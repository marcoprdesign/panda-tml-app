"use client";
import { useState } from 'react';

export default function Calculator() {
  const [pearls, setPearls] = useState<string>('');
  const rateEur = 1.74; 
  const rateUsd = 1.88; 

  const handleInputChange = (value: string) => {
    const normalized = value.replace(',', '.');
    if (normalized === '' || /^\d*\.?\d{0,1}$/.test(normalized)) {
      setPearls(value);
    }
  };

  const numericValue = Number(pearls.replace(',', '.'));
  const amountEur = (numericValue * rateEur).toFixed(2);
  const amountUsd = (numericValue * rateUsd).toFixed(2);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#313449] px-1">Converter</h2>
      
      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-[#8089b0] uppercase tracking-[0.2em] ml-2">
          Amount in Pearls
        </label>
        <div className="relative bg-white/40 rounded-2xl border border-[#d3d6e4] overflow-hidden transition-all focus-within:border-[#313449]/40 shadow-sm backdrop-blur-sm">
          <input 
            type="text" 
            inputMode="decimal" 
            value={pearls} 
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="0,0"
            className="w-full bg-transparent p-5 text-4xl font-black text-[#313449] outline-none placeholder:text-[#313449]/10 text-center"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xl opacity-30 grayscale">
            💎
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#313449] p-4 rounded-2xl flex flex-col justify-center shadow-md">
          <span className="text-[8px] font-black text-[#f6f6f9]/50 uppercase mb-1">Euro</span>
          <span className="text-2xl font-black text-[#f6f6f9] leading-none">{amountEur}€</span>
        </div>
        <div className="bg-white/40 border border-[#d3d6e4] p-4 rounded-2xl flex flex-col justify-center shadow-sm">
          <span className="text-[8px] font-black text-[#8089b0] uppercase mb-1">Dollars</span>
          <span className="text-2xl font-black text-[#313449] leading-none">${amountUsd}</span>
        </div>
      </div>

      <div className="p-3 bg-[#ebecf3]/5 rounded-xl border border-[#d3d6e4]/30 text-center">
        <p className="text-[8px] text-[#8089b0] font-bold uppercase tracking-[0.2em]">
          Rate: 1 Pearl = 1.74€
        </p>
      </div>
    </div>
  );
}