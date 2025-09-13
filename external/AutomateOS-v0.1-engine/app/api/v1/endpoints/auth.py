# :Modules: Authentication Router
# [[ Purpose - User registration and login endpoints. ]]

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

# Import dependencies, schemas, models, security functions.
# from app.api import deps.
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.schemas.token import Token

# Authentication Router.
router = APIRouter()


# === Register Endpoint ===
@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user with a unique email and hashed password.",
)
# Create a new user.
#  [[ Using async allows the function to handle more requests efficiently, ]]
#  [[ especially when performing I/O-bound operations like database access, without blocking the event loop. ]]
async def register_user(
    *,
    session: Session = Depends(get_session),
    user_in: UserCreate
):
    # check if a user with this email already exists in the database.
    user = session.exec(select(User).where(User.email == user_in.email)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail=" A User with this email already exists.",
        )
    
    # Hash the plain PW from the reqauest using security utility.
    hashed_password = get_password_hash(user_in.password)

    # Create instance model for new User db.
    db_user = User(email=user_in.email, hashed_password=hashed_password, name=user_in.name)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user

# === Login Endpoint ===
@router.post(
    "/login",
    response_model=Token,
    summary="Obtain an access token",
    description="Authenticate with username (email) and password to receive a Bearer JWT token.",
)

# -- Get Access Token after authentication. -- 
async def login_for_access_token(
    *,
    session: Session = Depends(get_session),
    form_data: OAuth2PasswordRequestForm = Depends() # [[ Can reuse UserCreate schema for login credentails ]]
):
    user = session.exec(select(User).where(User.email == form_data.username)).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.id)

    return Token(access_token=access_token, token_type="bearer")
