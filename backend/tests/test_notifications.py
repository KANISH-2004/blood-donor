from app.models.notification import NotificationType
from app.services.notification_service import create_notification


def test_notifications_flow(client, donor_headers, test_donor_user, db_session):
    # Seed a notification for donor
    create_notification(
        db_session,
        user_id=test_donor_user.id,
        type_=NotificationType.MATCH_FOUND,
        title="Emergency Match Found",
        message="A patient urgently needs O- blood in Chennai.",
    )

    # Fetch notifications
    res = client.get("/api/v1/notifications", headers=donor_headers)
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) >= 1
    notif_id = notifs[0]["id"]
    assert notifs[0]["is_read"] is False

    # Mark single notification as read
    read_res = client.patch(f"/api/v1/notifications/{notif_id}/read", headers=donor_headers)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # Mark all read
    all_read_res = client.post("/api/v1/notifications/read-all", headers=donor_headers)
    assert all_read_res.status_code == 200
