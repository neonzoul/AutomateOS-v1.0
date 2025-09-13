# App API v1 Dependencies.

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.security import decode_access_token
from app.db.session import get_session
from app.models.user import User

# === Guard for endpoints ===

# Look for a token in "Authorization" request header.
# [[ with a value of "Bearer <token>" ]]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

# -- Get the current user from a JWT token. --
def get_current_user(
        session: Session = Depends(get_session), token: str = Depends(oauth2_scheme)
) -> User:
    # Decode token to get the payload
    payload = decode_access_token(token)

    if not payload or not payload.sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user = session.get(User, int(payload.sub))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
    
