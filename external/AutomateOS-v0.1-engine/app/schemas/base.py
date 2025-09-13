
from pydantic import BaseModel, ConfigDict

# configures schemas accept ORM objects globally.
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)