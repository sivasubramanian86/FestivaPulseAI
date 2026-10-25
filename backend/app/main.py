"""FestivaPulseAI — Main FastAPI Application Entrypoint.

Adheres to @02_system_architect, @07_modern_polyglot_standards, and @10_security_governance.
"""

import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.routers.event_routes import router as event_router
from backend.app.routers.health_routes import router as health_router
from backend.app.routers.pulse_routes import router as pulse_router
from backend.app.routers.qa_routes import router as qa_router
from backend.app.routers.rescue_routes import router as rescue_router

app = FastAPI(
    title="FestivaPulseAI",
    description="Autonomous Event Resilience Copilot & Day-of-Event Operating System for PromptWars Virtual [Challenge 5]",
    version="1.0.0",
)

# Standard-compliant CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Response-Time-Ms", "X-Trace-ID"],
    max_age=600,
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time_ms = int((time.time() - start_time) * 1000)
    response.headers["X-Response-Time-Ms"] = str(process_time_ms)
    return response


# Include routers
app.include_router(health_router)
app.include_router(event_router)
app.include_router(pulse_router)
app.include_router(rescue_router)
app.include_router(qa_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error_type": type(exc).__name__,
            "message": str(exc),
            "path": request.url.path,
        },
    )


if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
