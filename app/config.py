from dotenv import load_dotenv

import os

load_dotenv()

FIREBASE_URL = os.getenv(
    "FIREBASE_URL"
)

REDIS_HOST = os.getenv(
    "REDIS_HOST"
)

REDIS_PORT = int(
    os.getenv("REDIS_PORT")
)