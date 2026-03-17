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
      // 1. Upload vers le bucket 'drinks'
      const { data: storageData, error: storageError } = await supabase.storage
        .from('drinks')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // 2. Insertion dans la table 'drinks'
      const { error: dbError } = await supabase
        .from('drinks')
        .insert([{
          user_id: userProfile.id,
          drink_type: type,
          photo_url: fileName
        }]);

      if (dbError) throw dbError;

      // 3. Succès
      window.location.reload();
      
    } catch (error: any) {
      console.error("Erreur complète:", error);
      alert(`Erreur: ${error.message || "Impossible d'uploader la photo"}`);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#141417] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="text-center mb-5">
        <h3 className="text-[11px] font-black text-white uppercase tracking-tight">
          What are you drinking, <span className="text-[#DFFF5E]">{userProfile?.username || 'mate'}</span>?
        </h3>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-3 py-2 rounded-full border transition-all flex items-center gap-2 active:scale-90
              ${type === t 
                ? 'border-[#DFFF5E] bg-[#DFFF5E] text-black shadow-lg shadow-[#DFFF5E]/10' 
                : 'border-white/10 bg-white/5 text-white/50'}`}
          >
            <span className="text-[9px] font-black uppercase tracking-tight leading-none">
              {t.split(' ')[0]}
            </span>
            <span className="text-xs leading-none">
              {t.split(' ')[1]}
            </span>
          </button>
        ))}
      </div>

      <label className={`flex items-center justify-center w-full py-4 rounded-2xl text-black text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer active:scale-95 transition-all shadow-xl
        ${loading ? 'bg-[#DFFF5E]/50 cursor-not-allowed' : 'bg-[#DFFF5E] shadow-[#DFFF5E]/20'}`}>
        {loading ? 'Sending...' : '📸 Take a photo'}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleUpload} 
          disabled={loading} 
        />
      </label>
    </div>
  );
}