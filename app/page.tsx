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
import Profile from '@/components/Profile';

// 1. IMPORT DES ICÔNES STROKE UNIQUEMENT (Le plus léger/clean)
import { 
  DashboardSquare01Icon, 
  FileValidationIcon, 
  FootballIcon, 
  MoneyBag02Icon 
} from "hugeicons-react";

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
    <div className="min-h-screen bg-[#f6f6f9] flex items-center justify-center text-[#313449] font-black italic tracking-[0.3em] animate-pulse uppercase text-[10px]">
      LOADING THE SCROLL...
    </div>
  );

  if (!session) return (
    <main className="min-h-screen bg-[#f6f6f9] p-6 flex flex-col justify-center">
      <Auth />
    </main>
  );

  // CONFIGURATION SIMPLE
  const menuItems = [
    { id: 'activity', icon: DashboardSquare01Icon, label: 'Feed' },
    { id: 'schedule', icon: FileValidationIcon, label: 'Lineup' },
    { id: 'flunky', icon: FootballIcon, label: 'Game' },
    { id: 'calc', icon: MoneyBag02Icon, label: 'Pearls' }
  ];

  return (
    <main className="min-h-screen bg-[#f6f6f9] text-[#313449] flex flex-col font-sans antialiased">
      
      {/* HEADER */}
      <header className="px-6 py-6 flex justify-between items-center bg-[#f6f6f9]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#d3d6e4]/50">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#313449]/5 rounded-xl border border-[#313449]/10 text-xl shadow-inner">
            🐼
          </div>
          <div className="flex flex-col text-left min-w-0">
            <h1 className="text-lg font-black italic tracking-tighter uppercase leading-[0.9] text-[#313449] break-words">
              PANDAS OF <br className="xs:hidden" /> TOMORROWLAND
            </h1>
          </div>
        </div>
        
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`w-10 h-10 flex-shrink-0 rounded-full border-2 transition-all active:scale-90 overflow-hidden shadow-sm
            ${activeTab === 'profile' ? 'border-[#313449] ring-4 ring-[#313449]/10' : 'border-[#d3d6e4]'}`}
        >
          <Avatar 
            uid={session.user.id} 
            url={profile?.avatar_url} 
            username={profile?.username}
            readonly={true}
          />
        </button>
      </header>

      {/* CONTENU */}
      <div className="flex-1 overflow-y-auto px-5 pb-40">
        {activeTab === 'activity' && (
          <div className="mt-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex p-1 bg-[#ebecf3] rounded-2xl border border-[#d3d6e4] shadow-inner">
              <button onClick={() => setSubTab('feed')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${subTab === 'feed' ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'text-[#8089b0]'}`}> Journal </button>
              <button onClick={() => setSubTab('ranking')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${subTab === 'ranking' ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'text-[#8089b0]'}`}> Ranking </button>
            </div>
            {subTab === 'feed' ? <div className="space-y-8"><PostDrink userProfile={profile} /><DrinkFeed /></div> : <div className="space-y-10"><Leaderboard /><DrinkCharts /></div>}
          </div>
        )}
        {activeTab === 'profile' && <div className="mt-6 animate-in slide-in-from-right-4 duration-500"><Profile profile={profile} setProfile={setProfile} session={session} /></div>}
        {activeTab === 'schedule' && <div className="mt-6 animate-in fade-in duration-500"><Schedule /></div>}
        {activeTab === 'flunky' && <div className="mt-6 animate-in fade-in duration-500"><FlunkyBall /></div>}
        {activeTab === 'calc' && <div className="mt-6 animate-in fade-in duration-500"><Calculator /></div>}
      </div>

      {/* BOTTOM NAV - STROKE ONLY VERSION */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-[#202231]/95 backdrop-blur-xl border border-white/10 p-2 rounded-[2.8rem] flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-50">
        {menuItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`relative flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-[2.2rem] transition-all duration-300 active:scale-95
                ${isActive ? 'bg-[#f6f6f9] shadow-lg' : 'text-white/20'}`}
            >
              <Icon
                size={22}
                color={isActive ? "#202231" : "currentColor"}
                strokeWidth={isActive ? 2 : 1.5} // On augmente légèrement pour l'actif
                className="transition-all duration-300"
              />
              <span className={`text-[7px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${isActive ? 'text-[#202231]' : 'text-white/20'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </main>
  );
}