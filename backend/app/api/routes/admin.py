from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.db.session import get_db
from app.models.admin_action import ActionType, AdminAction
from app.models.blood_request import BloodRequest, RequestStatus
from app.models.donor_profile import DonorProfile
from app.models.user import User, UserRole
from app.schemas.donor import DonorProfileOut
from app.schemas.request import BloodRequestOut
from app.schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["Admin"])

admin_only = require_role(UserRole.ADMIN)


@router.get("/stats")
def platform_stats(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    return {
        "total_users": db.query(User).count(),
        "total_donors": db.query(DonorProfile).count(),
        "available_donors": db.query(DonorProfile).filter(DonorProfile.is_available.is_(True)).count(),
        "total_requests": db.query(BloodRequest).count(),
        "active_requests": db.query(BloodRequest).filter(BloodRequest.status == RequestStatus.ACTIVE).count(),
        "suspended_users": db.query(User).filter(User.is_suspended.is_(True)).count(),
    }


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/donors", response_model=list[DonorProfileOut])
def list_donors(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    profiles = db.query(DonorProfile).all()
    out = []
    for p in profiles:
        item = DonorProfileOut.model_validate(p)
        item.full_name = p.user.full_name if p.user else None
        out.append(item)
    return out


@router.get("/requests", response_model=list[BloodRequestOut])
def list_all_requests(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    return db.query(BloodRequest).order_by(BloodRequest.created_at.desc()).all()


@router.post("/users/{user_id}/suspend", response_model=UserOut)
def suspend_user(
    user_id: str,
    reason: str | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_only),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_suspended = True
    db.add(AdminAction(admin_id=admin.id, target_user_id=user.id, action_type=ActionType.SUSPEND_USER, reason=reason))
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/reactivate", response_model=UserOut)
def reactivate_user(user_id: str, db: Session = Depends(get_db), admin: User = Depends(admin_only)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_suspended = False
    db.add(AdminAction(admin_id=admin.id, target_user_id=user.id, action_type=ActionType.REACTIVATE_USER))
    db.commit()
    db.refresh(user)
    return user


@router.post("/requests/{request_id}/remove", status_code=status.HTTP_204_NO_CONTENT)
def remove_request(request_id: str, db: Session = Depends(get_db), admin: User = Depends(admin_only)):
    request = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    db.add(AdminAction(admin_id=admin.id, action_type=ActionType.DELETE_REQUEST, reason=f"Removed request {request_id}"))
    db.delete(request)
    db.commit()
    return None


@router.get("/actions")
def list_admin_actions(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    actions = db.query(AdminAction).order_by(AdminAction.created_at.desc()).limit(200).all()
    return [
        {
            "id": a.id,
            "admin_id": a.admin_id,
            "target_user_id": a.target_user_id,
            "action_type": a.action_type.value,
            "reason": a.reason,
            "created_at": a.created_at,
        }
        for a in actions
    ]
