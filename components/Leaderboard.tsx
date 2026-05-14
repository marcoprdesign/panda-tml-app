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
        .select(`username, avatar_url, drinks(id, event_id, points)`)
        .order('username');

      if (error) throw error;

      if (data) {
        const formatted = data.map(user => {
          const eventDrinks = user.drinks?.filter((d: any) => d.event_id === targetEventId) || [];
          return {
            username: user.username,
            avatar_url: user.avatar_url,
            count: eventDrinks.length,
            score: eventDrinks.reduce((sum: number, d: any) => sum + (d.points || 0), 0)
          };
        }).sort((a, b) => b.score - a.score);
        
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
              const isFirst = index === 0;
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <div 
                  key={user.username} 
                  className={`flex items-center gap-4 p-4 rounded-[1.8rem] border transition-all ${
                    isFirst ? 'bg-[#313449] border-[#313449]' : 'bg-white border-[#d3d6e4]'
                  }`}
                >
                  {/* Rang - Taille originale */}
                  <div className={`w-8 h-8 flex items-center justify-center font-black text-sm ${isFirst ? 'text-[#f6f6f9]' : 'text-[#8089b0]'}`}>
                    {index < 3 ? medals[index] : `#${index + 1}`}
                  </div>

                  {/* Avatar - Taille originale w-12 */}
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ebecf3]">
                    {user.avatar_url ? (
                      <img src={getAvatarUrl(user.avatar_url)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#ebecf3] flex items-center justify-center text-xs">🐼</div>
                    )}
                  </div>

                  {/* Infos - Textes condensés */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-black uppercase tracking-tight truncate ${isFirst ? 'text-white' : 'text-[#313449]'}`}>
                      {user.username}
                    </div>
                    <div className={`text-[8px] font-bold uppercase tracking-[0.2em] ${isFirst ? 'text-[#8089b0]' : 'text-[#58618a]'}`}>
                      {user.count} Drinks Archived
                    </div>
                  </div>

                  {/* POINTS - Carré à droite bien lisible */}
                  <div className={`px-4 py-2 rounded-xl font-black text-[12px] min-w-[45px] text-center ${
                    isFirst ? 'bg-[#f6f6f9] text-[#313449]' : 'bg-[#ebecf3] text-[#313449]'
                  }`}>
                    {user.score}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-[10px] text-[#8089b0] uppercase">No archives. 🐼</div>
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