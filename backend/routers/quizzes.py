"""Quiz routes (Under development)"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def quiz_status():
    return {"message": "Quiz routes under development"}
