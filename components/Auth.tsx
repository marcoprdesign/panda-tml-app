"use client";
import { useState } from 'react';
import { supabase } from '@/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [secretKey, setSecretKey] = useState(''); 
  const [isRegister, setIsRegister] = useState(false);

  const REQUIRED_KEY = "KdbYZ827p_mq75";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isRegister) {
      if (secretKey !== REQUIRED_KEY) {
        alert("❌ INVALID SECRET KEY. ACCESS DENIED.");
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: username } }
      });

      if (signUpError) {
        alert(signUpError.message);
      } else if (data.user) {
        await supabase.from('profiles').insert([
          { id: data.user.id, username: username, avatar_url: null }
        ]);
        alert('Archive created! Please verify your email.');
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
        <h1 className="text-4xl font-black italic tracking-tighter text-[#2F4F4F] uppercase leading-none drop-shadow-sm">
          PANDAS <br/> ARCHIVE
        </h1>
        <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-[#2F4F4F]/10"></div>
            <p className="text-[10px] font-black text-[#778899] uppercase tracking-[0.4em]">
              {isRegister ? 'Join the legacy' : 'Access the hub'}
            </p>
            <div className="h-[1px] w-8 bg-[#2F4F4F]/10"></div>
        </div>
      </div>

      <form onSubmit={handleAuth} className="space-y-5">
        <div className="space-y-3">
          {/* 1. NICKNAME (Register only) */}
          {isRegister && (
            <div className="relative animate-in zoom-in-95 duration-500">
              <input
                type="text"
                placeholder="YOUR NICKNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/40 border border-[#2F4F4F]/20 rounded-2xl p-5 text-[11px] font-black text-[#2F4F4F] outline-none focus:border-[#2F4F4F] transition-all placeholder:text-[#778899]/30 uppercase tracking-widest shadow-sm"
                required={isRegister}
              />
            </div>
          )}

          {/* 2. EMAIL */}
          <div className="relative group">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/40 border border-[#778899]/10 rounded-2xl p-5 text-[11px] font-black text-[#2F4F4F] outline-none focus:border-[#2F4F4F]/40 transition-all placeholder:text-[#778899]/30 uppercase tracking-widest shadow-sm"
              required
            />
          </div>
          
          {/* 3. PASSWORD */}
          <div className="relative group">
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/40 border border-[#778899]/10 rounded-2xl p-5 text-[11px] font-black text-[#2F4F4F] outline-none focus:border-[#2F4F4F]/40 transition-all placeholder:text-[#778899]/30 uppercase tracking-widest shadow-sm"
              required
            />
          </div>

          {/* 4. SECRET KEY (Register only - Last field) */}
          {isRegister && (
            <div className="relative animate-in slide-in-from-top-2 duration-500">
              <input
                type="text"
                placeholder="SECRET ACCESS KEY"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full bg-[#2F4F4F]/5 border-2 border-[#2F4F4F]/30 rounded-2xl p-5 text-[11px] font-black text-[#2F4F4F] outline-none focus:border-[#2F4F4F] transition-all placeholder:text-[#2F4F4F]/20 uppercase tracking-[0.3em] shadow-inner"
                required={isRegister}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 rounded-[2rem] bg-[#2F4F4F] text-[#F5F5DC] font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-[#2F4F4F]/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Consulting...' : isRegister ? 'Create Archive' : 'Identify'}
        </button>
      </form>

      {/* SWITCHER */}
      <div className="text-center">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-[9px] font-black text-[#778899] uppercase tracking-[0.2em] hover:text-[#2F4F4F] transition-colors border-b border-[#778899]/20 pb-1"
        >
          {isRegister ? 'Already in? Log in' : 'No account? Register here'}
        </button>
      </div>

      {/* FOOTER */}
      <div className="pt-12 flex items-center justify-center opacity-30">
        <div className="w-8 h-[1px] bg-[#2F4F4F]"></div>
        <div className="mx-4 text-[9px] text-[#2F4F4F] font-black italic tracking-[0.5em]">MMXXVI</div>
        <div className="w-8 h-[1px] bg-[#2F4F4F]"></div>
      </div>
    </div>
  );
}