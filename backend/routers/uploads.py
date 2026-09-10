"""Material upload routes (Under development)"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def uploads_status():
    return {"message": "Upload routes under development"}
