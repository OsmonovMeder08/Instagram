from sqlalchemy import Column, String, Integer, Table, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

followers = Table(
    'followers',
    Base.metadata,
    Column('follower_id', String, ForeignKey('users.id')),
    Column('following_id', String, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    avatar = Column(String, default="")
    bio = Column(String, default="")

    followers = relationship(
        "User",
        secondary=followers,
        primaryjoin=id==followers.c.following_id,
        secondaryjoin=id==followers.c.follower_id,
        backref="following"
    )
