"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { MoreHorizontalIcon, Delete02Icon } from "hugeicons-react";

interface DrinkFeedProps {
  archiveEventId?: string;
}

export default function DrinkFeed({ archiveEventId }: DrinkFeedProps) {
  const [drinks, setDrinks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchDrinks = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
    
    let targetEventId = archiveEventId;

    if (!targetEventId) {
      const { data: activeEvent } = await supabase
        .from('events')
        .select('id')
        .eq('is_active', true)
        .single();
      targetEventId = activeEvent?.id;
    }

    const { data: drinksData } = await supabase
      .from('drinks')
      .select('*, profiles:user_id (avatar_url, username), drink_likes(user_id)')
      .eq('event_id', targetEventId) 
      .order('created_at', { ascending: false });

    if (drinksData) setDrinks(drinksData);
    setLoading(false);
  };

  useEffect(() => { 
    fetchDrinks(); 
  }, [archiveEventId]);

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

  const handleDelete = async (drinkId: string) => {
    const confirmed = window.confirm("Delete this memory forever?");
    if (!confirmed) return;
    const { error } = await supabase.from('drinks').delete().eq('id', drinkId).eq('user_id', userId);
    if (!error) setDrinks(prev => prev.filter(d => d.id !== drinkId));
    setOpenMenuId(null);
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-5 h-5 border-2 border-[#d3d6e4] border-t-[#313449] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {drinks.length > 0 ? (
        drinks.map((drink) => {
          const isLiked = drink.drink_likes?.some((l: any) => l.user_id === userId);
          const isOwner = drink.user_id === userId;
          const count = drink.drink_likes?.length || 0;
          
          return (
            <div key={drink.id} className="relative aspect-[4/5] rounded-[2.8rem] overflow-hidden border border-[#d3d6e4]/30 shadow-xl bg-[#ebecf3] group">
              <img 
                src={getUrl('drinks', drink.photo_url)} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Drink Archive" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#202231]/40 via-transparent to-transparent opacity-80" />
              
              {/* HEADER INFO */}
<div className="absolute top-5 left-5 flex items-center gap-3 bg-[#f6f6f9]/90 backdrop-blur-xl p-1.5 pr-6 rounded-[2.2rem] border border-white/50 shadow-lg">
  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#313449] shadow-sm bg-white">
    {drink.profiles?.avatar_url && (
      <img src={getUrl('avatars', drink.profiles.avatar_url)} className="w-full h-full object-cover" />
    )}
  </div>
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black text-[#313449] uppercase tracking-widest leading-none">
        {drink.profiles?.username}
      </span>
      <span className="text-[7px] font-bold text-[#8089b0] uppercase tracking-widest leading-none flex items-center gap-1">
        • {new Date(drink.created_at).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short' 
          })}
        <span className="opacity-50">•</span> 
        {new Date(drink.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
      </span>
    </div>
    <span className="text-[9px] font-black text-[#58618a] uppercase tracking-[0.2em] leading-none">
      {drink.drink_type}
    </span>
  </div>
</div>

              {/* BOUTON OPTIONS (...) */}
              {isOwner && (
                <div className="absolute top-6 right-6">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === drink.id ? null : drink.id)}
                    className="p-3 bg-[#f6f6f9]/90 backdrop-blur-xl rounded-full border border-white/50 text-[#313449] shadow-lg active:scale-90 transition-all"
                  >
                    <MoreHorizontalIcon size={18} />
                  </button>

                  {/* MENU DÉROULANT */}
                  {openMenuId === drink.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute top-14 right-0 z-20 w-40 bg-[#f6f6f9] border border-white rounded-[1.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <button
                          onClick={() => handleDelete(drink.id)}
                          className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Delete02Icon size={16} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* LIKE BUTTON */}
              <div className="absolute bottom-6 left-6">
                <button onClick={() => handleLike(drink.id)} className={`flex items-center gap-3 backdrop-blur-2xl p-3 px-6 rounded-[1.8rem] border transition-all duration-500 active:scale-90 shadow-xl ${isLiked ? 'bg-[#313449] border-[#313449] text-[#f6f6f9]' : 'bg-white/80 border-white text-[#313449]'}`}>
                  <span className={`text-sm transition-all duration-500 ${isLiked ? 'grayscale-0 scale-110' : 'grayscale opacity-40'}`}>❤️</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">{count}</span>
                </button>
              </div>

            </div>
          );
        })
      ) : (
        <div className="py-20 text-center uppercase text-[10px] font-black text-[#8089b0] tracking-widest">No records found for this era.</div>
      )}
    </div>
  );
}