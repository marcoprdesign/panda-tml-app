"use client";
import { supabase } from '@/supabase';
import Avatar from './Avatar';
import Members from './Members';

export default function Profile({ profile, setProfile, session }: any) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* 1. SECTION IDENTITÉ */}
      <div className="flex flex-col items-center text-center space-y-4 pt-8">
        <div className="w-28 h-28 border-4 border-[#313449] rounded-full p-1 shadow-2xl relative group bg-white/50">
          <Avatar 
            uid={session.user.id} 
            url={profile?.avatar_url} 
            username={profile?.username}
            onUpload={(url: string) => setProfile({ ...profile, avatar_url: url })} 
          />
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#8089b0] uppercase tracking-[0.4em]">Welcome back</p>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#313449]">
              {profile?.username || 'Traveler'}
            </h2>
          </div>

          {/* BOUTON LOGOUT EN PILL */}
          <button 
            onClick={handleSignOut}
            className="inline-block px-4 py-1.5 rounded-full border border-[#d3d6e4] bg-[#ebecf3]/50 text-[8px] font-black text-[#8089b0] uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-800 hover:border-red-200 transition-all active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>

      {/* SÉPARATEUR DISCRET */}
      <div className="px-6">
        <div className="h-[1px] w-full bg-[#d3d6e4]/30" />
      </div>

      {/* 2. SECTION THE PACK */}
      <div className="animate-in fade-in duration-1000 delay-200">
        <Members />
      </div>

    </div>
  );
}