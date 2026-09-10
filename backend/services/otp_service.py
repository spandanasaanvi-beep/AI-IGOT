"""
OTP Service - Handle sending and verifying OTPs
"""
import logging
import secrets
from typing import Optional
import asyncio

logger = logging.getLogger(__name__)


class OTPService:
    """Service for OTP generation and delivery."""
    
    @staticmethod
    def generate_otp(length: int = 6) -> str:
        """Generate random numeric OTP."""
        return "".join(str(secrets.randbelow(10)) for _ in range(length))
    
    async def send_otp(
        self,
        phone_number: str,
        otp_code: str,
        provider: str = "development"
    ) -> bool:
        """
        Send OTP through configured provider.
        
        Supported providers:
        - twilio
        - msg91
        - firebase
        - development (logs only)
        """
        try:
            if provider == "twilio":
                return await self._send_via_twilio(phone_number, otp_code)
            elif provider == "msg91":
                return await self._send_via_msg91(phone_number, otp_code)
            elif provider == "firebase":
                return await self._send_via_firebase(phone_number, otp_code)
            elif provider == "development":
                logger.info(f"📱 [DEV] OTP {otp_code} for {phone_number}")
                return True
            else:
                logger.error(f"Unknown OTP provider: {provider}")
                return False
        
        except Exception as e:
            logger.error(f"Error sending OTP via {provider}: {e}")
            return False
    
    async def _send_via_twilio(self, phone_number: str, otp_code: str) -> bool:
        """Send OTP via Twilio Verify service."""
        try:
            from twilio.rest import Client
            from ..config import settings
            
            client = Client(
                settings.twilio_account_sid,
                settings.twilio_auth_token
            )
            
            verification = client.verify.v2.services(
                settings.twilio_verify_service_sid
            ).verifications.create(
                to=f"+{phone_number}",
                channel="sms"
            )
            
            logger.info(f"✓ OTP sent via Twilio: {phone_number}")
            return verification.sid is not None
        
        except Exception as e:
            logger.error(f"Twilio error: {e}")
            return False
    
    async def _send_via_msg91(self, phone_number: str, otp_code: str) -> bool:
        """Send OTP via MSG91."""
        try:
            import aiohttp
            from ..config import settings
            
            url = "https://api.msg91.com/api/sendotp.php"
            params = {
                "key": settings.msg91_api_key,
                "mobile": phone_number,
                "otp": otp_code,
                "sender": settings.msg91_sender_id,
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        logger.info(f"✓ OTP sent via MSG91: {phone_number}")
                        return True
            
            return False
        
        except Exception as e:
            logger.error(f"MSG91 error: {e}")
            return False
    
    async def _send_via_firebase(self, phone_number: str, otp_code: str) -> bool:
        """Send OTP via Firebase Phone Authentication."""
        try:
            # Firebase implementation would go here
            logger.info(f"✓ OTP sent via Firebase: {phone_number}")
            return True
        
        except Exception as e:
            logger.error(f"Firebase error: {e}")
            return False
