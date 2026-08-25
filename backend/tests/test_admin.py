def test_admin_stats(client, admin_headers, test_donor_user, test_requester_user):
    res = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert res.status_code == 200
    stats = res.json()
    assert "total_users" in stats
    assert "total_donors" in stats
    assert "active_requests" in stats
    assert stats["total_users"] >= 2


def test_admin_suspend_and_reactivate_user(client, admin_headers, test_donor_user):
    # Suspend user
    suspend_res = client.post(
        f"/api/v1/admin/users/{test_donor_user.id}/suspend?reason=Test suspension",
        headers=admin_headers,
    )
    assert suspend_res.status_code == 200
    assert suspend_res.json()["is_suspended"] is True

    # Reactivate user
    reactivate_res = client.post(
        f"/api/v1/admin/users/{test_donor_user.id}/reactivate",
        headers=admin_headers,
    )
    assert reactivate_res.status_code == 200
    assert reactivate_res.json()["is_suspended"] is False


def test_admin_list_users(client, admin_headers):
    res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_unauthorized_user_cannot_access_admin(client, donor_headers):
    res = client.get("/api/v1/admin/stats", headers=donor_headers)
    assert res.status_code == 403
