def test_register_donor(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test Donor User",
            "email": "newdonor@test.dev",
            "phone": "9876543210",
            "password": "Password@123",
            "role": "donor",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newdonor@test.dev"
    assert data["user"]["role"] == "donor"


def test_register_duplicate_email_fails(client, test_donor_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Duplicate User",
            "email": test_donor_user.email,
            "phone": "9876543210",
            "password": "Password@123",
            "role": "donor",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_success(client, test_donor_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_donor_user.email,
            "password": "Donor@123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_donor_user.email


def test_login_invalid_password(client, test_donor_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_donor_user.email,
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_current_user_me(client, donor_headers, test_donor_user):
    response = client.get("/api/v1/auth/me", headers=donor_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_donor_user.id
    assert data["email"] == test_donor_user.email
