"""Detailed health check endpoint for M4 Max monitoring."""

import os
import platform
from datetime import datetime

import psutil
from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health/detailed")
async def health_detailed():
    """Detailed health check for M4 Max monitoring."""
    try:
        memory = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=0.1)
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": settings.ENVIRONMENT,
            "system": {
                "platform": platform.machine(),  # Should show arm64
                "processor": platform.processor(),
                "system": platform.system(),
                "cpu_count": psutil.cpu_count(),
                "cpu_percent": cpu_percent,
                "memory": {
                    "total_gb": round(memory.total / (1024**3), 2),
                    "available_gb": round(memory.available / (1024**3), 2),
                    "used_gb": round(memory.used / (1024**3), 2),
                    "percent": memory.percent,
                },
            },
            "orbstack": {
                "detected": os.environ.get("ORBSTACK_ENV") == "1",
                "docker_host": os.environ.get("DOCKER_HOST", "not set"),
            },
            "firebase_emulators": {
                "firestore": os.environ.get("FIRESTORE_EMULATOR_HOST", "not connected"),
                "auth": os.environ.get("FIREBASE_AUTH_EMULATOR_HOST", "not connected"),
                "storage": os.environ.get("FIREBASE_STORAGE_EMULATOR_HOST", "not connected"),
            },
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
        }

