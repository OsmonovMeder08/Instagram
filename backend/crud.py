from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(
        id=str(uuid.uuid4()),
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        avatar="",
        bio="",
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def follow_user(db: Session, follower_id: str, following_id: str):
    follower = get_user(db, follower_id)
    following = get_user(db, following_id)
    if not follower or not following:
        return False
    if following in follower.following:
        return False
    follower.following.append(following)
    db.commit()
    return True

def unfollow_user(db: Session, follower_id: str, following_id: str):
    follower = get_user(db, follower_id)
    following = get_user(db, following_id)
    if not follower or not following:
        return False
    if following not in follower.following:
        return False
    follower.following.remove(following)
    db.commit()
    return True
