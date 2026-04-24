"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import DrinkCharts from './DrinkCharts';

interface LeaderboardProps {
  archiveEventId?: string;
}

export default function Leaderboard({ archiveEventId }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let targetEventId = archiveEventId;

      if (!targetEventId) {
        const { data: activeEvent } = await supabase.from('events').select('id').eq('is_active', true).single();
        targetEventId = activeEvent?.id;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`username, avatar_url, drinks(id, event_id)`)
        .order('username');

      if (error) throw error;

      if (data) {
        const formatted = data.map(user => ({
          username: user.username,
          avatar_url: user.avatar_url,
          count: user.drinks?.filter((d: any) => d.event_id === targetEventId).length || 0
        })).sort((a, b) => b.count - a.count);
        
        setLeaders(formatted);
      }
    } catch (err) {
      console.error("Erreur Leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchLeaderboard(); 
  }, [archiveEventId]);

  const getAvatarUrl = (path: string) => 
    supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="text-[10px] font-black uppercase tracking-widest text-[#313449]">Calculating Hierarchy...</div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="space-y-6">
        <div className="px-2">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#313449]">The Hierarchy</h2>
          <div className="h-1 w-12 bg-[#58618a] mt-1 rounded-full"></div>
        </div>
        <div className="space-y-3">
          {leaders.length > 0 ? (
            leaders.map((user, index) => {
              const isTop3 = index < 3;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={user.username} className={`flex items-center gap-4 p-4 rounded-[1.8rem] border ${index === 0 ? 'bg-[#313449] border-[#313449]' : 'bg-white border-[#d3d6e4]'}`}>
                  <div className={`w-10 h-10 flex items-center justify-center font-black text-sm ${index === 0 ? 'text-[#f6f6f9]' : 'text-[#8089b0]'}`}>
                    {isTop3 ? medals[index] : `#${index + 1}`}
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ebecf3]">
                    {user.avatar_url ? <img src={getAvatarUrl(user.avatar_url)} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#ebecf3] flex items-center justify-center">🐼</div>}
                  </div>
                  <div className="flex-1">
                    <div className={`text-[11px] font-black uppercase ${index === 0 ? 'text-white' : 'text-[#313449]'}`}>{user.username}</div>
                    <div className={`text-[8px] font-bold uppercase tracking-[0.2em] ${index === 0 ? 'text-[#8089b0]' : 'text-[#58618a]'}`}>{user.count} Drinks Archived</div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-black text-[10px] ${index === 0 ? 'bg-[#f6f6f9] text-[#313449]' : 'bg-[#ebecf3] text-[#313449]'}`}>
                    {user.count}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-[10px] text-[#8089b0] uppercase">No archives for this era. 🐼</div>
          )}
        </div>
      </div>
      <div className="pt-10 border-t border-[#d3d6e4]/50">
        <div className="px-2 mb-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#313449]">The Analytics</h2>
          <div className="h-1 w-12 bg-[#58618a] mt-1 rounded-full"></div>
        </div>
        <DrinkCharts archiveEventId={archiveEventId} />
      </div>
    </div>
  );
}