from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.blood_request import RequestStatus, UrgencyLevel
from app.models.donor_profile import BloodGroup


class BloodRequestCreate(BaseModel):
    blood_group: BloodGroup
    hospital_name: str = Field(min_length=2, max_length=150)
    hospital_location: str = Field(min_length=2, max_length=200)
    city: str = Field(min_length=2, max_length=100)
    units_required: int = Field(ge=1, le=20)
    urgency: UrgencyLevel
    required_by: datetime
    notes: str | None = Field(default=None, max_length=1000)


class BloodRequestUpdate(BaseModel):
    units_required: int | None = Field(default=None, ge=1, le=20)
    urgency: UrgencyLevel | None = None
    required_by: datetime | None = None
    notes: str | None = None
    status: RequestStatus | None = None


class BloodRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    requester_id: str
    blood_group: BloodGroup
    hospital_name: str
    hospital_location: str
    city: str
    units_required: int
    urgency: UrgencyLevel
    required_by: datetime
    notes: str | None
    status: RequestStatus
    created_at: datetime
