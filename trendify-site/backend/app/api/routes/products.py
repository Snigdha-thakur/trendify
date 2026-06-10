from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.core.database import get_db
from app.models.models import DigitalProduct
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.api.routes.users import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/products", tags=["Digital Products"])


@router.post("/", response_model=ProductResponse)
def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("creator", "admin"):
        raise HTTPException(status_code=403, detail="Only creators can create products")

    product = DigitalProduct(
        creator_id=current_user.id,
        name=data.name,
        description=data.description,
        price_type=data.price_type,
        amount=data.amount,
        status="Under review",
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/", response_model=list[ProductResponse])
def list_products(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(DigitalProduct).filter(DigitalProduct.status == "Active").offset(skip).limit(limit).all()


@router.get("/my", response_model=list[ProductResponse])
def my_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(DigitalProduct).filter(DigitalProduct.creator_id == current_user.id).all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    product = db.query(DigitalProduct).filter(DigitalProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID,
    data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(DigitalProduct).filter(DigitalProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(DigitalProduct).filter(DigitalProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
