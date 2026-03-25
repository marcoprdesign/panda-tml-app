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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username');
      
      if (error) {
        console.error("🚨 ERREUR SUPABASE:", error.message);
        return;
      }

      if (data) setProfiles(data);
    } catch (err) {
      console.error("💥 ERREUR CRITIQUE:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewPandaDetails = async (profile: any) => {
    setLoading(true);
    setSelectedPanda(profile);

    const { count: drinkCount } = await supabase
      .from('drinks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id);

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

  if (loading && !selectedPanda) return (
    <div className="py-10 text-center opacity-20 text-[10px] font-black uppercase tracking-widest animate-pulse text-[#313449]">
      Finding the pack...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {!selectedPanda ? (
        // --- VUE 1 : LISTE DES MEMBRES ---
        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#313449]/50 px-2">The Pack</h3>
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-[#d3d6e4]/30 overflow-hidden shadow-sm">
            {profiles.map((p) => (
              <div 
                key={p.id} 
                onClick={() => viewPandaDetails(p)}
                className="flex items-center justify-between p-5 border-b border-[#d3d6e4]/20 last:border-0 active:bg-[#313449]/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#313449]/5 border border-[#313449]/10 overflow-hidden">
                    {p.avatar_url ? (
                      <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${p.avatar_url}`} className="w-full h-full object-cover" />
                    ) : <span className="flex items-center justify-center h-full text-xl">🐼</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-tight text-[#313449]">{p.username || 'Mysterious Panda'}</span>
                    <span className="text-[8px] font-bold text-[#8089b0] uppercase tracking-widest">{p.country || 'Nomadic'}</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-[#8089b0]">VIEW →</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // --- VUE 2 : DÉTAILS D'UN PANDA ---
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <button onClick={() => setSelectedPanda(null)} className="text-[9px] font-black uppercase tracking-widest text-[#313449] flex items-center gap-2 mb-4 hover:opacity-60 transition-opacity">
            ← Back to the pack
          </button>

          {/* Header Profil */}
          <div className="bg-white/60 p-8 rounded-[3rem] border border-[#d3d6e4] text-center space-y-5 shadow-xl">
             <div className="w-24 h-24 mx-auto rounded-full border-4 border-[#313449]/10 overflow-hidden shadow-inner bg-[#f6f6f9]">
                {selectedPanda.avatar_url ? (
                   <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${selectedPanda.avatar_url}`} className="w-full h-full object-cover" />
                ) : <span className="text-4xl leading-[6rem]">🐼</span>}
             </div>
             
             <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-[#313449] leading-tight">{selectedPanda.username}</h2>
                
                {/* CHIPS : COUNTRY & JOINED (Waikawa Palette) */}
                <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
                    <span className="px-3 py-1.5 bg-[#58618a]/5 border border-[#58618a]/10 text-[#58618a]/70 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                        {selectedPanda.country || 'Nomadic'}
                    </span>
                    <span className="px-3 py-1.5 bg-[#58618a]/5 border border-[#58618a]/10 text-[#58618a]/70 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                        Joined {selectedPanda.joined || 'Ancient'}
                    </span>
                </div>
             </div>

             <div className="inline-block px-5 py-2 bg-[#313449] text-[#f6f6f9] rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#313449]/10">
                {pandaStats?.drinkCount} Drinks Logged
             </div>
          </div>

          {/* Son Path (Lineup) */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#313449]/50 px-2">Their Path</h3>
            {pandaStats?.path.length > 0 ? (
              <div className="space-y-3">
                {pandaStats.path.map((item: any, i: number) => (
                  <div key={i} className="bg-white/40 p-4 rounded-2xl border border-[#d3d6e4] flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#313449]">{item.artist}</p>
                      <p className="text-[8px] font-bold text-[#8089b0] uppercase">{item.day} • {item.stage}</p>
                    </div>
                    <span className="text-[9px] font-black text-[#313449]/40">{item.start_time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-[9px] font-black uppercase text-[#8089b0]/40 italic">This panda is wandering aimlessly...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}