"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { ArrowDown01Icon } from "hugeicons-react";

const UNLOCK_DATE = new Date('2026-07-20T12:00:00Z');

interface TimeCapsuleMessagesProps {
  currentUserId: string;
  onBack: () => void;
}

export default function TimeCapsuleMessages({ currentUserId, onBack }: TimeCapsuleMessagesProps) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [isLocked, setIsLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const initMessages = async () => {
      try {
        setLoading(true);
        const now = new Date();
        setIsLocked(now < UNLOCK_DATE);

        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .not('id', 'eq', currentUserId);
        
        if (profilesData) {
          const sortedProfiles = [...profilesData].sort((a, b) => 
            (a.username || "").localeCompare(b.username || "")
          );
          setProfiles(sortedProfiles);
        }

        await fetchMessages();
      } catch (e) {
        console.error("Error initializing messages:", e);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) initMessages();
  }, [currentUserId]);

  const fetchMessages = async () => {
    const { data: received } = await supabase
      .from('time_capsule_messages')
      .select('id, created_at, sender_id, message_text')
      .eq('receiver_id', currentUserId);
    
    if (received) setReceivedMessages(received);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceiverId || !messageText.trim()) return;

    try {
      setSending(true);
      setStatusMessage(null);

      const { error } = await supabase
        .from('time_capsule_messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedReceiverId,
          message_text: messageText.trim()
        });

      if (error) throw error;

      setMessageText("");
      setStatusMessage("✉️ Capsule sealed successfully!");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Error while sending...");
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="text-center py-10 text-[10px] font-black text-[#313449]/30 animate-pulse tracking-[0.3em] uppercase">
      Encrypting capsule...
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-10">
      
      {/* HEADER : STRICTEMENT IDENTIQUE À PEARLS */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-[#ebecf3] rounded-full text-[#313449]">
          <ArrowDown01Icon size={20} className="rotate-90" />
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#313449]">Time Capsule</h2>
      </div>

      {/* FORMULAIRE D'ENVOI */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-[#8089b0] uppercase tracking-[0.2em] ml-2">
          Send a secret message
        </label>
        <div className="bg-white/40 border border-[#d3d6e4] rounded-[2rem] p-6 shadow-sm backdrop-blur-sm space-y-4">
          <p className="text-[9px] font-bold text-[#8089b0] uppercase tracking-wide leading-normal">
            Your friend won't be able to read it until Monday, July 20th at 12:00.
          </p>

          <form onSubmit={handleSendMessage} className="space-y-4 pt-2">
            <div className="relative">
              <select
                value={selectedReceiverId}
                onChange={(e) => setSelectedReceiverId(e.target.value)}
                className="w-full bg-[#ebecf3]/50 border border-[#d3d6e4] rounded-xl py-3.5 px-4 text-[11px] font-bold text-[#313449] focus:outline-none appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Choose a panda...</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>🐼 {p.username}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-[10px]">▼</span>
            </div>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your secret message here..."
              rows={4}
              className="w-full bg-[#ebecf3]/50 border border-[#d3d6e4] rounded-2xl p-4 text-[11px] font-bold text-[#313449] placeholder-[#8089b0]/50 focus:outline-none resize-none shadow-inner"
              required
            />

            <button
              type="submit"
              disabled={sending}
              className="w-full py-4 bg-[#313449] text-[#f6f6f9] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
              {sending ? 'Sealing...' : 'Seal in time 🔒'}
            </button>
          </form>

          {statusMessage && (
            <div className="text-center text-[9px] font-black uppercase tracking-wider text-[#f59e0b] animate-pulse">
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* RECEPTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-4 px-2">
          <h3 className="text-[10px] font-black text-[#313449] uppercase tracking-[0.4em] whitespace-nowrap">Received Capsules</h3>
          <div className="h-[1px] flex-1 bg-[#d3d6e4]/50"></div>
        </div>

        <div className="space-y-3">
          {receivedMessages.length === 0 ? (
            <div className="text-center py-10 bg-[#ebecf3]/30 rounded-[2rem] border border-dashed border-[#d3d6e4]">
              <p className="text-[9px] font-black text-[#8089b0] uppercase tracking-[0.2em]">No capsules waiting</p>
            </div>
          ) : (
            receivedMessages.map((msg) => {
              const sender = profiles.find(p => p.id === msg.sender_id)?.username || "A panda";
              return (
                <div key={msg.id} className="p-5 bg-white/60 border border-[#d3d6e4] rounded-[2rem] shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-[#313449] uppercase tracking-wide">From: 🐼 {sender}</span>
                    <span className="text-[8px] font-bold text-[#8089b0]">{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  {isLocked ? (
                    <div className="p-4 bg-[#313449]/5 rounded-2xl border border-dashed border-[#313449]/20 flex items-center gap-4">
                      <span className="text-xl animate-pulse">🔒</span>
                      <div className="text-[9px] font-black uppercase tracking-wider text-[#58618a] leading-relaxed">
                        Encrypted until <br/>
                        <span className="text-[#f59e0b]">July 20, 12:00 PM</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] font-bold text-[#313449] leading-relaxed bg-white/40 p-4 rounded-xl border border-[#d3d6e4]/50">
                      {msg.message_text}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}