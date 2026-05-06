import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, X, Send, Users, Shield, 
  MessageCircle, Hash, Search, MoreVertical,
  Minus, Maximize2, Trash2, Smile
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";

export default function ChatSystem() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState("global");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState({});
  const messagesEndRef = useRef(null);

  // Channels configuration
  const channels = [
    { id: "global", name: "Global Church", icon: MessageCircle, color: "bg-primary" },
    { id: `role:${user?.role}`, name: `${user?.role?.replace('_', ' ')} Channel`, icon: Shield, color: "bg-tertiary-fixed-dim" },
  ];

  // Add specific collaborative channels
  if (user?.role === 'admin' || user?.role === 'shepherd') {
    channels.push({ id: "role:admin_shepherd", name: "Admin & Shepherd", icon: Hash, color: "bg-secondary" });
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      fetchProfiles();
      
      // Subscribe to real-time messages
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel=eq.${activeChannel}` 
        }, payload => {
          setMessages(current => [...current, payload.new]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, activeChannel]);

  useEffect(scrollToBottom, [messages]);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, role');
    if (data) {
      const profileMap = {};
      data.forEach(p => profileMap[p.id] = p);
      setProfiles(profileMap);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel', activeChannel)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) setMessages(data);
    setLoading(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      sender_id: user.id,
      content: newMessage.trim(),
      channel: activeChannel,
    };

    const { error } = await supabase.from('messages').insert([messageData]);
    if (!error) {
      setNewMessage("");
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-primary text-on-primary shadow-2xl flex items-center justify-center z-[500] cursor-pointer group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageSquare size={28} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-tertiary-fixed-dim rounded-full border-2 border-primary animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 100, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-surface-container-low/90 backdrop-blur-2xl rounded-[32px] border border-outline-variant/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] z-[500] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container/30">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${channels.find(c => c.id === activeChannel)?.color || 'bg-primary'} grid place-items-center text-on-primary shadow-lg`}>
                  {React.createElement(channels.find(c => c.id === activeChannel)?.icon || MessageSquare, { size: 20 })}
                </div>
                <div>
                  <h3 className="font-black text-sm text-primary tracking-tight">
                    {channels.find(c => c.id === activeChannel)?.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Real-time Connected</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg hover:bg-surface-container transition-colors grid place-items-center text-primary/40 hover:text-primary">
                  <Search size={18} />
                </button>
                <button className="w-8 h-8 rounded-lg hover:bg-surface-container transition-colors grid place-items-center text-primary/40 hover:text-primary">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Channel Sidebar (Optional/Compact) */}
              <div className="w-16 bg-surface-container-highest/20 border-r border-outline-variant/5 flex flex-col items-center py-4 gap-4">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-10 h-10 rounded-xl transition-all duration-300 grid place-items-center relative group ${
                      activeChannel === channel.id 
                      ? `${channel.color} text-on-primary shadow-md scale-110` 
                      : 'bg-surface-container-low text-primary/40 hover:text-primary hover:bg-surface-container'
                    }`}
                  >
                    <channel.icon size={18} />
                    {activeChannel === channel.id && (
                      <motion.div 
                        layoutId="active-dot"
                        className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-l-full" 
                      />
                    )}
                    {/* Tooltip */}
                    <div className="absolute left-14 bg-surface px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg border border-outline-variant/10">
                      {channel.name}
                    </div>
                  </button>
                ))}
              </div>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col bg-surface/30">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary/20 mb-4">
                        <MessageCircle size={32} />
                      </div>
                      <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">No messages yet</p>
                      <p className="text-[10px] text-primary/30 mt-1">Start the conversation in {channels.find(c => c.id === activeChannel)?.name}</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender_id === user.id;
                      const sender = profiles[msg.sender_id];
                      const showAvatar = idx === 0 || messages[idx-1].sender_id !== msg.sender_id;

                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {showAvatar && !isMe && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-1 ml-1">
                              {sender?.full_name} • {sender?.role?.replace('_', ' ')}
                            </span>
                          )}
                          <motion.div
                            initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              isMe 
                              ? 'bg-primary text-on-primary rounded-tr-none' 
                              : 'bg-surface-container-high text-primary rounded-tl-none'
                            }`}
                          >
                            {msg.content}
                            <div className={`text-[9px] mt-1.5 opacity-40 font-bold ${isMe ? 'text-right' : 'text-left'}`}>
                              {format(new Date(msg.created_at), 'HH:mm')}
                            </div>
                          </motion.div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-surface-container/50 border-t border-outline-variant/5">
                  <form onSubmit={sendMessage} className="relative">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full h-12 bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl px-5 pr-12 text-sm text-primary placeholder:text-primary/30 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer shadow-lg"
                    >
                      <Send size={16} />
                    </button>
                    <div className="flex items-center gap-3 mt-3 px-1">
                       <button type="button" className="text-primary/30 hover:text-primary transition-colors"><Smile size={16}/></button>
                       <button type="button" className="text-primary/30 hover:text-primary transition-colors"><Hash size={16}/></button>
                       <span className="text-[9px] font-black uppercase tracking-widest text-primary/20 ml-auto">Press Enter to send</span>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
