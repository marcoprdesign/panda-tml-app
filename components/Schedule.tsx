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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Stocke TOUS les favoris du groupe (lineup_id et user_id uniquement)
  const [allGroupFavorites, setAllGroupFavorites] = useState<any[]>([]);
  
  // Gère l'ID de l'artiste actuellement déplié
  const [expandedArtistId, setExpandedArtistId] = useState<number | null>(null);

  // Stocke la liste des profils pour lier les usernames de manière isolée
  const [profilesList, setProfilesList] = useState<any[]>([]);

  // 1. Initialisation au montage
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);

        // Récupération du Lineup
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

        

        // Récupération de TOUS les favoris du groupe
        const { data: allFavData } = await supabase
          .from('lineup_favorites')
          .select('lineup_id, user_id');
        
        if (allFavData) {
          setAllGroupFavorites(allFavData);
        }

// Récupération des profils en parallèle de manière isolée
const { data: profilesData, error: profilesError } = await supabase
  .from('profiles')
  .select('id, username');

// 🔥 Le log pour voir exactement ce que Supabase renvoie ou bloque :
console.log("DEBUG PROFILES:", { data: profilesData, error: profilesError });

if (profilesData) {
  setProfilesList(profilesData);
}

        // Récupération de la session utilisateur
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUserId(session.user.id);
          // Filtre pour obtenir tes favoris personnels au refresh
          if (allFavData) {
            const myFavs = allFavData
              .filter(fav => fav.user_id === session.user.id)
              .map(fav => fav.lineup_id);
            setFavorites(myFavs);
          }
        }
      } catch (e) {
        console.error("Erreur initialisation:", e);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  // 2. Action d'ajout/suppression en favoris
  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Bloque l'ouverture de la section artiste lors du clic sur l'étoile
    if (!currentUserId) return;

    const isAlreadyFav = favorites.includes(id);

    // UI optimiste : Mise à jour visuelle instantanée
    setFavorites(prev => isAlreadyFav ? prev.filter(f => f !== id) : [...prev, id]);

    // Mise à jour locale immédiate du state du groupe
    if (isAlreadyFav) {
      setAllGroupFavorites(prev => prev.filter(f => !(f.user_id === currentUserId && f.lineup_id === id)));
    } else {
      setAllGroupFavorites(prev => [...prev, { lineup_id: id, user_id: currentUserId }]);
    }

    try {
      if (isAlreadyFav) {
        await supabase
          .from('lineup_favorites')
          .delete()
          .match({ user_id: currentUserId, lineup_id: id });
      } else {
        await supabase
          .from('lineup_favorites')
          .insert({ user_id: currentUserId, lineup_id: id });
      }
    } catch (e) {
      console.error("Erreur Supabase favoris:", e);
    }
  };

  const handleArtistClick = (artistId: number) => {
    setExpandedArtistId(prevId => (prevId === artistId ? null : artistId));
  };

  // 3. Filtrage du Lineup
  const filteredLineup = lineup.filter(item => {
    const matchesSearch = item.artist?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.stage?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = searchTerm.length > 0 ? true : (item.day?.toLowerCase() === selectedDay.toLowerCase());
    const isFav = activeSubTab === 'my' ? favorites.includes(item.id) : true;
    return matchesSearch && matchesDay && isFav;
  });

  // 4. Tri chronologique (gestion de la fin de nuit après minuit)
  const getSortedArtistsForStage = (artists: any[]) => {
    return [...artists].sort((a, b) => {
      const getWeight = (timeStr: string) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        let totalHours = hours + minutes / 60;
        if (hours >= 0 && hours < 6) totalHours += 24; 
        return totalHours;
      };
      return getWeight(a.start_time) - getWeight(b.start_time);
    });
  };

  if (loading) return (
    <div className="text-center py-10 text-[10px] font-black text-[#313449]/30 animate-pulse tracking-[0.3em] uppercase">
      Consulting the Lineup...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 px-1">
      
      {/* BARRE DE RECHERCHE */}
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

      {/* ONGLETS GLOBAL / MY SCHEDULE */}
      <div className="flex p-1 bg-[#ebecf3] rounded-2xl border border-[#d3d6e4] shadow-inner">
        <button onClick={() => setActiveSubTab('global')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeSubTab === 'global' ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'text-[#8089b0]'}`}>
          Timetable
        </button>
        <button onClick={() => setActiveSubTab('my')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeSubTab === 'my' ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'text-[#8089b0]'}`}>
          My favorites ({favorites.length})
        </button>
      </div>

      {/* FILTRE JOURS */}
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
          const unsortedStageArtists = filteredLineup.filter(item => item.stage?.toUpperCase() === stage);
          if (unsortedStageArtists.length === 0) return null;

          const stageArtists = getSortedArtistsForStage(unsortedStageArtists);

          return (
            <div key={stage} className="space-y-5">
              <div className="flex items-center gap-4 px-2">
                <h3 className="text-[10px] font-black text-[#313449] uppercase tracking-[0.4em] whitespace-nowrap">{stage}</h3>
                <div className="h-[1px] flex-1 bg-[#d3d6e4]"></div>
              </div>

              <div className="space-y-3">
                {stageArtists.map(artist => {
                  const isFav = favorites.includes(artist.id);
                  const isExpanded = expandedArtistId === artist.id;

                  // Liste des favoris des autres membres de la squad pour cet artiste
                  const interestedFavs = allGroupFavorites.filter(
                    fav => fav.lineup_id === artist.id && fav.user_id !== currentUserId
                  );

                  return (
                    <div key={artist.id} className="space-y-2">
                      <div 
                        onClick={() => handleArtistClick(artist.id)}
                        className={`p-5 rounded-[1.8rem] border flex justify-between items-center transition-all duration-300 cursor-pointer active:scale-[0.98]
                          ${isExpanded ? 'bg-[#ebecf3] border-[#d3d6e4]' : 'bg-white border-[#d3d6e4] shadow-sm'}`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="text-[11px] font-black uppercase tracking-wider leading-none text-[#313449]">{artist.artist}</div>
                          <div className="text-[8px] font-bold uppercase tracking-widest text-[#58618a]">
                            {searchTerm ? `${artist.day.slice(0,3)} • ` : ''} {artist.start_time} — {artist.end_time}
                          </div>
                        </div>

                        {/* ÉTOILE */}
                        <button 
                          onClick={(e) => toggleFavorite(e, artist.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all border outline-none
                            ${isFav ? 'bg-[#202231] text-[#f6f6f9] border-[#202231]' : 'bg-[#f6f6f9] text-[#adb2cc] border-[#d3d6e4]'}`}
                        >
                          {isFav ? '✦' : '✧'}
                        </button>
                      </div>

                      {/* Section extensible sociale */}
                      {isExpanded && (
                        <div className="mx-4 p-4 bg-[#ebecf3]/50 border border-[#d3d6e4]/60 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                          <h4 className="text-[8px] font-black tracking-widest uppercase text-[#8089b0] mb-2.5">🧑‍🤝‍🧑 Squad Members Interested:</h4>
                          {interestedFavs.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {interestedFavs.map((fav, i) => {
                                // Recherche de correspondance d'ID dans la liste des profils chargés
                                const match = profilesList.find(p => p.id === fav.user_id);
                                const displayName = match ? match.username : "Friend";

                                return (
                                  <span key={i} className="px-3 py-1 bg-white border border-[#d3d6e4] rounded-full text-[9px] font-black text-[#313449] uppercase tracking-wide shadow-sm flex items-center gap-1.5">
                                    <span className="text-xs">🐼</span> {displayName}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[9px] italic font-medium text-[#8089b0] pl-1">No pandas have added this artist yet.</p>
                          )}
                        </div>
                      )}
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