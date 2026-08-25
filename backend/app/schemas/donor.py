from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.donor_profile import BloodGroup, ContactMethod


class DonorProfileCreate(BaseModel):
    age: int = Field(ge=18, le=65, description="Donors are typically required to be 18-65")
    blood_group: BloodGroup
    city: str = Field(min_length=2, max_length=100)
    area: str | None = Field(default=None, max_length=120)
    is_available: bool = True
    last_donation_date: date | None = None
    preferred_contact_method: ContactMethod = ContactMethod.APP


class DonorProfileUpdate(BaseModel):
    age: int | None = Field(default=None, ge=18, le=65)
    blood_group: BloodGroup | None = None
    city: str | None = None
    area: str | None = None
    is_available: bool | None = None
    last_donation_date: date | None = None
    preferred_contact_method: ContactMethod | None = None


class DonorProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    age: int
    blood_group: BloodGroup
    city: str
    area: str | None
    is_available: bool
    last_donation_date: date | None
    preferred_contact_method: ContactMethod
    total_donations: int
    created_at: datetime

    # donor-facing convenience fields populated at the API layer
    full_name: str | None = None


class DonorPublicOut(BaseModel):
    """
    Public-safe view of a donor used in search results.
    Deliberately omits phone/email/exact address/full profile id linkage.
    """
    model_config = ConfigDict(from_attributes=True)

    donor_id: str
    display_name: str
    blood_group: BloodGroup
    city: str
    area: str | None
    is_available: bool
