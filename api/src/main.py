from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from typing import List
from .database import SessionLocal, create_tables
from . import models, schemas, auth
from fastapi.middleware.cors import CORSMiddleware


create_tables()


app = FastAPI(title="Blog API Avançada", version="0.2.1")

origins = [
    "http://localhost:3000",  # A URL do seu frontend React
    "http://localhost",       # Às vezes necessário
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Permite as origens listadas
    allow_credentials=True,     # Permite cookies (importante para o futuro)
    allow_methods=["*"],        # Permite todos os métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],        # Permite todos os cabeçalhos
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/register/", response_model=schemas.AuthorRead, status_code=status.HTTP_201_CREATED)
def register(author_create: schemas.AuthorCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.Author).filter(models.Author.username == author_create.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Autor com este username já existe")

    existing_email = db.query(models.Author).filter(models.Author.email == author_create.email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Autor com este email já existe")

    hashed_password = auth.hash_password(author_create.password)
    db_author = models.Author(
        username=author_create.username,
        email=author_create.email,
        password=hashed_password
    )
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author

@app.post("/login/", response_model=schemas.Token)
def login(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.Author).filter(models.Author.username == form_data.username).first()

    if not db_user or not auth.verify_password(form_data.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.AuthorRead)
async def read_users_me(current_user: models.Author = Depends(auth.get_current_active_user)):
    return current_user


@app.post("/posts/", response_model=schemas.PostRead, status_code=status.HTTP_201_CREATED)
def create_post(
    post_create: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.Author = Depends(auth.get_current_active_user)
):
    db_post_obj = models.Post(
        title=post_create.title, 
        text=post_create.text,
        date=post_create.date, 
        author_id=current_user.id
    )
    db.add(db_post_obj)
    db.commit()
    db.refresh(db_post_obj)

    reloaded_post = db.query(models.Post).options(
        selectinload(models.Post.author),
        selectinload(models.Post.comments).options(
            selectinload(models.Comment.commenter)
        )
    ).filter(models.Post.id == db_post_obj.id).first()

    if not reloaded_post:
        raise HTTPException(status_code=500, detail="Erro ao recarregar o post após a criação.")
    return reloaded_post

@app.get("/posts/", response_model=List[schemas.PostRead])
def get_all_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = (
        db.query(models.Post)
        .options(
            selectinload(models.Post.author),
            selectinload(models.Post.comments).options(
                selectinload(models.Comment.commenter)
            )
        )
        .order_by(models.Post.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return posts

@app.get("/posts/{post_id}", response_model=schemas.PostRead)
def get_post_by_id(post_id: int, db: Session = Depends(get_db)):
    db_post = (
        db.query(models.Post)
        .options(
            selectinload(models.Post.author),
            selectinload(models.Post.comments).options(
                selectinload(models.Comment.commenter)
            )
        )
        .filter(models.Post.id == post_id)
        .first()
    )
    if db_post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post não encontrado")
    return db_post

@app.put("/posts/{post_id}", response_model=schemas.PostRead)
def update_post(
    post_id: int,
    post_update: schemas.PostUpdate,
    db: Session = Depends(get_db),
    current_user: models.Author = Depends(auth.get_current_active_user)
):
    db_post_query = db.query(models.Post).filter(models.Post.id == post_id)
    db_post_to_update = db_post_query.first()

    if db_post_to_update is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post não encontrado")
    if db_post_to_update.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não autorizado a atualizar este post")

    update_data = post_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_post_to_update, key, value)
    db.commit()
    db.refresh(db_post_to_update) 

    reloaded_post = db.query(models.Post).options(
        selectinload(models.Post.author),
        selectinload(models.Post.comments).options(
            selectinload(models.Comment.commenter)
        )
    ).filter(models.Post.id == post_id).first()
    if not reloaded_post:
         raise HTTPException(status_code=500, detail="Erro ao recarregar o post após a atualização.")
    return reloaded_post


@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.Author = Depends(auth.get_current_active_user)
):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post não encontrado")
    if db_post.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não autorizado a deletar este post")

    db.delete(db_post)
    db.commit()
    return None

@app.post("/posts/{post_id}/comments/", response_model=schemas.CommentRead, status_code=status.HTTP_201_CREATED)
def create_comment_for_post(
    post_id: int,
    comment_create: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.Author = Depends(auth.get_current_active_user)
):
    db_post_check = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post não encontrado para adicionar comentário")

    db_comment_obj = models.Comment(
        title=comment_create.title,
        text=comment_create.text,
        date=comment_create.date,
        post_id=post_id,
        commenter_id=current_user.id
    )
    db.add(db_comment_obj)
    db.commit()
    db.refresh(db_comment_obj)

    reloaded_comment = db.query(models.Comment).options(
        selectinload(models.Comment.commenter) # Só precisamos do commenter aqui
    ).filter(models.Comment.id == db_comment_obj.id).first()

    if not reloaded_comment:
        raise HTTPException(status_code=500, detail="Erro ao recarregar o comentário após a criação.")
    return reloaded_comment

@app.get("/posts/{post_id}/comments/", response_model=List[schemas.CommentRead])
def get_comments_for_post(
    post_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    post_exists = db.query(models.Post.id).filter(models.Post.id == post_id).first()
    if not post_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post não encontrado")

    comments = (
        db.query(models.Comment)
        .filter(models.Comment.post_id == post_id)
        .options(selectinload(models.Comment.commenter))
        .order_by(models.Comment.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return comments

@app.get("/authors/{author_id}/posts/", response_model=List[schemas.PostRead])
def get_posts_by_author(
    author_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    author_check = db.query(models.Author.id).filter(models.Author.id == author_id).first()
    if not author_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Autor não encontrado")

    posts = (
        db.query(models.Post)
        .filter(models.Post.author_id == author_id)
        .options(
            selectinload(models.Post.author),
            selectinload(models.Post.comments).options(
                selectinload(models.Comment.commenter)
            )
        )
        .order_by(models.Post.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return posts

@app.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.Author = Depends(auth.get_current_active_user)
):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comentário não encontrado")
    if db_comment.commenter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não autorizado a deletar este comentário")

    db.delete(db_comment)
    db.commit()
    return None
