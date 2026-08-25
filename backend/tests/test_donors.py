def test_get_my_donor_profile(client, donor_headers, test_donor_user):
    response = client.get("/api/v1/donors/profile/me", headers=donor_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["blood_group"] == "O-"
    assert data["city"] == "Chennai"
    assert data["full_name"] == test_donor_user.full_name


def test_update_donor_profile_availability(client, donor_headers):
    response = client.patch(
        "/api/v1/donors/profile/me",
        headers=donor_headers,
        json={"is_available": False},
    )
    assert response.status_code == 200
    assert response.json()["is_available"] is False

    # Toggle back to available
    response = client.patch(
        "/api/v1/donors/profile/me",
        headers=donor_headers,
        json={"is_available": True},
    )
    assert response.status_code == 200
    assert response.json()["is_available"] is True


def test_search_donors_public_privacy(client, test_donor_user):
    # Public donor search must NEVER leak email, phone, or exact address
    response = client.get("/api/v1/donors/search?city=Chennai&blood_group=O-")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    donor = data[0]
    assert "email" not in donor
    assert "phone" not in donor
    assert "display_name" in donor
    assert donor["blood_group"] == "O-"
    assert donor["city"] == "Chennai"
