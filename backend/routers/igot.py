"""iGOT integration routes (Under development)"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def igot_status():
    return {"message": "iGOT routes under development"}
