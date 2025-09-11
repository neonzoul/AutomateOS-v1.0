# :Modules: Security Utilities

from typing import Any, TypedDict

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings #[[ To-Do in config.py]]
from app.schemas.token import TokenPayload

# === Password hashing/verification, API key generation+hashing, and JWT helpers. ===

# Declare JWT payload structure
class JWTPayload(TypedDict):
    exp: int # Expiration Timestamp
    sub: str # Subject (user ID)
    iat: int # Issued at Timestamp

# --- Hashing ---
# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- Key Generation ---
# JWT token Creation.
def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Use a default expiration time from settings
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Payload for JWT encode. 
    payload_data: JWTPayload = {
        "exp": int(expire.timestamp()), 
        "sub": str(subject),            
        "iat": int(datetime.now(timezone.utc).timestamp())
    }
    to_encode = dict(payload_data)

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# --- Decoded access token, Returns payload. ---
def decode_access_token(token: str) -> TokenPayload | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return TokenPayload(**payload)
    except JWTError:
        return None