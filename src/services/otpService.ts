/* =========================================================================
 * OTP service — PROTOTYPE implementation.
 *
 * This module is the ONLY place that knows how OTPs are delivered. It
 * intentionally mirrors the backend contract (backend/routers/auth.py +
 * backend/services/otp_service.py) so a real SMS provider (Twilio /
 * MSG91 / Firebase) can be wired in by replacing `deliverOtp` with an
 * API call — no UI changes required.
 *
 * NOTE: This is a demo mechanism, NOT a production SMS service.
 * ======================================================================= */

export interface OtpDeliveryResult {
  delivered: boolean;
  /** The demo OTP code (never exists in a real provider integration). */
  demoCode?: string;
  message: string;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes, matching backend config
const MAX_ATTEMPTS = 5;

interface StoredOtp {
  code: string;
  expiresAt: number;
  attempts: number;
}

const OTP_KEY = 'pragatiai_otp_session';

/**
 * Demo delivery channel. In production, replace this function body with a
 * call to `POST /api/auth/send-otp` on the FastAPI backend, which routes to
 * Twilio / MSG91 / Firebase via backend/services/otp_service.py.
 */
async function deliverOtp(mobile: string): Promise<OtpDeliveryResult> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 900));

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const session: StoredOtp = {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  };
  sessionStorage.setItem(OTP_KEY, JSON.stringify(session));

  // Prototype behaviour: surface the code in the console + a demo banner.
  console.info(
    `%c[PragatiAI DEMO OTP] ${code} → +91 ${mobile}` +
      '\nIn production this is delivered via SMS (Twilio/MSG91/Firebase).',
    'background:#173496;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold;'
  );

  return {
    delivered: true,
    demoCode: code,
    message: `Demo OTP generated for +91 ${mobile}. This prototype does not send real SMS.`,
  };
}

export async function sendOtp(mobile: string): Promise<OtpDeliveryResult> {
  return deliverOtp(mobile);
}

export interface VerifyResult {
  ok: boolean;
  reason?: 'expired' | 'max-attempts' | 'mismatch';
}

export async function verifyOtp(mobile: string, code: string): Promise<VerifyResult> {
  await new Promise((r) => setTimeout(r, 600));
  void mobile; // session-scoped demo store; a real provider keys OTPs by number
  const raw = sessionStorage.getItem(OTP_KEY);
  if (!raw) return { ok: false, reason: 'expired' };

  const session: StoredOtp = JSON.parse(raw);
  if (Date.now() > session.expiresAt) {
    sessionStorage.removeItem(OTP_KEY);
    return { ok: false, reason: 'expired' };
  }
  if (session.attempts >= MAX_ATTEMPTS) {
    sessionStorage.removeItem(OTP_KEY);
    return { ok: false, reason: 'max-attempts' };
  }

  if (session.code === code.trim()) {
    sessionStorage.removeItem(OTP_KEY);
    return { ok: true };
  }

  session.attempts += 1;
  sessionStorage.setItem(OTP_KEY, JSON.stringify(session));
  return { ok: false, reason: 'mismatch' };
}

export async function resendOtp(mobile: string): Promise<OtpDeliveryResult> {
  // Rate-limit delay (demo: shortened). Real provider would enforce 30s.
  await new Promise((r) => setTimeout(r, 800));
  void mobile;
  return deliverOtp(mobile);
}
