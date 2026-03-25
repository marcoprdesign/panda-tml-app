"use client";
import { useState } from 'react';
import { supabase } from '@/supabase';
import Avatar from './Avatar';
import Members from './Members';
import Messages from './Messages'; 

export default function Profile({ profile, setProfile, session }: any) {
  const [subTab, setSubTab] = useState<'me' | 'members' | 'messages'>('me');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* 1. NAVIGATION INTERNE */}
      <div className="flex p-1 bg-[#ebecf3] rounded-2xl border border-[#d3d6e4] shadow-inner sticky top-2 z-40 backdrop-blur-md">
        <button 
          onClick={() => setSubTab('me')} 
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 
            ${subTab === 'me' || subTab === 'messages' ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'text-[#8089b0]'}`}
        >
          My Profile
        </button>
        <button 
          onClick={() => setSubTab('members')} 
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 
            ${subTab === 'members' ? 'bg-[#313449] text-[#f6f6f9] shadow-md' : 'text-[#8089b0]'}`}
        >
          The Pack
        </button>
      </div>

      {/* 2. LOGIQUE D'AFFICHAGE CONDITIONNELLE */}
      {subTab === 'me' ? (
        <div className="space-y-10 animate-in fade-in duration-500">
          {/* SECTION IDENTITÉ */}
          <div className="flex flex-col items-center text-center space-y-4 pt-4">
            <div className="w-28 h-28 border-4 border-[#313449] rounded-full p-1 shadow-2xl relative group bg-white/50">
              <Avatar 
                uid={session.user.id} 
                url={profile?.avatar_url} 
                username={profile?.username}
                onUpload={(url: string) => setProfile({ ...profile, avatar_url: url })} 
              />
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#8089b0] uppercase tracking-[0.4em]">Welcome back</p>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#313449]">
                {profile?.username || 'Traveler'}
              </h2>
            </div>
          </div>

          {/* MENU ACTIONS */}
          <div className="space-y-3">
            <button 
              onClick={() => setSubTab('messages')}
              className="w-full bg-white/40 border border-[#d3d6e4] p-5 rounded-[2rem] flex items-center justify-between group active:scale-[0.98] transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="text-xl">✉️</span>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#313449]">Sacred Messages</span>
              </div>
              <span className="text-[#313449]/30 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button className="w-full bg-white/40 border border-[#d3d6e4] p-5 rounded-[2rem] flex items-center justify-between group active:scale-[0.98] transition-all shadow-sm opacity-50">
              <div className="flex items-center gap-4">
                <span className="text-xl">🔔</span>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#313449]">Alerts Log</span>
              </div>
              <div className="bg-[#313449] text-[#f6f6f9] text-[8px] px-2 py-0.5 rounded-full font-black">2</div>
            </button>
          </div>

          {/* DÉCONNEXION */}
          <div className="pt-10 flex flex-col items-center gap-6">
            <button 
              onClick={handleSignOut}
              className="text-[10px] font-black text-[#8089b0]/60 uppercase tracking-[0.3em] border-b border-[#d3d6e4] pb-1 hover:text-red-800 transition-colors"
            >
              Leave the Archive
            </button>
          </div>
        </div>
      ) : subTab === 'messages' ? (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <button 
            onClick={() => setSubTab('me')} 
            className="text-[9px] font-black uppercase tracking-widest text-[#313449] flex items-center gap-2 px-2"
          >
            ← Back to Profile
          </button>
          <Messages session={session} />
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <Members />
        </div>
      )}
    </div>
  );
}