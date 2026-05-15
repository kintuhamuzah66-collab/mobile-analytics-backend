from fastapi.testclient import TestClient

from app.main import fastapi_app


client = TestClient(fastapi_app)


def test_stats():

    response = client.get("/stats")

    assert response.status_code == 200

    data = response.json()

    assert "total_events" in data

    assert "active_users" in data

    assert "top_apps" in data