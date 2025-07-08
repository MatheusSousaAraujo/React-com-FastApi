from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from typing import List, Any
from .database import create_tables
from . import models, schemas, auth, dependencies # Importa o novo arquivo
from fastapi.middleware.cors import CORSMiddleware

create_tables()

app = FastAPI(
    title="Fórum API com Grupos",
    version="1.0.0",
    description="Uma API para um fórum com sistema de grupos, autenticação e posts."
)

# --- Configuração do CORS ---
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A função get_db() foi movida para dependencies.py e não está mais aqui.

# =================================================================
# ===                  ENDPOINTS DE AUTENTICAÇÃO                  ===
# =================================================================

@app.post("/register/", response_model=schemas.AuthorRead, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register(author_create: schemas.AuthorCreate, db: Session = Depends(dependencies.get_db)):
    existing_user = db.query(models.Author).filter(models.Author.username == author_create.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário com este username já existe")
    existing_email = db.query(models.Author).filter(models.Author.email == author_create.email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário com este email já existe")
    hashed_password = auth.hash_password(author_create.password)
    db_author = models.Author(username=author_create.username, email=author_create.email, password=hashed_password)
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author

@app.post("/login/", response_model=schemas.Token, tags=["Auth"])
def login(form_data: schemas.UserLogin, db: Session = Depends(dependencies.get_db)):
    db_user = db.query(models.Author).filter(models.Author.username == form_data.username).first()
    if not db_user or not auth.verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas", headers={"WWW-Authenticate": "Bearer"})
    access_token = auth.create_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.AuthorReadWithGroups, tags=["Auth"])
async def read_users_me(current_user: models.Author = Depends(auth.get_current_active_user)):
    return current_user

# =================================================================
# ===                 ENDPOINTS DE GRUPOS (FÓRUNS)                ===
# =================================================================

@app.get("/groups/", response_model=List[schemas.GroupRead], tags=["Groups"])
def get_all_groups(db: Session = Depends(dependencies.get_db)):
    groups = db.query(models.Group).options(selectinload(models.Group.creator)).all()
    return groups

@app.get("/groups/{group_id}/details", response_model=Any, tags=["Groups"])
def get_group_details(group_id: int, db: Session = Depends(dependencies.get_db)):
    group = db.query(models.Group).options(selectinload(models.Group.creator), selectinload(models.Group.members)).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    class GroupDetails(schemas.GroupRead):
        members: List[schemas.AuthorRead] = []
    return GroupDetails.from_orm(group)

@app.post("/groups/", response_model=schemas.GroupRead, status_code=status.HTTP_201_CREATED, tags=["Groups"])
def create_group(group_create: schemas.GroupCreate, db: Session = Depends(dependencies.get_db), current_user: models.Author = Depends(auth.get_current_active_user)):
    db_group = models.Group(**group_create.model_dump(), creator_id=current_user.id)
    db_group.members.append(current_user)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@app.post("/groups/{group_id}/join", status_code=status.HTTP_200_OK, tags=["Groups"])
def join_group(group_id: int, db: Session = Depends(dependencies.get_db), current_user: models.Author = Depends(auth.get_current_active_user)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    if current_user in group.members:
        raise HTTPException(status_code=400, detail="Você já é membro deste grupo")
    group.members.append(current_user)
    db.commit()
    return {"message": f"Você entrou no grupo '{group.name}' com sucesso"}

@app.post("/groups/{group_id}/leave", status_code=status.HTTP_200_OK, tags=["Groups"])
def leave_group(group_id: int, db: Session = Depends(dependencies.get_db), current_user: models.Author = Depends(auth.get_current_active_user)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    if current_user not in group.members:
        raise HTTPException(status_code=400, detail="Você não é membro deste grupo")
    group.members.remove(current_user)
    db.commit()
    return {"message": f"Você saiu do grupo '{group.name}' com sucesso"}

@app.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Groups"])
def delete_group(
    group_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.Author = Depends(auth.get_current_active_user)
):
    """
    (PROTEGIDA) Permite que o CRIADOR de um grupo o exclua.
    Isso também excluirá todos os posts e comentários associados devido ao 'cascade' no modelo.
    """
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    
    if group.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para excluir este grupo")
        
    db.delete(group)
    db.commit()
    return None

# =================================================================
# ===                  ENDPOINTS DE POSTS E COMENTÁRIOS           ===
# =================================================================

@app.get("/posts/", response_model=List[schemas.PostRead], tags=["Posts"])
def get_user_feed(db: Session = Depends(dependencies.get_db), current_user: models.Author = Depends(auth.get_current_active_user)):
    user_group_ids = [group.id for group in current_user.groups]
    if not user_group_ids:
        return []
    posts = (
        db.query(models.Post).filter(models.Post.group_id.in_(user_group_ids))
        .options(selectinload(models.Post.author), selectinload(models.Post.group), selectinload(models.Post.comments).options(selectinload(models.Comment.commenter)))
        .order_by(models.Post.date.desc()).limit(100).all()
    )
    return posts

@app.post("/posts/", response_model=schemas.PostRead, status_code=status.HTTP_201_CREATED, tags=["Posts"])
def create_post(post_create: schemas.PostCreate, db: Session = Depends(dependencies.get_db), current_user: models.Author = Depends(auth.get_current_active_user)):
    group = db.query(models.Group).filter(models.Group.id == post_create.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    if current_user not in group.members:
        raise HTTPException(status_code=403, detail="Você não tem permissão para postar neste grupo")
    db_post_obj = models.Post(**post_create.model_dump(), author_id=current_user.id)
    db.add(db_post_obj)
    db.commit()
    db.refresh(db_post_obj)
    reloaded_post = db.query(models.Post).options(selectinload(models.Post.author), selectinload(models.Post.group), selectinload(models.Post.comments).options(selectinload(models.Comment.commenter))).filter(models.Post.id == db_post_obj.id).first()
    if not reloaded_post:
        raise HTTPException(status_code=500, detail="Erro ao recarregar o post após a criação.")
    return reloaded_post

@app.get("/posts/{post_id}", response_model=schemas.PostRead, tags=["Posts"])
def get_post_by_id(post_id: int, db: Session = Depends(dependencies.get_db)):
    db_post = db.query(models.Post).options(selectinload(models.Post.author), selectinload(models.Post.group), selectinload(models.Post.comments).options(selectinload(models.Comment.commenter))).filter(models.Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post não encontrado")
    return db_post

@app.put("/posts/{post_id}", response_model=schemas.PostRead, tags=["Posts"])
def update_post(post_id: int, post_update: schemas.PostUpdate, db: Session = Depends(dependencies.get_db), current_user: models.Author = Depends(auth.get_current_active_user)):
    db_post_to_update = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post_to_update is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post não encontrado")
    if db_post_to_update.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não autorizado a atualizar este post")
    update_data = post_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_post_to_update, key, value)
    db.commit()
    db.refresh(db_post_to_update)
    reloaded_post = db.query(models.Post).options(selectinload(models.Post.author), selectinload(models.Post.group), selectinload(models.Post.comments).options(selectinload(models.Comment.commenter))).filter(models.Post.id == post_id).first()
    if not reloaded_post:
         raise HTTPException(status_code=500, detail="Erro ao recarregar o post após a atualização.")
    return reloaded_post

@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Posts"])
def delete_post(post_id: int, db: Session = Depends(dependencies.get_db), current_user: models.Author = Depends(auth.get_current_active_user)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post não encontrado")
    if db_post.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não autorizado a deletar este post")
    db.delete(db_post)
    db.commit()
    return None

@app.post("/posts/{post_id}/comments/", response_model=schemas.CommentRead, status_code=status.HTTP_201_CREATED, tags=["Comments"])
def create_comment_for_post(post_id: int, comment_create: schemas.CommentCreate, db: Session = Depends(dependencies.get_db), current_user: models.Author = Depends(auth.get_current_active_user)):
    db_post_check = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post_check:
        raise HTTPException(status_code=404, detail="Post não encontrado para adicionar comentário")
    if current_user not in db_post_check.group.members:
        raise HTTPException(status_code=403, detail="Você não pode comentar em posts de grupos dos quais não faz parte.")
    db_comment_obj = models.Comment(**comment_create.model_dump(), post_id=post_id, commenter_id=current_user.id)
    db.add(db_comment_obj)
    db.commit()
    db.refresh(db_comment_obj)
    reloaded_comment = db.query(models.Comment).options(selectinload(models.Comment.commenter)).filter(models.Comment.id == db_comment_obj.id).first()
    if not reloaded_comment:
        raise HTTPException(status_code=500, detail="Erro ao recarregar o comentário após a criação.")
    return reloaded_comment

@app.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Comments"])
def delete_comment(comment_id: int, db: Session = Depends(dependencies.get_db), current_user: models.Author = Depends(auth.get_current_active_user)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comentário não encontrado")
    if db_comment.commenter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não autorizado a deletar este comentário")
    db.delete(db_comment)
    db.commit()
    return None

@app.get("/authors/{author_id}/posts/", response_model=List[schemas.PostRead], tags=["Authors"])
def get_posts_by_author(author_id: int, db: Session = Depends(dependencies.get_db)):
    # ... Esta rota pode precisar de ajuste se a intenção for mostrar apenas posts
    # de grupos em comum, mas por enquanto, mantém a funcionalidade original.
    author_check = db.query(models.Author.id).filter(models.Author.id == author_id).first()
    if not author_check:
        raise HTTPException(status_code=404, detail="Autor não encontrado")

    posts = (
        db.query(models.Post).filter(models.Post.author_id == author_id)
        .options(selectinload(models.Post.author), selectinload(models.Post.group), selectinload(models.Post.comments).options(selectinload(models.Comment.commenter)))
        .order_by(models.Post.date.desc()).limit(10).all()
    )
    return posts