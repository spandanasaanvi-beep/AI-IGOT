"""Dashboard routes (Under development)"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def dashboard_status():
    return {"message": "Dashboard routes under development"}
