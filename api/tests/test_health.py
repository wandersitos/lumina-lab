from django.test import TestCase, Client
from django.db import connection

try:
    import pytest
    django_db = pytest.mark.django_db
except ImportError:
    def django_db(f):
        return f

@django_db
class HealthTests(TestCase):
    def test_db_connection(self):
        """R1: El backend en Django y la base de datos arrancan sin errores."""
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            row = cursor.fetchone()
        self.assertEqual(row[0], 1)

    def test_health_endpoint(self):
        """R1/R2: El endpoint de health devuelve 200 OK."""
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "OK"})

@django_db
def test_db_connection():
    """R1: El backend en Django y la base de datos en Postgres arrancan sin errores."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        row = cursor.fetchone()
    assert row[0] == 1

def test_health_endpoint(client=None):
    """R1/R2: El endpoint de health devuelve 200 OK."""
    c = client if client is not None else Client()
    response = c.get("/api/health/")
    assert response.status_code == 200
    assert response.json() == {"status": "OK"}
