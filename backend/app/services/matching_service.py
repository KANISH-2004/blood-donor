"""
Donor matching logic.

IMPORTANT: The compatibility table below is a commonly cited reference for
who-can-donate-to-whom by ABO/Rh blood group. It is used ONLY to narrow down
a candidate list of donors to contact. It is NOT a medical determination.
Actual transfusion compatibility, cross-matching, and donor eligibility must
always be confirmed by qualified medical professionals / blood banks before
any transfusion happens. This app never bypasses that requirement.
"""
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.blood_request import BloodRequest, UrgencyLevel
from app.models.donor_profile import BloodGroup, DonorProfile

# Recipient blood group -> list of blood groups that can donate to them.
COMPATIBILITY_MAP: dict[BloodGroup, list[BloodGroup]] = {
    BloodGroup.O_NEG: [BloodGroup.O_NEG],
    BloodGroup.O_POS: [BloodGroup.O_NEG, BloodGroup.O_POS],
    BloodGroup.A_NEG: [BloodGroup.O_NEG, BloodGroup.A_NEG],
    BloodGroup.A_POS: [BloodGroup.O_NEG, BloodGroup.O_POS, BloodGroup.A_NEG, BloodGroup.A_POS],
    BloodGroup.B_NEG: [BloodGroup.O_NEG, BloodGroup.B_NEG],
    BloodGroup.B_POS: [BloodGroup.O_NEG, BloodGroup.O_POS, BloodGroup.B_NEG, BloodGroup.B_POS],
    BloodGroup.AB_NEG: [BloodGroup.O_NEG, BloodGroup.A_NEG, BloodGroup.B_NEG, BloodGroup.AB_NEG],
    BloodGroup.AB_POS: list(BloodGroup),  # AB+ can receive from anyone
}

_URGENCY_WEIGHT = {
    UrgencyLevel.CRITICAL: 1.5,
    UrgencyLevel.URGENT: 1.2,
    UrgencyLevel.SCHEDULED: 1.0,
}


def compatible_blood_groups(recipient_group: BloodGroup) -> list[BloodGroup]:
    return COMPATIBILITY_MAP.get(recipient_group, [recipient_group])


def score_donor(donor: DonorProfile, request: BloodRequest) -> float:
    """
    Simple, transparent scoring heuristic:
      + same city as request           -> big boost (proxy for distance)
      + same area as hospital location -> extra boost
      + currently available            -> required (filtered earlier), boosts score
      + eligible by donation-gap rule  -> boost
      + exact blood group match        -> small boost over merely-compatible group
      * urgency weight                 -> scales everything for urgent requests
    This produces a ranking only. It never makes a medical eligibility call.
    """
    score = 10.0

    if donor.city.strip().lower() == request.city.strip().lower():
        score += 40
    if donor.area and donor.area.strip().lower() in request.hospital_location.strip().lower():
        score += 15
    if donor.is_available:
        score += 20
    if donor.eligible_by_donation_gap():
        score += 15
    if donor.blood_group == request.blood_group:
        score += 10

    score *= _URGENCY_WEIGHT.get(request.urgency, 1.0)
    return round(score, 2)


def find_candidate_donors(db: Session, request: BloodRequest, limit: int = 20) -> list[tuple[DonorProfile, float]]:
    """
    Returns a ranked list of (donor, score) tuples for a given blood request.
    Filters: compatible blood group + currently available.
    Does NOT guarantee medical eligibility — see module docstring.
    """
    allowed_groups = compatible_blood_groups(request.blood_group)

    candidates = (
        db.query(DonorProfile)
        .filter(DonorProfile.blood_group.in_(allowed_groups))
        .filter(DonorProfile.is_available.is_(True))
        .all()
    )

    scored = [(donor, score_donor(donor, request)) for donor in candidates]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[:limit]
