"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';

interface Player {
  id: string;
  username: string;
  beers: number;
  inGame: boolean;
}

export default function FlunkyBall() {
  const [view, setView] = useState<'history' | 'setup' | 'playing'>('history');
  const [history, setHistory] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
    fetchProfiles();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    const { data, error } = await supabase
      .from('flunky_games')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
    setLoading(false);
  }

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('id, username');
    if (data) setAllProfiles(data);
  }

  // Logique de désaffectation si on reclique sur le même bouton
  const addToTeam = (profile: any, team: 'A' | 'B') => {
    const isAlreadyInA = teamA.find(p => p.id === profile.id);
    const isAlreadyInB = teamB.find(p => p.id === profile.id);

    if (team === 'A') {
      if (isAlreadyInA) {
        setTeamA(teamA.filter(p => p.id !== profile.id));
      } else {
        setTeamA([...teamA, { id: profile.id, username: profile.username, beers: 0, inGame: true }]);
        setTeamB(teamB.filter(p => p.id !== profile.id)); // Retire de B s'il y était
      }
    } else {
      if (isAlreadyInB) {
        setTeamB(teamB.filter(p => p.id !== profile.id));
      } else {
        setTeamB([...teamB, { id: profile.id, username: profile.username, beers: 0, inGame: true }]);
        setTeamA(teamA.filter(p => p.id !== profile.id)); // Retire de A s'il y était
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
    
    // RÈGLE : Si TOUS les joueurs de l'équipe "A" sont éliminés, c'est l'équipe "A" qui gagne
    const allEliminated = next.every(p => !p.inGame);
    if (allEliminated) {
        handleWin(team === 'A' ? 'ALPHA' : 'BETA');
    }
  };

  const handleWin = async (winnerTeamName: string) => {
    const winnerPlayers = winnerTeamName === 'ALPHA' ? teamA : teamB;
    const names = winnerPlayers.map(p => p.username).join(', ');

    await supabase.from('flunky_games').insert([{
      winner_team: winnerTeamName,
      winner_names: names,
      team_a_data: teamA,
      team_b_data: teamB
    }]);

    alert(`🏆 VICTOIRE TEAM ${winnerTeamName} !`);
    setTeamA([]);
    setTeamB([]);
    setView('history');
    fetchHistory();
  };

  if (view === 'history' && !selectedGame) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">History</h2>
          <button onClick={() => setView('setup')} className="bg-[#DFFF5E] text-black px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#DFFF5E]/10 active:scale-95 transition-all">New Game +</button>
        </div>
        {loading ? (
          <div className="py-20 text-center text-white/10 font-black uppercase tracking-[0.3em] text-xs">Loading...</div>
        ) : history.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]"><p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">No games recorded</p></div>
        ) : (
          <div className="grid gap-3">
            {history.map(game => (
              <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-[#141417] p-5 rounded-[2rem] border border-white/5 active:bg-white/5 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-[#DFFF5E] text-black text-[8px] font-black uppercase px-2 py-1 rounded-md">Winner: {game.winner_team}</span>
                  <span className="text-white/20 text-[8px] font-bold uppercase">{new Date(game.created_at).toLocaleDateString([], {day: '2-digit', month: '2-digit'})}</span>
                </div>
                <p className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-1">{game.winner_names}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selectedGame) {
    return (
      <div className="space-y-6 animate-in zoom-in-95 duration-300">
        <button onClick={() => setSelectedGame(null)} className="flex items-center gap-2 text-[10px] font-black text-[#DFFF5E] uppercase tracking-widest"><span>←</span> Back</button>
        <div className="bg-[#141417] p-6 rounded-[2.5rem] border border-white/5">
            <h3 className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mb-6">Match Details</h3>
            <div className="space-y-8">
                {['A', 'B'].map(t => (
                    <div key={t} className="space-y-3">
                        <p className="text-[10px] font-black text-[#DFFF5E] uppercase tracking-widest">Team {t === 'A' ? 'Alpha' : 'Beta'}</p>
                        <div className="grid gap-2">
                            {(t === 'A' ? selectedGame.team_a_data : selectedGame.team_b_data).map((p: any) => (
                                <div key={p.id} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                                    <span className="text-xs font-bold text-white uppercase">{p.username}</span>
                                    <span className="text-[10px] font-black text-[#DFFF5E]">{p.beers} 🍺</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  if (view === 'setup') {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center"><h2 className="text-2xl font-black italic uppercase">Build Teams</h2><button onClick={() => setView('history')} className="text-[10px] font-bold text-white/30 uppercase">Cancel</button></div>
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-4 rounded-2xl border border-[#DFFF5E]/20 min-h-[120px]">
                <p className="text-[8px] font-black text-[#DFFF5E] mb-3 uppercase text-center tracking-widest">Team Alpha</p>
                <div className="space-y-1">{teamA.map(p => <div key={p.id} className="text-[10px] font-bold text-white text-center truncate">{p.username}</div>)}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 min-h-[120px]">
                <p className="text-[8px] font-black text-white/30 mb-3 uppercase text-center tracking-widest">Team Beta</p>
                <div className="space-y-1">{teamB.map(p => <div key={p.id} className="text-[10px] font-bold text-white text-center truncate">{p.username}</div>)}</div>
            </div>
        </div>
        <div className="bg-[#141417] rounded-[2rem] p-4 border border-white/5 space-y-2 max-h-[300px] overflow-y-auto">
            {allProfiles.map(prof => (
                <div key={prof.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[11px] font-bold text-white/70 uppercase truncate mr-2">{prof.username}</span>
                    <div className="flex gap-1.5">
                        <button onClick={() => addToTeam(prof, 'A')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${teamA.find(p => p.id === prof.id) ? 'bg-[#DFFF5E] text-black shadow-[0_0_10px_rgba(223,255,94,0.3)]' : 'bg-white/5 text-white/40'}`}>A</button>
                        <button onClick={() => addToTeam(prof, 'B')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${teamB.find(p => p.id === prof.id) ? 'bg-[#DFFF5E] text-black shadow-[0_0_10px_rgba(223,255,94,0.3)]' : 'bg-white/5 text-white/40'}`}>B</button>
                    </div>
                </div>
            ))}
        </div>
        <button onClick={() => setView('playing')} disabled={teamA.length === 0 || teamB.length === 0} className="w-full py-5 bg-[#DFFF5E] text-black font-black rounded-3xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#DFFF5E]/10 disabled:opacity-20 transition-all">Start Match ⚡</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
        <div className="text-center"><span className="bg-red-500/10 text-red-500 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.3em] animate-pulse border border-red-500/20">Live Match</span></div>
        {['A', 'B'].map(teamKey => (
            <div key={teamKey} className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                    <span className="text-[10px] font-black text-[#DFFF5E] uppercase tracking-[0.3em]">Team {teamKey === 'A' ? 'Alpha' : 'Beta'}</span>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                </div>
                {(teamKey === 'A' ? teamA : teamB).map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between p-3 pl-5 rounded-2xl border transition-all duration-300 ${p.inGame ? 'bg-[#141417] border-white/5 shadow-lg' : 'bg-black/40 border-transparent grayscale opacity-50'}`}>
                        <div className="flex flex-col"><span className={`text-[11px] font-black uppercase tracking-tight ${p.inGame ? 'text-white' : 'text-white/30 line-through'}`}>{p.username}</span>{!p.inGame && <span className="text-[7px] font-black text-red-500 uppercase mt-0.5">Eliminated</span>}</div>
                        <div className="flex items-center gap-3">
                            {p.inGame && (
                                <div className="flex items-center bg-black/50 rounded-full border border-white/5 p-0.5"><button onClick={() => updateBeer(teamKey as 'A'|'B', i, -1)} className="w-8 h-8 flex items-center justify-center text-white/20">-</button><span className="w-5 text-center text-[10px] font-black text-[#DFFF5E]">{p.beers}</span><button onClick={() => updateBeer(teamKey as 'A'|'B', i, 1)} className="w-8 h-8 flex items-center justify-center text-[#DFFF5E]">+</button></div>
                            )}
                            <button onClick={() => toggleElimination(teamKey as 'A'|'B', i)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${p.inGame ? 'bg-white/5 text-white/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}>{p.inGame ? '✕' : '↺'}</button>
                        </div>
                    </div>
                ))}
            </div>
        ))}
        <div className="pt-4"><button onClick={() => { if(confirm('Cancel?')) setView('history') }} className="w-full py-4 text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Abort Game</button></div>
    </div>
  );
}