from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from database import engine, Base, SessionLocal
import models, crud, schemas, auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует")
    db_email = crud.get_user_by_email(db, email=user.email)
    if db_email:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    created_user = crud.create_user(db, user)
    return created_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Неверное имя пользователя или пароль")
    if not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Неверное имя пользователя или пароль")
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users", response_model=List[schemas.UserOut])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    # Добавляем количество подписчиков/подписок для каждого пользователя
    results = []
    for user in users:
        results.append(schemas.UserOut(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            avatar=user.avatar,
            bio=user.bio,
            followers_count=len(user.followers),
            following_count=len(user.following)
        ))
    return results

@app.post("/follow/{user_id}")
def follow(user_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя подписаться на самого себя")
    result = crud.follow_user(db, follower_id=current_user.id, following_id=user_id)
    if not result:
        raise HTTPException(status_code=400, detail="Ошибка подписки")
    return {"detail": "Вы подписались"}

@app.post("/unfollow/{user_id}")
def unfollow(user_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя отписаться от самого себя")
    result = crud.unfollow_user(db, follower_id=current_user.id, following_id=user_id)
    if not result:
        raise HTTPException(status_code=400, detail="Ошибка отписки")
    return {"detail": "Вы отписались"}

@app.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(auth.get_current_user)):
    return schemas.UserOut(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        avatar=current_user.avatar,
        bio=current_user.bio,
        followers_count=len(current_user.followers),
        following_count=len(current_user.following)
    )
