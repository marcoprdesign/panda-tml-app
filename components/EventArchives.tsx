"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { Archive01Icon } from "hugeicons-react";
import ArchiveModal from './ArchiveModal.tsx';

export default function EventArchives() {
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
    <div className="px-1 space-y-4">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Archive01Icon size={18} className="text-[#313449]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#313449]">
          Previous Events
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {archives.map((event) => (
          <div key={event.id} className="bg-white rounded-[2rem] border border-[#d3d6e4]/50 p-5 flex justify-between items-center shadow-sm">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase text-[#313449]">{event.name}</p>
              <p className="text-[8px] font-bold text-[#8089b0] uppercase tracking-widest">Memory Boxed</p>
            </div>
            
            <button 
              onClick={() => setSelectedEvent(event)}
              className="px-4 py-2 rounded-xl bg-[#ebecf3] text-[9px] font-black uppercase text-[#58618a] active:scale-95 transition-all"
            >
              View Feed
            </button>
          </div>
        ))}
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