"use client";
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/supabase';
import { Camera01Icon, LinkBackwardIcon } from "hugeicons-react";

const DRINK_OPTIONS = [
  { id: 'BEER', label: 'Beear', emoji: '🍺', points: 1 },
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
  const [status, setStatus] = useState<'idle' | 'back' | 'front' | 'uploading'>('idle');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Nettoyage complet des caméras
  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Track stopped:", track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // On nettoie si le composant est fermé
  useEffect(() => {
    return () => stopAllStreams();
  }, []);

  const setupCamera = async (mode: 'user' | 'environment') => {
    stopAllStreams(); // CRUCIAL : Stopper avant de relancer
    
    try {
      const constraints = {
        video: { 
          facingMode: mode,
          width: { ideal: 1080 },
          height: { ideal: 1350 }
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        // Sur iOS, il faut parfois attendre un tick avant le play()
        setTimeout(() => {
          videoRef.current?.play().catch(e => console.error("Play error:", e));
        }, 100);
      }
    } catch (err) {
      console.error("Camera Setup Error:", err);
      alert("Impossible d'accéder à la caméra " + mode);
      setStatus('idle');
    }
  };

  const startCapture = async () => {
    setStatus('back');
    await setupCamera('environment');
  };

  const takeFirstPhoto = async () => {
    if (!videoRef.current) return;
    
    // Initialisation Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    canvasRef.current = canvas;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 1080, 1350);
    }

    setStatus('front');
    await setupCamera('user');
  };

  const takeSecondPhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const sW = 320, sH = 420, sX = 40, sY = 40;
      
      ctx.save();
      // Effet miroir pour le rendu final du selfie
      ctx.translate(sX + sW, sY);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, sW, sH);
      ctx.restore();
      
      // Bordure blanche BeReal
      ctx.strokeStyle = "white";
      ctx.lineWidth = 6;
      ctx.strokeRect(sX, sY, sW, sH);
    }

    stopAllStreams();
    handleFinalUpload();
  };

  const handleFinalUpload = async () => {
    setStatus('uploading');
    setLoading(true);
    try {
      const blob = await new Promise<Blob | null>(res => canvasRef.current?.toBlob(res, 'image/jpeg', 0.8));
      if (!blob) throw new Error("Export failed");

      const { data: activeEvent } = await supabase.from('events').select('id').eq('is_active', true).single();
      const fileName = `${userProfile.id}-${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage.from('drinks').upload(fileName, blob);
      if (storageError) throw storageError;

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
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 px-1">
      {/* OVERLAY CAMERA */}
      {status !== 'idle' && status !== 'uploading' && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-8">
          <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mt-4">
            <p className="text-white text-[10px] font-black uppercase tracking-widest text-center">
              {status === 'back' ? '📸 Step 1: The Drink' : '🤳 Step 2: The Selfie'}
            </p>
          </div>

          <div className="relative w-full aspect-[4/5] bg-neutral-900 rounded-[3rem] overflow-hidden border border-white/10">
            <video 
              ref={videoRef} 
              playsInline 
              muted 
              autoPlay
              className={`w-full h-full object-cover ${status === 'front' ? 'scale-x-[-1]' : ''}`}
            />
          </div>

          <button 
            onClick={status === 'back' ? takeFirstPhoto : takeSecondPhoto}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-10 active:scale-90 transition-transform"
          >
            <div className="w-16 h-16 border-4 border-black rounded-full" />
          </button>
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
        onClick={startCapture}
        disabled={loading}
        className="flex flex-col items-center justify-center w-full py-5 rounded-[2rem] text-[#f6f6f9] bg-[#202231] shadow-xl active:scale-95 transition-all"
      >
        <div className="flex items-center gap-2">
          <Camera01Icon size={18} />
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">
            {loading ? 'Processing...' : 'Capture Dual Photo'}
          </span>
        </div>
      </button>

      {status === 'uploading' && (
        <div className="fixed inset-0 z-[110] bg-[#313449]/90 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mb-4" />
            <p className="text-white text-[10px] font-black uppercase tracking-widest italic">Archiving your drink...</p>
        </div>
      )}
    </div>
  );
}