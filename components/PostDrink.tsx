"use client";
import { useState, useRef } from 'react';
import { supabase } from '@/supabase';
import { Camera01Icon, ReloadIcon } from "hugeicons-react";

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
  const [status, setStatus] = useState<'idle' | 'back' | 'front' | 'uploading'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);

  const captureAndUpload = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera access requires HTTPS.");
      return;
    }

    setLoading(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1350;

    try {
      // --- 1. CAPTURE ARRIÈRE (DRINK) ---
      setStatus('back');
      const streamBack = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1080 } } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = streamBack;
        await videoRef.current.play();
      }

      // On attend 2 secondes pour que l'utilisateur cadre son verre
      await new Promise(r => setTimeout(r, 2000));
      ctx?.drawImage(videoRef.current!, 0, 0, 1080, 1350);
      streamBack.getTracks().forEach(t => t.stop());

      // --- 2. CAPTURE AVANT (SELFIE) ---
      setStatus('front');
      const streamFront = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 400 } } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = streamFront;
        await videoRef.current.play();
      }

      // On attend 2 secondes pour le selfie
      await new Promise(r => setTimeout(r, 2000));
      
      if (ctx) {
        const sW = 320, sH = 420, sX = 40, sY = 40;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.strokeRect(sX, sY, sW, sH);
        ctx.drawImage(videoRef.current!, sX, sY, sW, sH);
      }
      streamFront.getTracks().forEach(t => t.stop());

      // --- 3. ENVOI ---
      setStatus('uploading');
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.8));
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

    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setLoading(false);
      setStatus('idle');
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 px-1">
      
      {/* OVERLAY DE PREVIEW (S'affiche pendant la capture) */}
      {status !== 'idle' && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative w-full aspect-[4/5] bg-[#1a1a1a] rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl">
            <video 
              ref={videoRef} 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1] flip-horizontal" // On flip pour le selfie, à ajuster selon la cam
              style={{ transform: status === 'back' ? 'scaleX(1)' : 'scaleX(-1)' }}
            />
            
            {/* INDICATEUR DE STATUS */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 bg-gradient-to-t from-black/60 to-transparent">
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <p className="text-white text-xs font-black uppercase tracking-[0.2em] animate-pulse">
                  {status === 'back' ? '📸 Point at your drink' : '🤳 Smile for selfie'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SÉLECTION BOISSONS */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {DRINK_OPTIONS.map((option) => {
          const isActive = selected.id === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelected(option)}
              className={`px-4 py-3 rounded-2xl border transition-all flex flex-col items-center gap-1 active:scale-95 duration-300 min-w-[80px]
                ${isActive ? 'border-[#313449] bg-[#313449] text-[#f6f6f9]' : 'border-[#d3d6e4] bg-white text-[#58618a]'}`}
            >
              <span className="text-xl">{option.emoji}</span>
              <span className="text-[8px] font-[1000] uppercase tracking-widest">{option.label}</span>
            </button>
          );
        })}
      </div>

      <button 
        onClick={captureAndUpload}
        disabled={loading}
        className="flex flex-col items-center justify-center w-full py-5 rounded-[2rem] text-[#f6f6f9] bg-[#202231] shadow-xl active:scale-95"
      >
        <div className="flex items-center gap-2">
          <Camera01Icon size={18} />
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">
            {loading ? 'Processing...' : 'Take BeReal Drink'}
          </span>
        </div>
      </button>

      <p className="text-[8px] text-[#8089b0] font-bold uppercase text-center tracking-widest opacity-60">
        Live preview will open for both shots
      </p>
    </div>
  );
}