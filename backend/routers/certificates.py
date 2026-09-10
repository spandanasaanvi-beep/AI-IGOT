"""Certificate routes (Under development)"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def certificates_status():
    return {"message": "Certificate routes under development"}
