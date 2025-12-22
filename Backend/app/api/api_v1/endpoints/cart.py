from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.database.postgres import get_db

router = APIRouter()

@router.get("/", response_model=schemas.Cart)
def read_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's cart.
    """
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        # Create cart if not exists
        cart = models.Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

@router.post("/items", response_model=schemas.Cart)
def add_to_cart(
    *,
    db: Session = Depends(get_db),
    cart_in: schemas.CartItemCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add item to cart.
    """
    # Get or create cart
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        cart = models.Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        
    # Check if item exists in cart
    item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == cart_in.product_id
    ).first()
    
    if item:
        item.quantity += cart_in.quantity
    else:
        # Check product exists
        product = db.query(models.Product).filter(models.Product.id == cart_in.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        item = models.CartItem(
            cart_id=cart.id,
            product_id=cart_in.product_id,
            quantity=cart_in.quantity
        )
        db.add(item)
        
    db.commit()
    db.refresh(cart)
    return cart

@router.delete("/items/{product_id}", response_model=schemas.Cart)
def remove_from_cart(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove item from cart.
    """
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
        
    db.delete(item)
    db.commit()
    db.refresh(cart)
    return cart

@router.put("/items/{product_id}", response_model=schemas.Cart)
def update_cart_item(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    cart_in: schemas.CartItemUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update cart item quantity.
    """
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
        
    if cart_in.quantity <= 0:
        db.delete(item)
    else:
        item.quantity = cart_in.quantity
        
    db.commit()
    db.refresh(cart)
    return cart
