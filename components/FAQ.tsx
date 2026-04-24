"use client";
import { useState } from 'react';
import { Search01Icon, ArrowDown01Icon } from "hugeicons-react";

const DUMB_QUESTIONS = [
  { q: "Is water wet at Tomorrowland?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ut convallis léo." },
  { q: "Can I pay with real pandas?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit." },
  { q: "Where is the 'Secret Stage' everyone talks about?", a: "Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { q: "How many beers is too many beers?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam." }
];

export default function FAQ({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaq = DUMB_QUESTIONS.filter(item => 
    item.q.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in slide-in-from-right-10 duration-500">
      {/* HEADER FAQ */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-[#ebecf3] rounded-full text-[#313449]">
          <ArrowDown01Icon size={20} className="rotate-90" />
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#313449]">Dumb FAQ</h2>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-8">
        <Search01Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8089b0]" size={18} />
        <input 
          type="text"
          placeholder="SEARCH A DUMB QUESTION..."
          className="w-full bg-[#ebecf3] border-none rounded-[1.5rem] py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest text-[#313449] placeholder:text-[#8089b0]/50 focus:ring-2 ring-[#313449]/10 outline-none"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LISTE DES QUESTIONS */}
      <div className="space-y-4">
        {filteredFaq.map((item, index) => (
          <div key={index} className="bg-white rounded-[1.8rem] border border-[#d3d6e4]/50 overflow-hidden transition-all">
            <button 
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-5 flex justify-between items-center text-left"
            >
              <span className="text-[11px] font-black uppercase tracking-wide text-[#313449] leading-tight pr-4">
                {item.q}
              </span>
              <ArrowDown01Icon 
                size={16} 
                className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {openIndex === index && (
              <div className="px-5 pb-5 animate-in fade-in zoom-in-95 duration-300">
                <p className="text-[12px] text-[#58618a] leading-relaxed font-medium">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}