# RedLine — Blood Donor & Emergency Blood Request Platform

A full-stack MVP that connects blood donors, requesters, hospitals, and
admins so that people can find compatible, available donors quickly during
an emergency.

> **Medical disclaimer:** RedLine helps people *discover* and *coordinate*.
> It does not — and never will — make medical eligibility or
> transfusion-compatibility decisions. Suggested donor matches are a
> data-driven starting point only. Always confirm actual compatibility and
> donor eligibility with a qualified medical professional or blood bank
> before any donation or transfusion.

---

## Table of contents

1. [Problem statement](#problem-statement)
2. [Solution](#solution)
3. [Features](#features)
4. [Tech stack](#tech-stack)
5. [System architecture](#system-architecture)
6. [Database structure](#database-structure)
7. [API endpoints](#api-endpoints)
8. [Project structure](#project-structure)
9. [Installation](#installation)
10. [Environment variables](#environment-variables)
11. [Running the backend](#running-the-backend)
12. [Running the frontend](#running-the-frontend)
13. [Running the database](#running-the-database)
14. [Running everything with Docker](#running-everything-with-docker)
15. [Testing the main features](#testing-the-main-features)
16. [Screenshots](#screenshots)
17. [Future improvements](#future-improvements)
18. [Disclaimer](#disclaimer)

---

## Problem statement

During a medical emergency, families and hospitals often lose critical time
trying to locate a compatible blood donor through phone trees, social media
posts, and word of mouth. There's no shared, structured place to see who's
nearby, available, and the right blood group — while also protecting donor
privacy.

## Solution

RedLine is a web platform where:

- **Donors** register once with their blood group, approximate location,
  and availability.
- **Requesters** post a blood request with hospital, urgency, and units
  needed.
- A **matching engine** ranks compatible, available donors near the
  request — using real ABO/Rh compatibility rules — without exposing
  donors' exact addresses or contact details publicly.
- **Admins** oversee the platform: user management, suspicious-account
  handling, and platform statistics.

## Features

- Email/password authentication with JWT, role-based access (donor,
  requester, admin)
- Donor registration & profile management (blood group, city/area,
  availability, last donation date, preferred contact method)
- Emergency blood request creation with urgency levels and required units
- Donor matching engine (blood-group compatibility + proximity +
  availability), with a clear non-medical disclaimer
- Public donor search that never exposes exact address, phone, or email
- In-app notifications (new request, match found, request accepted,
  request completed) — architected so SMS/email/WhatsApp providers can be
  plugged in later without a schema change
- Separate dashboards for donors, requesters, and admins
- Admin panel: user list, suspend/reactivate accounts, request oversight,
  platform stats, action audit log
- Responsive, accessible UI with loading, empty, and error states

## Tech stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios
**Backend:** Python, FastAPI, SQLAlchemy 2.0, Pydantic v2, python-jose (JWT),
passlib/bcrypt
**Database:** PostgreSQL (SQLite supported out of the box for quick local
dev without Docker)
**Containerization:** Docker + docker-compose

## System architecture

```
┌─────────────┐      HTTPS/JSON       ┌──────────────┐      SQL       ┌────────────┐
│   Frontend   │  ───────────────────▶ │   Backend    │ ─────────────▶ │  Database  │
│ React + Vite │ ◀─────────────────── │   FastAPI    │ ◀───────────── │ PostgreSQL │
│  (port 5173) │      JSON responses   │  (port 8000) │   SQLAlchemy   │ (port 5432)│
└─────────────┘                       └──────────────┘                └────────────┘
```

- The frontend calls the backend exclusively through the REST API
  (`src/api/client.js`), attaching the JWT from `localStorage` to every
  request.
- The backend talks to Postgres (or SQLite in dev) through SQLAlchemy's
  ORM; `Base.metadata.create_all()` provisions tables on startup, and
  `app/db/seed.py` populates realistic sample data.
- CORS is restricted to the frontend origin(s) via `CORS_ORIGINS`.

## Database structure

See [`database/schema.sql`](database/schema.sql) for the full reference
schema, and `backend/app/models/` for the SQLAlchemy source of truth. Tables:

- `users` — accounts and roles
- `donor_profiles` — one-to-one with a donor user
- `blood_requests` — created by requesters
- `donor_matches` — candidate donor ↔ request pairings with a score
- `notifications` — in-app (and future SMS/email/WhatsApp) alerts
- `donation_history` — completed donation records
- `admin_actions` — audit log of admin actions

## API endpoints

Full reference: [`docs/API.md`](docs/API.md). Interactive docs are also
served live at `http://localhost:8000/docs` once the backend is running.

## Project structure

```
Blood-Donor-Platform/
├── frontend/                 # React + Vite + Tailwind SPA
│   ├── src/
│   │   ├── api/               # Axios client + endpoint wrappers
│   │   ├── components/        # Navbar, Footer, Toast, badges, etc.
│   │   ├── context/            # AuthContext
│   │   └── pages/              # Landing, Login, Register, dashboards, ...
│   ├── Dockerfile
│   └── .env.example
├── backend/                   # FastAPI REST API
│   ├── app/
│   │   ├── api/routes/          # auth, users, donors, requests, matching, notifications, admin
│   │   ├── core/                 # config, security, deps
│   │   ├── db/                    # session, base, seed
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── schemas/                 # Pydantic schemas
│   │   └── services/                 # matching_service, notification_service
│   ├── Dockerfile
│   └── .env.example
├── database/
│   └── schema.sql              # Reference SQL schema
├── docs/
│   └── API.md                  # Endpoint reference
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Installation

Prerequisites: **Node.js 18+**, **Python 3.11+**, and either **Docker** (easiest)
or a local **PostgreSQL** instance (optional — SQLite works out of the box).

```bash
git clone <your-fork-url> Blood-Donor-Platform
cd Blood-Donor-Platform
```

## Environment variables

Copy the example env files and adjust as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.example .env   # only needed for docker-compose (Postgres credentials)
```

Never commit real `.env` files — they're already excluded via `.gitignore`.

| File                    | Key variables                                              |
|--------------------------|-------------------------------------------------------------|
| `backend/.env`            | `DATABASE_URL`, `JWT_SECRET_KEY`, `CORS_ORIGINS`             |
| `frontend/.env`           | `VITE_API_BASE_URL`                                          |
| `.env` (project root)     | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (Docker)|

Generate a strong JWT secret with: `openssl rand -hex 32`

## Running the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Uses SQLite by default (no setup needed) unless DATABASE_URL is changed to Postgres
python -m app.db.seed           # creates tables + realistic sample data
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000` (docs at `/docs`).

Seeded demo accounts:

| Role      | Email                       | Password       |
|-----------|-------------------------------|------------------|
| Admin     | `admin@blooddonor.dev`         | `Admin@123`       |
| Donor     | `donor1@blooddonor.dev`        | `Donor@123`        |
| Requester | `requester1@blooddonor.dev`    | `Requester@123`     |

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

The app is now live at `http://localhost:5173` and talks to the backend at
the URL set in `VITE_API_BASE_URL`.

## Running the database

**Option A — SQLite (default, zero setup):** nothing to do; `backend/app/db/seed.py`
creates `backend/blood_donor.db` automatically.

**Option B — PostgreSQL locally:**

```bash
createdb blood_donor_db
# then set in backend/.env:
# DATABASE_URL=postgresql://<user>:<password>@localhost:5432/blood_donor_db
python -m app.db.seed
```

**Option C — Docker (see below)** runs Postgres for you.

## Running everything with Docker

```bash
cp .env.example .env               # set real Postgres credentials
cp backend/.env.example backend/.env
# in backend/.env set:
# DATABASE_URL=postgresql://<user>:<password>@db:5432/<db>  (matches root .env)

docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000` (docs at `/docs`)
- Postgres: `localhost:5432`

Seed the database once the containers are up:

```bash
docker compose exec backend python -m app.db.seed
```

## Testing the main features

1. **Register** a donor account at `/register`, choosing "Donor," then fill
   in your donor profile at `/donor/register`.
2. **Register** a second account as "Requester," then post a request at
   `/request/new`.
3. On the request's detail page, click **Find matching donors** — you'll
   see ranked candidates with a match score and the medical disclaimer.
4. Log in as the seeded **admin** account and visit `/dashboard/admin` to
   view platform stats, manage users (suspend/reactivate), and review
   requests.
5. Try `/search` (public donor search) to confirm no phone/email/exact
   address is ever shown.

## Screenshots

_Add screenshots here after running the app locally, e.g.:_

- `docs/screenshots/landing.png` — Landing page
- `docs/screenshots/dashboard-donor.png` — Donor dashboard
- `docs/screenshots/dashboard-admin.png` — Admin dashboard
- `docs/screenshots/request-detail.png` — Request detail + matching

## Future improvements

- Real SMS/email/WhatsApp delivery (Twilio, SES, WhatsApp Business API) —
  the `notifications.channel` field is already modeled for this
- Verified blood bank accounts and hospital-side dashboards
- Geolocation-based distance instead of city/area string matching
- Rate limiting and stronger anti-abuse controls on public search
- Automated tests (pytest for backend, Vitest/RTL for frontend) and CI
- Push notifications via a service worker
- Multi-language support

## Disclaimer

This project is an educational/startup MVP demonstration. It is **not** a
certified medical device or service. RedLine assists with discovery and
coordination only. All transfusion-compatibility and donor-eligibility
decisions must be made by qualified medical professionals and accredited
blood banks. In a life-threatening emergency, always contact your local
emergency services and hospital directly.
