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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => stopAllStreams();
  }, []);

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
      setTimeout(() => {
        videoRef.current?.play().catch(e => console.error("Play error:", e));
      }, 100);
    }
  };

  const startSequence = async () => {
    setLoading(true);
    setStatus('capturing');
    setActiveSide('back');
    
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    canvasRef.current = canvas;

    try {
      await setupCamera('environment');
    } catch (err) {
      alert("Error starting camera");
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleShutterClick = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;

    try {
      // 1. Capture du Drink (Arrière)
      drawCover(ctx, videoRef.current, 0, 0, 1080, 1350);

      // 2. Bascule auto vers Selfie
      setActiveSide('front');
      await setupCamera('user');
      
      // Timer auto pour le selfie (1.5s)
      await new Promise(r => setTimeout(r, 1500));
      
      // --- CONFIGURATION SELFIE BAS À DROITE ARRONDI ---
      const sW = 320; 
      const sH = 420; 
      const sX = 1080 - sW - 40; 
      const sY = 1350 - sH - 40; 
      const radius = 40; // Rayon de l'arrondi

      ctx.save();
      
      // Création du chemin arrondi (masque)
      ctx.beginPath();
      ctx.moveTo(sX + radius, sY);
      ctx.lineTo(sX + sW - radius, sY);
      ctx.quadraticCurveTo(sX + sW, sY, sX + sW, sY + radius);
      ctx.lineTo(sX + sW, sY + sH - radius);
      ctx.quadraticCurveTo(sX + sW, sY + sH, sX + sW - radius, sY + sH);
      ctx.lineTo(sX + radius, sY + sH);
      ctx.quadraticCurveTo(sX, sY + sH, sX, sY + sH - radius);
      ctx.lineTo(sX, sY + radius);
      ctx.quadraticCurveTo(sX, sY, sX + radius, sY);
      ctx.closePath();
      
      // On clip pour que l'image respecte l'arrondi
      ctx.clip();

      // Application du miroir et dessin
      ctx.translate(sX + sW, sY);
      ctx.scale(-1, 1);
      drawCover(ctx, videoRef.current, 0, 0, sW, sH);
      
      ctx.restore();
      
      // Dessin de la bordure blanche par-dessus l'arrondi
      ctx.beginPath();
      ctx.lineWidth = 8;
      ctx.strokeStyle = "white";
      ctx.moveTo(sX + radius, sY);
      ctx.lineTo(sX + sW - radius, sY);
      ctx.quadraticCurveTo(sX + sW, sY, sX + sW, sY + radius);
      ctx.lineTo(sX + sW, sY + sH - radius);
      ctx.quadraticCurveTo(sX + sW, sY + sH, sX + sW - radius, sY + sH);
      ctx.lineTo(sX + radius, sY + sH);
      ctx.quadraticCurveTo(sX, sY + sH, sX, sY + sH - radius);
      ctx.lineTo(sX, sY + radius);
      ctx.quadraticCurveTo(sX, sY, sX + radius, sY);
      ctx.stroke();

      stopAllStreams();
      handleUpload();
    } catch (err) {
      console.error(err);
      setStatus('idle');
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
      alert("Upload Error: " + e.message);
      setStatus('idle');
    }
  };

  return (
    <div className="w-full space-y-4 px-1">
      {status === 'capturing' && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-8">
          <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mt-4">
            <p className="text-white text-[10px] font-black uppercase tracking-widest">
              {activeSide === 'back' ? '📸 Step 1: Drink' : '🤳 Step 2: Smile!'}
            </p>
          </div>

          <div className="relative w-full aspect-[4/5] bg-neutral-900 rounded-[3rem] overflow-hidden border border-white/10">
            <video 
              ref={videoRef} 
              playsInline muted autoPlay
              className={`w-full h-full object-cover ${activeSide === 'front' ? 'scale-x-[-1]' : ''}`}
            />
          </div>

          <div className="pb-10 min-h-[120px] flex items-center justify-center">
            {activeSide === 'back' ? (
              <button 
                onClick={handleShutterClick}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
              >
                <div className="w-16 h-16 border-4 border-black rounded-full" />
              </button>
            ) : (
              <div className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">
                Capturing selfie...
              </div>
            )}
          </div>
        </div>
      )}

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
            {loading ? 'Loading...' : 'Capture BeReal Drink'}
          </span>
        </div>
      </button>

      {status === 'uploading' && (
        <div className="fixed inset-0 z-[110] bg-[#313449]/95 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Archiving...</p>
        </div>
      )}
    </div>
  );
}