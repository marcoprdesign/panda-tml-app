"use client";
import { useState } from 'react';

export default function Calculator() {
  const [pearls, setPearls] = useState<string>('');
  const rateEur = 1.74; 
  const rateUsd = 1.88; 

  const amountEur = (Number(pearls) * rateEur).toFixed(2);
  const amountUsd = (Number(pearls) * rateUsd).toFixed(2);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Converter</h2>
      
      {/* Input Style "Badge" */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-[#DFFF5E] uppercase tracking-[0.2em] ml-2">Amount in Pearls</label>
        <div className="relative bg-white/5 rounded-2xl border border-white/10 overflow-hidden transition-all focus-within:border-[#DFFF5E]/50">
          <input 
            type="number" 
            inputMode="decimal"
            value={pearls} 
            onChange={(e) => setPearls(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent p-5 text-4xl font-black text-white outline-none placeholder:text-white/10 text-center"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xl opacity-30">
            💎
          </div>
        </div>
      </div>

      {/* Resultats en Grille */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#DFFF5E] p-4 rounded-2xl flex flex-col justify-center shadow-md">
          <span className="text-[8px] font-black text-black/50 uppercase mb-1">Euro</span>
          <span className="text-2xl font-black text-black leading-none">{amountEur}€</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-center">
          <span className="text-[8px] font-black text-white/30 uppercase mb-1">Dollars</span>
          <span className="text-2xl font-black text-white leading-none">${amountUsd}</span>
        </div>
      </div>

      {/* Info bulle discrète (La référence pour le style) */}
      <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
        <p className="text-[8px] text-white/30 font-bold uppercase tracking-[0.2em]">
          Rate: 1 Pearl = 1.74€
        </p>
      </div>
    </div>
  );
}