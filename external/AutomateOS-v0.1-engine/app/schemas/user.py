# Define the Data Shapes related to the user.

from sqlmodel import SQLModel

# Common all user schemas
class UserBase(SQLModel):
    email: str # [[ To avoid repeating the email field ]]
    name: str | None # [[ Added to /models/user ]]

# Creating a new user (Input to the API)
# [[ This is what the /register enpoint will expect. ]]
class UserCreate(UserBase):
    password: str

# Reading a user (Output from the API)
# !Is has no password field.
# [[ What the API wil return ]]
class UserRead(UserBase):
    id: int

