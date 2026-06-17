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

    data_dict = data.model_dump(exclude_none=True)
    data_dict.pop('status', None)  # status is always set to 'Under review' on creation
    product = DigitalProduct(
        creator_id=current_user.id,
        status="Under review",
        **data_dict,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/", response_model=list[ProductResponse])
def list_products(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(DigitalProduct).filter(DigitalProduct.status == "Active").offset(skip).limit(limit).all()


@router.get("/my")
def my_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    products = db.query(DigitalProduct).filter(DigitalProduct.creator_id == current_user.id).all()
    result = []
    for p in products:
        result.append({
            'id': str(p.id),
            'creator_id': str(p.creator_id) if p.creator_id else None,
            'name': p.name,
            'creator_name': p.creator_name,
            'profile_picture': p.profile_picture,
            'category': p.category,
            'price_type': p.price_type,
            'status': p.status,
            'whitelabeled': p.whitelabeled,
            'description': p.description,
            'cover_image': p.cover_image,
            'button_text': p.button_text,
            'amount': float(p.amount) if p.amount is not None else 0,
            'discount_price': float(p.discount_price) if p.discount_price is not None else 0,
            'offer_discount': p.offer_discount,
            'payment_link': p.payment_link,
            'testimonials': p.testimonials,
            'faqs': p.faqs,
            'benefits': p.benefits,
            'social_links': p.social_links,
            'form_fields': p.form_fields,
            'digital_files': p.digital_files,
            'success_redirect': p.success_redirect,
            'failed_redirect': p.failed_redirect,
            'support_phone': p.support_phone,
            'support_email': p.support_email,
            'limit_quantity': p.limit_quantity,
            'max_quantity': float(p.max_quantity) if p.max_quantity is not None else 0,
            'meta_pixel_id': p.meta_pixel_id,
            'google_analytics_id': p.google_analytics_id,
            'webhook_url': p.webhook_url,
            'webhook_key': p.webhook_key,
            'created_at': p.created_at.isoformat() if p.created_at else None,
        })
    return result


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

    for field, value in data.model_dump(exclude_unset=True).items():
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
