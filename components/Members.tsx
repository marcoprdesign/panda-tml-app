"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export default function Members() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedPanda, setSelectedPanda] = useState<any>(null);
  const [pandaStats, setPandaStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('username');
    if (data) setProfiles(data);
    setLoading(false);
  };

  const viewPandaDetails = async (profile: any) => {
    setLoading(true);
    setSelectedPanda(profile);

    // 1. Récupérer le nombre de verres
    const { count: drinkCount } = await supabase
      .from('drinks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id);

    // 2. Récupérer son Lineup (Path)
    const { data: favs } = await supabase
      .from('lineup_favorites')
      .select('lineup(artist, stage, start_time, day)')
      .eq('user_id', profile.id);

    setPandaStats({
      drinkCount: drinkCount || 0,
      path: favs?.map((f: any) => f.lineup) || []
    });
    setLoading(false);
  };

  if (loading && !selectedPanda) return <div className="py-10 text-center opacity-20 text-[10px] font-black uppercase tracking-widest">Finding the pack...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {!selectedPanda ? (
        // --- VUE 1 : LISTE DES MEMBRES ---
        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2F4F4F]/50 px-2">The Pack</h3>
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-[#778899]/10 overflow-hidden shadow-sm">
            {profiles.map((p) => (
              <div 
                key={p.id} 
                onClick={() => viewPandaDetails(p)}
                className="flex items-center justify-between p-5 border-b border-[#778899]/5 last:border-0 active:bg-[#2F4F4F]/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#2F4F4F]/5 border border-[#2F4F4F]/10 overflow-hidden">
                    {p.avatar_url ? (
                      <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${p.avatar_url}`} className="w-full h-full object-cover" />
                    ) : <span className="flex items-center justify-center h-full text-xl">🐼</span>}
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight text-[#2F4F4F]">{p.username || 'Mysterious Panda'}</span>
                </div>
                <span className="text-[10px] font-black text-[#778899]">VIEW →</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // --- VUE 2 : DÉTAILS D'UN PANDA ---
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <button onClick={() => setSelectedPanda(null)} className="text-[9px] font-black uppercase tracking-widest text-[#2F4F4F] flex items-center gap-2 mb-4">
            ← Back to the pack
          </button>

          {/* Header Profil */}
          <div className="bg-white/60 p-8 rounded-[3rem] border border-[#2F4F4F]/10 text-center space-y-4 shadow-xl">
             <div className="w-24 h-24 mx-auto rounded-full border-4 border-[#2F4F4F]/10 overflow-hidden shadow-inner">
                {selectedPanda.avatar_url ? (
                   <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${selectedPanda.avatar_url}`} className="w-full h-full object-cover" />
                ) : <span className="text-4xl leading-[6rem]">🐼</span>}
             </div>
             <h2 className="text-xl font-black uppercase tracking-tighter text-[#2F4F4F]">{selectedPanda.username}</h2>
             <div className="inline-block px-4 py-1 bg-[#2F4F4F] text-[#F5F5DC] rounded-full text-[10px] font-black uppercase tracking-widest">
                {pandaStats?.drinkCount} Drinks Logged
             </div>
          </div>

          {/* Son Path (Lineup) */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2F4F4F]/50 px-2">Their Path</h3>
            {pandaStats?.path.length > 0 ? (
              <div className="space-y-3">
                {pandaStats.path.map((item: any, i: number) => (
                  <div key={i} className="bg-white/40 p-4 rounded-2xl border border-[#778899]/10 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#2F4F4F]">{item.artist}</p>
                      <p className="text-[8px] font-bold text-[#778899] uppercase">{item.day} • {item.stage}</p>
                    </div>
                    <span className="text-[9px] font-black text-[#2F4F4F]/40">{item.start_time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-[9px] font-black uppercase text-[#778899]/40 italic">This panda is wandering aimlessly...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}