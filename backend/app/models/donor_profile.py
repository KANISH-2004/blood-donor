import enum
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import gen_uuid


class BloodGroup(str, enum.Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"


class ContactMethod(str, enum.Enum):
    PHONE = "phone"
    EMAIL = "email"
    APP = "in_app"


class DonorProfile(Base):
    __tablename__ = "donor_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)

    age: Mapped[int] = mapped_column(Integer, nullable=False)
    blood_group: Mapped[BloodGroup] = mapped_column(Enum(BloodGroup), nullable=False, index=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    area: Mapped[str] = mapped_column(String(120), nullable=True)  # approximate area, never exact address
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    last_donation_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    preferred_contact_method: Mapped[ContactMethod] = mapped_column(Enum(ContactMethod), default=ContactMethod.APP)
    total_donations: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="donor_profile")
    matches = relationship("DonorMatch", back_populates="donor", cascade="all, delete-orphan")
    donations = relationship("DonationHistory", back_populates="donor", cascade="all, delete-orphan")

    def eligible_by_donation_gap(self, min_gap_days: int = 90) -> bool:
        """Simple heuristic only — NOT a medical eligibility decision."""
        if not self.last_donation_date:
            return True
        return (date.today() - self.last_donation_date).days >= min_gap_days
