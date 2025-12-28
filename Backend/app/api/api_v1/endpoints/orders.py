from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.database.postgres import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Order)
def create_order(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new order from current cart.
    """
    # Get cart
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
        
    # Calculate total
    total_amount = 0
    for item in cart.items:
        total_amount += item.product.price * item.quantity
        
    # Create order
    order = models.Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending"
    )
    db.add(order)
    db.flush() # Get ID
    
    # Create order items
    for item in cart.items:
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=item.product.id,
            quantity=item.quantity,
            price_at_purchase=item.product.price
        )
        db.add(order_item)
        
    # Clear cart
    db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
    
    db.commit()
    db.refresh(order)
    return order

@router.get("/", response_model=List[schemas.Order])
def read_orders(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve current user orders.
    """
    orders = db.query(models.Order).filter(
        models.Order.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return orders

@router.get("/{id}", response_model=schemas.Order)
def read_order(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get order by ID.
    """
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return order
