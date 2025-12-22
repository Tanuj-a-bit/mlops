from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.database.postgres import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Category])
def read_categories(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve categories.
    """
    categories = db.query(models.Category).filter(
        models.Category.parent_id == None
    ).offset(skip).limit(limit).all()
    return categories

@router.get("/{id}", response_model=schemas.Category)
def read_category(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    """
    Get category by ID.
    """
    category = db.query(models.Category).filter(models.Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.get("/{id}/subcategories", response_model=List[schemas.Category])
def read_subcategories(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    """
    Get subcategories of a category.
    """
    subcategories = db.query(models.Category).filter(models.Category.parent_id == id).all()
    return subcategories
