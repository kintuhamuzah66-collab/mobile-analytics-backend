import socketio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.upload_routes import router as upload_router

from app.sockets.socket_manager import sio

from app.routes.dashboard_routes import (
    router as dashboard_router
)

# Create FastAPI app
fastapi_app = FastAPI(
    title="Mobile Analytics Backend"
)

fastapi_app.include_router(dashboard_router)


# Enable CORS
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(upload_router)

# Create final ASGI app
app = socketio.ASGIApp(
    sio,
    other_asgi_app=fastapi_app
)

# Root route
@fastapi_app.get("/")
async def home():
    return {
        "message": "Backend running"
    }

# Health route
@fastapi_app.get("/health")
async def health():
    return {
        "status": "running"
    }

# Socket connection event
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

# Socket disconnect event
@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")