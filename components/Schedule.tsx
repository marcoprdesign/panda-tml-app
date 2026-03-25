"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

const STAGE_PRIORITY: Record<string, number> = {
  'MAINSTAGE': 1,
  'FREEDOM STAGE': 2,
  'ATMOSPHERE': 3,
  'THE GREAT LIBRARY': 4,
  'CRYSTAL GARDEN': 5,
};

export default function Schedule() {
  const [activeSubTab, setActiveSubTab] = useState<'global' | 'my'>('global');
  const [selectedDay, setSelectedDay] = useState('Friday');
  const [searchTerm, setSearchTerm] = useState("");
  const [lineup, setLineup] = useState<any[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const { data: lineupData } = await supabase
        .from('lineup')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (lineupData) {
        setLineup(lineupData);
        const uniqueStages = Array.from(new Set(lineupData.map(item => item.stage?.toUpperCase()))).filter(Boolean) as string[];
        const sortedStages = uniqueStages.sort((a, b) => (STAGE_PRIORITY[a] || 999) - (STAGE_PRIORITY[b] || 999));
        setStages(sortedStages);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: favData } = await supabase.from('lineup_favorites').select('lineup_id').eq('user_id', session.user.id);
        if (favData) setFavorites(favData.map(f => f.lineup_id));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const toggleFavorite = async (id: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const isAlreadyFav = favorites.includes(id);
    setFavorites(prev => isAlreadyFav ? prev.filter(f => f !== id) : [...prev, id]);
    try {
      if (isAlreadyFav) {
        await supabase.from('lineup_favorites').delete().match({ user_id: session.user.id, lineup_id: id });
      } else {
        await supabase.from('lineup_favorites').insert({ user_id: session.user.id, lineup_id: id });
      }
    } catch (e) { console.error(e); }
  };

  const filteredLineup = lineup.filter(item => {
    const matchesSearch = item.artist?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.stage?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = searchTerm.length > 0 ? true : (item.day?.toLowerCase() === selectedDay.toLowerCase());
    const isFav = activeSubTab === 'my' ? favorites.includes(item.id) : true;
    return matchesSearch && matchesDay && isFav;
  });

  if (loading) return (
    <div className="text-center py-10 text-[10px] font-black text-[#313449]/30 animate-pulse tracking-[0.3em] uppercase">
      Consulting the Lineup...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 px-1">
      
      {/* BARRE DE RECHERCHE - Waikawa 50/200/900 */}
      <div className="relative group px-1">
        <input 
          type="text"
          placeholder="Search Artist or Stage..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-[#d3d6e4] rounded-2xl py-4 pl-12 pr-4 text-[11px] font-bold text-[#313449] placeholder-[#8089b0]/50 focus:outline-none focus:ring-2 focus:ring-[#313449]/5 transition-all shadow-sm"
        />
        <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
      </div>

      {/* ONGLETS GLOBAL / MY SCHEDULE - Waikawa 100/900 */}
      <div className="flex p-1 bg-[#ebecf3] rounded-2xl border border-[#d3d6e4] shadow-inner">
        <button onClick={() => setActiveSubTab('global')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeSubTab === 'global' ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'text-[#8089b0]'}`}>
          Global
        </button>
        <button onClick={() => setActiveSubTab('my')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeSubTab === 'my' ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'text-[#8089b0]'}`}>
          My Path ({favorites.length})
        </button>
      </div>

      {/* FILTRE JOURS - Waikawa 50/200/900 */}
      {!searchTerm && (
        <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-300">
          {['Friday', 'Saturday', 'Sunday'].map(day => (
            <button key={day} onClick={() => setSelectedDay(day)} className={`flex-1 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${selectedDay === day ? 'bg-[#313449] text-[#f6f6f9] border-[#313449] shadow-md' : 'bg-white border-[#d3d6e4] text-[#8089b0]'}`}>
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      )}

      {/* LISTE DES ARTISTES */}
      <div className="space-y-12 mt-8">
        {stages.map(stage => {
          const stageArtists = filteredLineup.filter(item => item.stage?.toUpperCase() === stage);
          if (stageArtists.length === 0) return null;

          return (
            <div key={stage} className="space-y-5">
              <div className="flex items-center gap-4 px-2">
                <h3 className="text-[10px] font-black text-[#313449] uppercase tracking-[0.4em] whitespace-nowrap">{stage}</h3>
                <div className="h-[1px] flex-1 bg-[#d3d6e4]"></div>
              </div>

              <div className="space-y-3">
                {stageArtists.map(artist => {
                  const isFav = favorites.includes(artist.id);
                  return (
                    <div 
                      key={artist.id} 
                      onClick={() => toggleFavorite(artist.id)}
                      className={`p-5 rounded-[1.8rem] border transition-all duration-300 flex justify-between items-center active:scale-[0.97]
                        ${isFav ? 'bg-[#202231] border-[#202231] shadow-lg shadow-[#202231]/20' : 'bg-white border-[#d3d6e4] shadow-sm'}`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className={`text-[11px] font-black uppercase tracking-wider leading-none ${isFav ? 'text-[#f6f6f9]' : 'text-[#313449]'}`}>{artist.artist}</div>
                        <div className={`text-[8px] font-bold uppercase tracking-widest ${isFav ? 'text-[#8089b0]' : 'text-[#58618a]'}`}>
                          {searchTerm ? `${artist.day.slice(0,3)} • ` : ''} {artist.start_time} — {artist.end_time}
                        </div>
                      </div>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all border ${isFav ? 'bg-[#f6f6f9] text-[#202231] border-[#f6f6f9]' : 'bg-[#f6f6f9] text-[#adb2cc] border-[#d3d6e4]'}`}>
                        {isFav ? '✦' : '✧'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredLineup.length === 0 && (
          <div className="text-center py-20 bg-[#ebecf3]/50 rounded-[2.5rem] border border-dashed border-[#d3d6e4]">
            <p className="text-[9px] font-black text-[#8089b0] uppercase tracking-[0.3em]">
              {searchTerm ? "No artist matches this search" : "Your path is unwritten"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}