"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export default function Leaderboard() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase.from('drinks').select('user_id, profiles:user_id(username, avatar_url)');
      if (data) {
        const counts = data.reduce((acc: any, curr: any) => {
          const id = curr.user_id;
          if (!acc[id]) acc[id] = { name: curr.profiles?.username || 'Raver', avatar: curr.profiles?.avatar_url, count: 0 };
          acc[id].count += 1;
          return acc;
        }, {});
        setStats(Object.values(counts).sort((a: any, b: any) => b.count - a.count));
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-3">
      {stats.map((user, index) => (
        <div key={user.name} className="flex items-center justify-between p-5 bg-[#141417] rounded-3xl border border-white/5">
          <div className="flex items-center gap-4">
            <span className="text-sm font-black italic text-[#DFFF5E]/20">0{index + 1}</span>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-black">
              {user.avatar && (
                <img src={supabase.storage.from('avatars').getPublicUrl(user.avatar).data.publicUrl} className="w-full h-full object-cover" />
              )}
            </div>
            <span className="text-xs font-black text-white uppercase">{user.name}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#DFFF5E]">{user.count}</span>
            <span className="text-[8px] font-bold text-white/20 uppercase">Drinks</span>
          </div>
        </div>
      ))}
    </div>
  );
}