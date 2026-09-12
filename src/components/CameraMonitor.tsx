import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCcw, ShieldAlert, ShieldCheck, VideoOff } from 'lucide-react';

type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable';

interface Props {
  onDemoEvent?: (msg: string) => void;
  required?: boolean;
  onStatusChange?: (status: CameraStatus) => void;
}

const CameraMonitor: React.FC<Props> = ({ onDemoEvent, required = false, onStatusChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const updateStatus = (nextStatus: CameraStatus) => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  };

  const requestCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      updateStatus('unavailable');
      return;
    }

    updateStatus('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play().catch(() => undefined);
      }

      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          updateStatus('unavailable');
          onDemoEvent?.('Camera access was interrupted. Please allow camera permission to continue the assessment.');
        };
      });

      updateStatus('active');
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      const nextStatus = name === 'NotAllowedError' ? 'denied' : 'unavailable';
      updateStatus(nextStatus);
      if (required) {
        onDemoEvent?.('Camera access is required for this assessment. Please allow camera permission and retry.');
      }
    }
  };

  useEffect(() => {
    if (required) {
      void requestCamera();
    }

    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [required]);

  useEffect(() => {
    if (status !== 'active' || !onDemoEvent) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.08) {
        onDemoEvent('DEMO EVENT: Possible look-away from screen (simulated AI detection).');
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [status, onDemoEvent]);

  const title = required ? 'Mandatory Camera Check' : 'AI Camera Monitoring';

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start bg-slate-50 border border-slate-200 rounded-md p-4">
      <div className="w-40 h-28 rounded-md bg-slate-800 overflow-hidden relative shrink-0 flex items-center justify-center">
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
        {status !== 'active' && (
          <VideoOff size={28} className="text-slate-400 absolute" />
        )}
        {status === 'active' && (
          <span className="absolute top-1.5 left-1.5 badge bg-red-600 text-white animate-pulse-dot">● REC</span>
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Camera size={15} /> {title}
        </p>

        {required && (
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Camera access is mandatory for this assessment. Please allow access so the live preview can start.
          </p>
        )}

        {status === 'idle' && !required && (
          <>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Camera permission is requested before the assessment. Video stays on your device — nothing is recorded or uploaded.
            </p>
            <button className="btn-primary mt-3 !py-2 !px-4 text-xs" onClick={requestCamera}>
              Enable Camera Monitoring
            </button>
          </>
        )}

        {status === 'requesting' && (
          <p className="text-xs text-slate-500 mt-1.5">Requesting camera permission…</p>
        )}

        {status === 'active' && (
          <div className="mt-1.5 space-y-1">
            <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Camera access granted
            </p>
            <p className="text-[11px] text-slate-500">
              Live preview is active and remains on your device during the assessment.
            </p>
          </div>
        )}

        {status === 'denied' && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-amber-700 flex items-center gap-1.5">
              <ShieldAlert size={14} /> Camera permission was denied. Camera access is mandatory for this assessment.
            </p>
            <button className="btn-primary !py-2 !px-4 text-xs" onClick={requestCamera}>
              <RefreshCcw size={13} className="inline-block mr-1" /> Retry camera access
            </button>
          </div>
        )}

        {status === 'unavailable' && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-amber-700">
              Camera is unavailable on this device or the stream stopped unexpectedly. Please retry after checking your browser settings.
            </p>
            <button className="btn-primary !py-2 !px-4 text-xs" onClick={requestCamera}>
              <RefreshCcw size={13} className="inline-block mr-1" /> Retry camera access
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraMonitor;
