"use client";
import { useState } from 'react';
import { ArrowLeft01Icon, StarsIcon, ChampionIcon } from "hugeicons-react";
import DrinkFeed from './DrinkFeed';
import Leaderboard from './Leaderboard';

interface ArchiveModalProps {
  event: any;
  onClose: () => void;
}

export default function ArchiveModal({ event, onClose }: ArchiveModalProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'ranking'>('journal');

  return (
    <div className="fixed inset-0 z-[100] bg-[#f6f6f9] overflow-y-auto animate-in slide-in-from-right duration-500">
      
      {/* HEADER FIXE */}
      <div className="sticky top-0 z-10 bg-[#f6f6f9]/80 backdrop-blur-xl border-b border-[#d3d6e4]/30 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onClose} className="p-2 bg-[#ebecf3] rounded-full text-[#313449] active:scale-90 transition-transform">
            <ArrowLeft01Icon size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#313449] leading-none">
              {event.name}
            </h2>
            <p className="text-[8px] font-black text-[#8089b0] uppercase tracking-[0.2em] mt-1">
              Historical Archive
            </p>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex bg-[#ebecf3] p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('journal')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${activeTab === 'journal' ? 'bg-[#313449] text-white shadow-lg' : 'text-[#8089b0]'}`}
          >
            <StarsIcon size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Journal</span>
          </button>
          <button 
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${activeTab === 'ranking' ? 'bg-[#313449] text-white shadow-lg' : 'text-[#8089b0]'}`}
          >
            <ChampionIcon size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Ranking</span>
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div className="p-6">
        {activeTab === 'journal' ? (
          <DrinkFeed archiveEventId={event.id} />
        ) : (
          <Leaderboard archiveEventId={event.id} />
        )}
      </div>
    </div>
  );
}