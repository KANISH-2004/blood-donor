import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.donor_profile import BloodGroup, ContactMethod, DonorProfile
from app.models.user import User, UserRole

# Use in-memory SQLite for super-fast, isolated automated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_admin_user(db_session):
    user = User(
        full_name="Admin Test",
        email="admin@test.dev",
        phone="9999999990",
        hashed_password=hash_password("Admin@123"),
        role=UserRole.ADMIN,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_headers(test_admin_user):
    token = create_access_token(subject=test_admin_user.id, extra_claims={"role": "admin"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_donor_user(db_session):
    user = User(
        full_name="Jane Donor",
        email="jane.donor@test.dev",
        phone="9999999991",
        hashed_password=hash_password("Donor@123"),
        role=UserRole.DONOR,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    profile = DonorProfile(
        user_id=user.id,
        age=28,
        blood_group=BloodGroup.O_NEG,
        city="Chennai",
        area="Anna Nagar",
        is_available=True,
        preferred_contact_method=ContactMethod.APP,
        total_donations=3,
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(profile)
    return user


@pytest.fixture
def donor_headers(test_donor_user):
    token = create_access_token(subject=test_donor_user.id, extra_claims={"role": "donor"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_requester_user(db_session):
    user = User(
        full_name="John Requester",
        email="john.requester@test.dev",
        phone="9999999992",
        hashed_password=hash_password("Requester@123"),
        role=UserRole.REQUESTER,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def requester_headers(test_requester_user):
    token = create_access_token(subject=test_requester_user.id, extra_claims={"role": "requester"})
    return {"Authorization": f"Bearer {token}"}
