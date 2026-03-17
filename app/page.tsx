"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import Auth from '@/components/Auth';
import Calculator from '@/components/Calculator';
import Avatar from '@/components/Avatar';
import PostDrink from '@/components/PostDrink';
import DrinkFeed from '@/components/DrinkFeed';
import Leaderboard from '@/components/Leaderboard';
import FlunkyBall from '@/components/FlunkyBall';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('activity'); // activity | flunky | calc
  const [subTab, setSubTab] = useState('feed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-[#DFFF5E] font-black italic tracking-widest animate-pulse">
      PANDAS OF TOMORROWLAND...
    </div>
  );

  if (!session) return (
    <main className="min-h-screen bg-[#0A0A0C] p-6 flex flex-col justify-center">
      <Auth />
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-white flex flex-col">
      
      {/* HEADER FIXE */}
      <header className="px-5 py-4 flex justify-between items-center bg-[#0A0A0C]/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-white/10 overflow-hidden bg-black relative shadow-lg">
                <Avatar 
                  uid={session.user.id} 
                  url={profile?.avatar_url} 
                  onUpload={(url) => setProfile({ ...profile, avatar_url: url })} 
                />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black italic tracking-tighter uppercase leading-none">PANDAS OF TOMORROWLAND</h1>
              <span className="text-[7px] font-bold text-[#DFFF5E] uppercase tracking-[0.2em] mt-1">Tomorrowland 2026</span>
            </div>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="text-[8px] font-black text-white/30 uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-full active:bg-white/5 transition-all"
        >
          Logout
        </button>
      </header>

      {/* ZONE DE CONTENU DYNAMIQUE */}
      <div className="flex-1 overflow-y-auto px-5 pb-32">
        
        {/* ONGLET ACTIVITY (Feed & Leaderboard) */}
        {activeTab === 'activity' && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex p-1 bg-[#141417] rounded-xl border border-white/5 shadow-inner">
              <button 
                onClick={() => setSubTab('feed')} 
                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${subTab === 'feed' ? 'bg-[#DFFF5E] text-black shadow-md shadow-[#DFFF5E]/10' : 'text-white/20'}`}
              >
                Feed
              </button>
              <button 
                onClick={() => setSubTab('ranking')} 
                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${subTab === 'ranking' ? 'bg-[#DFFF5E] text-black shadow-md shadow-[#DFFF5E]/10' : 'text-white/20'}`}
              >
                Ranking
              </button>
            </div>
            
            {subTab === 'feed' ? (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <PostDrink userProfile={profile} />
                <DrinkFeed />
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-4">
                <Leaderboard />
              </div>
            )}
          </div>
        )}

        {/* ONGLET FLUNKY BALL */}
        {activeTab === 'flunky' && (
          <div className="mt-6 animate-in slide-in-from-bottom-4 duration-500">
            <FlunkyBall />
          </div>
        )}

        {/* ONGLET CALCULATOR */}
        {activeTab === 'calc' && (
          <div className="mt-6 animate-in slide-in-from-bottom-4 duration-500">
            <Calculator />
          </div>
        )}
      </div>

      {/* NAVIGATION BAR FLOTTANTE (Design 3 Boutons) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#1A1A1E]/95 backdrop-blur-3xl border border-white/10 p-1.5 rounded-[2.2rem] flex justify-between items-center shadow-2xl z-50">
        
        {/* Activity Tab */}
        <button 
          onClick={() => setActiveTab('activity')} 
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-[1.8rem] transition-all ${activeTab === 'activity' ? 'bg-[#DFFF5E] text-black' : 'text-white/20'}`}
        >
          <span className="text-xl leading-none">⚡</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Live</span>
        </button>

        {/* Flunky Ball Tab (VS) */}
        <button 
          onClick={() => setActiveTab('flunky')} 
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-[1.8rem] transition-all ${activeTab === 'flunky' ? 'bg-[#DFFF5E] text-black' : 'text-white/20'}`}
        >
          <span className="text-xl leading-none">🥊</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Match</span>
        </button>

        {/* Pearls Tab */}
        <button 
          onClick={() => setActiveTab('calc')} 
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-[1.8rem] transition-all ${activeTab === 'calc' ? 'bg-[#DFFF5E] text-black' : 'text-white/20'}`}
        >
          <span className="text-xl leading-none">💎</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Pearls</span>
        </button>
      </div>
      
    </main>
  );
}