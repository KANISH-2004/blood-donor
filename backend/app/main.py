from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Import all models so they register on Base.metadata before create_all runs
from app.models import (  # noqa: F401
    admin_action,
    blood_request,
    donation_history,
    donor_match,
    donor_profile,
    notification,
    user,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "REST API for the Blood Donor & Emergency Blood Request Platform. "
        "Connects blood donors, requesters, hospitals, and admins. "
        "Disclaimer: this platform assists with discovery and coordination "
        "only — it never makes medical eligibility or transfusion-compatibility "
        "decisions. Always confirm with a qualified medical professional or "
        "blood bank before any donation or transfusion."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "status": "ok",
        "docs": "/docs",
        "disclaimer": "This platform does not make medical eligibility or transfusion decisions.",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
