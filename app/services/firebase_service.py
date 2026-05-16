import os
import json
import firebase_admin

from firebase_admin import credentials
from firebase_admin import db

from app.config import FIREBASE_URL


# Prevent duplicate Firebase initialization
if not firebase_admin._apps:

    firebase_credentials = json.loads(
        os.getenv("FIREBASE_CREDENTIALS")
    )

    cred = credentials.Certificate(
        firebase_credentials
    )

    firebase_admin.initialize_app(
        cred,
        {
            "databaseURL": FIREBASE_URL
        }
    )


# Function to save phone events
def save_phone_event(event_data: dict):

    ref = db.reference("events")

    ref.push(event_data)