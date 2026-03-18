"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import Auth from '@/components/Auth';
import Calculator from '@/components/Calculator';
import Avatar from '@/components/Avatar';
import PostDrink from '@/components/PostDrink';
import DrinkFeed from '@/components/DrinkFeed';
import DrinkCharts from '@/components/DrinkCharts';
import Leaderboard from '@/components/Leaderboard';
import FlunkyBall from '@/components/FlunkyBall';
import Schedule from '@/components/Schedule'; 

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('activity'); 
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
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center text-[#2F4F4F] font-black italic tracking-[0.3em] animate-pulse uppercase text-[10px]">
      LOADING THE SCROLL...
    </div>
  );

  if (!session) return (
    <main className="min-h-screen bg-[#F5F5DC] p-6 flex flex-col justify-center">
      <Auth />
    </main>
  );

  return (
    <main className="min-h-screen bg-[#F5F5DC] text-[#2F4F4F] flex flex-col font-sans antialiased">
      
      {/* HEADER */}
  <header className="px-6 py-6 flex justify-between items-center bg-[#F5F5DC]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#778899]/20">
  <div className="flex items-center gap-3 min-w-0 flex-1">
    
    {/* Avatar - Toujours parfaitement rond et fixe */}
    <div className="w-10 h-10 flex-shrink-0 aspect-square rounded-full border-2 border-[#2F4F4F] overflow-hidden bg-white shadow-sm flex items-center justify-center">
      <Avatar 
        uid={session.user.id} 
        url={profile?.avatar_url} 
        username={profile?.username}
        onUpload={(url) => setProfile({ ...profile, avatar_url: url })} 
      />
    </div>
    
    <div className="flex flex-col text-left min-w-0">
      {/* TITRE : Retrait de leading-none et ajout de leading-tight pour le multi-ligne */}
      <h1 className="text-lg font-black italic tracking-tighter uppercase leading-[0.9] text-[#2F4F4F] break-words">
        PANDAS OF <br className="xs:hidden" /> TOMORROWLAND
      </h1>
      
      {/* Statut Actif */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8F9779] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8F9779]"></span>
        </span>
        <span className="text-[8px] font-black text-[#778899] uppercase tracking-[0.3em] text-left leading-none">
          Currently Online
        </span>
      </div>
    </div>
  </div>
  
  {/* Bouton Exit - Garde sa place à droite */}
  <button 
    onClick={() => supabase.auth.signOut()} 
    className="flex-shrink-0 text-[9px] font-black text-[#778899]/60 uppercase tracking-widest border border-[#778899]/30 px-3 py-1.5 rounded-full active:scale-95 transition-all ml-4"
  >
    Exit
  </button>
</header>

      {/* ZONE DE CONTENU */}
      <div className="flex-1 overflow-y-auto px-5 pb-36">
        
        {activeTab === 'activity' && (
          <div className="mt-6 space-y-8 animate-in fade-in duration-500">
            
            {/* Switcher Ardoise */}
            <div className="flex p-1 bg-[#778899]/10 rounded-2xl border border-[#778899]/20 shadow-inner">
              <button 
                onClick={() => setSubTab('feed')} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${subTab === 'feed' ? 'bg-[#2F4F4F] text-[#F5F5DC] shadow-md' : 'text-[#778899]'}`}
              >
                Journal
              </button>
              <button 
                onClick={() => setSubTab('ranking')} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${subTab === 'ranking' ? 'bg-[#2F4F4F] text-[#F5F5DC] shadow-md' : 'text-[#778899]'}`}
              >
                Ranking
              </button>
            </div>
            
            {subTab === 'feed' ? (
              <div className="space-y-8">
                {/* Plus de wrapper "bloc dans un bloc" ici */}
                <PostDrink userProfile={profile} />
                <DrinkFeed />
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-bottom-4">
                <DrinkCharts />
                <Leaderboard />
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && <div className="mt-6"><Schedule /></div>}
        {activeTab === 'flunky' && <div className="mt-6"><FlunkyBall /></div>}
        {activeTab === 'calc' && <div className="mt-6"><Calculator /></div>}
      </div>

      {/* NAVIGATION BAR FLOTTANTE */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#2F4F4F] border border-white/10 p-2 rounded-[2.5rem] flex justify-between items-center shadow-2xl z-50">
        {[
          { id: 'activity', icon: '📜', label: 'Feed' },
          { id: 'schedule', icon: '🏛️', label: 'Lineup' },
          { id: 'flunky', icon: '🏆', label: 'Game' },
          { id: 'calc', icon: '💎', label: 'Pearls' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-[2.2rem] transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-[#F5F5DC] text-[#2F4F4F] shadow-lg scale-105' 
                : 'text-[#F5F5DC]/40'}`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}