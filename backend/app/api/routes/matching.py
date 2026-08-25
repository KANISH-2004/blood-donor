from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.blood_request import BloodRequest, RequestStatus
from app.models.donor_match import DonorMatch, MatchStatus
from app.models.notification import NotificationType
from app.models.user import User
from app.schemas.match import DonorMatchOut
from app.services.matching_service import find_candidate_donors
from app.services.notification_service import create_notification

router = APIRouter(prefix="/matching", tags=["Donor Matching"])

DISCLAIMER = (
    "These are data-driven candidate suggestions only, ranked by blood-group "
    "compatibility, approximate location, and availability. They are NOT a "
    "medical determination. Actual transfusion compatibility and donor "
    "eligibility must always be confirmed by a qualified medical "
    "professional or blood bank before any donation or transfusion."
)


@router.post("/requests/{request_id}/run", response_model=list[DonorMatchOut])
def run_matching(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if request.requester_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    candidates = find_candidate_donors(db, request)

    results = []
    for donor, score in candidates:
        match = (
            db.query(DonorMatch)
            .filter(DonorMatch.request_id == request.id, DonorMatch.donor_id == donor.id)
            .first()
        )
        if not match:
            match = DonorMatch(request_id=request.id, donor_id=donor.id, match_score=score, status=MatchStatus.SUGGESTED)
            db.add(match)
        else:
            match.match_score = score
        db.commit()
        db.refresh(match)

        out = DonorMatchOut.model_validate(match)
        out.donor_display_name = donor.user.full_name if donor.user else None
        out.donor_blood_group = donor.blood_group.value
        out.donor_city = donor.city
        results.append(out)

        create_notification(
            db,
            user_id=donor.user_id,
            type_=NotificationType.MATCH_FOUND,
            title="You may be a match for an emergency request",
            message=f"A request for {request.blood_group.value} blood near {request.city} may match your profile.",
            related_request_id=request.id,
        )

    return results


@router.get("/requests/{request_id}", response_model=list[DonorMatchOut])
def get_matches(request_id: str, db: Session = Depends(get_db)):
    matches = db.query(DonorMatch).filter(DonorMatch.request_id == request_id).order_by(DonorMatch.match_score.desc()).all()
    results = []
    for match in matches:
        out = DonorMatchOut.model_validate(match)
        if match.donor and match.donor.user:
            out.donor_display_name = match.donor.user.full_name
            out.donor_blood_group = match.donor.blood_group.value
            out.donor_city = match.donor.city
        results.append(out)
    return results


@router.post("/matches/{match_id}/accept", response_model=DonorMatchOut)
def accept_match(match_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    match = db.query(DonorMatch).filter(DonorMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    if match.donor.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    match.status = MatchStatus.ACCEPTED
    match.request.status = RequestStatus.ACCEPTED
    db.commit()
    db.refresh(match)

    create_notification(
        db,
        user_id=match.request.requester_id,
        type_=NotificationType.REQUEST_ACCEPTED,
        title="A donor accepted your request",
        message="A matched donor has accepted your blood request. Coordinate next steps via the hospital/blood bank.",
        related_request_id=match.request_id,
    )
    return match


@router.get("/disclaimer")
def matching_disclaimer():
    return {"disclaimer": DISCLAIMER}
