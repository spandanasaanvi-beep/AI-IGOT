import React, { useState } from 'react';
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
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) return setError('Please enter your full name.');
    if (!/^\d{10}$/.test(mobile)) return setError('Please enter a valid 10-digit mobile number.');
    setLoading(true);
    const res = await sendOtp(mobile);
    setLoading(false);
    if (res.delivered) {
      setDemoCode(res.demoCode ?? null);
      setStep('otp');
    } else {
      setError(res.message);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    const res = await resendOtp(mobile);
    setLoading(false);
    if (res.delivered) {
      setDemoCode(res.demoCode ?? null);
      setOtp('');
      setError('');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) return setError('Enter the 6-digit code.');
    setLoading(true);
    const res = await verifyOtp(mobile, otp);
    setLoading(false);
    if (res.ok) {
      registerUser(fullName.trim(), mobile);
      navigate('/profile-setup', { replace: true });
    } else if (res.reason === 'expired') {
      setError('This OTP has expired. Please request a new one.');
    } else if (res.reason === 'max-attempts') {
      setError('Too many incorrect attempts. Please request a new OTP.');
    } else {
      setError('Incorrect OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="gov-strap" />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Brand */}
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
                  <input id="fullName" className="input" placeholder="e.g. Ananya Sharma" value={fullName}
                    onChange={(e) => setFullName(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="label" htmlFor="mobile">Mobile Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-sm text-slate-500 font-semibold">
                      +91
                    </span>
                    <input id="mobile" type="tel" inputMode="numeric" className="input rounded-l-none" placeholder="10-digit mobile number"
                      value={mobile} maxLength={10}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">We'll send a one-time verification code.</p>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Sending OTP…' : <>Send OTP <ArrowRight size={16} /></>}
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Prototype notice: OTP is generated locally for demonstration and shown below after sending.
                  A production deployment connects a real SMS provider via the pluggable OTP service layer.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5" noValidate>
                <div className="text-center">
                  <span className="inline-flex w-12 h-12 rounded-full bg-emerald-50 items-center justify-center mb-3">
                    <Phone size={20} className="text-emerald-600" />
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">Verify your mobile number</h2>
                  <p className="text-sm text-slate-500 mt-1">Code sent to +91 {mobile}</p>
                </div>

                {/* Demo OTP banner — clearly labelled as prototype behaviour */}
                {demoCode && (
                  <div className="bg-accent-50 border border-accent-200 rounded-md px-4 py-3 text-center">
                    <p className="text-[11px] font-semibold text-accent-700 uppercase tracking-wide">Prototype demo OTP (no real SMS sent)</p>
                    <p className="text-2xl font-extrabold text-accent-800 tracking-[0.4em] mt-1">{demoCode}</p>
                  </div>
                )}

                <div>
                  <label className="label flex items-center gap-1.5" htmlFor="otp"><KeyRound size={14} /> Enter 6-digit OTP</label>
                  <input id="otp" inputMode="numeric" className="input text-center text-xl tracking-[0.5em] font-bold" placeholder="••••••"
                    value={otp} maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus />
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

                <button type="submit" className="btn-primary w-full" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying…' : <>Verify OTP <ShieldCheck size={16} /></>}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={() => { setStep('form'); setOtp(''); setError(''); }}
                    className="text-primary-700 font-semibold hover:underline">
                    Change number
                  </button>
                  <button type="button" onClick={handleResend} disabled={loading}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-primary-700 font-medium">
                    <RotateCw size={13} /> Resend OTP
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
