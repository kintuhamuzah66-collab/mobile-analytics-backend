from pydantic import BaseModel, Field
from datetime import datetime


class PhoneEvent(BaseModel):

    user_name: str = Field(
        min_length=2,
        max_length=50
    )

    app_name: str = Field(
        min_length=2,
        max_length=50
    )

    event_type: str

    timestamp: datetime

    duration_seconds: int = Field(
        ge=0
    )