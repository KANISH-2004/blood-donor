from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.blood_request import BloodRequest, RequestStatus
from app.models.notification import NotificationType
from app.models.user import User
from app.schemas.request import BloodRequestCreate, BloodRequestOut, BloodRequestUpdate
from app.services.notification_service import create_notification

router = APIRouter(prefix="/requests", tags=["Blood Requests"])


@router.post("", response_model=BloodRequestOut, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: BloodRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request = BloodRequest(requester_id=current_user.id, **payload.model_dump())
    db.add(request)
    db.commit()
    db.refresh(request)

    create_notification(
        db,
        user_id=current_user.id,
        type_=NotificationType.NEW_REQUEST,
        title="Blood request created",
        message=f"Your request for {request.blood_group.value} at {request.hospital_name} is now active.",
        related_request_id=request.id,
    )
    return request


@router.get("", response_model=list[BloodRequestOut])
def list_requests(
    city: str | None = Query(default=None),
    blood_group: str | None = Query(default=None),
    status_filter: RequestStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
):
    query = db.query(BloodRequest)
    if city:
        query = query.filter(BloodRequest.city.ilike(f"%{city}%"))
    if blood_group:
        query = query.filter(BloodRequest.blood_group == blood_group)
    if status_filter:
        query = query.filter(BloodRequest.status == status_filter)
    else:
        query = query.filter(BloodRequest.status != RequestStatus.CANCELLED)
    return query.order_by(BloodRequest.created_at.desc()).limit(200).all()


@router.get("/mine", response_model=list[BloodRequestOut])
def my_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(BloodRequest)
        .filter(BloodRequest.requester_id == current_user.id)
        .order_by(BloodRequest.created_at.desc())
        .all()
    )


@router.get("/{request_id}", response_model=BloodRequestOut)
def get_request(request_id: str, db: Session = Depends(get_db)):
    request = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return request


@router.patch("/{request_id}", response_model=BloodRequestOut)
def update_request(
    request_id: str,
    payload: BloodRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if request.requester_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this request")

    previous_status = request.status
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(request, field, value)
    db.commit()
    db.refresh(request)

    if payload.status and payload.status != previous_status:
        notif_map = {
            RequestStatus.ACCEPTED: (NotificationType.REQUEST_ACCEPTED, "A donor accepted your request."),
            RequestStatus.COMPLETED: (NotificationType.REQUEST_COMPLETED, "Your blood request has been completed."),
        }
        if payload.status in notif_map:
            type_, message = notif_map[payload.status]
            create_notification(
                db,
                user_id=request.requester_id,
                type_=type_,
                title="Request status updated",
                message=message,
                related_request_id=request.id,
            )
    return request


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if request.requester_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this request")
    request.status = RequestStatus.CANCELLED
    db.commit()
    return None
