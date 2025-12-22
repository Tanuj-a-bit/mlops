from typing import List, Optional
from pydantic import BaseModel

class RecommendationRequest(BaseModel):
    user_id: Optional[int] = None
    item_id: Optional[int] = None
    limit: int = 5

class RecommendedItem(BaseModel):
    itemid: int
    name: str
    categoryid: str

    class Config:
        from_attributes = True
