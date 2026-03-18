"use client";
import { useState } from 'react';

export default function Calculator() {
  const [pearls, setPearls] = useState<string>('');
  const rateEur = 1.74; 
  const rateUsd = 1.88; 

  const handleInputChange = (value: string) => {
    // 1. On autorise la virgule visuellement, mais on la traite comme un point
    const normalized = value.replace(',', '.');
    
    // 2. Regex : Autorise les chiffres, un seul point (ou virgule) 
    // et MAXIMUM un chiffre après (ex: 2.5 ou 2,5)
    if (normalized === '' || /^\d*\.?\d{0,1}$/.test(normalized)) {
      // On garde la valeur telle qu'elle a été tapée (point ou virgule)
      setPearls(value);
    }
  };

  // Pour le calcul, on s'assure que la virgule est remplacée par un point
  const numericValue = Number(pearls.replace(',', '.'));
  const amountEur = (numericValue * rateEur).toFixed(2);
  const amountUsd = (numericValue * rateUsd).toFixed(2);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#2F4F4F] px-1">Converter</h2>
      
      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-[#778899] uppercase tracking-[0.2em] ml-2">
          Amount in Pearls
        </label>
        <div className="relative bg-white/40 rounded-2xl border border-[#778899]/20 overflow-hidden transition-all focus-within:border-[#2F4F4F]/40 shadow-sm backdrop-blur-sm">
          <input 
            type="text" // Changé en text pour accepter la virgule sans erreur navigateur
            inputMode="decimal" // Force l'ouverture du clavier numérique avec séparateur
            value={pearls} 
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="0,0"
            className="w-full bg-transparent p-5 text-4xl font-black text-[#2F4F4F] outline-none placeholder:text-[#2F4F4F]/10 text-center"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xl opacity-30 grayscale">
            💎
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#2F4F4F] p-4 rounded-2xl flex flex-col justify-center shadow-md">
          <span className="text-[8px] font-black text-[#F5F5DC]/50 uppercase mb-1">Euro</span>
          <span className="text-2xl font-black text-[#F5F5DC] leading-none">{amountEur}€</span>
        </div>
        <div className="bg-white/40 border border-[#778899]/20 p-4 rounded-2xl flex flex-col justify-center shadow-sm">
          <span className="text-[8px] font-black text-[#778899] uppercase mb-1">Dollars</span>
          <span className="text-2xl font-black text-[#2F4F4F] leading-none">${amountUsd}</span>
        </div>
      </div>

      <div className="p-3 bg-[#778899]/5 rounded-xl border border-[#778899]/10 text-center">
        <p className="text-[8px] text-[#778899]/40 font-bold uppercase tracking-[0.2em]">
          Rate: 1 Pearl = 1.74€
        </p>
      </div>
    </div>
  );
}