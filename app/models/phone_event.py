from pydantic import BaseModel, Field
from datetime import datetime


class PhoneEvent(BaseModel):

    timestamp: datetime

    user_name: str = Field(
        min_length=2,
        max_length=50
    )

    phone_imei: str

    app_name: str = Field(
        min_length=2,
        max_length=100
    )

    event_type: str

    duration_seconds: int = Field(
        ge=0
    )

    screen_state: str