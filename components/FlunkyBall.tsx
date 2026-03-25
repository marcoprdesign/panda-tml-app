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
    const { data } = await supabase
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

  const addToTeam = (profile: any, team: 'A' | 'B') => {
    const isAlreadyInA = teamA.find(p => p.id === profile.id);
    const isAlreadyInB = teamB.find(p => p.id === profile.id);
    if (team === 'A') {
      if (isAlreadyInA) setTeamA(teamA.filter(p => p.id !== profile.id));
      else {
        setTeamA([...teamA, { id: profile.id, username: profile.username, beers: 0, inGame: true }]);
        setTeamB(teamB.filter(p => p.id !== profile.id));
      }
    } else {
      if (isAlreadyInB) setTeamB(teamB.filter(p => p.id !== profile.id));
      else {
        setTeamB([...teamB, { id: profile.id, username: profile.username, beers: 0, inGame: true }]);
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
    if (next.every(p => !p.inGame)) handleWin(team === 'A' ? 'ALPHA' : 'BETA');
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
    setView('history'); fetchHistory();
    setTeamA([]); setTeamB([]);
  };

  // --- VUE HISTORIQUE ---
  if (view === 'history' && !selectedGame) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-2xl font-black italic uppercase text-[#313449] tracking-tighter">Legends</h2>
          <button onClick={() => setView('setup')} className="bg-[#313449] text-[#f6f6f9] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
            New Duel +
          </button>
        </div>
        {loading ? (
          <div className="py-20 text-center text-[#8089b0]/40 font-black uppercase tracking-[0.3em] text-[10px]">Consulting the scrolls...</div>
        ) : (
          <div className="grid gap-4">
            {history.map(game => (
              <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-white p-5 rounded-[2.2rem] border border-[#d3d6e4] shadow-sm active:bg-[#ebecf3] transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-[#313449] text-[#f6f6f9] text-[8px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider">Victor: {game.winner_team}</span>
                  <span className="text-[#8089b0] text-[8px] font-black uppercase tracking-[0.1em]">{new Date(game.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] font-black text-[#313449] uppercase tracking-tight line-clamp-1 italic">{game.winner_names}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- VUE DÉTAILS MATCH ---
  if (selectedGame) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <button onClick={() => setSelectedGame(null)} className="flex items-center gap-2 text-[10px] font-black text-[#313449] uppercase tracking-widest px-2"><span>←</span> Back to legends</button>
        <div className="bg-white p-6 rounded-[2.5rem] border border-[#d3d6e4] shadow-sm">
            <h3 className="text-center text-[#8089b0] text-[9px] font-black uppercase tracking-[0.4em] mb-8">Sacred Archives</h3>
            <div className="space-y-8">
                {['A', 'B'].map(t => (
                    <div key={t} className="space-y-4">
                        <p className="text-[10px] font-black text-[#313449] uppercase tracking-[0.2em] border-l-2 border-[#313449] pl-3">Team {t === 'A' ? 'Alpha' : 'Beta'}</p>
                        <div className="grid gap-2">
                            {(t === 'A' ? selectedGame.team_a_data : selectedGame.team_b_data).map((p: any) => (
                                <div key={p.id} className="flex justify-between items-center bg-[#f6f6f9] p-4 rounded-2xl border border-[#d3d6e4]">
                                    <span className="text-[10px] font-black text-[#313449] uppercase tracking-wide">{p.username}</span>
                                    <span className="text-[11px] font-black text-[#58618a]">{p.beers} 🍺</span>
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

  // --- VUE SETUP ---
  if (view === 'setup') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex justify-between items-center px-2"><h2 className="text-2xl font-black italic uppercase text-[#313449]">Assemble Squads</h2><button onClick={() => setView('history')} className="text-[10px] font-bold text-[#8089b0] uppercase tracking-widest">Cancel</button></div>
        <div className="grid grid-cols-2 gap-3 px-1">
            <div className="bg-white p-5 rounded-[2rem] border border-[#313449]/20 min-h-[140px] shadow-sm">
                <p className="text-[8px] font-black text-[#313449] mb-4 uppercase text-center tracking-[0.2em]">Team Alpha</p>
                <div className="space-y-2">{teamA.map(p => <div key={p.id} className="text-[10px] font-black text-[#313449]/70 text-center truncate uppercase tracking-tighter">{p.username}</div>)}</div>
            </div>
            <div className="bg-[#ebecf3] p-5 rounded-[2rem] border border-[#d3d6e4] min-h-[140px] shadow-inner">
                <p className="text-[8px] font-black text-[#8089b0] mb-4 uppercase text-center tracking-[0.2em]">Team Beta</p>
                <div className="space-y-2">{teamB.map(p => <div key={p.id} className="text-[10px] font-black text-[#8089b0] text-center truncate uppercase tracking-tighter">{p.username}</div>)}</div>
            </div>
        </div>
        <div className="bg-[#f6f6f9] rounded-[2.5rem] p-6 border border-[#d3d6e4] space-y-2 max-h-[350px] overflow-y-auto shadow-inner">
            {allProfiles.map(prof => (
                <div key={prof.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#d3d6e4]">
                    <span className="text-[11px] font-black text-[#313449]/70 uppercase truncate mr-2 pl-3">{prof.username}</span>
                    <div className="flex gap-2">
                        <button onClick={() => addToTeam(prof, 'A')} className={`w-11 h-11 rounded-xl text-[11px] font-black transition-all ${teamA.find(p => p.id === prof.id) ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'bg-[#ebecf3] text-[#8089b0]'}`}>A</button>
                        <button onClick={() => addToTeam(prof, 'B')} className={`w-11 h-11 rounded-xl text-[11px] font-black transition-all ${teamB.find(p => p.id === prof.id) ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'bg-[#ebecf3] text-[#8089b0]'}`}>B</button>
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
        <div className="text-center px-4"><span className="bg-[#313449]/5 text-[#313449] text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-[0.3em] animate-pulse border border-[#d3d6e4]">Battle in Progress</span></div>
        {['A', 'B'].map(teamKey => (
            <div key={teamKey} className="space-y-5">
                <div className="flex items-center gap-4 px-2">
                    <span className="text-[10px] font-black text-[#313449] uppercase tracking-[0.4em]">Team {teamKey === 'A' ? 'Alpha' : 'Beta'}</span>
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
        <div className="pt-6"><button onClick={() => { if(confirm('Abort match?')) setView('history') }} className="w-full py-4 text-[9px] font-black text-[#8089b0]/60 uppercase tracking-[0.4em] hover:text-[#313449] transition-colors">Surrender Duel</button></div>
    </div>
  );
}