import os
import redis


# Create Redis connection using Render REDIS_URL
r = redis.from_url(
    os.getenv("REDIS_URL"),
    decode_responses=True
)


# Save active user session
def save_active_session(
    user_name: str,
    app_name: str
):

    # Store for 5 minutes
    r.setex(
        user_name,
        300,
        app_name
    )


# Retrieve active user
def get_active_user(user_name: str):

    return r.get(user_name)