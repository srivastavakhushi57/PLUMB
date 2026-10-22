import pytest
import httpx

BASE_URL = "http://127.0.0.1:8000"

def test_health_check_endpoint():
    with httpx.Client(base_url=BASE_URL) as client:
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["app"] == "PLUMB"

def test_login_and_token_generation():
    with httpx.Client(base_url=BASE_URL) as client:
        res = client.post("/api/auth/login", json={
            "email": "creator@plumb.brand",
            "password": "creator123"
        })
        assert res.status_code == 200
        token_data = res.json()
        assert "access_token" in token_data
        assert token_data["role"] == "creator"
        assert token_data["is_external"] is False

def test_rbac_admin_endpoint_guard():
    with httpx.Client(base_url=BASE_URL) as client:
        # Login as creator
        c_res = client.post("/api/auth/login", json={
            "email": "creator@plumb.brand",
            "password": "creator123"
        })
        token = c_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Attempt to access audit logs (Admin only)
        audit_res = client.get("/api/audit/logs", headers=headers)
        assert audit_res.status_code == 403

def test_contrast_calculation_endpoint():
    with httpx.Client(base_url=BASE_URL) as client:
        res = client.post("/api/visual/check-contrast", json={
            "foreground_hex": "#F5F5F5",
            "background_hex": "#000000"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["ratio"] > 15.0
        assert data["normal_text_aa"] is True
        assert data["normal_text_aaa"] is True
