"""
User profile routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()


@router.get("/me")
async def get_current_user_profile(
    current_user: dict = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile. (Routes in development)"""
    return {
        "message": "User routes under development",
        "user": current_user
    }
