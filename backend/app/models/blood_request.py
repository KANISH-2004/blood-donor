import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.donor_profile import BloodGroup
from app.models.user import gen_uuid


class UrgencyLevel(str, enum.Enum):
    CRITICAL = "critical"   # needed within hours
    URGENT = "urgent"       # needed within 24-48h
    SCHEDULED = "scheduled"  # planned / non-emergency


class RequestStatus(str, enum.Enum):
    ACTIVE = "active"
    MATCHED = "matched"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    requester_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    blood_group: Mapped[BloodGroup] = mapped_column(Enum(BloodGroup), nullable=False, index=True)
    hospital_name: Mapped[str] = mapped_column(String(150), nullable=False)
    hospital_location: Mapped[str] = mapped_column(String(200), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    units_required: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    urgency: Mapped[UrgencyLevel] = mapped_column(Enum(UrgencyLevel), nullable=False, index=True)
    required_by: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), default=RequestStatus.ACTIVE, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    requester = relationship("User", back_populates="blood_requests")
    matches = relationship("DonorMatch", back_populates="request", cascade="all, delete-orphan")
    donations = relationship("DonationHistory", back_populates="request", cascade="all, delete-orphan")
