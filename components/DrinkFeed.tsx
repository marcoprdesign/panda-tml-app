"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export default function DrinkFeed() {
  const [drinks, setDrinks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchDrinks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
    
    const { data: drinksData } = await supabase
      .from('drinks')
      .select('*, profiles:user_id (avatar_url, username), drink_likes(user_id)')
      .order('created_at', { ascending: false });

    if (drinksData) setDrinks(drinksData);
  };

  useEffect(() => { fetchDrinks(); }, []);

  const getUrl = (bucket: string, path: string) => 
    supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  const handleLike = async (drinkId: string) => {
    if (!userId) return;
    const drink = drinks.find(d => d.id === drinkId);
    const isLiked = drink?.drink_likes?.some((l: any) => l.user_id === userId);

    // Mise à jour optimiste (immédiate sur l'écran)
    setDrinks(prevDrinks => prevDrinks.map(d => {
      if (d.id === drinkId) {
        return {
          ...d,
          drink_likes: isLiked 
            ? d.drink_likes.filter((l: any) => l.user_id !== userId)
            : [...(d.drink_likes || []), { user_id: userId }]
        };
      }
      return d;
    }));

    // Action en base de données
    if (isLiked) {
      await supabase.from('drink_likes').delete().eq('user_id', userId).eq('drink_id', drinkId);
    } else {
      await supabase.from('drink_likes').insert({ user_id: userId, drink_id: drinkId });
    }
  };

  return (
    <div className="space-y-10 pb-24">
      {drinks.map((drink) => {
        const isLiked = drink.drink_likes?.some((l: any) => l.user_id === userId);
        const count = drink.drink_likes?.length || 0;
        
        return (
          <div key={drink.id} className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#141417]">
            <img src={getUrl('drinks', drink.photo_url)} className="w-full h-full object-cover" alt="Drink" />
            
            {/* --- SINGLE PILL TOP LEFT --- */}
            <div className="absolute top-4 left-4 flex items-center gap-2.5 bg-black/60 backdrop-blur-md p-1.5 pr-4 rounded-[1.2rem] border border-white/10 shadow-lg">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#DFFF5E]/50 flex-shrink-0">
                {drink.profiles?.avatar_url && (
                  <img src={getUrl('avatars', drink.profiles.avatar_url)} className="w-full h-full object-cover" />
                )}
              </div>
              
              {/* Infos Texte */}
              <div className="flex flex-col gap-0.5">
                {/* Ligne 1 : Nom • Heure */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-white uppercase tracking-tight leading-none">
                    {drink.profiles?.username}
                  </span>
                  <span className="text-[10px] text-white/30 leading-none">•</span>
                  <span className="text-[8px] font-bold text-white/40 uppercase leading-none">
                    {new Date(drink.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {/* Ligne 2 : Drink Type */}
                <span className="text-[9px] font-black text-[#DFFF5E] uppercase tracking-widest leading-none">
                  {drink.drink_type}
                </span>
              </div>
            </div>

            {/* --- LIKE BUTTON --- */}
            <div className="absolute bottom-6 left-6">
              <button 
                onClick={() => handleLike(drink.id)}
                className={`flex items-center gap-2 backdrop-blur-xl p-2 px-4 rounded-2xl border transition-all duration-300 active:scale-95 shadow-lg
                  ${isLiked ? 'bg-[#DFFF5E] border-[#DFFF5E]' : 'bg-black/60 border-white/10'}`}
              >
                <span className={`text-sm transition-transform ${isLiked ? 'scale-110' : 'grayscale'}`}>❤️</span>
                <span className={`text-[10px] font-black transition-colors ${isLiked ? 'text-black' : 'text-white'}`}>
                  {count}
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}