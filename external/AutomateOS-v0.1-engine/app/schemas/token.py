# Defines the shapes for the JWT authentication flow. 
from sqlmodel import SQLModel

# The API response when a user logs in.
# [[ shape of the JSON ]]
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

# Payload of the Token.
# [[The data embeded withtin the JWT]]
class TokenPayload(SQLModel):
    sub: str | None = None # 'sub' is the standard JWT claim for "subject"
