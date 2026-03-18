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
import Profile from '@/components/Profile'; // 1. AJOUT DE L'IMPORT

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
          {/* Logo Temporaire Panda */}
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#2F4F4F]/5 rounded-xl border border-[#2F4F4F]/10 text-xl">
            🐼
          </div>
          
          <div className="flex flex-col text-left min-w-0">
            <h1 className="text-lg font-black italic tracking-tighter uppercase leading-[0.9] text-[#2F4F4F] break-words">
              PANDAS OF <br className="xs:hidden" /> TOMORROWLAND
            </h1>
          </div>
        </div>
        
        {/* AVATAR À DROITE - CLIQUEZ ICI POUR LE PROFIL */}
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`w-10 h-10 flex-shrink-0 rounded-full border-2 transition-all active:scale-90 overflow-hidden shadow-sm
            ${activeTab === 'profile' ? 'border-[#2F4F4F] ring-2 ring-[#2F4F4F]/20' : 'border-[#778899]/20'}`}
        >
          <Avatar 
            uid={session.user.id} 
            url={profile?.avatar_url} 
            username={profile?.username}
            readonly={true} // Mode Header
            onUpload={(url) => setProfile({ ...profile, avatar_url: url })} 
          />
        </button>
      </header>

      {/* ZONE DE CONTENU */}
      <div className="flex-1 overflow-y-auto px-5 pb-36">
        
        {/* ONGLET ACTIVITÉ */}
        {activeTab === 'activity' && (
          <div className="mt-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex p-1 bg-[#778899]/10 rounded-2xl border border-[#778899]/20 shadow-inner">
              <button 
                onClick={() => setSubTab('feed')} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${subTab === 'feed' ? 'bg-[#2F4F4F] text-[#F5F5DC] shadow-md' : 'text-[#778899]'}`}
              > Journal </button>
              <button 
                onClick={() => setSubTab('ranking')} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${subTab === 'ranking' ? 'bg-[#2F4F4F] text-[#F5F5DC] shadow-md' : 'text-[#778899]'}`}
              > Ranking </button>
            </div>
            
            {subTab === 'feed' ? (
              <div className="space-y-8">
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

        {/* 2. AJOUT DU RENDU DE L'ONGLET PROFIL */}
        {activeTab === 'profile' && (
          <div className="mt-6">
            <Profile 
              profile={profile} 
              setProfile={setProfile} 
              session={session} 
            />
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