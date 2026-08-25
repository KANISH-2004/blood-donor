from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.donor_match import MatchStatus


class DonorMatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    request_id: str
    donor_id: str
    match_score: float
    status: MatchStatus
    created_at: datetime

    # convenience fields resolved at the API layer for display
    donor_display_name: str | None = None
    donor_blood_group: str | None = None
    donor_city: str | None = None
