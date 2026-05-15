import firebase_admin

from firebase_admin import credentials, db
from app.config import FIREBASE_URL

# Prevent duplicate Firebase initialization
if not firebase_admin._apps:

    cred = credentials.Certificate(
        "learning-for-project-e4909-firebase-adminsdk-fbsvc-4f5dddb170.json"
    )

    firebase_admin.initialize_app(cred, {
        "databaseURL":
        FIREBASE_URL
    })


# Function to save phone events
def save_phone_event(event_data: dict):

    ref = db.reference("events")

    ref.push(event_data)