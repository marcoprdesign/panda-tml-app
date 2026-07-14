"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';

interface Player {
  id: string;
  username: string;
  beers: number;
  inGame: boolean;
}

interface PlayerStats {
  username: string;
  played: number;
  wins: number;
  winRatio: number;
  beers: number;
  beersPerMatch: number;
}

type SortKey = 'winRatio' | 'played' | 'wins' | 'beers' | 'beersPerMatch';

// ⚽ DEFINITION DES NOMS DE CLUBS PANDAS ICI
const TEAM_A_NAME = "FC Panda";
const TEAM_B_NAME = "Panda Athletic"; 

export default function FlunkyBall() {
  const [view, setView] = useState<'history' | 'setup' | 'playing'>('history');
  const [history, setHistory] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 🔄 Filtre de tri par défaut (Ratio de victoire)
  const [sortBy, setSortBy] = useState<SortKey>('winRatio');

  useEffect(() => {
    fetchHistory();
    fetchProfiles();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    const { data } = await supabase
      .from('flunky_games')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
    setLoading(false);
  }

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('id, username');
    if (data) {
      const sortedProfiles = [...data].sort((a, b) => 
        a.username.localeCompare(b.username, undefined, { sensitivity: 'base' })
      );
      setAllProfiles(sortedProfiles);
    }
  }

  // --- CALCUL ET TRI DES STATISTIQUES ---
  const getLeaderboard = (): PlayerStats[] => {
    const statsMap: { [username: string]: { played: number; wins: number; beers: number } } = {};

    history.forEach(game => {
      const teamAData = game.team_a_data || [];
      const teamBData = game.team_b_data || [];
      const winnerTeam = game.winner_team;

      // Traiter l'équipe A
      teamAData.forEach((p: any) => {
        if (!statsMap[p.username]) {
          statsMap[p.username] = { played: 0, wins: 0, beers: 0 };
        }
        statsMap[p.username].played += 1;
        statsMap[p.username].beers += p.beers || 0;
        if (winnerTeam === TEAM_A_NAME) {
          statsMap[p.username].wins += 1;
        }
      });

      // Traiter l'équipe B
      teamBData.forEach((p: any) => {
        if (!statsMap[p.username]) {
          statsMap[p.username] = { played: 0, wins: 0, beers: 0 };
        }
        statsMap[p.username].played += 1;
        statsMap[p.username].beers += p.beers || 0;
        if (winnerTeam === TEAM_B_NAME) {
          statsMap[p.username].wins += 1;
        }
      });
    });

    const leaderboard: PlayerStats[] = Object.keys(statsMap).map(username => {
      const player = statsMap[username];
      const winRatio = player.played > 0 ? (player.wins / player.played) * 100 : 0;
      const beersPerMatch = player.played > 0 ? player.beers / player.played : 0;

      return {
        username,
        played: player.played,
        wins: player.wins,
        winRatio: Math.round(winRatio),
        beers: player.beers,
        beersPerMatch: Number(beersPerMatch.toFixed(1))
      };
    });

    // Application du tri sélectionné dynamiquement
    return leaderboard.sort((a, b) => {
      if (sortBy === 'beersPerMatch') {
        return b.beersPerMatch - a.beersPerMatch;
      }
      return b[sortBy] - a[sortBy];
    });
  };

  const leaderboardData = getLeaderboard();

  const addToTeam = (profile: any, team: 'A' | 'B') => {
    const isAlreadyInA = teamA.find(p => p.id === profile.id);
    const isAlreadyInB = teamB.find(p => p.id === profile.id);
    if (team === 'A') {
      if (isAlreadyInA) setTeamA(teamA.filter(p => p.id !== profile.id));
      else {
        setTeamA([...teamA, { id: profile.id, username: profile.username, beers: 1, inGame: true }]);
        setTeamB(teamB.filter(p => p.id !== profile.id));
      }
    } else {
      if (isAlreadyInB) setTeamB(teamB.filter(p => p.id !== profile.id));
      else {
        setTeamB([...teamB, { id: profile.id, username: profile.username, beers: 1, inGame: true }]);
        setTeamA(teamA.filter(p => p.id !== profile.id));
      }
    }
  };

  const updateBeer = (team: 'A' | 'B', index: number, delta: number) => {
    const setter = team === 'A' ? setTeamA : setTeamB;
    const current = team === 'A' ? teamA : teamB;
    const next = [...current];
    next[index].beers = Math.max(0, next[index].beers + delta);
    setter(next);
  };

  const toggleElimination = (team: 'A' | 'B', index: number) => {
    const setter = team === 'A' ? setTeamA : setTeamB;
    const current = team === 'A' ? teamA : teamB;
    const next = [...current];
    next[index].inGame = !next[index].inGame;
    setter(next);
    if (next.every(p => !p.inGame)) handleWin(team === 'A' ? TEAM_A_NAME : TEAM_B_NAME);
  };

  const handleWin = async (winnerTeamName: string) => {
    const winnerPlayers = winnerTeamName === TEAM_A_NAME ? teamA : teamB;
    const names = winnerPlayers.map(p => p.username).join(', ');
    await supabase.from('flunky_games').insert([{
      winner_team: winnerTeamName,
      winner_names: names,
      team_a_data: teamA,
      team_b_data: teamB
    }]);
    setView('history'); fetchHistory();
    setTeamA([]); setTeamB([]);
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game from the archives? 🗑️")) return;
    
    try {
      const { data, error } = await supabase
        .from('flunky_games')
        .delete()
        .eq('id', gameId)
        .select();

      if (error) throw error;
      await fetchHistory();
    } catch (err: any) {
      console.error("Error deleting game:", err);
      alert(`Could not delete this match: ${err.message}`);
    }
  };

  // --- VUE HISTORIQUE ---
  if (view === 'history' && !selectedGame) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-2xl font-black italic uppercase text-[#313449] tracking-tighter">Flunky Ball</h2>
          {history.length > 0 && !loading && (
            <button onClick={() => setView('setup')} className="bg-[#313449] text-[#f6f6f9] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
              New Game +
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#8089b0]/40 font-black uppercase tracking-[0.3em] text-[10px]">
            Consulting the scrolls...
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white border border-[#d3d6e4] rounded-[2.5rem] shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-[#f6f6f9] rounded-full flex items-center justify-center border border-[#d3d6e4] text-3xl shadow-inner">
              🐼
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="text-[13px] font-black text-[#313449] uppercase tracking-wider">
                The Pitch is Ready
              </h3>
              <p className="text-[11px] font-medium text-[#8089b0] leading-relaxed">
                No matches have been registered yet. Gather your squad, grab your beers, and write history!
              </p>
            </div>
            <button 
              onClick={() => setView('setup')} 
              className="bg-[#313449] text-[#f6f6f9] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-md hover:shadow-lg active:scale-95 transition-all w-full"
            >
              Start the first Derby ⚡
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* LISTE DES PARTIES */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[#8089b0] uppercase tracking-[0.3em] px-2">Match History</h3>
              <div className="grid gap-4">
                {history.map(game => (
                  <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-white p-5 rounded-[2.2rem] border border-[#d3d6e4] shadow-sm active:bg-[#ebecf3] transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-[#313449] text-[#f6f6f9] text-[8px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider">Winner: {game.winner_team}</span>
                      <span className="text-[#8089b0] text-[8px] font-black uppercase tracking-[0.1em]">{new Date(game.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] font-black text-[#313449] uppercase tracking-tight line-clamp-1 italic">{game.winner_names}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 🏆 ZONE LEADERBOARD CLASSEMENT */}
            <div className="space-y-4 pt-4 border-t border-[#d3d6e4]/50">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black text-[#8089b0] uppercase tracking-[0.3em]">Panda Leaderboard</h3>
                
                {/* 🔄 SELECTEUR DE TRI (SORT BY) */}
                <div className="flex items-center gap-1.5 bg-[#f6f6f9] px-3 py-1.5 rounded-xl border border-[#d3d6e4]">
                  <span className="text-[8px] font-black text-[#8089b0] uppercase tracking-wider">Sort:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="bg-transparent text-[9px] font-black text-[#313449] uppercase tracking-wider focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="winRatio">Win %</option>
                    <option value="wins">Wins</option>
                    <option value="played">Played</option>
                    <option value="beers">Beers</option>
                    <option value="beersPerMatch">Beers/Match</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-white border border-[#d3d6e4] rounded-[2.2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[540px] border-collapse text-left">
                    <thead>
                      <tr className="bg-[#f6f6f9] border-b border-[#d3d6e4]">
                        <th className="py-4 px-5 text-[8px] font-black text-[#8089b0] uppercase tracking-[0.15em] w-8 text-center">Rank</th>
                        <th className="py-4 px-4 text-[8px] font-black text-[#8089b0] uppercase tracking-[0.15em]">Name</th>
                        <th className="py-4 px-4 text-[8px] font-black text-[#8089b0] uppercase tracking-[0.15em] text-center">Played</th>
                        <th className="py-4 px-4 text-[8px] font-black text-[#8089b0] uppercase tracking-[0.15em] text-center">Wins</th>
                        <th className="py-4 px-4 text-[8px] font-black text-[#8089b0] uppercase tracking-[0.15em] text-center">Win %</th>
                        <th className="py-4 px-4 text-[8px] font-black text-[#8089b0] uppercase tracking-[0.15em] text-center">Beers</th>
                        <th className="py-4 px-5 text-[8px] font-black text-[#8089b0] uppercase tracking-[0.15em] text-center">Beers/Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d3d6e4]/60">
                      {leaderboardData.map((row, index) => {
                        const rank = index + 1;
                        let rankEmoji = "🏅";
                        if (rank === 1) rankEmoji = "👑";
                        if (rank === 2) rankEmoji = "🥈";
                        if (rank === 3) rankEmoji = "🥉";

                        return (
                          <tr key={row.username} className="hover:bg-[#f6f6f9]/40 transition-colors">
                            <td className="py-4 px-5 text-center text-[10px] font-black text-[#313449]">
                              {rank <= 3 ? rankEmoji : rank}
                            </td>
                            <td className="py-4 px-4 text-[10px] font-black text-[#313449] uppercase tracking-wide">
                              {row.username}
                            </td>
                            <td className={`py-4 px-4 text-center text-[11px] font-bold ${sortBy === 'played' ? 'text-[#313449]' : 'text-[#8089b0]'}`}>
                              {row.played}
                            </td>
                            <td className={`py-4 px-4 text-center text-[11px] font-bold ${sortBy === 'wins' ? 'text-emerald-700 font-black' : 'text-emerald-600'}`}>
                              {row.wins}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {/* 🟢 Le badge vert avec bordure reste vert en permanence, peu importe la vue active */}
                              <span className={`bg-emerald-50 text-emerald-700 text-[9px] px-2 py-1 rounded-md border border-emerald-200 ${sortBy === 'winRatio' ? 'font-black ring-1 ring-emerald-500/20' : 'font-bold'}`}>
                                {row.winRatio}%
                              </span>
                            </td>
                            <td className={`py-4 px-4 text-center text-[11px] font-bold ${sortBy === 'beers' ? 'text-[#313449] font-black' : 'text-[#58618a]'}`}>
                              {row.beers} 🍺
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-md border ${sortBy === 'beersPerMatch' ? 'bg-[#313449] text-white border-[#313449]' : 'bg-[#f6f6f9] text-[#313449] border-[#d3d6e4]'}`}>
                                {row.beersPerMatch}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VUE DÉTAILS MATCH ---
  if (selectedGame) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <button onClick={() => setSelectedGame(null)} className="flex items-center gap-2 text-[10px] font-black text-[#313449] uppercase tracking-widest px-2"><span>←</span> Back to the list</button>
        <div className="bg-white p-6 rounded-[2.5rem] border border-[#d3d6e4] shadow-sm space-y-8">
            <h3 className="text-center text-[#8089b0] text-[9px] font-black uppercase tracking-[0.4em]">Game recap</h3>
            <div className="space-y-8">
                {['A', 'B'].map(t => {
                    const currentTeamName = t === 'A' ? TEAM_A_NAME : TEAM_B_NAME;
                    const isWinner = selectedGame.winner_team === currentTeamName;
                    
                    return (
                        <div key={t} className="space-y-4">
                            <div className="flex items-center gap-3 border-l-2 border-[#313449] pl-3">
                                <p className="text-[10px] font-black text-[#313449] uppercase tracking-[0.2em]">
                                  {currentTeamName}
                                </p>
                                {isWinner && (
                                  <span className="bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm">
                                    Win
                                  </span>
                                )}
                            </div>
                            <div className="grid gap-2">
                                {(t === 'A' ? selectedGame.team_a_data : selectedGame.team_b_data).map((p: any) => (
                                    <div key={p.id} className="flex justify-between items-center bg-[#f6f6f9] p-4 rounded-2xl border border-[#d3d6e4]">
                                        <span className="text-[10px] font-black text-[#313449] uppercase tracking-wide">{p.username}</span>
                                        <span className="text-[11px] font-black text-[#58618a]">{p.beers} 🍺</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="pt-4 border-t border-[#d3d6e4]/50">
              <button 
                onClick={() => handleDeleteGame(selectedGame.id)}
                className="w-full py-4 text-[9px] font-black text-red-500 hover:text-red-700 bg-red-50 rounded-[1.5rem] uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
              >
                Delete this match 🗑️
              </button>
            </div>
        </div>
      </div>
    );
  }

  // --- VUE SETUP ---
  if (view === 'setup') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex justify-between items-center px-2"><h2 className="text-2xl font-black italic uppercase text-[#313449]">Squads</h2><button onClick={() => setView('history')} className="text-[10px] font-bold text-[#8089b0] uppercase tracking-widest">Cancel</button></div>
        <div className="grid grid-cols-2 gap-3 px-1">
            <div className="bg-white p-5 rounded-[2rem] border border-[#313449]/20 min-h-[140px] shadow-sm">
                <p className="text-[8px] font-black text-[#313449] mb-4 uppercase text-center tracking-[0.2em]">{TEAM_A_NAME}</p>
                <div className="space-y-2">{teamA.map(p => <div key={p.id} className="text-[10px] font-black text-[#313449]/70 text-center truncate uppercase tracking-tighter">{p.username}</div>)}</div>
            </div>
            <div className="bg-[#ebecf3] p-5 rounded-[2rem] border border-[#d3d6e4] min-h-[140px] shadow-inner">
                <p className="text-[8px] font-black text-[#8089b0] mb-4 uppercase text-center tracking-[0.2em]">{TEAM_B_NAME}</p>
                <div className="space-y-2">{teamB.map(p => <div key={p.id} className="text-[10px] font-black text-[#8089b0] text-center truncate uppercase tracking-tighter">{p.username}</div>)}</div>
            </div>
        </div>
        <div className="bg-[#f6f6f9] rounded-[2.5rem] p-6 border border-[#d3d6e4] space-y-2 max-h-[350px] overflow-y-auto shadow-inner">
            {allProfiles.map(prof => (
                <div key={prof.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#d3d6e4]">
                    <span className="text-[11px] font-black text-[#313449]/70 uppercase truncate mr-2 pl-3">{prof.username}</span>
                    <div className="flex gap-2">
                        <button onClick={() => addToTeam(prof, 'A')} className={`px-3.5 h-11 rounded-xl text-[10px] font-black transition-all truncate max-w-[85px] ${teamA.find(p => p.id === prof.id) ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'bg-[#ebecf3] text-[#8089b0]'}`}>F.C. Panda</button>
                        <button onClick={() => addToTeam(prof, 'B')} className={`px-3.5 h-11 rounded-xl text-[10px] font-black transition-all truncate max-w-[85px] ${teamB.find(p => p.id === prof.id) ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'bg-[#ebecf3] text-[#8089b0]'}`}>Panda A.C.</button>
                    </div>
                </div>
            ))}
        </div>
        <button onClick={() => setView('playing')} disabled={teamA.length === 0 || teamB.length === 0} className="w-full py-5 bg-[#313449] text-[#f6f6f9] font-black rounded-[2rem] uppercase tracking-[0.3em] text-[10px] shadow-xl disabled:opacity-30 transition-all active:scale-95">Enter Arena ⚡</button>
      </div>
    );
  }

  // --- VUE MATCH EN COURS ---
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center px-4"><span className="bg-[#313449]/5 text-[#313449] text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-[0.3em] animate-pulse border border-[#d3d6e4]">Derby in Progress</span></div>
        {['A', 'B'].map(teamKey => (
            <div key={teamKey} className="space-y-5">
                <div className="flex items-center gap-4 px-2">
                    <span className="text-[10px] font-black text-[#313449] uppercase tracking-[0.4em]">
                      {teamKey === 'A' ? TEAM_A_NAME : TEAM_B_NAME}
                    </span>
                    <div className="h-[1px] flex-1 bg-[#d3d6e4]"></div>
                </div>
                {(teamKey === 'A' ? teamA : teamB).map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between p-4 pl-6 rounded-[2.2rem] border transition-all duration-500 ${p.inGame ? 'bg-white border-[#d3d6e4] shadow-sm' : 'bg-transparent border-transparent grayscale opacity-30'}`}>
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-black uppercase tracking-tight ${p.inGame ? 'text-[#313449]' : 'text-[#8089b0] line-through'}`}>{p.username}</span>
                          {!p.inGame && <span className="text-[8px] font-black text-[#58618a] uppercase mt-1 tracking-widest">Eliminated</span>}
                        </div>
                        <div className="flex items-center gap-4">
                            {p.inGame && (
                                <div className="flex items-center bg-[#f6f6f9] rounded-full border border-[#d3d6e4] p-1 shadow-inner">
                                  <button onClick={() => updateBeer(teamKey as 'A'|'B', i, -1)} className="w-9 h-9 flex items-center justify-center text-[#8089b0] font-black">-</button>
                                  <span className="w-7 text-center text-[11px] font-black text-[#313449]">{p.beers}</span>
                                  <button onClick={() => updateBeer(teamKey as 'A'|'B', i, 1)} className="w-9 h-9 flex items-center justify-center text-[#313449] font-black">+</button>
                                </div>
                            )}
                            <button onClick={() => toggleElimination(teamKey as 'A'|'B', i)} className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center transition-all shadow-sm ${p.inGame ? 'bg-white text-[#58618a] border border-[#d3d6e4]' : 'bg-[#313449] text-white'}`}>
                              {p.inGame ? '✕' : '↺'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ))}
        <div className="pt-6"><button onClick={() => { if(confirm('Abort derby?')) setView('history') }} className="w-full py-4 text-[9px] font-black text-[#8089b0]/60 uppercase tracking-[0.4em] hover:text-[#313449] transition-colors">Surrender Game</button></div>
    </div>
  );
}