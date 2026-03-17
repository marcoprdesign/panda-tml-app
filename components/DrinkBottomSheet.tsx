"use client";
import { useState } from 'react';
import { supabase } from '@/supabase';

const TYPES = [
  { label: 'BEER', emoji: '🍺' }, 
  { label: 'COCKTAIL', emoji: '🍸' }, 
  { label: 'WINE', emoji: '🍷' },
  { label: 'SHOT', emoji: '🥃' }, 
  { label: 'CHAMPAGNE', emoji: '🥂' },
  { label: 'SOFT', emoji: '🥤' },
  { label: 'WATER', emoji: '💧' }
];

export default function DrinkBottomSheet({ userProfile }: { userProfile: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('BEER 🍺');

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fileName = `${userProfile.id}-${Date.now()}.jpg`;

    try {
      await supabase.storage.from('drinks').upload(fileName, file);
      await supabase.from('drinks').insert([{
        user_id: userProfile.id,
        user_name: userProfile.username,
        drink_type: type,
        photo_url: fileName
      }]);
      window.location.reload();
    } catch (error) {
      alert("Erreur d'envoi");
      setLoading(false);
    }
  };

  return (
    <>
      {/* BOUTON FLOTTANT POUR OUVRIR (Optionnel si tu veux l'ouvrir au clic) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#DFFF5E] text-black px-6 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
      >
        + Post a drink
      </button>

      {/* OVERLAY SOMBRE */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end transition-opacity"
          onClick={() => setIsOpen(false)} // Ferme si on clique à côté
        >
          {/* SHEET CONTAINER */}
          <div 
            className="w-full bg-[#141417] rounded-t-[3rem] p-8 border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()} // Empêche la fermeture quand on clique dedans
          >
            {/* Petit trait de drag (visuel) */}
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />

            <h2 className="text-xl font-black text-white text-center mb-8">
              Are you drinking, <span className="text-[#DFFF5E]">{userProfile?.username}</span>?
            </h2>

            {/* GRILLE DE VIGNETTES PLUS GROSSES */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {TYPES.map((t) => {
                const fullType = `${t.label} ${t.emoji}`;
                return (
                  <button
                    key={t.label}
                    onClick={() => setType(fullType)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2
                      ${type === fullType 
                        ? 'border-[#DFFF5E] bg-[#DFFF5E]/10' 
                        : 'border-white/5 bg-white/5 opacity-40'}`}
                  >
                    <span className="text-3xl">{t.emoji}</span>
                    <span className="text-[10px] font-black text-white">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* BOUTON SHARE */}
            <label className={`flex items-center justify-center w-full py-5 rounded-[2rem] text-black text-sm font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-xl
              ${loading ? 'bg-[#DFFF5E]/50' : 'bg-[#DFFF5E] shadow-[#DFFF5E]/20'}`}>
              {loading ? 'POSTING...' : '🚀 Share my drink'}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} disabled={loading} />
            </label>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 text-white/30 text-[10px] font-bold uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}