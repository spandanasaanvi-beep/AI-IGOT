"""Learning routes (Under development)"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def learning_status():
    return {"message": "Learning routes under development"}
