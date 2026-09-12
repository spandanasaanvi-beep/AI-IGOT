import React, { useEffect, useRef, useState } from 'react';
import { Camera, ShieldAlert, ShieldCheck, VideoOff } from 'lucide-react';

interface Props {
  /** Called when the demo detector fires an event (e.g. simulated look-away). */
  onDemoEvent?: (msg: string) => void;
}

/**
 * AI Camera Monitoring — PROTOTYPE.
 *
 * Real browser camera access (getUserMedia) with a visible preview.
 * Advanced computer-vision face/eye detection is NOT implemented: the
 * periodic "look-away" events below are clearly-labelled demo logic.
 * No recording is stored; the stream stays local and is stopped on unmount.
 */
const CameraMonitor: React.FC<Props> = ({ onDemoEvent }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unavailable'>('idle');

  const requestCamera = async () => {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStatus('active');
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      setStatus(name === 'NotAllowedError' ? 'denied' : 'unavailable');
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Demo-only periodic detection events (clearly labelled, not real CV)
  useEffect(() => {
    if (status !== 'active' || !onDemoEvent) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.15) {
        onDemoEvent('DEMO EVENT: Possible look-away from screen (simulated AI detection).');
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [status, onDemoEvent]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start bg-slate-50 border border-slate-200 rounded-md p-4">
      <div className="w-40 h-28 rounded-md bg-slate-800 overflow-hidden relative shrink-0 flex items-center justify-center">
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
        {status !== 'active' && (
          <VideoOff size={28} className="text-slate-400 absolute" />
        )}
        {status === 'active' && (
          <span className="absolute top-1.5 left-1.5 badge bg-red-600 text-white animate-pulse-dot">● REC (local preview only)</span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Camera size={15} /> AI Camera Monitoring
        </p>
        {status === 'idle' && (
          <>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Camera permission is requested before the assessment. Video stays on your device — nothing is recorded or uploaded.
            </p>
            <button className="btn-primary mt-3 !py-2 !px-4 text-xs" onClick={requestCamera}>
              Enable Camera Monitoring
            </button>
          </>
        )}
        {status === 'requesting' && <p className="text-xs text-slate-500 mt-1.5">Requesting camera permission…</p>}
        {status === 'active' && (
          <div className="mt-1.5 space-y-1">
            <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck size={14} /> AI Monitoring: Active
            </p>
            <p className="text-[11px] text-slate-500">
              Prototype: attention events are simulated demo logic — no real computer vision runs, and no footage is stored.
            </p>
          </div>
        )}
        {status === 'denied' && (
          <p className="text-xs text-amber-700 mt-1.5 flex items-center gap-1.5">
            <ShieldAlert size={14} /> Camera permission denied — you may continue, but monitoring is inactive.
          </p>
        )}
        {status === 'unavailable' && (
          <p className="text-xs text-amber-700 mt-1.5">Camera unavailable on this device — monitoring is inactive.</p>
        )}
      </div>
    </div>
  );
};

export default CameraMonitor;
