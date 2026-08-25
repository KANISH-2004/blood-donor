"""
Seeds the database with realistic sample data for local development.

Run with:  python -m app.db.seed   (from the backend/ directory, venv active)
"""
import random
from datetime import date, datetime, timedelta, timezone

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.blood_request import BloodRequest, RequestStatus, UrgencyLevel
from app.models.donor_profile import BloodGroup, ContactMethod, DonorProfile
from app.models.user import User, UserRole

# Import remaining models so all relationships resolve correctly.
from app.models import admin_action, donation_history, donor_match, notification  # noqa: F401,E402


CITIES = ["Chennai", "Bengaluru", "Hyderabad", "Coimbatore", "Madurai"]
AREAS = ["Anna Nagar", "T Nagar", "Whitefield", "Gachibowli", "RS Puram"]
BLOOD_GROUPS = list(BloodGroup)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already has data. Skipping seed.")
            return

        # --- Admin ---
        admin = User(
            full_name="Platform Admin",
            email="admin@blooddonor.dev",
            phone="9000000000",
            hashed_password=hash_password("Admin@123"),
            role=UserRole.ADMIN,
        )
        db.add(admin)

        # --- Donors ---
        donor_users = []
        for i in range(1, 13):
            user = User(
                full_name=f"Donor User {i}",
                email=f"donor{i}@blooddonor.dev",
                phone=f"90000000{i:02d}",
                hashed_password=hash_password("Donor@123"),
                role=UserRole.DONOR,
            )
            db.add(user)
            db.flush()
            profile = DonorProfile(
                user_id=user.id,
                age=random.randint(19, 55),
                blood_group=random.choice(BLOOD_GROUPS),
                city=random.choice(CITIES),
                area=random.choice(AREAS),
                is_available=random.choice([True, True, True, False]),
                last_donation_date=date.today() - timedelta(days=random.randint(10, 300)),
                preferred_contact_method=random.choice(list(ContactMethod)),
                total_donations=random.randint(0, 8),
            )
            db.add(profile)
            donor_users.append(user)

        # --- Requesters ---
        requester_users = []
        for i in range(1, 5):
            user = User(
                full_name=f"Requester User {i}",
                email=f"requester{i}@blooddonor.dev",
                phone=f"91000000{i:02d}",
                hashed_password=hash_password("Requester@123"),
                role=UserRole.REQUESTER,
            )
            db.add(user)
            db.flush()
            requester_users.append(user)

        db.flush()

    # --- Blood requests ---
    hospitals = ["City General Hospital", "St. Mary's Medical Center", "Apex Care Hospital", "Apollo Hospitals", "Fortis Healthcare"]
    for i in range(8):
        req = BloodRequest(
            requester_id=random.choice(requester_users).id,
            blood_group=random.choice(BLOOD_GROUPS),
            hospital_name=random.choice(hospitals),
            hospital_location=f"{random.choice(AREAS)}, {random.choice(CITIES)}",
            city=random.choice(CITIES),
            units_required=random.randint(1, 4),
            urgency=random.choice(list(UrgencyLevel)),
            required_by=datetime.now(timezone.utc) + timedelta(hours=random.randint(4, 72)),
            notes="Urgent requirement for patient. Please coordinate via hospital blood bank.",
            status=RequestStatus.ACTIVE,
        )
        db.add(req)

        db.commit()
        print("Seed complete.")
        print("Admin login:      admin@blooddonor.dev / Admin@123")
        print("Donor login:      donor1@blooddonor.dev / Donor@123")
        print("Requester login:  requester1@blooddonor.dev / Requester@123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
