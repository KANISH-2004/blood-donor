from fastapi import APIRouter

from app.api.routes import admin, auth, donors, matching, notifications, requests, users

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(donors.router)
api_router.include_router(requests.router)
api_router.include_router(matching.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
