from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.models.models import Coupon, DigitalProduct
from app.schemas.schemas import CouponCreate, CouponUpdate, CouponResponse
from app.api.routes.users import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/coupons", tags=["Coupons"])


def build_coupon_response(coupon: Coupon) -> dict:
    return {
        "id": coupon.id,
        "creator_id": coupon.creator_id,
        "product_id": coupon.product_id,
        "product_name": coupon.product.name if coupon.product else None,
        "name": coupon.name,
        "code": coupon.code,
        "status": coupon.status,
        "discount_type": coupon.discount_type,
        "discount_value": float(coupon.discount_value) if coupon.discount_value is not None else 0,
        "limited": coupon.limited,
        "usage_limit": float(coupon.usage_limit) if coupon.usage_limit is not None else 0,
        "usage_count": float(coupon.usage_count) if coupon.usage_count is not None else 0,
        "valid_from": coupon.valid_from.isoformat() if coupon.valid_from else None,
        "valid_until": coupon.valid_until.isoformat() if coupon.valid_until else None,
        "created_at": coupon.created_at.isoformat() if coupon.created_at else None,
    }


@router.post("/", response_model=CouponResponse)
def create_coupon(
    data: CouponCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("creator", "admin"):
        raise HTTPException(status_code=403, detail="Only creators can create coupons")

    coupon = Coupon(
        creator_id=current_user.id,
        **data.model_dump(exclude_none=True),
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return build_coupon_response(coupon)


@router.get("/my", response_model=list[CouponResponse])
def my_coupons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    coupons = db.query(Coupon).filter(Coupon.creator_id == current_user.id).all()
    return [build_coupon_response(c) for c in coupons]


@router.get("/{coupon_id}", response_model=CouponResponse)
def get_coupon(coupon_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    if coupon.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return build_coupon_response(coupon)


@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: UUID,
    data: CouponUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    if coupon.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(coupon, field, value)
    db.commit()
    db.refresh(coupon)
    return build_coupon_response(coupon)


@router.delete("/{coupon_id}")
def delete_coupon(
    coupon_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    if coupon.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    db.delete(coupon)
    db.commit()
    return {"message": "Coupon deleted"}
