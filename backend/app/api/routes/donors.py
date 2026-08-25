from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.donor_profile import BloodGroup, DonorProfile
from app.models.user import User, UserRole
from app.schemas.donor import DonorProfileCreate, DonorProfileOut, DonorProfileUpdate, DonorPublicOut

router = APIRouter(prefix="/donors", tags=["Donors"])


def _mask_name(full_name: str) -> str:
    """Show first name + masked last name to protect privacy in public search results."""
    parts = full_name.strip().split()
    if not parts:
        return "Donor"
    if len(parts) == 1:
        return parts[0]
    return f"{parts[0]} {parts[-1][0]}."


@router.post("/profile", response_model=DonorProfileOut, status_code=status.HTTP_201_CREATED)
def create_or_update_profile(
    payload: DonorProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(DonorProfile).filter(DonorProfile.user_id == current_user.id).first()
    if existing:
        for field, value in payload.model_dump().items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        profile = existing
    else:
        profile = DonorProfile(user_id=current_user.id, **payload.model_dump())
        db.add(profile)
        # Ensure the user is tagged as a donor so they show up in matching/search
        if current_user.role == UserRole.REQUESTER:
            current_user.role = UserRole.DONOR
        db.commit()
        db.refresh(profile)

    out = DonorProfileOut.model_validate(profile)
    out.full_name = current_user.full_name
    return out


@router.get("/profile/me", response_model=DonorProfileOut)
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(DonorProfile).filter(DonorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor profile not found")
    out = DonorProfileOut.model_validate(profile)
    out.full_name = current_user.full_name
    return out


@router.patch("/profile/me", response_model=DonorProfileOut)
def update_my_profile(
    payload: DonorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(DonorProfile).filter(DonorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor profile not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    out = DonorProfileOut.model_validate(profile)
    out.full_name = current_user.full_name
    return out


@router.get("/search", response_model=list[DonorPublicOut])
def search_donors(
    city: str | None = Query(default=None),
    blood_group: BloodGroup | None = Query(default=None),
    area: str | None = Query(default=None),
    available_only: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    """
    Public-safe donor search. Never returns phone/email/exact address —
    only approximate location (city/area) and availability.
    """
    query = db.query(DonorProfile)
    if city:
        query = query.filter(DonorProfile.city.ilike(f"%{city}%"))
    if area:
        query = query.filter(DonorProfile.area.ilike(f"%{area}%"))
    if blood_group:
        query = query.filter(DonorProfile.blood_group == blood_group)
    if available_only:
        query = query.filter(DonorProfile.is_available.is_(True))

    profiles = query.limit(100).all()
    results = []
    for p in profiles:
        results.append(
            DonorPublicOut(
                donor_id=p.id,
                display_name=_mask_name(p.user.full_name) if p.user else "Donor",
                blood_group=p.blood_group,
                city=p.city,
                area=p.area,
                is_available=p.is_available,
            )
        )
    return results
