from collections import Counter

from fastapi import APIRouter

from firebase_admin import db

from app.services.redis_service import r

router = APIRouter()


# =========================================
# ACTIVE USERS
# =========================================

@router.get("/active-users")
async def active_users():

    users = {}

    for key in r.keys("*"):

        users[key] = r.get(key)

    return {
        "active_users": users,
        "count": len(users)
    }


# =========================================
# RECENT EVENTS
# =========================================

@router.get("/events")
async def get_events():

    ref = db.reference("events")

    events = ref.get()

    if not events:
        return []

    result = []

    for key, value in events.items():

        result.append({
            "id": key,
            **value
        })

    # newest first
    result.reverse()

    return result


# =========================================
# SYSTEM STATS
# =========================================

@router.get("/stats")
async def stats():

    # Firebase events
    ref = db.reference("events")

    events = ref.get()

    if not events:
        return {
            "total_events": 0,
            "active_users": 0,
            "top_apps": {}
        }

    total_events = len(events)

    # Redis active users
    active_users = len(r.keys("*"))

    # Count app usage
    app_counter = Counter()

    for value in events.values():

        app_name = value.get("app_name")

        if app_name:
            app_counter[app_name] += 1

    return {
        "total_events": total_events,
        "active_users": active_users,
        "top_apps": dict(app_counter)
    }