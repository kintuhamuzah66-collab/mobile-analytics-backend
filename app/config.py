from dotenv import load_dotenv

import os

load_dotenv()

FIREBASE_URL = os.getenv(
    "FIREBASE_URL"
)

import os

FIREBASE_URL = os.getenv("FIREBASE_URL")

REDIS_URL = os.getenv("REDIS_URL")