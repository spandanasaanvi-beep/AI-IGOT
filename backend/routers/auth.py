"""
Authentication routes - OTP and user registration
"""
import logging
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..config import settings
from ..models import User, OTPLog
from ..schemas import (
    OTPRequestSchema, OTPVerifySchema, TokenSchema, UserProfileResponseSchema
)
from ..services.otp_service import OTPService
from ..services.auth_service import AuthService

logger = logging.getLogger(__name__)
router = APIRouter()

otp_service = OTPService()
auth_service = AuthService()


# ============================================
# SEND OTP
# ============================================

@router.post("/send-otp", response_model=dict)
async def send_otp(
    request: OTPRequestSchema,
    db: Session = Depends(get_db)
):
    """
    Send OTP to mobile number.
    
    - **phone_number**: 10-digit mobile number with country code
    
    Returns OTP code in demo mode for testing.
    """
    # Validate phone number format
    phone_number = request.phone_number.strip()
    if not phone_number.isdigit() or len(phone_number) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format"
        )
    
    try:
        # Check rate limiting
        recent_otps = db.query(OTPLog).filter(
            OTPLog.phone_number == phone_number,
            OTPLog.created_at > datetime.utcnow() - timedelta(minutes=1)
        ).count()
        
        if recent_otps >= 3:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many OTP requests. Please try again later."
            )
        
        # Generate OTP
        otp_code = otp_service.generate_otp(settings.otp_length)
        
        # Send OTP through configured provider
        if settings.demo_mode:
            logger.info(f"📱 DEMO MODE: OTP for {phone_number}: {otp_code}")
            otp_sent = True
        else:
            otp_sent = await otp_service.send_otp(
                phone_number=phone_number,
                otp_code=otp_code,
                provider=settings.otp_provider
            )
        
        if not otp_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP. Please try again."
            )
        
        # Store OTP log
        expiry_time = datetime.utcnow() + timedelta(minutes=settings.otp_expiry_minutes)
        otp_log = OTPLog(
            phone_number=phone_number,
            otp_code=otp_code,
            expires_at=expiry_time
        )
        db.add(otp_log)
        db.commit()
        
        logger.info(f"✓ OTP sent successfully to {phone_number}")
        
        return {
            "success": True,
            "message": "OTP sent successfully",
            "phone_number": phone_number,
            "expiry_minutes": settings.otp_expiry_minutes,
            "demo_otp": otp_code if settings.demo_mode else None,  # Only in demo mode
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending OTP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP"
        )


# ============================================
# VERIFY OTP & REGISTER
# ============================================

@router.post("/verify-otp", response_model=TokenSchema)
async def verify_otp(
    request: OTPVerifySchema,
    db: Session = Depends(get_db)
):
    """
    Verify OTP and create user account.
    
    Returns JWT tokens for authenticated access.
    """
    phone_number = request.phone_number.strip()
    otp_code = request.otp_code.strip()
    full_name = request.full_name.strip()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            User.phone_number == phone_number
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already registered with this phone number"
            )
        
        # Verify OTP
        otp_log = db.query(OTPLog).filter(
            OTPLog.phone_number == phone_number,
            OTPLog.is_verified == False,
            OTPLog.expires_at > datetime.utcnow()
        ).order_by(OTPLog.created_at.desc()).first()
        
        if not otp_log:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid OTP found. Please request a new OTP."
            )
        
        # Check OTP code
        if otp_log.otp_code != otp_code:
            otp_log.attempt_count += 1
            db.commit()
            
            if otp_log.attempt_count >= settings.otp_max_attempts:
                otp_log.is_verified = False
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum OTP attempts exceeded. Please request a new OTP."
                )
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid OTP. Attempts remaining: {settings.otp_max_attempts - otp_log.attempt_count}"
            )
        
        # Mark OTP as verified
        otp_log.is_verified = True
        db.commit()
        
        # Create user
        user = User(
            phone_number=phone_number,
            full_name=full_name,
            is_verified=True,
            last_login=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"✓ User registered successfully: {phone_number}")
        
        # Generate tokens
        access_token = auth_service.create_access_token(
            data={"user_id": user.id, "phone_number": user.phone_number}
        )
        refresh_token = auth_service.create_refresh_token(
            data={"user_id": user.id}
        )
        
        return TokenSchema(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying OTP: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify OTP"
        )


# ============================================
# RESEND OTP
# ============================================

@router.post("/resend-otp", response_model=dict)
async def resend_otp(
    request: OTPRequestSchema,
    db: Session = Depends(get_db)
):
    """Resend OTP to phone number."""
    phone_number = request.phone_number.strip()
    
    try:
        # Check if OTP was recently sent
        recent_otp = db.query(OTPLog).filter(
            OTPLog.phone_number == phone_number,
            OTPLog.created_at > datetime.utcnow() - timedelta(seconds=settings.otp_resend_delay_seconds)
        ).first()
        
        if recent_otp:
            wait_time = settings.otp_resend_delay_seconds - int(
                (datetime.utcnow() - recent_otp.created_at).total_seconds()
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {wait_time} seconds before requesting OTP again"
            )
        
        # Send new OTP (reuse send_otp logic)
        return await send_otp(request, db)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resending OTP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend OTP"
        )


# ============================================
# LOGOUT
# ============================================

@router.post("/logout", response_model=dict)
async def logout(
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Logout user."""
    # In a real application, you might invalidate tokens here
    # For now, we rely on token expiry
    return {
        "success": True,
        "message": "Logged out successfully"
    }


# ============================================
# REFRESH TOKEN
# ============================================

@router.post("/refresh-token", response_model=TokenSchema)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    """
    try:
        payload = auth_service.verify_token(
            refresh_token,
            token_type="refresh"
        )
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new access token
        new_access_token = auth_service.create_access_token(
            data={"user_id": user.id, "phone_number": user.phone_number}
        )
        
        return TokenSchema(
            access_token=new_access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
    
    except Exception as e:
        logger.error(f"Error refreshing token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
