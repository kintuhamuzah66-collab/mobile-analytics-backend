from fastapi.testclient import TestClient

from app.main import fastapi_app


client = TestClient(fastapi_app)


def test_upload_event():

    response = client.post(
        "/upload",
        json={
            "user_name": "Kevin",
            "app_name": "WhatsApp",
            "event_type": "OPEN",
            "timestamp": "2026-05-15T12:30:00",
            "duration_seconds": 120
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == \
        "Event stored successfully"