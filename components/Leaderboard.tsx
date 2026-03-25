"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, drinks(id)')
      .order('username');

    if (data) {
      const formatted = data.map(user => ({
        username: user.username,
        avatar_url: user.avatar_url,
        count: user.drinks?.length || 0
      })).sort((a, b) => b.count - a.count);
      
      setLeaders(formatted);
    }
    setLoading(false);
  };

  const getAvatarUrl = (path: string) => 
    supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;

  if (loading) return <div className="text-center py-10 animate-pulse text-w-400 text-[10px] font-black uppercase tracking-widest">Calculating Hierarchy...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER DU CLASSEMENT */}
      <div className="px-2">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#313449]">
          The Hierarchy
        </h2>
        <div className="h-1 w-12 bg-[#58618a] mt-1 rounded-full"></div>
      </div>

      <div className="space-y-3">
        {leaders.map((user, index) => {
          const isTop3 = index < 3;
          const medals = ['🥇', '🥈', '🥉'];
          
          return (
            <div 
              key={user.username}
              className={`flex items-center gap-4 p-4 rounded-[1.8rem] border transition-all duration-500
                ${index === 0 
                  ? 'bg-[#313449] border-[#313449] shadow-xl shadow-[#313449]/20' 
                  : 'bg-white border-[#d3d6e4] shadow-sm'}`}
            >
              {/* RANK / MEDAL */}
              <div className={`w-10 h-10 flex items-center justify-center font-black text-sm
                ${index === 0 ? 'text-[#f6f6f9]' : 'text-[#8089b0]'}`}>
                {isTop3 ? medals[index] : `#${index + 1}`}
              </div>

              {/* AVATAR */}
              <div className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-inner
                ${index === 0 ? 'border-[#f6f6f9]/30' : 'border-[#ebecf3]'}`}>
                {user.avatar_url ? (
                  <img src={getAvatarUrl(user.avatar_url)} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#ebecf3] flex items-center justify-center text-xs opacity-50">🐼</div>
                )}
              </div>

              {/* INFO */}
              <div className="flex-1">
                <div className={`text-[11px] font-black uppercase tracking-wider
                  ${index === 0 ? 'text-[#f6f6f9]' : 'text-[#313449]'}`}>
                  {user.username}
                </div>
                <div className={`text-[8px] font-bold uppercase tracking-[0.2em]
                  ${index === 0 ? 'text-[#8089b0]' : 'text-[#58618a]'}`}>
                  {user.count > 0 ? `${user.count} Drinks Archived` : 'No records yet'}
                </div>
              </div>

              {/* COUNT BADGE */}
              <div className={`px-4 py-2 rounded-xl font-black text-[10px] tracking-tighter shadow-sm
                ${index === 0 ? 'bg-[#f6f6f9] text-[#313449]' : 'bg-[#ebecf3] text-[#313449]'}`}>
                {user.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER CLASSEMENT */}
      <p className="text-center text-[8px] font-bold text-[#8089b0] uppercase tracking-[0.4em] pt-4">
        Legacy of the heavy drinkers
      </p>
    </div>
  );
}