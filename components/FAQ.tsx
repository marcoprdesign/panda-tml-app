"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { Search01Icon, ArrowDown01Icon } from "hugeicons-react";
import ReactMarkdown from 'react-markdown';

const CATEGORIES_ORDER = [
  "BEFORE THE FESTIVAL",
  "BRUSSELS",
  "TRANSPORT",
  "FRIENDSHIP GARDEN",
  "BBQ",
  "FOOD OPTIONS",
  "PANDA MADNESS",
  "GENERAL"
];

interface FAQItem {
  id: string | number;
  q: string;
  a: string;
  category: string;
  image_url?: string;
}

export default function FAQ({ onBack }: { onBack: () => void }) {
  const [questions, setQuestions] = useState<FAQItem[]>([]);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFAQ = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faq')
        .select('id, q, a, category, image_url');
        
      if (error) throw error;
      if (data) setQuestions(data as FAQItem[]);
    } catch (err) {
      console.error("Error fetching FAQ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQ();
  }, []);

  const filteredFaq = questions.filter(item => 
    item.q?.toLowerCase().includes(search.toLowerCase()) ||
    item.a?.toLowerCase().includes(search.toLowerCase())
  );

  const groupByCategories = () => {
    const groups: { [key: string]: FAQItem[] } = {};
    
    CATEGORIES_ORDER.forEach(cat => {
      groups[cat] = [];
    });

    filteredFaq.forEach(item => {
      const cat = item.category?.toUpperCase() || "GENERAL";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });

    return groups;
  };

  const faqGroups = groupByCategories();
  const isSearching = search.trim() !== "";

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
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-[#d3d6e4] border-t-[#313449] rounded-full animate-spin" />
          </div>
        ) : filteredFaq.length > 0 ? (
          isSearching ? (
            <div className="space-y-4">
              {filteredFaq.map((item) => (
                <FAQRow key={item.id} item={item} openId={openId} setOpenId={setOpenId} />
              ))}
            </div>
          ) : (
            Object.keys(faqGroups).map((category) => {
              if (faqGroups[category].length === 0) return null;
              return (
                <div key={category} className="space-y-3">
                  <h3 className="text-[10px] font-black tracking-[0.2em] text-[#8089b0] uppercase pl-2">
                    {category}
                  </h3>
                  <div className="space-y-4">
                    {faqGroups[category].map((item) => (
                      <FAQRow key={item.id} item={item} openId={openId} setOpenId={setOpenId} />
                    ))}
                  </div>
                </div>
              );
            })
          )
        ) : (
          <div className="py-10 text-center uppercase text-[10px] font-black text-[#8089b0] tracking-widest">
            No dumb questions found.
          </div>
        )}
      </div>
    </div>
  );
}

function FAQRow({ item, openId, setOpenId }: { item: FAQItem, openId: string | number | null, setOpenId: (id: string | number | null) => void }) {
  const isOpen = openId === item.id;

  return (
    <div className="bg-white rounded-[1.8rem] border border-[#d3d6e4]/50 overflow-hidden transition-all shadow-sm">
      <button 
        onClick={() => setOpenId(isOpen ? null : item.id)}
        className="w-full p-5 flex justify-between items-center text-left"
      >
        <span className="text-[11px] font-black uppercase tracking-wide text-[#313449] leading-tight pr-4">
          {item.q}
        </span>
        <ArrowDown01Icon 
          size={16} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="px-5 pb-5 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          
          {/* RENDU DE LA REPONSE EN MARKDOWN (Gère paragraphes, liens, sauts de ligne) */}
          <div className="text-[12px] text-[#58618a] leading-relaxed font-medium faq-markdown-content">
            <ReactMarkdown
              components={{
                // Style personnalisé pour les paragraphes (crée de vrais blocs espacés)
                p: ({ children }) => <p className="mb-3 last:mb-0 whitespace-pre-line">{children}</p>,
                // Style personnalisé pour les liens hypertexte
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#313449] font-black underline decoration-[#8089b0] hover:text-[#58618a] transition-colors"
                  >
                    {children}
                  </a>
                ),
                // Style pour les listes à puces au cas où
                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-3">{children}</ul>,
                li: ({ children }) => <li>{children}</li>
              }}
            >
              {item.a}
            </ReactMarkdown>
          </div>

          {item.image_url && (
            <div className="w-full overflow-hidden rounded-2xl border border-[#d3d6e4]/30 bg-neutral-50 mt-2">
              <img 
                src={item.image_url} 
                alt={item.q} 
                className="w-full h-auto max-h-[250px] object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}