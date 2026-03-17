"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export default function DrinkFeed() {
  const [drinks, setDrinks] = useState<any[]>([]);

  useEffect(() => {
    const fetchDrinks = async () => {
      const { data } = await supabase
        .from('drinks')
        .select('*, profiles:user_id (avatar_url, username)')
        .order('created_at', { ascending: false });
      if (data) setDrinks(data);
    };
    fetchDrinks();
  }, []);

  const getUrl = (bucket: string, path: string) => 
    supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  return (
    <div className="space-y-10">
      {drinks.map((drink) => (
        <div key={drink.id} className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#141417]">
          <img src={getUrl('drinks', drink.photo_url)} className="w-full h-full object-cover" alt="Drink" />
          
          {/* User Info Pill */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/10">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#DFFF5E]/50">
              {drink.profiles?.avatar_url && (
                <img src={getUrl('avatars', drink.profiles.avatar_url)} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white uppercase leading-none">{drink.profiles?.username}</span>
              <span className="text-[7px] font-bold text-[#DFFF5E] uppercase tracking-tighter">
                {new Date(drink.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Drink Type Pill */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-[#DFFF5E] text-black px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
              {drink.drink_type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}