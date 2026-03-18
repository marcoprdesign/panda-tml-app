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

      // Rechargement pour voir le nouveau post dans le feed
      window.location.reload();
      
    } catch (error: any) {
      console.error("Erreur:", error);
      alert(`Erreur: ${error.message || "Impossible d'uploader"}`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10 px-1">
      
      {/* HEADER DE SECTION */}
      <div className="px-2 mb-2">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#2F4F4F]">
          Record Drink
        </h2>
        <p className="text-[9px] font-black text-[#778899] uppercase tracking-[0.3em] mt-1">
          Submit to the journal, <span className="text-[#2F4F4F]">{userProfile?.username || 'Traveler'}</span>
        </p>
      </div>

      {/* CONTENEUR PRINCIPAL */}
      <div className="w-full bg-white/40 rounded-[2.5rem] border border-[#778899]/20 backdrop-blur-sm p-6 shadow-sm relative overflow-hidden">
        
        {/* SÉLECTEUR DE TYPE EN GRILLE COMPACTE */}
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
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 active:scale-95 duration-300
                  ${isActive 
                    ? 'border-[#2F4F4F] bg-[#2F4F4F] text-[#F5F5DC] shadow-md shadow-[#2F4F4F]/20' 
                    : 'border-[#778899]/10 bg-white/20 text-[#778899]'}`}
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

        {/* BOUTON D'ACTION PRINCIPAL - STYLE ARDOISE SOMBRE */}
        <label className={`flex items-center justify-center w-full py-5 rounded-[2rem] text-[#F5F5DC] text-[11px] font-black uppercase tracking-[0.3em] cursor-pointer active:scale-95 transition-all shadow-xl relative z-10
          ${loading ? 'bg-[#2F4F4F]/50 cursor-not-allowed' : 'bg-[#2F4F4F] hover:bg-[#2F4F4F]/90 shadow-[#2F4F4F]/20'}`}>
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

        <p className="text-[8px] text-[#778899]/60 text-center mt-5 uppercase tracking-[0.4em] font-bold">
          Archiving to the sacred feed
        </p>
      </div>

      {/* PETITE DÉCO DE BAS DE PAGE */}
      <div className="flex justify-center opacity-10 pt-4">
        <div className="w-8 h-[1px] bg-[#2F4F4F]"></div>
      </div>
    </div>
  );
}