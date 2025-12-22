from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.database.postgres import get_db

router = APIRouter()

@router.get("/", response_model=schemas.product.ProductList)
def read_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None
) -> Any:
    """
    Retrieve products.
    """
    query = db.query(models.Product).filter(models.Product.available == True)
    
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
        
    total = query.count()
    products = query.offset(skip).limit(limit).all()
    
    return {
        "items": products,
        "total": total,
        "page": (skip // limit) + 1,
        "size": len(products)
    }

@router.get("/{id}", response_model=schemas.product.Product)
def read_product(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    """
    Get product by ID.
    """
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
