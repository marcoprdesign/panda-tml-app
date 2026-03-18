"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export default function DrinkFeed() {
  const [drinks, setDrinks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDrinks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
    
    const { data: drinksData } = await supabase
      .from('drinks')
      .select('*, profiles:user_id (avatar_url, username), drink_likes(user_id)')
      .order('created_at', { ascending: false });

    if (drinksData) setDrinks(drinksData);
    setLoading(false);
  };

  useEffect(() => { fetchDrinks(); }, []);

  const getUrl = (bucket: string, path: string) => 
    supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  const handleLike = async (drinkId: string) => {
    if (!userId) return;
    const drink = drinks.find(d => d.id === drinkId);
    const isLiked = drink?.drink_likes?.some((l: any) => l.user_id === userId);

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

    if (isLiked) {
      await supabase.from('drink_likes').delete().eq('user_id', userId).eq('drink_id', drinkId);
    } else {
      await supabase.from('drink_likes').insert({ user_id: userId, drink_id: drinkId });
    }
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-5 h-5 border-2 border-[#778899]/20 border-t-[#2F4F4F] rounded-full animate-spin" />
    </div>
  );

  return (
    /* Écart réduit : passage de space-y-12 à space-y-6 */
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {drinks.map((drink) => {
        const isLiked = drink.drink_likes?.some((l: any) => l.user_id === userId);
        const count = drink.drink_likes?.length || 0;
        
        return (
          <div key={drink.id} className="relative aspect-[4/5] rounded-[2.8rem] overflow-hidden border border-[#778899]/20 shadow-lg bg-white/20 group animate-in fade-in slide-in-from-bottom-6">
            
            {/* IMAGE DE FOND */}
            <img 
              src={getUrl('drinks', drink.photo_url)} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              alt="Drink Archive" 
            />
            
            {/* OVERLAY GRADIENT */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5DC]/60 via-transparent to-transparent opacity-80" />

            {/* --- PILL UNIQUE (Top Left) --- */}
            <div className="absolute top-5 left-5 flex items-center gap-3 bg-[#F5F5DC]/85 backdrop-blur-xl p-1.5 pr-6 rounded-[2.2rem] border border-white shadow-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2F4F4F] shadow-sm bg-white">
                {drink.profiles?.avatar_url && (
                  <img src={getUrl('avatars', drink.profiles.avatar_url)} className="w-full h-full object-cover" />
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#2F4F4F] uppercase tracking-widest leading-none">
                    {drink.profiles?.username}
                  </span>
                  <span className="text-[7px] font-bold text-[#778899] uppercase tracking-widest leading-none">
                    • {new Date(drink.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="text-[9px] font-black text-[#2F4F4F]/60 uppercase tracking-[0.2em] leading-none">
                  {drink.drink_type}
                </span>
              </div>
            </div>

            {/* --- LIKE BUTTON PILL (Bottom Left) --- */}
            <div className="absolute bottom-6 left-6">
              <button 
                onClick={() => handleLike(drink.id)}
                className={`flex items-center gap-3 backdrop-blur-2xl p-3 px-6 rounded-[1.8rem] border transition-all duration-500 active:scale-90 shadow-xl
                  ${isLiked 
                    ? 'bg-[#2F4F4F] border-[#2F4F4F] text-[#F5F5DC]' 
                    : 'bg-white/80 border-white text-[#2F4F4F]'}`}
              >
                <span className={`text-sm transition-all duration-500 ${isLiked ? 'grayscale-0 scale-110' : 'grayscale opacity-40'}`}>
                  ❤️
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {count}
                </span>
              </button>
            </div>

            {/* LE "TRUC BIZARRE" A ÉTÉ RETIRÉ D'ICI */}
          </div>
        );
      })}
    </div>
  );
}