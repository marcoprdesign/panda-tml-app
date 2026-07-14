"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { Archive01Icon, ArrowDown01Icon } from "hugeicons-react";
import ArchiveModal from './ArchiveModal';

interface EventArchivesProps {
  onBack?: () => void;
}

export default function EventArchives({ onBack }: EventArchivesProps) {
  const [archives, setArchives] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    async function fetchArchives() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });
      if (data) setArchives(data);
    }
    fetchArchives();
  }, []);

  if (archives.length === 0) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-10">
      
      {/* HEADER ARCHIVES (Calqué sur Steps) */}
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <button onClick={onBack} className="p-2 bg-[#ebecf3] rounded-full text-[#313449]">
            <ArrowDown01Icon size={20} className="rotate-90" />
          </button>
        )}
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#313449]">
          Previous Events
        </h2>
      </div>

      {/* LISTE DES ARCHIVES */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center px-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8089b0] italic">
            Memory Vault
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {archives.map((event) => (
            <div 
              key={event.id} 
              className="flex items-center gap-4 p-4 rounded-2xl border bg-white/40 border-[#d3d6e4] shadow-sm"
            >
              <div className="text-[11px] font-black text-[#8089b0] opacity-40">
                <Archive01Icon size={16} />
              </div>
              
              <div className="flex-1">
                <div className="text-[11px] font-black uppercase text-[#313449]">
                  {event.name}
                </div>
                <div className="text-[8px] font-bold text-[#8089b0] uppercase tracking-widest">
                  Memory Boxed
                </div>
              </div>

              <button 
                onClick={() => setSelectedEvent(event)}
                className="px-4 py-2 rounded-xl bg-[#ebecf3] text-[9px] font-black uppercase text-[#313449] active:scale-95 transition-all"
              >
                View Feed
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedEvent && (
        <ArchiveModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
}