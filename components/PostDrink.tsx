"use client";
import { useState } from 'react';
import { supabase } from '@/supabase';

const TYPES = [
  'BEER 🍺', 
  'COCKTAIL 🍸', 
  'WINE 🍷',
  'SHOT 🥃', 
  'CHAMPAGNE 🥂',
  'SOFT 🥤',
  'WATER 💧',
];

export default function PostDrink({ userProfile }: { userProfile: any }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('BEER 🍺');

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !userProfile) return;
    
    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`;

    try {
      const { data: storageData, error: storageError } = await supabase.storage
        .from('drinks')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('drinks')
        .insert([{
          user_id: userProfile.id,
          drink_type: type,
          photo_url: fileName
        }]);

      if (dbError) throw dbError;

      window.location.reload();
      
    } catch (error: any) {
      console.error("Erreur:", error);
      alert(`Erreur: ${error.message || "Impossible d'uploader"}`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10 px-1">
      
      {/* HEADER */}
      <div className="px-2 mb-2">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#313449]">
          Record Drink
        </h2>
        <p className="text-[9px] font-black text-[#8089b0] uppercase tracking-[0.3em] mt-1">
          Submit to the journal, <span className="text-[#313449]">{userProfile?.username || 'Traveler'}</span>
        </p>
      </div>

      {/* CONTENEUR - Changé en blanc pur (#ffffff) pour dénoter du fond global */}
      <div className="w-full bg-[#ffffff] rounded-[2.5rem] border border-[#d3d6e4] p-6 shadow-sm relative overflow-hidden">
        
        {/* SÉLECTEUR DE TYPE */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 relative z-10">
          {TYPES.map((t) => {
            const label = t.split(' ')[0];
            const emoji = t.split(' ')[1];
            const isActive = type === t;

            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                /* Inactif : bg-[#ebecf3] (bleu très clair) | Actif : bg-[#313449] */
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 active:scale-95 duration-300
                  ${isActive 
                    ? 'border-[#313449] bg-[#313449] text-[#f6f6f9] shadow-lg shadow-[#313449]/20' 
                    : 'border-[#d3d6e4] bg-[#ebecf3] text-[#58618a]'}`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                  {label}
                </span>
                <span className="text-sm leading-none">
                  {emoji}
                </span>
              </button>
            );
          })}
        </div>

        {/* BOUTON D'ACTION */}
        <label className={`flex items-center justify-center w-full py-5 rounded-[2rem] text-[#f6f6f9] text-[11px] font-black uppercase tracking-[0.3em] cursor-pointer active:scale-95 transition-all shadow-xl relative z-10
          ${loading ? 'bg-[#313449]/50 cursor-not-allowed' : 'bg-[#202231] hover:bg-[#313449] shadow-[#202231]/20'}`}>
          {loading ? 'Transcribing...' : '📸 Capture the moment'}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleUpload} 
            disabled={loading} 
          />
        </label>

        <p className="text-[8px] text-[#8089b0] text-center mt-5 uppercase tracking-[0.4em] font-bold">
          Archiving to the sacred feed
        </p>
      </div>

      <div className="flex justify-center opacity-20 pt-4">
        <div className="w-8 h-[1px] bg-[#313449]"></div>
      </div>
    </div>
  );
}