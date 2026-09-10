"""Assessment routes (Under development)"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def assessment_status():
    return {"message": "Assessment routes under development"}
