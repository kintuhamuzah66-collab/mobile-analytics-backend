from fastapi import APIRouter, HTTPException

from app.models.phone_event import PhoneEvent

from app.utils.logger import logger

from app.services.firebase_service import (
    save_phone_event
)

from app.services.redis_service import (
    save_active_session
)

from app.sockets.socket_manager import sio

router = APIRouter()


@router.post("/upload")
async def upload_event(event: PhoneEvent):

    try:

        # Convert full Pydantic model to dictionary
        event_data = {
            **event.model_dump(),
            "timestamp": str(event.timestamp)
        }

        logger.info(
            f"New event from {event.user_name}"
        )

        # Firebase save
        save_phone_event(event_data)

        # Redis save
        save_active_session(
            event.user_name,
            event.app_name
        )

        # WebSocket broadcast
        await sio.emit(
            "new_phone_event",
            event_data
        )

        return {
            "message": "Event stored successfully",
            "data": event_data
        }

    except Exception as e:

        logger.error(str(e))

        print("UPLOAD ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to process event"
        )