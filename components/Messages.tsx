"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/supabase';

export default function Messages({ session }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // 1. CHARGEMENT INITIAL + REALTIME
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('realtime_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => { fetchMessages(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. RÉCUPÉRATION DES MESSAGES
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!messages_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) console.error("🚨 Error:", error.message);
      else setMessages(data || []);
    } catch (err) {
      console.error("Exception:", err);
    }
  };

  // 3. ENVOI D'UN MESSAGE
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session) return;

    setSending(true);
    const content = newMessage;
    setNewMessage(""); 

    const { error } = await supabase
      .from('messages')
      .insert([{ 
        user_id: session.user.id, 
        content: content 
      }]);

    if (error) {
      console.error("🚨 Error:", error.message);
      setNewMessage(content); 
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] animate-in fade-in duration-700 px-1 relative">
      
      {/* LISTE DES MESSAGES (Nouveaux en bas) */}
      {/* pb-32 ici permet de scroller assez pour que le dernier message soit juste au dessus de l'input */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-32 flex flex-col-reverse">
        {messages.length === 0 && (
          <p className="text-center py-20 text-[9px] font-black uppercase text-[#778899]/30 tracking-[0.3em]">
            The archive is silent...
          </p>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.user_id === session?.user?.id;

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-3 duration-500`}
            >
              <div 
                className={`max-w-[85%] p-4 rounded-[1.8rem] border shadow-sm transition-all ${
                  isMe 
                    ? 'bg-[#2E8B57] border-[#2E8B57] text-[#F5F5DC] rounded-tr-none' 
                    : 'bg-white/60 backdrop-blur-md border-[#778899]/10 text-[#2F4F4F] rounded-tl-none'
                }`}
              >
                <div className={`flex items-center gap-2 mb-2 ${isMe ? 'flex-row-reverse text-right' : 'flex-row'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] overflow-hidden border ${
                    isMe ? 'bg-white/10 border-white/20' : 'bg-[#2F4F4F]/5 border-[#2F4F4F]/10'
                  }`}>
                     {msg.profiles?.avatar_url ? (
                       <img 
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${msg.profiles.avatar_url}`} 
                        className="w-full h-full object-cover"
                        alt="p"
                       />
                     ) : "🐼"}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-[0.15em] ${isMe ? 'text-white/70' : 'text-[#2F4F4F]/50'}`}>
                    {isMe ? 'Me' : (msg.profiles?.username || "Traveler")}
                  </span>
                </div>
                
                <p className={`text-[11px] font-semibold leading-relaxed px-1 ${isMe ? 'text-white' : 'text-[#2F4F4F]'}`}>
                  {msg.content}
                </p>

                <div className={`text-[6px] font-bold mt-2 opacity-40 uppercase tracking-tighter ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ZONE DE SAISIE FIXÉE (Ajustée à bottom-40 pour l'espace de 16px) */}
      <div className="fixed bottom-40 left-4 right-4 z-[100] animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Dégradé discret pour la lisibilité */}
        <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-[#F5F5DC]/50 to-transparent pointer-events-none"></div>

        <form onSubmit={sendMessage} className="relative shadow-2xl rounded-[2.5rem]">
          <input 
            type="text"
            placeholder="Grave a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-[#2F4F4F] border-none ring-0 outline-none rounded-[2.5rem] py-5 px-7 pr-16 text-[11px] font-bold text-[#F5F5DC] placeholder-[#F5F5DC]/30 focus:ring-2 focus:ring-[#2E8B57]/30 transition-all"
          />
          <button 
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#F5F5DC] text-[#2F4F4F] rounded-full flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all shadow-lg"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-[#2F4F4F]/20 border-t-[#2F4F4F] rounded-full animate-spin"></div>
            ) : (
              <span className="text-lg font-black italic mt-[-2px]">↑</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}