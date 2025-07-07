from pydantic import BaseModel, EmailStr, Field
import datetime
from typing import List, Optional

# =================================================================
# ===                      SCHEMAS DE AUTHOR                      ===
# =================================================================

class AuthorBase(BaseModel):
    username: str
    email: EmailStr

class AuthorCreate(AuthorBase):
    password: str

class AuthorRead(AuthorBase):
    id: int
    class Config:
        from_attributes = True


# =================================================================
# ===                      SCHEMAS DE GROUP                       ===
# =================================================================

class GroupBase(BaseModel):
    """
    Contém os campos que o cliente envia ao criar/atualizar um grupo.
    NÃO inclui o 'id'.
    """
    name: str
    description: Optional[str] = None

class GroupCreate(GroupBase):
    """
    Schema usado para validar os dados na criação de um grupo.
    Herda de GroupBase e não adiciona nada, pois os campos são os mesmos.
    """
    pass

class GroupRead(GroupBase):
    """
    Schema usado para retornar um grupo da API.
    Herda os campos de GroupBase e ADICIONA os campos gerados pelo DB.
    """
    id: int
    creator: AuthorRead
    class Config:
        from_attributes = True

# =================================================================
# ===                SCHEMAS PARA DADOS ANINHADOS               ===
# =================================================================

class GroupInDB(BaseModel):
    """
    Um schema simplificado para representar um grupo quando ele está
    aninhado dentro de outro objeto (como Post ou Author), para não
    poluir a resposta com dados desnecessários.
    """
    id: int
    name: str
    class Config:
        from_attributes = True

class AuthorReadWithGroups(AuthorRead):
    """Usa o GroupInDB para mostrar a lista de grupos de um usuário."""
    groups: List[GroupInDB] = []


# =================================================================
# ===                      SCHEMAS DE POST                        ===
# =================================================================

class PostBase(BaseModel):
    title: str
    text: str

class PostCreate(PostBase):
    date: datetime.datetime = Field(default_factory=datetime.datetime.now)
    group_id: int

class PostUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None

class PostRead(PostBase):
    id: int
    date: datetime.datetime
    author_id: int
    author: AuthorRead
    group: GroupInDB # Usa o schema de grupo simplificado
    comments: List['CommentRead'] = []
    class Config:
        from_attributes = True

# =================================================================
# ===                     SCHEMAS DE COMMENT                      ===
# =================================================================

class CommentBase(BaseModel):
    title: str
    text: str

class CommentCreate(CommentBase):
    date: datetime.datetime = Field(default_factory=datetime.datetime.now)

class CommentUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    
class CommentRead(CommentBase):
    id: int
    date: datetime.datetime
    post_id: int
    commenter_id: int
    commenter: AuthorRead 
    class Config:
        from_attributes = True

# Atualiza a referência de string no PostRead. Necessário quando um schema
# referencia outro que é definido depois dele.
PostRead.model_rebuild()

# =================================================================
# ===                   SCHEMAS DE AUTENTICAÇÃO                   ===
# =================================================================

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None