import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Phone, ShieldCheck, KeyRound, RotateCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { sendOtp, verifyOtp, resendOtp } from '../services/otpService';
import { ChakraMark } from '../components/Sidebar';
import { PLATFORM_SUBNAME } from '../mockData';

type Step = 'form' | 'otp';

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser } = useAppContext();
  const [step, setStep] = useState<Step>('form');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = window.setTimeout(() => {
      setResendSeconds((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) return setError('Please enter your full name.');
    if (!/^\d{10}$/.test(mobile)) return setError('Please enter a valid 10-digit mobile number.');

    setLoading(true);
    const res = await sendOtp(mobile);
    setLoading(false);

    if (res.delivered) {
      setOtp('');
      setDemoOtp(res.demoOtp || '');
      setStep('otp');
      setResendSeconds(30);
      setError('');
      return;
    }

    setError(res.message || 'Unable to send OTP right now. Please try again.');
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;

    setLoading(true);
    const res = await resendOtp(mobile);
    setLoading(false);

    if (res.delivered) {
      setOtp('');
      setDemoOtp(res.demoOtp || '');
      setError('');
      setResendSeconds(30);
      return;
    }

    setError(res.message || 'Unable to resend OTP right now. Please try again.');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) return setError('Enter the 6-digit code.');

    setLoading(true);
    const res = await verifyOtp(mobile, otp, fullName.trim());
    setLoading(false);

    if (res.ok) {
      registerUser(fullName.trim(), mobile);
      navigate('/profile-setup', { replace: true });
      return;
    }

    setError(res.message || 'Incorrect OTP. Please try again.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="gov-strap" />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-card mb-4">
              <ChakraMark size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-primary-900 tracking-tight">
              Pragati<span className="text-accent-500">AI</span>
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-xs mx-auto">{PLATFORM_SUBNAME}</p>
          </div>

          <div className="card p-7 animate-fadeIn">
            {step === 'form' ? (
              <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Create your PragatiAI account</h2>
                  <p className="text-sm text-slate-500 mt-1">Verify your mobile number to begin.</p>
                </div>

                <div>
                  <label className="label" htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    className="input"
                    placeholder="e.g. Ananya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="label" htmlFor="mobile">Mobile Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-sm text-slate-500 font-semibold">
                      +91
                    </span>
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      className="input rounded-l-none"
                      placeholder="10-digit mobile number"
                      value={mobile}
                      maxLength={10}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">We will send a one-time verification code to your mobile number.</p>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Sending OTP…' : <>Send OTP <ArrowRight size={16} /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5" noValidate>
                <div className="text-center">
                  <span className="inline-flex w-12 h-12 rounded-full bg-emerald-50 items-center justify-center mb-3">
                    <Phone size={20} className="text-emerald-600" />
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">Verify your mobile number</h2>
                  <p className="text-sm text-slate-500 mt-1">Verification code sent to +91 {mobile}</p>
                </div>

                <div>
                  <label className="label flex items-center gap-1.5" htmlFor="otp"><KeyRound size={14} /> Enter 6-digit OTP</label>

                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">Demo OTP (prototype)</p>
                    <p className="text-lg font-extrabold tracking-[0.35em] text-amber-900 mt-1">{demoOtp || '••••••'}</p>
                  </div>

                  <input
                    id="otp"
                    inputMode="numeric"
                    className="input text-center text-xl tracking-[0.5em] font-bold"
                    placeholder="••••••"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                  />
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

                <button type="submit" className="btn-primary w-full" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying…' : <>Verify OTP <ShieldCheck size={16} /></>}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setOtp('');
                      setDemoOtp('');
                      setError('');
                    }}
                    className="text-primary-700 font-semibold hover:underline"
                  >
                    Change number
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading || resendSeconds > 0}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCw size={13} />
                    {resendSeconds > 0 ? `Resend OTP (${resendSeconds}s)` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Government-style prototype · Not affiliated with any ministry · Data stays in your browser
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
