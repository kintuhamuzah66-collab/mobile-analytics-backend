from fastapi.testclient import TestClient

from app.main import fastapi_app


client = TestClient(fastapi_app)


def test_active_users():

    response = client.get(
        "/active-users"
    )

    assert response.status_code == 200