"use client";
import { useState } from 'react';
import { supabase } from '@/supabase';

const TYPES = ['🍺 BEER', '🍸 COCKTAIL', '💧 WATER', '🥃 SHOT'];

export default function PostDrink({ userProfile }: { userProfile: any }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('🍺 BEER');

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fileName = `${userProfile.id}-${Date.now()}.jpg`;
    await supabase.storage.from('drinks').upload(fileName, file);
    await supabase.from('drinks').insert([{
      user_id: userProfile.id,
      user_name: userProfile.username,
      drink_type: type,
      photo_url: fileName
    }]);
    window.location.reload();
  };

  return (
    <div className="bg-[#141417] p-6 rounded-[2rem] border border-white/5">
      <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 text-center">Fuel Selection</h3>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {TYPES.map(t => (
          <button 
            key={t}
            onClick={() => setType(t)}
            className={`py-3 rounded-xl text-[10px] font-bold transition-all border ${type === t ? 'bg-white text-black border-white' : 'bg-black/40 border-white/5 text-white/40'}`}
          >
            {t.split(' ')[1]}
          </button>
        ))}
      </div>
      <label className="flex items-center justify-center w-full py-4 rounded-2xl bg-[#DFFF5E] text-black text-xs font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#DFFF5E]/10">
        {loading ? '...' : '📸 Capture'}
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} disabled={loading} />
      </label>
    </div>
  );
}