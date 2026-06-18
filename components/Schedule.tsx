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
  const [loading, setLoading] = useState(true);
  
  // NOUVEAU : On gère l'ID de l'artiste sélectionné pour afficher ses détails
  const [expandedArtistId, setExpandedArtistId] = useState<number | null>(null);
  
  // NOUVEAU : Stocke TOUS les favoris du groupe avec les infos de tes potes
  const [allGroupFavorites, setAllGroupFavorites] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // 1. Récupération du Lineup
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

      // 2. Récupération de la session de l'user actuel
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }

      // 3. Récupération de TOUS les favoris du groupe avec le nom de l'ami
      // J'ajoute l'id du lineup et le nom du pote (jointure avec ta table des profils)
      const { data: favData } = await supabase
        .from('lineup_favorites')
        .select(`
          lineup_id,
          user_id,
          profiles ( display_name )
        `); // ⚠️ Ajuste 'profiles(display_name)' selon le nom réel de ta table user
        
      if (favData) {
        setAllGroupFavorites(favData);
      }

    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  // Liste des IDs favoris uniquement pour l'utilisateur actuel (pour l'affichage des étoiles et l'onglet "My schedule")
  const myFavoritesIds = allGroupFavorites
    .filter(fav => fav.user_id === currentUserId)
    .map(fav => fav.lineup_id);

const toggleFavorite = async (e: React.MouseEvent, id: number) => {
  e.stopPropagation(); // Empêche d'ouvrir le volet de l'artiste
  
  if (!currentUserId) return;
  const isAlreadyFav = myFavoritesIds.includes(id);

  // 1. MISE À JOUR LOCALE ET INSTANTANÉE (UI Optimiste)
  if (isAlreadyFav) {
    // On retire notre favori de la liste locale
    setAllGroupFavorites(prev => prev.filter(f => !(f.user_id === currentUserId && f.lineup_id === id)));
  } else {
    // On ajoute notre favori localement sans toucher au reste du groupe
    setAllGroupFavorites(prev => [...prev, { lineup_id: id, user_id: currentUserId, profiles: { display_name: "You" } }]);
  }

  // 2. ENVOI À SUPABASE EN ARRIÈRE-PLAN (Sans fetchInitialData qui fait sauter le scroll)
  try {
    if (isAlreadyFav) {
      await supabase.from('lineup_favorites').delete().match({ user_id: currentUserId, lineup_id: id });
    } else {
      await supabase.from('lineup_favorites').insert({ user_id: currentUserId, lineup_id: id });
    }
    
    // Au lieu de fetchInitialData(), on rafraîchit UNIQUEMENT la table des favoris en tâche de fond
    const { data: freshFavs } = await supabase
      .from('lineup_favorites')
      .select(`
        lineup_id,
        user_id,
        profiles ( display_name )
      `);
      
    if (freshFavs) {
      setAllGroupFavorites(freshFavs);
    }
  } catch (e) { 
    console.error("Erreur favoris:", e);
    // Optionnel : Tu pourrais restaurer l'état précédent ici en cas de vrai crash réseau
  }
};

  const filteredLineup = lineup.filter(item => {
    const matchesSearch = item.artist?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.stage?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = searchTerm.length > 0 ? true : (item.day?.toLowerCase() === selectedDay.toLowerCase());
    const isFav = activeSubTab === 'my' ? myFavoritesIds.includes(item.id) : true;
    return matchesSearch && matchesDay && isFav;
  });

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
          My favorites ({myFavoritesIds.length})
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
                  const isFav = myFavoritesIds.includes(artist.id);
                  const isExpanded = expandedArtistId === artist.id;

                  // On filtre les potes qui ont ajouté CET artiste précis en favori
                  const whoFavsThisArtist = allGroupFavorites
                    .filter(fav => fav.lineup_id === artist.id && fav.user_id !== currentUserId)
                    .map(fav => fav.profiles?.display_name || "Un pote");

                  return (
                    <div key={artist.id} className="space-y-2">
                      <div 
                        onClick={() => setExpandedArtistId(isExpanded ? null : artist.id)}
                        className={`p-5 rounded-[1.8rem] border transition-all duration-300 flex justify-between items-center cursor-pointer active:scale-[0.99] bg-white border-[#d3d6e4] shadow-sm`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="text-[11px] font-black uppercase tracking-wider leading-none text-[#313449]">{artist.artist}</div>
                          <div className="text-[8px] font-bold uppercase tracking-widest text-[#58618a]">
                            {searchTerm ? `${artist.day.slice(0,3)} • ` : ''} {artist.start_time} — {artist.end_time}
                          </div>
                        </div>

                        {/* BOUTON ÉTOILE : Seul le clic ici active/désactive le favori */}
                        <button 
                          onClick={(e) => toggleFavorite(e, artist.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all border outline-none
                            ${isFav ? 'bg-[#202231] text-[#f6f6f9] border-[#202231]' : 'bg-[#f6f6f9] text-[#adb2cc] border-[#d3d6e4]'}`}
                        >
                          {isFav ? '✦' : '✧'}
                        </button>
                      </div>

                      {/* NOUVEAU : Zone extensible qui affiche la liste des potes intéressés */}
                      {isExpanded && (
                        <div className="mx-4 p-4 bg-[#ebecf3]/60 border border-[#d3d6e4]/60 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                          <h4 className="text-[8px] font-black tracking-widest uppercase text-[#8089b0] mb-2">🧑‍🤝‍🧑 On stage with:</h4>
                          {whoFavsThisArtist.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {whoFavsThisArtist.map((name, i) => (
                                <span key={i} className="px-2.5 py-1 bg-white border border-[#d3d6e4] rounded-full text-[9px] font-black text-[#313449] uppercase tracking-wide shadow-sm">
                                  🐼 {name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[9px] italic font-medium text-[#8089b0]">No one else in the squad added this artist yet.</p>
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