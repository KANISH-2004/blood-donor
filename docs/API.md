# API Reference

Base URL: `http://localhost:8000/api/v1`

Interactive, always-up-to-date docs are also served by FastAPI itself at
`http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc`.

Authentication: send `Authorization: Bearer <access_token>` on any endpoint
marked **auth**. Tokens are returned by `/auth/register` and `/auth/login`.

## Auth

| Method | Path             | Auth | Description                          |
|--------|------------------|------|--------------------------------------|
| POST   | `/auth/register` | —    | Create an account, returns a token   |
| POST   | `/auth/login`    | —    | Log in, returns a token              |
| GET    | `/auth/me`       | ✅   | Get the current user                 |
| POST   | `/auth/logout`   | —    | Stateless — discard the token client-side |

## Users

| Method | Path         | Auth | Description             |
|--------|--------------|------|--------------------------|
| GET    | `/users/me`  | ✅   | Get your profile         |
| PUT    | `/users/me`  | ✅   | Update name/phone        |

## Donors

| Method | Path                   | Auth | Description                                   |
|--------|------------------------|------|------------------------------------------------|
| POST   | `/donors/profile`      | ✅   | Create or replace your donor profile           |
| GET    | `/donors/profile/me`   | ✅   | Get your donor profile                         |
| PATCH  | `/donors/profile/me`   | ✅   | Partially update your donor profile            |
| GET    | `/donors/search`       | —    | Public search — masked name, no phone/address  |

Query params for `/donors/search`: `city`, `area`, `blood_group`, `available_only` (default `true`).

## Blood requests

| Method | Path              | Auth | Description                        |
|--------|-------------------|------|--------------------------------------|
| POST   | `/requests`       | ✅   | Create a request                    |
| GET    | `/requests`       | —    | List active requests (filterable)   |
| GET    | `/requests/mine`  | ✅   | List your own requests              |
| GET    | `/requests/{id}`  | —    | Get a single request                |
| PATCH  | `/requests/{id}`  | ✅   | Update (owner or admin only)        |
| DELETE | `/requests/{id}`  | ✅   | Cancel (owner or admin only)        |

Query params for `GET /requests`: `city`, `blood_group`, `status`.

## Matching

| Method | Path                                 | Auth | Description                              |
|--------|---------------------------------------|------|-------------------------------------------|
| POST   | `/matching/requests/{id}/run`         | ✅   | Rank candidate donors for a request       |
| GET    | `/matching/requests/{id}`             | —    | List existing matches for a request       |
| POST   | `/matching/matches/{match_id}/accept` | ✅   | Donor accepts a suggested match           |
| GET    | `/matching/disclaimer`                | —    | The medical disclaimer text               |

**Compatibility rules used by matching** are standard ABO/Rh donor→recipient
rules (e.g. O- is a universal donor, AB+ a universal recipient). Scoring then
ranks compatible, available donors by same-city/area proximity and donation
recency. This is a discovery aid, not a medical or eligibility determination
— see the disclaimer endpoint and the in-app notices.

## Notifications

| Method | Path                         | Auth | Description                  |
|--------|-------------------------------|------|-------------------------------|
| GET    | `/notifications`              | ✅   | List your notifications       |
| PATCH  | `/notifications/{id}/read`    | ✅   | Mark one as read              |
| POST   | `/notifications/read-all`     | ✅   | Mark all as read              |

## Admin

All admin routes require a user with `role = admin`.

| Method | Path                              | Description                     |
|--------|------------------------------------|----------------------------------|
| GET    | `/admin/stats`                     | Platform-wide counters           |
| GET    | `/admin/users`                     | List all users                   |
| GET    | `/admin/donors`                    | List all donor profiles          |
| GET    | `/admin/requests`                  | List all blood requests          |
| POST   | `/admin/users/{id}/suspend`        | Suspend a user                   |
| POST   | `/admin/users/{id}/reactivate`     | Reactivate a suspended user      |
| POST   | `/admin/requests/{id}/remove`      | Remove a request                 |
| GET    | `/admin/actions`                   | Audit log of admin actions       |

## Error format

Errors follow FastAPI's default shape:

```json
{ "detail": "Human-readable message" }
```
