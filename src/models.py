from sqlalchemy import (Column, Integer, String, ForeignKey,
                        Text, DateTime, Table)
from sqlalchemy.orm import relationship
import datetime
from .database import Base

# --- Tabela de Associação (Muitos-para-Muitos) ---
# Esta tabela especial liga Autores (Membros) a Grupos.
# Não é um modelo de classe, mas uma definição de tabela direta para o SQLAlchemy.
group_membership_table = Table('group_memberships', Base.metadata,
    Column('author_id', Integer, ForeignKey('authors.id'), primary_key=True),
    Column('group_id', Integer, ForeignKey('groups.id'), primary_key=True)
)


# --- Novos Modelos ---

class Group(Base):
    """
    Representa um grupo ou fórum, como "Rock", "Dança", etc.
    """
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    creator_id = Column(Integer, ForeignKey("authors.id"), nullable=False)

    # Relações
    creator = relationship("Author") # Relação simples para saber quem criou o grupo.

    # Relação muitos-para-muitos com os membros (autores) através da tabela de associação.
    members = relationship(
        "Author",
        secondary=group_membership_table,
        back_populates="groups"
    )

    # Relação um-para-muitos com os posts que pertencem a este grupo.
    posts = relationship("Post", back_populates="group", cascade="all, delete-orphan")


# --- Modelos Atualizados ---

class Author(Base):
    """
    Representa um usuário/autor. Agora pode ser membro de vários grupos.
    """
    __tablename__ = "authors"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    # Relações existentes
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments_made = relationship(
        "Comment",
        back_populates="commenter",
        cascade="all, delete-orphan",
        foreign_keys="[Comment.commenter_id]"
    )
    
    # Nova relação muitos-para-muitos com os grupos dos quais o autor é membro.
    groups = relationship(
        "Group",
        secondary=group_membership_table,
        back_populates="members"
    )


class Post(Base):
    """
    Representa um post ou tópico. Agora, cada post pertence obrigatoriamente a um grupo.
    """
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    text = Column(Text)
    date = Column(DateTime, default=datetime.datetime.now)
    author_id = Column(Integer, ForeignKey("authors.id"), nullable=False)
    
    # Nova chave estrangeira para ligar o post a um grupo.
    # É `nullable=False` para garantir que todo post tenha um grupo.
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)

    # Relações existentes
    author = relationship("Author", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    
    # Nova relação um-para-um (do ponto de vista do Post) com o Grupo.
    group = relationship("Group", back_populates="posts")


# --- Modelo Inalterado ---

class Comment(Base):
    """
    Representa um comentário em um post. Este modelo não precisa de alterações diretas,
    pois ele está ligado a um Post, que por sua vez está ligado a um Grupo.
    """
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    commenter_id = Column(Integer, ForeignKey("authors.id"), nullable=False)
    title = Column(String)
    text = Column(Text)
    date = Column(DateTime, default=datetime.datetime.now)

    # Relações existentes
    post = relationship("Post", back_populates="comments")
    commenter = relationship(
        "Author",
        back_populates="comments_made",
        foreign_keys=[commenter_id]
    )