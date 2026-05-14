"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase';
import { 
  WorkoutRunIcon, 
  Camera01Icon, 
  ArrowLeft01Icon,
  ArrowDown01Icon
} from "hugeicons-react";

export default function StepsFeature({ userProfile, onBack }: { userProfile: any, onBack: () => void }) {
  const [activeDay, setActiveDay] = useState('FRIDAY');
  const [steps, setSteps] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const fetchLeaderboard = useCallback(async () => {
    const { data, error } = await supabase
      .from('steps')
      .select(`user_id, step_count, day, profiles(username, avatar_url)`)
      .eq('day', activeDay)
      .order('step_count', { ascending: false });
    
    if (error) {
      console.error("Erreur fetch:", error.message);
    } else {
      setLeaderboard(data || []);
    }
  }, [activeDay]);

  useEffect(() => { 
    fetchLeaderboard(); 
  }, [fetchLeaderboard]);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !steps) return;
    
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.id}/${activeDay}-${Date.now()}.${fileExt}`;
      
      // 1. Upload Photo
      const { error: storageError } = await supabase.storage
        .from('steps-proof')
        .upload(fileName, file);
      
      if (storageError) throw storageError;

      // 2. Upsert Data (Sans la colonne updated_at)
      const { error: dbError } = await supabase.from('steps').upsert({
        user_id: userProfile.id,
        day: activeDay,
        step_count: parseInt(steps),
        photo_url: fileName
        // Retrait de updated_at ici
      }, { onConflict: 'user_id,day' });

      if (dbError) throw dbError;

      // 3. Reset & Refresh
      setSteps('');
      await fetchLeaderboard();
      
    } catch (err: any) { 
      console.error("Erreur complète:", err);
      alert("Erreur: " + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-10">
      

{/* HEADER FAQ */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-[#ebecf3] rounded-full text-[#313449]">
          <ArrowDown01Icon size={20} className="rotate-90" />
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#313449]">Dumb FAQ</h2>
      </div>

      

      {/* SELECTION DES JOURS */}
      <div className="space-y-3">
        <label className="text-[9px] font-black text-[#8089b0] uppercase tracking-[0.2em] ml-2">
          Select Day
        </label>
        <div className="flex bg-[#ebecf3]/50 p-1 rounded-2xl border border-[#d3d6e4]/50">
          {['FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                activeDay === day ? 'bg-[#313449] text-white shadow-lg' : 'text-[#8089b0]'
              }`}
            >
              {day.slice(0,3)}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT PRINCIPAL */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-[#8089b0] uppercase tracking-[0.2em] ml-2">
          Amount of Steps
        </label>
        <div className="relative bg-white/40 rounded-2xl border border-[#d3d6e4] overflow-hidden transition-all focus-within:border-[#313449]/40 shadow-sm backdrop-blur-sm">
          <input 
            type="text" 
            inputMode="numeric"
            value={steps} 
            onChange={(e) => setSteps(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent p-5 text-4xl font-black text-[#313449] outline-none placeholder:text-[#313449]/10 text-center"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xl opacity-30 grayscale">👟</div>
        </div>
      </div>

      {/* BOUTON UPDATE */}
      <label className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all ${
        loading || !steps ? 'bg-gray-100 text-gray-400 border border-[#d3d6e4]' : 'bg-[#313449] text-white shadow-md'
      }`}>
        <Camera01Icon size={18} /> 
        {loading ? 'Processing...' : 'Update History'}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={loading || !steps} />
      </label>

      {/* LEADERBOARD */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center px-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8089b0] italic">Daily Ranking</p>
          <button onClick={fetchLeaderboard} className="text-[8px] font-bold uppercase text-[#313449] underline decoration-dotted">Refresh</button>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  entry.user_id === userProfile.id 
                  ? 'bg-[#313449] border-[#313449] shadow-md' 
                  : 'bg-white/40 border-[#d3d6e4] shadow-sm'
                }`}
              >
                <div className={`text-[11px] font-black ${entry.user_id === userProfile.id ? 'text-white/50' : 'text-[#8089b0]'}`}>#{index + 1}</div>
                <div className="flex-1">
                  <div className={`text-[11px] font-black uppercase ${entry.user_id === userProfile.id ? 'text-white' : 'text-[#313449]'}`}>
                    {entry.profiles?.username} {entry.user_id === userProfile.id && "(You)"}
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] font-bold ${entry.user_id === userProfile.id ? 'text-white/60' : 'text-[#8089b0]'}`}>
                    <WorkoutRunIcon size={12} />
                    {entry.step_count.toLocaleString()} Pas
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[11px] font-black ${
                  entry.user_id === userProfile.id ? 'bg-white/10 text-white' : 'bg-[#ebecf3] text-[#313449]'
                }`}>
                  {Math.round(entry.step_count / 1000)}K
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-[#d3d6e4] rounded-2xl text-[9px] font-black uppercase text-[#8089b0] opacity-40">
              No entries for this day
            </div>
          )}
        </div>
      </div>

    </div>
  );
}