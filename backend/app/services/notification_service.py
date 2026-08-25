"""
Notification service.

Today this only creates in-app notification rows that the frontend polls /
fetches. The `channel` field on each notification is designed so that SMS,
email, and WhatsApp providers can be plugged in later (e.g. Twilio, SES,
WhatsApp Business API) without changing the calling code — a real provider
call would simply be added inside `_dispatch()`.
"""
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationChannel, NotificationType


def _dispatch(notification: Notification) -> None:
    """
    Placeholder for real delivery. In production this would branch on
    notification.channel and call the relevant provider SDK. For the MVP,
    in-app notifications are simply stored and read via the API.
    """
    pass


def create_notification(
    db: Session,
    user_id: str,
    type_: NotificationType,
    title: str,
    message: str,
    related_request_id: str | None = None,
    channel: NotificationChannel = NotificationChannel.IN_APP,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        type=type_,
        channel=channel,
        title=title,
        message=message,
        related_request_id=related_request_id,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    _dispatch(notification)
    return notification
