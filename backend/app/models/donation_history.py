from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import gen_uuid


class DonationHistory(Base):
    __tablename__ = "donation_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    donor_id: Mapped[str] = mapped_column(String(36), ForeignKey("donor_profiles.id"), nullable=False, index=True)
    request_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("blood_requests.id"), nullable=True)

    donation_date: Mapped[date] = mapped_column(Date, default=date.today)
    units_donated: Mapped[int] = mapped_column(Integer, default=1)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    donor = relationship("DonorProfile", back_populates="donations")
    request = relationship("BloodRequest", back_populates="donations")
