from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.product import Product

# Cart Schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItem(CartItemBase):
    id: int
    product: Product
    
    class Config:
        from_attributes = True

class CartBase(BaseModel):
    pass

class Cart(CartBase):
    id: int
    user_id: int
    items: List[CartItem] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItem(OrderItemBase):
    id: int
    price_at_purchase: float
    product: Product
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_amount: float
    status: str

class OrderCreate(BaseModel):
    pass

class Order(OrderBase):
    id: int
    user_id: int
    items: List[OrderItem] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
