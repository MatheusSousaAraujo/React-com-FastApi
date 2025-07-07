from pydantic import BaseModel, EmailStr, Field
import datetime
from typing import List, Optional

# --- Schemas Base ---
class AuthorBase(BaseModel):
    username: str
    email: EmailStr

class PostBase(BaseModel):
    title: str
    text: str

class CommentBase(BaseModel):
    title: str
    text: str

# --- Schemas de Criação ---
class AuthorCreate(AuthorBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class PostCreate(PostBase):
    # date é definida pelo servidor no modelo SQLAlchemy, mas Pydantic pode ter um default factory
    date: datetime.datetime = Field(default_factory=datetime.datetime.now)

class CommentCreate(CommentBase):
    date: datetime.datetime = Field(default_factory=datetime.datetime.now)

# --- Schemas de Atualização ---
class PostUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None

class CommentUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None

# --- Schemas de Resposta (Leitura) ---
class AuthorRead(AuthorBase):
    id: int

    class Config:
        from_attributes = True # Pydantic v2+ (ou orm_mode = True para v1)

# ForwardRef para dependências circulares se necessário, mas aqui não parece ser o caso ainda.
# from pydantic import ForwardRef
# PostReadRef = ForwardRef('PostRead')
# CommentReadRef = ForwardRef('CommentRead')

class CommentRead(CommentBase):
    id: int
    date: datetime.datetime
    post_id: int
    commenter_id: int
    commenter: AuthorRead # Mostra quem comentou (deve funcionar com AuthorRead definido acima)

    class Config:
        from_attributes = True

class PostRead(PostBase):
    id: int
    date: datetime.datetime
    author_id: int
    author: AuthorRead # Mostra o autor do post
    comments: List[CommentRead] = [] # Mostra os comentários do post

    class Config:
        from_attributes = True

# Atualizar referências se você usou ForwardRef
# PostRead.model_rebuild()
# CommentRead.model_rebuild()

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None