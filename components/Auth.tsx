"use client";
import { useState } from 'react';
import { supabase } from '@/supabase';

const COUNTRIES = [
  "Argentina 🇦🇷", "Belgium 🇧🇪", "Brazil 🇧🇷", "Switzerland 🇨🇭", "Costa Rica 🇨🇷", 
  "Germany 🇩🇪", "Ecuador 🇪🇨", "Spain 🇪🇸", "France 🇫🇷", "United Kingdom 🇬🇧", 
  "Mexico 🇲🇽", "The Netherlands 🇳🇱", "Norway 🇳🇴", "New-Zeland 🇳🇿", 
  "Romania 🇷🇴", "Singapore 🇸🇬", "USA 🇺🇸"
].sort();

const YEARS = Array.from({ length: 2026 - 2015 + 1 }, (_, i) => (2015 + i).toString());

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [joined, setJoined] = useState('');
  const [secretKey, setSecretKey] = useState(''); 
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isRegister) {
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: username } }
      });

      if (signUpError) {
        alert(signUpError.message);
      } else if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: data.user.id, 
            username: username, 
            country: country,
            joined: joined,
            avatar_url: null 
          });

        if (profileError) {
          alert("Erreur profil: " + profileError.message);
        } else {
          alert('Archive created! Please verify your email.');
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 py-10 px-4">
      {/* HEADER */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black italic tracking-tighter text-[#313449] uppercase leading-none">
          PANDAS <br/> ARCHIVE
        </h1>
        <p className="text-[10px] font-black text-[#8089b0] uppercase tracking-[0.4em]">
          {isRegister ? 'Join the legacy' : 'Access the hub'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-3">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="YOUR NICKNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/40 border border-[#313449]/20 rounded-2xl p-5 text-[11px] font-black text-[#313449] outline-none placeholder:text-[#8089b0]/30 uppercase tracking-widest shadow-sm"
                required
              />

              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white/40 border border-[#313449]/10 rounded-2xl p-5 text-[11px] font-black text-[#313449] outline-none uppercase tracking-widest shadow-sm appearance-none"
                required
              >
                <option value="" disabled>SELECT COUNTRY</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={joined}
                onChange={(e) => setJoined(e.target.value)}
                className="w-full bg-white/40 border border-[#313449]/10 rounded-2xl p-5 text-[11px] font-black text-[#313449] outline-none uppercase tracking-widest shadow-sm appearance-none"
                required
              >
                <option value="" disabled>JOINED SINCE</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/40 border border-[#8089b0]/10 rounded-2xl p-5 text-[11px] font-black text-[#313449] outline-none placeholder:text-[#8089b0]/30 uppercase tracking-widest shadow-sm"
            required
          />
          
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/40 border border-[#8089b0]/10 rounded-2xl p-5 text-[11px] font-black text-[#313449] outline-none placeholder:text-[#8089b0]/30 uppercase tracking-widest shadow-sm"
            required
          />

          {isRegister && (
            <input
              type="text"
              placeholder="SECRET ACCESS KEY (OPTIONAL)"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full bg-[#313449]/5 border-2 border-[#313449]/30 rounded-2xl p-5 text-[11px] font-black text-[#313449] outline-none placeholder:text-[#313449]/20 uppercase tracking-[0.3em] shadow-inner"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 rounded-[2rem] bg-[#313449] text-[#f6f6f9] font-black uppercase tracking-[0.3em] text-[10px] shadow-xl disabled:opacity-50 transition-all"
        >
          {loading ? 'Consulting...' : isRegister ? 'Create Archive' : 'Identify'}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-[9px] font-black text-[#8089b0] uppercase tracking-[0.2em] border-b border-[#8089b0]/20 pb-1"
        >
          {isRegister ? 'Already in? Log in' : 'No account? Register here'}
        </button>
      </div>
    </div>
  );
}