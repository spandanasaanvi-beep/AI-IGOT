"""Contact routes (Under development)"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def contact_status():
    return {"message": "Contact routes under development"}
