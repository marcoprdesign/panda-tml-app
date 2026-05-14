"use client";
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/supabase';
import { Camera01Icon } from "hugeicons-react";

const DRINK_OPTIONS = [
  { id: 'BEER', label: 'Beer', emoji: '🍺', points: 1 },
  { id: 'LARGE_BEER', label: 'Large Beer', emoji: '🍻', points: 2 },
  { id: 'COCKTAIL', label: 'Cocktail', emoji: '🍸', points: 1 },
  { id: 'WINE', label: 'Wine', emoji: '🍷', points: 1 },
  { id: 'SHOT', label: 'Shot', emoji: '🥃', points: 1 },
  { id: 'SOFT', label: 'Soft', emoji: '🥤', points: 1 },
  { id: 'WATER', label: 'Water', emoji: '💧', points: 0 },
];

export default function PostDrink({ userProfile, onPost }: { userProfile: any, onPost?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(DRINK_OPTIONS[0]);
  const [status, setStatus] = useState<'idle' | 'capturing' | 'uploading'>('idle');
  const [activeSide, setActiveSide] = useState<'back' | 'front'>('back');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopAllStreams();
  }, []);

  // Fonction magique pour éviter l'étirement (Object-fit: cover sur Canvas)
  const drawCover = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, x: number, y: number, w: number, h: number) => {
    const videoRatio = video.videoWidth / video.videoHeight;
    const targetRatio = w / h;
    let sw, sh, sx, sy;

    if (videoRatio > targetRatio) {
      sh = video.videoHeight;
      sw = video.videoHeight * targetRatio;
      sx = (video.videoWidth - sw) / 2;
      sy = 0;
    } else {
      sw = video.videoWidth;
      sh = video.videoWidth / targetRatio;
      sx = 0;
      sy = (video.videoHeight - sh) / 2;
    }
    ctx.drawImage(video, sx, sy, sw, sh, x, y, w, h);
  };

  const setupCamera = async (mode: 'user' | 'environment') => {
    stopAllStreams();
    const constraints = {
      video: { facingMode: mode, width: { ideal: 1080 }, height: { ideal: 1350 } }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  };

  const startSequence = async () => {
    setLoading(true);
    setStatus('capturing');
    setActiveSide('back');

    // 1. Init Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d')!;

    try {
      // 2. BACK PHOTO
      await setupCamera('environment');
      await new Promise(r => setTimeout(r, 2000)); // 2 sec pour viser le verre
      drawCover(ctx, videoRef.current!, 0, 0, 1080, 1350);

      // 3. FRONT PHOTO (Auto-switch)
      setActiveSide('front');
      await setupCamera('user');
      await new Promise(r => setTimeout(r, 1500)); // 1.5 sec pour sourire
      
      const sW = 320, sH = 420, sX = 40, sY = 40;
      ctx.save();
      ctx.translate(sX + sW, sY);
      ctx.scale(-1, 1); // Mirror rendu final
      drawCover(ctx, videoRef.current!, 0, 0, sW, sH);
      ctx.restore();
      
      ctx.strokeStyle = "white";
      ctx.lineWidth = 6;
      ctx.strokeRect(sX, sY, sW, sH);

      stopAllStreams();
      handleUpload();
    } catch (err) {
      alert("Error during capture");
      setStatus('idle');
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    setStatus('uploading');
    try {
      const blob = await new Promise<Blob | null>(res => canvasRef.current?.toBlob(res, 'image/jpeg', 0.8));
      if (!blob) throw new Error("Export failed");

      const { data: activeEvent } = await supabase.from('events').select('id').eq('is_active', true).single();
      const fileName = `${userProfile.id}-${Date.now()}.jpg`;

      await supabase.storage.from('drinks').upload(fileName, blob);
      await supabase.from('drinks').insert([{
        user_id: userProfile.id,
        drink_type: `${selected.label} ${selected.emoji}`,
        points: selected.points,
        photo_url: fileName,
        event_id: activeEvent?.id || 'tml-2024'
      }]);

      if (onPost) onPost();
      window.location.reload();
    } catch (e: any) {
      alert(e.message);
      setStatus('idle');
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 px-1">
      {/* OVERLAY CAPTURE AUTOMATIQUE */}
      {status === 'capturing' && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8">
          <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-8">
            <p className="text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
              {activeSide === 'back' ? '📸 Step 1: Capturing Drink' : '🤳 Step 2: Smile!'}
            </p>
          </div>

          <div className="relative w-full aspect-[4/5] bg-neutral-900 rounded-[3rem] overflow-hidden border border-white/10">
            <video 
              ref={videoRef} 
              playsInline muted autoPlay
              className={`w-full h-full object-cover ${activeSide === 'front' ? 'scale-x-[-1]' : ''}`}
            />
          </div>
          
          <div className="mt-12 text-white/30 text-[9px] font-bold uppercase tracking-widest">
            Automatic dual-shot in progress...
          </div>
        </div>
      )}

      {/* SELECTION BOISSONS */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {DRINK_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelected(option)}
            className={`px-4 py-3 rounded-2xl border transition-all flex flex-col items-center gap-1 min-w-[80px]
              ${selected.id === option.id ? 'border-[#313449] bg-[#313449] text-[#f6f6f9]' : 'border-[#d3d6e4] bg-white text-[#58618a]'}`}
          >
            <span className="text-xl">{option.emoji}</span>
            <span className="text-[8px] font-black uppercase tracking-widest">{option.label}</span>
          </button>
        ))}
      </div>

      <button 
        onClick={startSequence}
        disabled={loading}
        className="flex flex-col items-center justify-center w-full py-5 rounded-[2rem] text-[#f6f6f9] bg-[#202231] shadow-xl active:scale-95 transition-all"
      >
        <div className="flex items-center gap-2">
          <Camera01Icon size={18} />
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">
            {loading ? 'Processing...' : 'One-Click BeReal'}
          </span>
        </div>
      </button>

      {status === 'uploading' && (
        <div className="fixed inset-0 z-[110] bg-[#313449]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest italic">Merging & Archiving...</p>
        </div>
      )}
    </div>
  );
}