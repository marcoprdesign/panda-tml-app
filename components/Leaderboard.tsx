"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export default function Leaderboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('drinks')
        .select('user_id, profiles:user_id(username, avatar_url)');
      
      if (data) {
        const counts = data.reduce((acc: any, curr: any) => {
          const id = curr.user_id;
          const profile = Array.isArray(curr.profiles) ? curr.profiles[0] : curr.profiles;
          
          if (!acc[id]) {
            acc[id] = { 
              name: profile?.username || 'Traveler', 
              avatar: profile?.avatar_url, 
              count: 0 
            };
          }
          acc[id].count += 1;
          return acc;
        }, {});
        
        setStats(Object.values(counts).sort((a: any, b: any) => b.count - a.count));
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-10 opacity-20 animate-pulse text-[10px] font-black uppercase tracking-widest">
      Consulting the archives...
    </div>
  );

  return (
    <div className="space-y-3 pb-10 px-1 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <h3 className="text-[10px] font-black text-[#778899] uppercase tracking-[0.3em] pl-4 mb-5">
        Panda Hierarchy
      </h3>

      {stats.map((user, index) => {
        const isFirst = index === 0;
        const isTop3 = index < 3;

        return (
          <div 
            key={user.name} 
            className={`flex items-center justify-between p-4 rounded-[2.2rem] border transition-all duration-500
              ${isFirst 
                ? 'bg-[#2F4F4F] border-[#2F4F4F] shadow-lg shadow-[#2F4F4F]/20 scale-[1.02]' 
                : 'bg-white/40 border-[#778899]/10 shadow-sm'}`}
          >
            <div className="flex items-center gap-4">
              {/* Index de classement stylisé */}
              <div className={`w-6 text-center font-black italic text-[11px] 
                ${isFirst ? 'text-[#F5F5DC]' : 'text-[#778899]/40'}`}>
                {index + 1 < 10 ? `0${index + 1}` : index + 1}
              </div>

              {/* Avatar avec bordure Ardoise pour le top 1 */}
              <div className={`w-11 h-11 rounded-full overflow-hidden border-2 bg-[#F5F5DC] shadow-inner
                ${isFirst ? 'border-[#F5F5DC]' : 'border-[#778899]/10'}`}>
                {user.avatar ? (
                  <img 
                    src={supabase.storage.from('avatars').getPublicUrl(user.avatar).data.publicUrl} 
                    className="w-full h-full object-cover" 
                    alt="avatar"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">
                    🐼
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <span className={`text-[11px] font-black uppercase tracking-widest 
                  ${isFirst ? 'text-[#F5F5DC]' : 'text-[#2F4F4F]'}`}>
                  {user.name}
                </span>
                {isFirst && (
                  <span className="text-[7px] font-bold text-[#F5F5DC]/60 uppercase tracking-[0.2em] mt-0.5 animate-pulse">
                    Current Alpha
                  </span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="flex flex-col items-end pr-2">
              <span className={`text-2xl font-black leading-none tracking-tighter
                ${isFirst ? 'text-[#F5F5DC]' : 'text-[#2F4F4F]'}`}>
                {user.count}
              </span>
              <span className={`text-[7px] font-black uppercase tracking-[0.1em]
                ${isFirst ? 'text-[#F5F5DC]/40' : 'text-[#778899]/40'}`}>
                Drinks
              </span>
            </div>
          </div>
        );
      })}

      {stats.length === 0 && (
        <div className="text-center py-10 opacity-30 text-[9px] font-black uppercase tracking-[0.3em]">
          The scroll is empty...
        </div>
      )}
    </div>
  );
}