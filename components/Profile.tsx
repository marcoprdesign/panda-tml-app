"use client";
import { useState } from 'react';
import { supabase } from '@/supabase';
import Avatar from './Avatar';
import Members from './Members';
import FAQ from './FAQ';
import EventArchives from './EventArchives'; 
import { 
  HelpCircleIcon, 
  UserGroupIcon, 
  PencilEdit01Icon, 
  CheckmarkCircle01Icon 
} from "hugeicons-react";

const COUNTRIES = [
  "Argentina 🇦🇷", "Belgium 🇧🇪", "Brazil 🇧🇷", "Switzerland 🇨🇭", "Costa Rica 🇨🇷", 
  "Germany 🇩🇪", "Ecuador 🇪🇨", "Spain 🇪🇸", "France 🇫🇷", "United Kingdom 🇬🇧", 
  "Mexico 🇲🇽", "The Netherlands 🇳🇱", "Norway 🇳🇴", "New-Zeland 🇳🇿", 
  "Romania 🇷🇴", "Singapore 🇸🇬", "USA 🇺🇸"
].sort();

const YEARS = Array.from({ length: 2026 - 2014 + 1 }, (_, i) => (2014 + i).toString());

export default function Profile({ profile, setProfile, session }: any) {
  const [showFAQ, setShowFAQ] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: profile?.username || '',
    country: profile?.country || '',
    joined: profile?.joined || ''
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        username: editForm.username,
        country: editForm.country,
        joined: editForm.joined
      })
      .eq('id', session.user.id);

    if (!error) {
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
    } else {
      alert(error.message);
    }
  };

  if (showFAQ) {
    return <FAQ onBack={() => setShowFAQ(false)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* 1. SECTION IDENTITÉ */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4 px-6">
        <div className="w-28 h-28 border-4 border-[#313449] rounded-full p-1 shadow-2xl relative group bg-white/50">
          <Avatar 
            uid={session.user.id} 
            url={profile?.avatar_url} 
            username={profile?.username}
            onUpload={(url: string) => setProfile({ ...profile, avatar_url: url })} 
          />
        </div>
        
        <div className="space-y-3 w-full max-w-xs">
          {!isEditing ? (
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#8089b0] uppercase tracking-[0.4em]">Welcome back</p>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#313449]">
                {profile?.username || 'Traveler'}
              </h2>
              <p className="text-[8px] font-bold text-[#8089b0] uppercase tracking-widest">
                {profile?.country || 'Nomadic'} • Joined {profile?.joined || '2014'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 animate-in zoom-in-95 duration-200">
              <input 
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                className="w-full bg-[#ebecf3] border border-[#d3d6e4] rounded-xl px-4 py-2 text-center text-sm font-black uppercase text-[#313449] outline-none"
                placeholder="NICKNAME"
              />
              <div className="flex gap-2">
                <select 
                  value={editForm.country}
                  onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                  className="flex-1 bg-[#ebecf3] border border-[#d3d6e4] rounded-xl px-2 py-2 text-[9px] font-black uppercase text-[#313449] outline-none appearance-none text-center"
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  value={editForm.joined}
                  onChange={(e) => setEditForm({...editForm, joined: e.target.value})}
                  className="w-24 bg-[#ebecf3] border border-[#d3d6e4] rounded-xl px-2 py-2 text-[9px] font-black uppercase text-[#313449] outline-none appearance-none text-center"
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSignOut}
                className="px-4 py-1.5 rounded-full border border-[#d3d6e4] bg-[#ebecf3]/50 text-[8px] font-black text-[#8089b0] uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-800 transition-all"
              >
                Logout
              </button>

              <button 
                onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-all text-[8px] font-black uppercase tracking-[0.2em] ${
                  isEditing 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'border border-[#d3d6e4] bg-[#ebecf3]/50 text-[#8089b0]'
                }`}
              >
                {isEditing ? <CheckmarkCircle01Icon size={12} /> : <PencilEdit01Icon size={12} />}
                {isEditing ? 'Save' : 'Edit Profile'}
              </button>
            </div>

            <button 
              onClick={() => setShowFAQ(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#313449] text-[#f6f6f9] shadow-lg shadow-[#313449]/20 transition-all active:scale-95 group"
            >
              <HelpCircleIcon size={16} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                Frequently Asked Questions
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-2">
        <div className="h-[1px] w-full bg-[#d3d6e4]/30" />
      </div>

      {/* 2. SECTION PANDA MEMBERS */}
      <div className="space-y-4 px-1">
        <div className="flex items-center gap-2 px-2">
          <UserGroupIcon size={18} className="text-[#313449]" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#313449]">
            PANDA MEMBERS
          </h3>
        </div>
        <Members />
      </div>

      {/* 3. SECTION ARCHIVES */}
      <div className="pt-2">
        <EventArchives />
      </div>

    </div>
  );
}