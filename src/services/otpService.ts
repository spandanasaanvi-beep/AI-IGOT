/* =========================================================================
 * OTP service — local demo/mock implementation for the prototype.
 *
 * This preserves the existing OTP UI and registration flow while avoiding any
 * real SMS / API calls. The generated code is shown to the user directly in
 * the browser so the prototype can continue without external OTP services.
 * ======================================================================= */

export interface OtpDeliveryResult {
  delivered: boolean;
  message: string;
  retryAfterSeconds?: number;
  demoOtp?: string;
}

export interface VerifyResult {
  ok: boolean;
  reason?: 'expired' | 'max-attempts' | 'mismatch' | 'error';
  message?: string;
}

const demoOtpStore = new Map<string, string>();

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, '').slice(-10);
}

function generateDemoOtp(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
}

export async function sendOtp(mobile: string): Promise<OtpDeliveryResult> {
  const normalizedMobile = normalizeMobile(mobile);
  const demoOtp = generateDemoOtp();

  demoOtpStore.set(normalizedMobile, demoOtp);

  return {
    delivered: true,
    message: `Demo OTP generated successfully. Use ${demoOtp} to continue.`,
    demoOtp,
  };
}

export async function verifyOtp(mobile: string, code: string, _fullName: string): Promise<VerifyResult> {
  const normalizedMobile = normalizeMobile(mobile);
  const storedOtp = demoOtpStore.get(normalizedMobile);

  if (!storedOtp) {
    return {
      ok: false,
      reason: 'expired',
      message: 'Demo OTP is missing or expired. Please request a new one.',
    };
  }

  if (storedOtp !== code) {
    return {
      ok: false,
      reason: 'mismatch',
      message: 'Incorrect OTP. Please try again.',
    };
  }

  demoOtpStore.delete(normalizedMobile);

  return {
    ok: true,
    message: 'OTP verified successfully.',
  };
}

export async function resendOtp(mobile: string): Promise<OtpDeliveryResult> {
  return sendOtp(mobile);
}
