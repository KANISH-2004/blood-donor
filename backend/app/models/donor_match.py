import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import gen_uuid


class MatchStatus(str, enum.Enum):
    SUGGESTED = "suggested"
    NOTIFIED = "notified"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    COMPLETED = "completed"


class DonorMatch(Base):
    """
    Represents a candidate match between a blood request and a donor.
    Produced by the matching service — compatibility here is a data-driven
    suggestion only, NOT a medical/eligibility determination.
    """
    __tablename__ = "donor_matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    request_id: Mapped[str] = mapped_column(String(36), ForeignKey("blood_requests.id"), nullable=False, index=True)
    donor_id: Mapped[str] = mapped_column(String(36), ForeignKey("donor_profiles.id"), nullable=False, index=True)

    match_score: Mapped[float] = mapped_column(Float, default=0.0)  # higher = better candidate
    status: Mapped[MatchStatus] = mapped_column(Enum(MatchStatus), default=MatchStatus.SUGGESTED, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    request = relationship("BloodRequest", back_populates="matches")
    donor = relationship("DonorProfile", back_populates="matches")
