from fastapi.testclient import TestClient
from backend.models import User
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.database import get_db, Base
import pytest
from backend.main import app
from datetime import datetime
from unittest import mock

@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c

def test_update_profile(client):
    updated_data = {
        "first_name": "Anna",
        "last_name": "Marosi",
        "age": 30,
        "weight": 50

    }

    user_id = 6

    mock_user=mock.MagicMock(spec=User)
    mock_user.id = user_id
    mock_user.first_name = "Anna"
    mock_user.last_name = "Kiss"
    mock_user.age = 24
    mock_user.weight = 66
    mock_user.updated_at = datetime.now()

    with mock.patch('backend.db.database.SessionLocal') as mock_db_session:
        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_user

        mock_db_session.commit.return_value = None
        mock_db_session.refresh.return_value = None
     
        response = client.put(f"/profile/{user_id}", json = updated_data)

        assert response.status_code == 200
        updated_user = response.json()


        assert updated_user["first_name"] == "Anna"
        assert updated_user["last_name"] == "Marosi"
        assert updated_user["age"] == 30
        assert updated_user["weight"] == 50

        mock_db_session.return_value.commit.assert_called_once()
        mock_db_session.return_value.refresh.assert_called_once_with(mock_user)

        assert mock_user.first_name == updated_data["first_name"]
        assert mock_user.last_name == updated_data["last_name"]
        assert mock_user.age == updated_data["age"]
        assert mock_user.weight == updated_data["weight"]
        assert mock_user.updated_at is not None  