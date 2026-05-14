"use client";
import { useState } from 'react';
import { ArrowLeft01Icon, ArrowDown01Icon } from "hugeicons-react";

export default function Calculator({ onBack }: { onBack: () => void }) {
  const [pearls, setPearls] = useState<string>('');
  const [euros, setEuros] = useState<string>('');
  const [dollars, setDollars] = useState<string>('');
  
  const rateEur = 1.74; 
  const rateUsd = 1.88; 

  // Fonction utilitaire pour nettoyer l'input
  const normalize = (val: string) => val.replace(',', '.');

  const updateFromPearls = (value: string) => {
    const clean = normalize(value);
    setPearls(value);
    if (clean === '' || isNaN(Number(clean))) {
      setEuros('');
      setDollars('');
    } else {
      const p = Number(clean);
      setEuros((p * rateEur).toFixed(2));
      setDollars((p * rateUsd).toFixed(2));
    }
  };

  const updateFromEuros = (value: string) => {
    const clean = normalize(value);
    setEuros(value);
    if (clean === '' || isNaN(Number(clean))) {
      setPearls('');
      setDollars('');
    } else {
      const e = Number(clean);
      const p = e / rateEur;
      setPearls(p.toFixed(1));
      setDollars((p * rateUsd).toFixed(2));
    }
  };

  const updateFromDollars = (value: string) => {
    const clean = normalize(value);
    setDollars(value);
    if (clean === '' || isNaN(Number(clean))) {
      setPearls('');
      setEuros('');
    } else {
      const d = Number(clean);
      const p = d / rateUsd;
      setPearls(p.toFixed(1));
      setEuros((p * rateEur).toFixed(2));
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-10">
      
      {/* HEADER STEPS */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-[#ebecf3] rounded-full text-[#313449]">
          <ArrowDown01Icon size={20} className="rotate-90" />
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#313449]">Pearls converter</h2>
      </div>

      {/* INPUT PRINCIPAL : PEARLS */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-[#8089b0] uppercase tracking-[0.2em] ml-2">
          Amount in Pearls
        </label>
        <div className="relative bg-white/40 rounded-2xl border border-[#d3d6e4] overflow-hidden transition-all focus-within:border-[#313449]/40 shadow-sm backdrop-blur-sm">
          <input 
            type="text" 
            inputMode="decimal" 
            value={pearls} 
            onChange={(e) => updateFromPearls(e.target.value)}
            placeholder="0,0"
            className="w-full bg-transparent p-5 text-4xl font-black text-[#313449] outline-none placeholder:text-[#313449]/10 text-center"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xl opacity-30 grayscale">💎</div>
        </div>
      </div>

      {/* GRILLE : EUROS & DOLLARS ÉDITABLES */}
      <div className="grid grid-cols-2 gap-2">
        {/* CASE EURO */}
        <div className="bg-[#313449] p-4 rounded-2xl flex flex-col shadow-md transition-all focus-within:ring-2 ring-[#313449]/20">
          <span className="text-[8px] font-black text-[#f6f6f9]/50 uppercase mb-1">Euro (€)</span>
          <input 
            type="text"
            inputMode="decimal"
            value={euros}
            onChange={(e) => updateFromEuros(e.target.value)}
            className="bg-transparent text-2xl font-black text-[#f6f6f9] outline-none w-full"
            placeholder="0.00"
          />
        </div>

        {/* CASE DOLLAR */}
        <div className="bg-white/40 border border-[#d3d6e4] p-4 rounded-2xl flex flex-col shadow-sm transition-all focus-within:border-[#313449]/40">
          <span className="text-[8px] font-black text-[#8089b0] uppercase mb-1">Dollars ($)</span>
          <input 
            type="text"
            inputMode="decimal"
            value={dollars}
            onChange={(e) => updateFromDollars(e.target.value)}
            className="bg-transparent text-2xl font-black text-[#313449] outline-none w-full"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* TAUX FIXE */}
      <div className="p-3 bg-[#ebecf3]/5 rounded-xl border border-[#d3d6e4]/30 text-center">
        <p className="text-[8px] text-[#8089b0] font-bold uppercase tracking-[0.2em]">
          Rate: 1 Pearl = 1.74€ / 1.88$
        </p>
      </div>

    </div>
  );
}