from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.notification import NotificationChannel, NotificationType


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    type: NotificationType
    channel: NotificationChannel
    title: str
    message: str
    related_request_id: str | None
    is_read: bool
    created_at: datetime
