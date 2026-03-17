"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

// Liste des scènes pour le filtrage (On pourra en ajouter d'autres ici)
const STAGES = ['MAINSTAGE', 'FREEDOM STAGE', 'ATMOSPHERE', 'THE GREAT LIBRARY'];

export default function Schedule() {
  const [activeSubTab, setActiveSubTab] = useState<'global' | 'my'>('global');
  const [selectedDay, setSelectedDay] = useState('Friday');
  const [lineup, setLineup] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLineup();
  }, []);

  const fetchLineup = async () => {
    try {
      const { data, error } = await supabase
        .from('lineup')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      if (data) setLineup(data);
    } catch (e) {
      console.error("Erreur lineup:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Filtrage intelligent
  const filteredLineup = lineup.filter(item => {
    const isSameDay = item.day?.toLowerCase() === selectedDay.toLowerCase();
    const isFav = activeSubTab === 'my' ? favorites.includes(item.id) : true;
    return isSameDay && isFav;
  });

  if (loading) return <div className="text-center py-10 text-[10px] font-black opacity-20 animate-pulse">LOADING LINEUP...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Onglets Global / My Schedule */}
      <div className="flex p-1 bg-[#141417] rounded-xl border border-white/5 shadow-inner">
        <button 
          onClick={() => setActiveSubTab('global')} 
          className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeSubTab === 'global' ? 'bg-white text-black' : 'text-white/20'}`}
        >
          Global
        </button>
        <button 
          onClick={() => setActiveSubTab('my')} 
          className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeSubTab === 'my' ? 'bg-[#DFFF5E] text-black shadow-md shadow-[#DFFF5E]/10' : 'text-white/20'}`}
        >
          My Schedule ({favorites.length})
        </button>
      </div>

      {/* 2. Filtre Jours */}
      <div className="flex gap-2">
        {['Friday', 'Saturday', 'Sunday'].map(day => (
          <button 
            key={day} 
            onClick={() => setSelectedDay(day)} 
            className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all
              ${selectedDay === day ? 'bg-[#DFFF5E] text-black border-[#DFFF5E]' : 'bg-white/5 border-white/5 text-white/30'}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 3. Liste par Scènes */}
      <div className="space-y-10 pb-10">
        {STAGES.map(stage => {
          const stageArtists = filteredLineup.filter(item => item.stage?.toUpperCase() === stage);
          if (stageArtists.length === 0) return null;

          return (
            <div key={stage} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-white/5"></div>
                <h3 className="text-[10px] font-black text-[#DFFF5E] uppercase tracking-[0.3em]">{stage}</h3>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>

              <div className="space-y-2">
                {stageArtists.map(artist => (
                  <div 
                    key={artist.id} 
                    onClick={() => toggleFavorite(artist.id)}
                    className={`p-4 rounded-2xl border transition-all flex justify-between items-center active:scale-[0.98]
                      ${favorites.includes(artist.id) ? 'bg-[#DFFF5E]/10 border-[#DFFF5E]/30' : 'bg-[#141417] border-white/5'}`}
                  >
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-tight">{artist.artist}</div>
                      <div className="text-[9px] text-white/30 font-bold mt-0.5">{artist.start_time} — {artist.end_time}</div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all
                      ${favorites.includes(artist.id) ? 'bg-[#DFFF5E] text-black' : 'bg-white/5 text-white/10'}`}>
                      {favorites.includes(artist.id) ? '★' : '☆'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Message si vide */}
        {filteredLineup.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              {activeSubTab === 'my' ? 'No favorites selected for this day' : 'No artists found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}