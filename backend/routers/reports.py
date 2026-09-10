"""Report generation routes (Under development)"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def reports_status():
    return {"message": "Report routes under development"}
