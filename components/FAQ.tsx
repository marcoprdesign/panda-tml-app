"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { Search01Icon, ArrowDown01Icon } from "hugeicons-react";

interface FAQItem {
  id: string | number;
  q: string;
  a: string;
}

export default function FAQ({ onBack }: { onBack: () => void }) {
  const [questions, setQuestions] = useState<FAQItem[]>([]);
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupération des données depuis la table Supabase
  const fetchFAQ = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faq')
        .select('id, q, a')
        // Tu peux ajouter un .order('q', { ascending: true }) si tu veux trier par ordre alphabétique
        
      if (error) throw error;
      if (data) setQuestions(data);
    } catch (err) {
      console.error("Error fetching FAQ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQ();
  }, []);

  // Filtrage avec une sécurité au cas où 'q' est indéfini
  const filteredFaq = questions.filter(item => 
    item.q?.toLowerCase().includes(search.toLowerCase())
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
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-[#d3d6e4] border-t-[#313449] rounded-full animate-spin" />
          </div>
        ) : filteredFaq.length > 0 ? (
          filteredFaq.map((item, index) => (
            <div key={item.id || index} className="bg-white rounded-[1.8rem] border border-[#d3d6e4]/50 overflow-hidden transition-all">
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
          ))
        ) : (
          <div className="py-10 text-center uppercase text-[10px] font-black text-[#8089b0] tracking-widest">
            No dumb questions found.
          </div>
        )}
      </div>
    </div>
  );
}