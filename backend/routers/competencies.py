"""Competency routes (Under development)"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def competencies_status():
    return {"message": "Competency routes under development"}
