"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

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

  const filteredLineup = lineup.filter(item => {
    const isSameDay = item.day?.toLowerCase() === selectedDay.toLowerCase();
    const isFav = activeSubTab === 'my' ? favorites.includes(item.id) : true;
    return isSameDay && isFav;
  });

  if (loading) return (
    <div className="text-center py-10 text-[10px] font-black text-[#2F4F4F]/20 animate-pulse tracking-[0.3em] uppercase">
      Consulting the Grimoire...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 px-1">
      
      {/* 1. Onglets Global / My Schedule - Palette Ardoise */}
      <div className="flex p-1 bg-[#778899]/10 rounded-2xl border border-[#778899]/20 shadow-inner">
        <button 
          onClick={() => setActiveSubTab('global')} 
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 
            ${activeSubTab === 'global' ? 'bg-[#2F4F4F] text-[#F5F5DC] shadow-md' : 'text-[#778899]'}`}
        >
          Global
        </button>
        <button 
          onClick={() => setActiveSubTab('my')} 
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 
            ${activeSubTab === 'my' ? 'bg-[#2F4F4F] text-[#F5F5DC] shadow-md' : 'text-[#778899]'}`}
        >
          My Path ({favorites.length})
        </button>
      </div>

      {/* 2. Filtre Jours - Style Archive */}
      <div className="flex gap-2">
        {['Friday', 'Saturday', 'Sunday'].map(day => (
          <button 
            key={day} 
            onClick={() => setSelectedDay(day)} 
            className={`flex-1 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-300
              ${selectedDay === day 
                ? 'bg-[#F5F5DC] text-[#2F4F4F] border-[#2F4F4F] shadow-md' 
                : 'bg-white/30 border-[#778899]/10 text-[#778899]/50'}`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* 3. Liste par Scènes */}
      <div className="space-y-12 mt-8">
        {STAGES.map(stage => {
          const stageArtists = filteredLineup.filter(item => item.stage?.toUpperCase() === stage);
          if (stageArtists.length === 0) return null;

          return (
            <div key={stage} className="space-y-5">
              {/* Séparateur de Scène épuré */}
              <div className="flex items-center gap-4 px-2">
                <h3 className="text-[10px] font-black text-[#2F4F4F] uppercase tracking-[0.4em] whitespace-nowrap">{stage}</h3>
                <div className="h-[1px] flex-1 bg-[#2F4F4F]/10"></div>
              </div>

              <div className="space-y-3">
                {stageArtists.map(artist => {
                  const isFav = favorites.includes(artist.id);
                  return (
                    <div 
                      key={artist.id} 
                      onClick={() => toggleFavorite(artist.id)}
                      className={`p-5 rounded-[1.8rem] border transition-all duration-300 flex justify-between items-center active:scale-[0.97]
                        ${isFav 
                          ? 'bg-[#2F4F4F] border-[#2F4F4F] shadow-lg shadow-[#2F4F4F]/10' 
                          : 'bg-white/40 border-[#778899]/10 shadow-sm'}`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className={`text-[11px] font-black uppercase tracking-wider leading-none 
                          ${isFav ? 'text-[#F5F5DC]' : 'text-[#2F4F4F]'}`}>
                          {artist.artist}
                        </div>
                        <div className={`text-[8px] font-bold uppercase tracking-widest 
                          ${isFav ? 'text-[#F5F5DC]/50' : 'text-[#778899]'}`}>
                          {artist.start_time} — {artist.end_time}
                        </div>
                      </div>
                      
                      {/* Bouton Étoile stylisé */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all border
                        ${isFav 
                          ? 'bg-[#F5F5DC] text-[#2F4F4F] border-[#F5F5DC]' 
                          : 'bg-[#778899]/5 text-[#778899]/30 border-[#778899]/10'}`}>
                        {isFav ? '✦' : '✧'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredLineup.length === 0 && (activeSubTab === 'my') && (
          <div className="text-center py-20 bg-white/20 rounded-[2.5rem] border border-dashed border-[#778899]/20">
            <p className="text-[9px] font-black text-[#778899]/40 uppercase tracking-[0.3em]">
              Your path is unwritten
            </p>
          </div>
        )}
      </div>
    </div>
  );
}