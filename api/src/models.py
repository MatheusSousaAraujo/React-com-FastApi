from sqlalchemy import (Column, Integer, String, ForeignKey,
    Text, DateTime)
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class Author(Base):
    __tablename__ = "authors"
    id = Column(Integer, primary_key= True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) 

    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan", lazy="select")
    comments_made = relationship(
        "Comment",
        back_populates="commenter",
        cascade="all, delete-orphan",
        lazy="select",
        foreign_keys="[Comment.commenter_id]"
    )

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key= True, index=True)
    author_id = Column(Integer, ForeignKey("authors.id")) 
    title = Column(String, index=True)
    text = Column(Text)
    date = Column(DateTime, default=datetime.datetime.now)
    author = relationship("Author", back_populates="posts", lazy="select")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan", lazy="select")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id")) 
    commenter_id = Column(Integer, ForeignKey("authors.id"))
    title = Column(String)
    text = Column(Text)
    date = Column(DateTime, default=datetime.datetime.now)
    post = relationship("Post", back_populates="comments", lazy="select")
    commenter = relationship(
        "Author",
        back_populates="comments_made", 
        lazy="select",
        foreign_keys=[commenter_id]
    )