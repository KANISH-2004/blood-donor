from datetime import datetime, timedelta, timezone
from app.models.donor_profile import BloodGroup
from app.services.matching_service import compatible_blood_groups


def test_blood_compatibility_logic():
    # O- can donate to all, but only receive from O-
    assert compatible_blood_groups(BloodGroup.O_NEG) == [BloodGroup.O_NEG]

    # O+ can receive from O- and O+
    assert set(compatible_blood_groups(BloodGroup.O_POS)) == {BloodGroup.O_NEG, BloodGroup.O_POS}

    # AB+ can receive from all groups
    assert set(compatible_blood_groups(BloodGroup.AB_POS)) == set(BloodGroup)


def test_matching_flow(client, requester_headers, test_donor_user):
    future_time = (datetime.now(timezone.utc) + timedelta(hours=12)).isoformat()
    # Create an emergency request for O- blood in Chennai
    req_res = client.post(
        "/api/v1/requests",
        headers=requester_headers,
        json={
            "blood_group": "O-",
            "hospital_name": "Apollo Emergency",
            "hospital_location": "Greams Road, Chennai",
            "city": "Chennai",
            "units_required": 2,
            "urgency": "critical",
            "required_by": future_time,
        },
    )
    request_id = req_res.json()["id"]

    # Run matching for this request
    match_res = client.post(f"/api/v1/matching/requests/{request_id}/run", headers=requester_headers)
    assert match_res.status_code == 200
    matches = match_res.json()
    assert len(matches) >= 1
    top_match = matches[0]
    assert top_match["donor_blood_group"] == "O-"
    assert top_match["donor_city"] == "Chennai"
    assert top_match["match_score"] > 50


def test_matching_disclaimer_endpoint(client):
    res = client.get("/api/v1/matching/disclaimer")
    assert res.status_code == 200
    assert "disclaimer" in res.json()
    assert "medical" in res.json()["disclaimer"].lower()
