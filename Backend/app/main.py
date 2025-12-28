from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

from app.api.api_v1.api import api_router
from app.monitoring import router as monitoring_router

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(monitoring_router, prefix="")

@app.get("/")
async def root():
    return {"message": "Welcome to MLOps E-commerce API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
