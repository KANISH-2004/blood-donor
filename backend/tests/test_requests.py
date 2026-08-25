from datetime import datetime, timedelta, timezone


def test_create_blood_request(client, requester_headers, test_requester_user):
    future_time = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
    response = client.post(
        "/api/v1/requests",
        headers=requester_headers,
        json={
            "blood_group": "O-",
            "hospital_name": "Apollo Hospitals",
            "hospital_location": "Greams Road, Thousand Lights",
            "city": "Chennai",
            "units_required": 2,
            "urgency": "critical",
            "required_by": future_time,
            "notes": "Emergency surgery requirement",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["blood_group"] == "O-"
    assert data["hospital_name"] == "Apollo Hospitals"
    assert data["units_required"] == 2
    assert data["status"] == "active"


def test_list_blood_requests(client, requester_headers):
    future_time = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
    client.post(
        "/api/v1/requests",
        headers=requester_headers,
        json={
            "blood_group": "A+",
            "hospital_name": "City General",
            "hospital_location": "T Nagar",
            "city": "Chennai",
            "units_required": 1,
            "urgency": "urgent",
            "required_by": future_time,
        },
    )

    response = client.get("/api/v1/requests?city=Chennai")
    assert response.status_code == 200
    requests = response.json()
    assert len(requests) >= 1
    assert any(r["blood_group"] == "A+" for r in requests)


def test_requester_my_requests(client, requester_headers):
    response = client.get("/api/v1/requests/mine", headers=requester_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_cancel_blood_request(client, requester_headers):
    future_time = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
    created = client.post(
        "/api/v1/requests",
        headers=requester_headers,
        json={
            "blood_group": "B+",
            "hospital_name": "Fortis Hospital",
            "hospital_location": "Vadapalani",
            "city": "Chennai",
            "units_required": 1,
            "urgency": "scheduled",
            "required_by": future_time,
        },
    ).json()

    req_id = created["id"]
    delete_res = client.delete(f"/api/v1/requests/{req_id}", headers=requester_headers)
    assert delete_res.status_code == 204

    # Verify status is now cancelled
    get_res = client.get(f"/api/v1/requests/{req_id}")
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "cancelled"
