import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import gen_uuid


class ActionType(str, enum.Enum):
    SUSPEND_USER = "suspend_user"
    REACTIVATE_USER = "reactivate_user"
    VERIFY_DONOR = "verify_donor"
    REPORT_ACCOUNT = "report_account"
    DELETE_REQUEST = "delete_request"
    OTHER = "other"


class AdminAction(Base):
    __tablename__ = "admin_actions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    admin_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    target_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    action_type: Mapped[ActionType] = mapped_column(Enum(ActionType), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    admin = relationship("User", foreign_keys=[admin_id])
    target_user = relationship("User", foreign_keys=[target_user_id])
