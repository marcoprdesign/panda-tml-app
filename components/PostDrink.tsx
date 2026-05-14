"use client";
import { useState } from 'react';
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
  const [status, setStatus] = useState<'idle' | 'capturing'>('idle');

  const captureAndUpload = async () => {
    // 1. SÉCURITÉ HTTPS / MEDIA DEVICES
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera access requires HTTPS and a modern browser.");
      return;
    }

    setLoading(true);
    setStatus('capturing');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const video = document.createElement('video');
      video.setAttribute('playsinline', 'true');
      video.muted = true;

      // Format Portrait 4:5
      canvas.width = 1080;
      canvas.height = 1350;

      // 2. CAPTURE CAMÉRA ARRIÈRE (Le Drink)
      const streamBack = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1080 } } 
      });
      video.srcObject = streamBack;
      await video.play();
      await new Promise(r => setTimeout(r, 1000)); // Focus
      ctx?.drawImage(video, 0, 0, 1080, 1350);
      streamBack.getTracks().forEach(t => t.stop());

      // 3. CAPTURE CAMÉRA AVANT (Le Selfie)
      const streamFront = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 400 } } 
      });
      video.srcObject = streamFront;
      await video.play();
      await new Promise(r => setTimeout(r, 800));

      if (ctx) {
        const sW = 320, sH = 420, sX = 40, sY = 40;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.strokeRect(sX, sY, sW, sH);
        ctx.drawImage(video, sX, sY, sW, sH);
      }
      streamFront.getTracks().forEach(t => t.stop());

      // 4. PRÉPARATION DU BLOB
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.8));
      if (!blob) throw new Error("Canvas export failed");

      // 5. ENVOI SUPABASE
      const { data: activeEvent } = await supabase
        .from('events')
        .select('id')
        .eq('is_active', true)
        .single();

      const fileName = `${userProfile.id}-${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from('drinks')
        .upload(fileName, blob);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from('drinks').insert([{
        user_id: userProfile.id,
        drink_type: `${selected.label} ${selected.emoji}`,
        points: selected.points,
        photo_url: fileName,
        event_id: activeEvent?.id || 'tml-2024'
      }]);

      if (dbError) throw dbError;

      if (onPost) onPost();
      window.location.reload();

    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
      setLoading(false);
      setStatus('idle');
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 px-1">
      {/* SÉLECTION BOISSONS */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {DRINK_OPTIONS.map((option) => {
          const isActive = selected.id === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelected(option)}
              className={`px-4 py-3 rounded-2xl border transition-all flex flex-col items-center gap-1 active:scale-95 duration-300 min-w-[80px]
                ${isActive 
                  ? 'border-[#313449] bg-[#313449] text-[#f6f6f9] shadow-lg shadow-[#313449]/20' 
                  : 'border-[#d3d6e4] bg-white text-[#58618a]'}`}
            >
              <span className="text-xl">{option.emoji}</span>
              <span className="text-[8px] font-[1000] uppercase tracking-widest">{option.label}</span>
              <span className={`text-[7px] font-black ${isActive ? 'text-white/50' : 'text-[#8089b0]'}`}>
                {option.points} PTS
              </span>
            </button>
          );
        })}
      </div>

      {/* BOUTON CAPTURE DUAL (Bereal Style) */}
      <button 
        onClick={captureAndUpload}
        disabled={loading}
        className={`flex flex-col items-center justify-center w-full py-5 rounded-[2rem] text-[#f6f6f9] transition-all shadow-xl active:scale-95
        ${loading ? 'bg-[#313449]/50 cursor-not-allowed' : 'bg-[#202231] hover:bg-[#313449] shadow-[#202231]/20'}`}
      >
        <div className="flex items-center gap-2">
          {loading ? (
             <span className="text-[11px] font-black uppercase tracking-[0.3em] animate-pulse">
               {status === 'capturing' ? 'Stay Still...' : 'Processing...'}
             </span>
          ) : (
            <>
              <div className="flex -space-x-1">
                <Camera01Icon size={18} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Capture Drink</span>
            </>
          )}
        </div>
      </button>

      <p className="text-[8px] text-[#8089b0] font-bold uppercase text-center tracking-widest opacity-60">
        Front & Back cameras will trigger automatically
      </p>
    </div>
  );
}