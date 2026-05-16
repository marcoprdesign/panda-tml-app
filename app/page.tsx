"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/supabase';
import Auth from '@/components/Auth';
import Avatar from '@/components/Avatar';
import PostDrink from '@/components/PostDrink';
import DrinkFeed from '@/components/DrinkFeed';
import Leaderboard from '@/components/Leaderboard';
import FlunkyBall from '@/components/FlunkyBall';
import Schedule from '@/components/Schedule'; 
import Profile from '@/components/Profile';
import { 
  DashboardSquare01Icon, 
  FileValidationIcon, 
  FootballIcon, 
  StarsIcon,      
  ChampionIcon,
  DrinkIcon,
  Cancel01Icon // Pour fermer la sheet
} from "hugeicons-react";

import { DotLottiePlayer } from '@dotlottie/react-player';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('activity'); 
  const [subTab, setSubTab] = useState('feed');
  const [isSheetOpen, setIsSheetOpen] = useState(false); // État de la Bottom Sheet
  const [loading, setLoading] = useState(true);
  const lottieRef = useRef<any>(null);

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

  if (loading) return <div className="min-h-screen bg-[#f6f6f9] flex items-center justify-center text-[#313449] font-black italic tracking-[0.3em] uppercase text-[10px]">LOADING...</div>;
  if (!session) return <main className="min-h-screen bg-[#f6f6f9] p-6 flex flex-col justify-center"><Auth /></main>;

  const menuItems = [
    { id: 'activity', icon: DashboardSquare01Icon, label: 'Feed' },
    { id: 'schedule', icon: FileValidationIcon, label: 'Lineup' },
    { id: 'flunky', icon: FootballIcon, label: 'Game' },
  ];

  return (
    <main className="min-h-screen bg-[#f6f6f9] text-[#313449] flex flex-col font-sans antialiased relative">
      
      {/* HEADER */}
      <header className="px-6 py-4 flex justify-between items-center bg-[#f6f6f9]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#d3d6e4]/50">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-14 h-14 -ml-2 overflow-hidden">
            <DotLottiePlayer lottieRef={lottieRef} src="https://lottie.host/0b50c70e-cb24-4365-9907-e193a4e41bdc/ECZWMXdVNQ.lottie" autoplay loop={false} style={{ width: '100%', height: '100%' }} />
          </div>
          <h1 className="text-lg font-black italic uppercase tracking-tighter">PANDAS OF <br/> TOMORROWLAND</h1>
        </div>
        <button onClick={() => setActiveTab('profile')} className={`w-10 h-10 rounded-full border-2 overflow-hidden ${activeTab === 'profile' ? 'border-[#313449] ring-4 ring-[#313449]/10' : 'border-[#d3d6e4]'}`}>
          <Avatar uid={session.user.id} url={profile?.avatar_url} username={profile?.username} readonly={true} />
        </button>
      </header>

      {/* ZONE DE CONTENU */}
      <div className="flex-1 overflow-y-auto px-5 pb-40">
        {activeTab === 'activity' && (
          <div className="mt-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex bg-[#ebecf3] p-1 rounded-2xl border border-[#d3d6e4]/30">
              <button onClick={() => setSubTab('feed')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${subTab === 'feed' ? 'bg-[#313449] text-white shadow-lg' : 'text-[#8089b0]'}`}><StarsIcon size={14} /><span className="text-[9px] font-black uppercase tracking-widest">Journal</span></button>
              <button onClick={() => setSubTab('ranking')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${subTab === 'ranking' ? 'bg-[#313449] text-white shadow-lg' : 'text-[#8089b0]'}`}><ChampionIcon size={14} /><span className="text-[9px] font-black uppercase tracking-widest">Ranking</span></button>
            </div>
            {subTab === 'feed' ? <div className="flex flex-col"><div className="py-2"></div><DrinkFeed /></div> : <Leaderboard />}
          </div>
        )}
        {activeTab === 'profile' && <div className="mt-6 animate-in slide-in-from-right-4 duration-500"><Profile profile={profile} setProfile={setProfile} session={session} setActiveTab={setActiveTab} /></div>}
        {activeTab === 'schedule' && <div className="mt-6 animate-in fade-in duration-500"><Schedule /></div>}
        {activeTab === 'flunky' && <div className="mt-6 animate-in fade-in duration-500"><FlunkyBall /></div>}
      </div>

             {/* --- BOTTOM SHEET OVERLAY --- */}
      {isSheetOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] animate-in fade-in duration-700 ease-out"
          onClick={() => setIsSheetOpen(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-[#f6f6f9] rounded-t-[3rem] p-6 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] z-[70] 
                       animate-in slide-in-from-bottom-full duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle visuel style iOS */}
            <div className="w-12 h-1.5 bg-[#d3d6e4] rounded-full mx-auto mb-8 mt-1" />
            
            {/* Bouton de fermeture discret */}
            <div className="absolute top-8 right-8">
              <button 
                onClick={() => setIsSheetOpen(false)}
                className="p-2.5 bg-[#ebecf3] rounded-full text-[#8089b0] active:scale-90 transition-all hover:bg-[#d3d6e4]"
              >
                <Cancel01Icon size={18} />
              </button>
            </div>
            
            {/* Contenu avec un léger délai d'apparition pour plus de finesse */}
            <div className="animate-in fade-in duration-1000 delay-200">
              <PostDrink userProfile={profile} onPost={() => setIsSheetOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV BAR */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-[#202231]/95 backdrop-blur-xl border border-white/10 p-2 rounded-[2.8rem] flex justify-between items-center shadow-2xl z-50">
        {menuItems.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-[2.2rem] transition-all ${activeTab === tab.id ? 'bg-[#f6f6f9] shadow-lg text-[#202231]' : 'text-white/50'}`}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
            <span className="text-[7px] font-[1000] uppercase tracking-[0.15em]">{tab.label}</span>
          </button>
        ))}
        
        {/* BOUTON ADD DRINK STATIQUE DANS LA NAV */}
        <button 
          onClick={() => setIsSheetOpen(true)} 
          className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-[2.2rem] transition-all text-white/50 active:scale-95"
        >
          <DrinkIcon size={22} strokeWidth={1.5} />
          <span className="text-[7px] font-[1000] uppercase tracking-[0.15em]">Add Drink</span>
        </button>
      </nav>
    </main>
  );
}