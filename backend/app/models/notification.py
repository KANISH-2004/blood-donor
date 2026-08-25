import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import gen_uuid


class NotificationType(str, enum.Enum):
    NEW_REQUEST = "new_request"
    MATCH_FOUND = "match_found"
    REQUEST_ACCEPTED = "request_accepted"
    REQUEST_COMPLETED = "request_completed"
    SYSTEM = "system"


class NotificationChannel(str, enum.Enum):
    """
    The channel a notification was (or will be) delivered through.
    Only IN_APP is actually wired up today; SMS/EMAIL/WHATSAPP are
    modeled now so the architecture can plug in real providers later
    without changing the schema.
    """
    IN_APP = "in_app"
    SMS = "sms"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    PUSH = "push"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType), nullable=False)
    channel: Mapped[NotificationChannel] = mapped_column(Enum(NotificationChannel), default=NotificationChannel.IN_APP)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    related_request_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("blood_requests.id"), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
