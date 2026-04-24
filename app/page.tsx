"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/supabase';
import Auth from '@/components/Auth';
import Calculator from '@/components/Calculator';
import Avatar from '@/components/Avatar';
import PostDrink from '@/components/PostDrink';
import DrinkFeed from '@/components/DrinkFeed';
import Leaderboard from '@/components/Leaderboard';
import FlunkyBall from '@/components/FlunkyBall';
import Schedule from '@/components/Schedule'; 
import Profile from '@/components/Profile';

// AJOUT DES ICÔNES POUR LE SWITCH
import { 
  DashboardSquare01Icon, 
  FileValidationIcon, 
  FootballIcon, 
  MoneyBag02Icon,
  StarsIcon,      // Ajouté
  ChampionIcon    // Ajouté
} from "hugeicons-react";

import { DotLottiePlayer } from '@dotlottie/react-player';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('activity'); 
  const [subTab, setSubTab] = useState('feed');
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

  const menuItems = [
    { id: 'activity', icon: DashboardSquare01Icon, label: 'Feed' },
    { id: 'schedule', icon: FileValidationIcon, label: 'Lineup' },
    { id: 'flunky', icon: FootballIcon, label: 'Game' },
    { id: 'calc', icon: MoneyBag02Icon, label: 'Pearls' }
  ];

  return (
    <main className="min-h-screen bg-[#f6f6f9] text-[#313449] flex flex-col font-sans antialiased">
      
      {/* HEADER STICKY */}
      <header className="px-6 py-4 flex justify-between items-center bg-[#f6f6f9]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#d3d6e4]/50">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center -ml-2 overflow-hidden">
            <DotLottiePlayer
              lottieRef={lottieRef}
              src="https://lottie.host/0b50c70e-cb24-4365-9907-e193a4e41bdc/ECZWMXdVNQ.lottie"
              autoplay
              loop={false} 
              onEvent={(event) => {
                if (event === 'complete') {
                  setTimeout(() => {
                    lottieRef.current?.seek(0);
                    lottieRef.current?.play();
                  }, 8000);
                }
              }}
              style={{ width: '100%', height: '100%' }}
            />
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

      {/* ZONE DE CONTENU */}
      <div className="flex-1 overflow-y-auto px-5 pb-40">
        {activeTab === 'activity' && (
          <div className="mt-6 space-y-8 animate-in fade-in duration-500">
            
            {/* SWITCH HARMONISÉ (Journal / Ranking) */}
            <div className="flex bg-[#ebecf3] p-1 rounded-2xl border border-[#d3d6e4]/30 shadow-inner">
              <button 
                onClick={() => setSubTab('feed')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
                  subTab === 'feed' 
                    ? 'bg-[#313449] text-white shadow-lg' 
                    : 'text-[#8089b0]'
                }`}
              >
                <StarsIcon size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Journal</span>
              </button>
              <button 
                onClick={() => setSubTab('ranking')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
                  subTab === 'ranking' 
                    ? 'bg-[#313449] text-white shadow-lg' 
                    : 'text-[#8089b0]'
                }`}
              >
                <ChampionIcon size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Ranking</span>
              </button>
            </div>

            {subTab === 'feed' ? (
              <div className="flex flex-col">
                <PostDrink userProfile={profile} />
                <div className="py-8 px-4"></div>
                <div className="-mt-6"> 
                  <DrinkFeed />
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <Leaderboard />
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="mt-6 animate-in slide-in-from-right-4 duration-500">
            <Profile profile={profile} setProfile={setProfile} session={session} />
          </div>
        )}
        
        {activeTab === 'schedule' && <div className="mt-6 animate-in fade-in duration-500"><Schedule /></div>}
        {activeTab === 'flunky' && <div className="mt-6 animate-in fade-in duration-500"><FlunkyBall /></div>}
        {activeTab === 'calc' && <div className="mt-6 animate-in fade-in duration-500"><Calculator /></div>}
      </div>

      {/* BOTTOM NAV BAR */}
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
                strokeWidth={isActive ? 2 : 1.5}
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