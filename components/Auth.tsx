"use client";
import { useState } from 'react';
import { supabase } from '@/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Nouvel état pour le surnom
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isRegister) {
      // 1. Inscription Auth
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: username, // On stocke aussi dans les metadata auth
          }
        }
      });

      if (signUpError) {
        alert(signUpError.message);
      } else if (data.user) {
        // 2. Création du profil avec le surnom
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { id: data.user.id, username: username, avatar_url: null }
          ]);
        
        if (profileError) console.error("Profile error:", profileError.message);
        alert('Compte créé ! Vérifie tes emails pour confirmer.');
      }
    } else {
      // Connexion classique
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
          PANDAS OF TOMORROWLAND
        </h1>
        <p className="text-[10px] font-bold text-[#DFFF5E] uppercase tracking-[0.3em]">
          {isRegister ? 'Join the crew' : 'Welcome back raver'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-3">
          {/* CHAMP SURNOM : Apparaît uniquement si isRegister est vrai */}
          {isRegister && (
            <div className="relative animate-in zoom-in-95 duration-300">
              <input
                type="text"
                placeholder="YOUR NICKNAME (EX: DJ POTTER)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#141417] border border-[#DFFF5E]/30 rounded-2xl p-4 text-xs font-bold text-[#DFFF5E] outline-none focus:border-[#DFFF5E] transition-all placeholder:text-[#DFFF5E]/20"
                required={isRegister}
              />
            </div>
          )}

          <div className="relative group">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#141417] border border-white/5 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-[#DFFF5E]/50 transition-all placeholder:text-white/10"
              required
            />
          </div>
          <div className="relative group">
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#141417] border border-white/5 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-[#DFFF5E]/50 transition-all placeholder:text-white/10"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#DFFF5E] text-black font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(223,255,94,0.1)] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'WAITING...' : isRegister ? 'CREATE ACCOUNT' : 'ENTER HUB'}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] hover:text-[#DFFF5E] transition-colors"
        >
          {isRegister ? 'Already in? Log in' : 'No account? Register here'}
        </button>
      </div>

      <div className="pt-8 flex justify-center opacity-10">
        <div className="w-12 h-[1px] bg-white"></div>
        <div className="mx-4 text-[10px] text-white font-black italic tracking-widest">2026</div>
        <div className="w-12 h-[1px] bg-white"></div>
      </div>
    </div>
  );
}