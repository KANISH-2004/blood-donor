-- Reference schema for the Blood Donor & Emergency Blood Request Platform.
--
-- This file documents the target relational structure in plain SQL for
-- readability and for anyone setting up Postgres manually. In normal
-- operation, the backend creates these tables automatically at startup via
-- SQLAlchemy (see backend/app/models/*.py) — you do NOT need to run this
-- file by hand unless you want to inspect or manually provision the schema.

CREATE TABLE users (
    id              UUID PRIMARY KEY,
    full_name       VARCHAR(120)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    phone           VARCHAR(20)   NOT NULL,
    hashed_password VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL DEFAULT 'requester', -- donor | requester | admin
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    is_suspended    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE donor_profiles (
    id                        UUID PRIMARY KEY,
    user_id                   UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    age                       INTEGER NOT NULL,
    blood_group               VARCHAR(3) NOT NULL, -- A+, A-, B+, B-, AB+, AB-, O+, O-
    city                      VARCHAR(100) NOT NULL,
    area                      VARCHAR(120),          -- approximate area only, never exact address
    is_available              BOOLEAN NOT NULL DEFAULT TRUE,
    last_donation_date        DATE,
    preferred_contact_method  VARCHAR(20) NOT NULL DEFAULT 'in_app', -- phone | email | in_app
    total_donations           INTEGER NOT NULL DEFAULT 0,
    created_at                TIMESTAMP NOT NULL DEFAULT now(),
    updated_at                TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_donor_profiles_blood_group ON donor_profiles(blood_group);
CREATE INDEX idx_donor_profiles_city ON donor_profiles(city);
CREATE INDEX idx_donor_profiles_available ON donor_profiles(is_available);

CREATE TABLE blood_requests (
    id                UUID PRIMARY KEY,
    requester_id      UUID NOT NULL REFERENCES users(id),
    blood_group       VARCHAR(3) NOT NULL,
    hospital_name     VARCHAR(150) NOT NULL,
    hospital_location VARCHAR(200) NOT NULL,
    city              VARCHAR(100) NOT NULL,
    units_required    INTEGER NOT NULL DEFAULT 1,
    urgency           VARCHAR(20) NOT NULL, -- critical | urgent | scheduled
    required_by       TIMESTAMP NOT NULL,
    notes             TEXT,
    status            VARCHAR(20) NOT NULL DEFAULT 'active', -- active | matched | accepted | completed | cancelled
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_blood_requests_city ON blood_requests(city);
CREATE INDEX idx_blood_requests_blood_group ON blood_requests(blood_group);
CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_blood_requests_urgency ON blood_requests(urgency);

CREATE TABLE donor_matches (
    id           UUID PRIMARY KEY,
    request_id   UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    donor_id     UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    match_score  FLOAT NOT NULL DEFAULT 0,
    status       VARCHAR(20) NOT NULL DEFAULT 'suggested', -- suggested | notified | accepted | declined | completed
    created_at   TIMESTAMP NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_donor_matches_request ON donor_matches(request_id);
CREATE INDEX idx_donor_matches_donor ON donor_matches(donor_id);

CREATE TABLE notifications (
    id                 UUID PRIMARY KEY,
    user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type               VARCHAR(30) NOT NULL, -- new_request | match_found | request_accepted | request_completed | system
    channel            VARCHAR(20) NOT NULL DEFAULT 'in_app', -- in_app | sms | email | whatsapp | push
    title              VARCHAR(150) NOT NULL,
    message            TEXT NOT NULL,
    related_request_id UUID REFERENCES blood_requests(id),
    is_read            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE TABLE donation_history (
    id             UUID PRIMARY KEY,
    donor_id       UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    request_id     UUID REFERENCES blood_requests(id),
    donation_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    units_donated  INTEGER NOT NULL DEFAULT 1,
    location       VARCHAR(200),
    notes          TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_donation_history_donor ON donation_history(donor_id);

CREATE TABLE admin_actions (
    id             UUID PRIMARY KEY,
    admin_id       UUID NOT NULL REFERENCES users(id),
    target_user_id UUID REFERENCES users(id),
    action_type    VARCHAR(30) NOT NULL, -- suspend_user | reactivate_user | verify_donor | report_account | delete_request | other
    reason         TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
