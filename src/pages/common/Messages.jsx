import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Send, Users, Shield, 
  MessageCircle, Hash, Search, MoreVertical,
  Smile, ImageIcon, Paperclip, Phone, Video,
  Check, CheckCheck, Plus, ArrowLeft, User,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { format } from "date-fns";
import { Card, Button, Input } from "../../components/common/UI";
import { useLocation } from "react-router-dom";

const ROLE_CONFIG = {
  admin: { label: "Admin", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  shepherd: { label: "Shepherd", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  bible_leader: { label: "Leader", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  finance: { label: "Finance", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  youth_ministry: { label: "Youth", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  management: { label: "Mgmt", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  kids_ministry: { label: "Kids", color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
};

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("global"); // 'global', 'role', or 'dm:userId'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState({});
  const [recentDMs, setRecentDMs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize from location state (Direct Message from Leaders page)
  useEffect(() => {
    if (location.state?.directChatId) {
      const targetId = location.state.directChatId;
      setActiveTab(`dm:${targetId}`);
      // Ensure the profile is loaded
      if (!profiles[targetId]) fetchProfiles();
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchProfiles();
    fetchRecentDMs();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to messages
    const channelName = activeTab.startsWith('dm:') ? `dm:${[user.id, activeTab.split(':')[1]].sort().join('-')}` : `chat:${activeTab}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
      }, payload => {
        const msg = payload.new;
        const targetUserId = activeTab.split(':')[1];
        
        // Filter logic for current view
        const isCurrentChannel = msg.channel === activeTab;
        const isCurrentDM = !msg.channel && (
          (msg.sender_id === user.id && msg.recipient_id === targetUserId) ||
          (msg.sender_id === targetUserId && msg.recipient_id === user.id)
        );

        if (isCurrentChannel || isCurrentDM) {
          setMessages(current => [...current, msg]);
        }
        
        // Update recent DMs if it's a DM
        if (!msg.channel) fetchRecentDMs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  useEffect(scrollToBottom, [messages]);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      const profileMap = {};
      data.forEach(p => profileMap[p.id] = p);
      setProfiles(profileMap);
    }
  };

  const fetchAllUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').neq('id', user.id);
    if (data) setAllUsers(data);
  };

  const fetchRecentDMs = async () => {
    const { data } = await supabase
      .from('messages')
      .select('sender_id, recipient_id, created_at')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .is('channel', null)
      .order('created_at', { ascending: false });

    if (data) {
      const uniqueUserIds = new Set();
      data.forEach(m => {
        if (m.sender_id !== user.id) uniqueUserIds.add(m.sender_id);
        if (m.recipient_id !== user.id) uniqueUserIds.add(m.recipient_id);
      });
      setRecentDMs(Array.from(uniqueUserIds));
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    let query = supabase.from('messages').select('*').order('created_at', { ascending: true });

    if (activeTab.startsWith('dm:')) {
      const targetId = activeTab.split(':')[1];
      query = query
        .is('channel', null)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${targetId}),and(sender_id.eq.${targetId},recipient_id.eq.${user.id})`);
    } else {
      query = query.eq('channel', activeTab);
    }

    const { data } = await query.limit(100);
    if (data) setMessages(data);
    setLoading(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      sender_id: user.id,
      content: newMessage.trim(),
    };

    if (activeTab.startsWith('dm:')) {
      messageData.recipient_id = activeTab.split(':')[1];
    } else {
      messageData.channel = activeTab;
    }

    const { error } = await supabase.from('messages').insert([messageData]);
    if (!error) {
      setNewMessage("");
      if (activeTab.startsWith('dm:')) fetchRecentDMs();
    }
  };

  const startDM = (userId) => {
    setActiveTab(`dm:${userId}`);
    setShowUserSearch(false);
    if (!recentDMs.includes(userId)) {
      setRecentDMs(prev => [userId, ...prev]);
    }
  };

  const getActiveTitle = () => {
    if (activeTab === 'global') return "Global Church";
    if (activeTab.startsWith('role:')) return `${activeTab.split(':')[1].replace('_', ' ')} Channel`;
    if (activeTab.startsWith('dm:')) {
      const id = activeTab.split(':')[1];
      return profiles[id]?.full_name || "Private Chat";
    }
    return "Messages";
  };

  const getActiveProfile = () => {
    if (activeTab.startsWith('dm:')) return profiles[activeTab.split(':')[1]];
    return null;
  };

  const channels = [
    { id: "global", name: "Global Church", icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: `role:${user?.role}`, name: "Ministry Channel", icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="p-4 sm:p-8 h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="w-full max-w-7xl h-full flex gap-4 sm:gap-8 relative">
        
        {/* Telegram Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 lg:flex flex-col gap-6 hidden"
        >
          <div className="flex items-center justify-between px-2">
            <h1 className="text-2xl font-black text-primary">Chat</h1>
            <button 
              onClick={() => setShowUserSearch(true)}
              className="w-10 h-10 rounded-2xl bg-primary/5 text-primary grid place-items-center hover:bg-primary hover:text-white transition-all duration-300"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="relative group px-2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..."
              className="w-full bg-surface-container-low border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card className="flex-1 p-2 overflow-y-auto custom-scrollbar flex flex-col gap-1 border-none shadow-premium bg-white/40 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/20 mt-4 mb-2 px-4">Channels</p>
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveTab(ch.id)}
                className={`flex items-center gap-4 p-3 rounded-[20px] transition-all duration-300 group ${
                  activeTab === ch.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/5 text-on-surface'
                }`}
              >
                <div className={`w-12 h-12 rounded-[18px] grid place-items-center shrink-0 ${activeTab === ch.id ? 'bg-white/20' : ch.bg}`}>
                  <ch.icon size={22} className={activeTab === ch.id ? 'text-white' : ch.color} />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-bold text-sm truncate">{ch.name}</p>
                  <p className={`text-[10px] opacity-60 truncate ${activeTab === ch.id ? 'text-white/70' : 'text-primary/40'}`}>Official Updates</p>
                </div>
              </button>
            ))}

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/20 mt-6 mb-2 px-4">Direct Messages</p>
            {recentDMs.map(dmId => {
              const p = profiles[dmId];
              const isActive = activeTab === `dm:${dmId}`;
              if (!p) return null;
              return (
                <button
                  key={dmId}
                  onClick={() => setActiveTab(`dm:${dmId}`)}
                  className={`flex items-center gap-4 p-3 rounded-[20px] transition-all duration-300 group ${
                    isActive ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/5 text-on-surface'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-[18px] grid place-items-center shrink-0 font-black text-sm ${isActive ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-primary'}`}>
                    {p.full_name?.charAt(0)}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate">{p.full_name}</p>
                      {p.role && ROLE_CONFIG[p.role] && (
                        <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${ROLE_CONFIG[p.role].bg} ${ROLE_CONFIG[p.role].color}`}>
                          {ROLE_CONFIG[p.role].label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500`} />
                      <p className={`text-[10px] opacity-60 truncate ${isActive ? 'text-white/70' : 'text-primary/40'}`}>Online</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {recentDMs.length === 0 && (
              <div className="py-8 text-center opacity-20 flex flex-col items-center gap-2">
                <Users size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest">No private chats</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowUserSearch(true)}>Find Someone</Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Telegram Chat Window */}
        <Card className="flex-1 flex flex-col p-0 overflow-hidden relative border-none shadow-premium bg-white/60 backdrop-blur-2xl rounded-[32px]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#002c53 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* Chat Header */}
          <div className="p-4 sm:p-6 border-b border-primary/5 flex items-center justify-between bg-white/50 relative z-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <button className="lg:hidden w-10 h-10 rounded-full bg-primary/5 grid place-items-center text-primary">
                <ArrowLeft size={20} />
              </button>
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-[20px] sm:rounded-[24px] grid place-items-center shadow-lg shrink-0 ${activeTab.startsWith('dm:') ? 'bg-surface-container-highest' : channels.find(c => c.id === activeTab)?.bg}`}>
                {activeTab.startsWith('dm:') ? (
                  <span className="font-black text-lg text-primary">{getActiveTitle()?.charAt(0)}</span>
                ) : (
                  React.createElement(channels.find(c => c.id === activeTab)?.icon || MessageSquare, { 
                    size: 24,
                    className: channels.find(c => c.id === activeTab)?.color
                  })
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-xl font-black text-primary truncate">{getActiveTitle()}</h2>
                  {getActiveProfile()?.role && ROLE_CONFIG[getActiveProfile().role] && (
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ROLE_CONFIG[getActiveProfile().role].bg} ${ROLE_CONFIG[getActiveProfile().role].color}`}>
                      {ROLE_CONFIG[getActiveProfile().role].label}
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-[18px] sm:rounded-[20px] bg-primary/5 text-primary/40 flex items-center justify-center hover:bg-primary/10 transition-all"><Search size={20} /></button>
              <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-[18px] sm:rounded-[20px] bg-primary/5 text-primary/40 flex items-center justify-center hover:bg-primary/10 transition-all"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 custom-scrollbar relative z-10">
            {loading ? (
              <div className="h-full grid place-items-center">
                <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 scale-90">
                <div className="w-32 h-32 rounded-[50px] bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <MessageSquare size={64} />
                </div>
                <h3 className="text-2xl font-black text-primary uppercase tracking-[0.2em]">Start Chatting</h3>
                <p className="text-sm font-bold text-primary mt-2">End-to-end encrypted messaging</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender_id === user.id;
                const sender = profiles[msg.sender_id];
                const showAvatar = idx === 0 || messages[idx-1].sender_id !== msg.sender_id;
                const nextIsMe = idx < messages.length - 1 && messages[idx+1].sender_id === msg.sender_id;

                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!activeTab.startsWith('dm:') && (
                      <div className="w-10 shrink-0">
                        {showAvatar && !isMe && (
                          <div className="w-10 h-10 rounded-2xl bg-surface-container-highest grid place-items-center font-black text-xs text-primary shadow-sm">
                            {sender?.full_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {showAvatar && !isMe && !activeTab.startsWith('dm:') && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1 mb-1">
                          {sender?.full_name}
                        </span>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: isMe ? 20 : -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className={`group relative p-3 sm:p-4 shadow-sm transition-all duration-300 ${
                          isMe 
                          ? 'bg-primary text-white rounded-[22px] rounded-tr-[4px] ml-12' 
                          : 'bg-white text-primary rounded-[22px] rounded-tl-[4px] border border-primary/5 mr-12'
                        } ${!nextIsMe ? 'mb-2' : 'mb-1'}`}
                      >
                        {!isMe && !activeTab.startsWith('dm:') && sender?.role && (
                          <div className={`text-[8px] font-black uppercase tracking-tighter mb-1 inline-block px-1.5 py-0.5 rounded ${ROLE_CONFIG[sender.role]?.bg} ${ROLE_CONFIG[sender.role]?.color}`}>
                            {ROLE_CONFIG[sender.role]?.label}
                          </div>
                        )}

                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        
                        <div className={`flex items-center gap-1 mt-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity ${isMe ? 'text-white' : 'text-primary'}`}>
                          <span className="text-[9px] font-bold">{format(new Date(msg.created_at), 'HH:mm')}</span>
                          {isMe && <CheckCheck size={12} />}
                        </div>

                        {showAvatar && (
                          <div className={`absolute top-0 w-4 h-4 overflow-hidden ${isMe ? '-right-2' : '-left-2'}`}>
                            <div className={`w-4 h-4 rotate-45 transform ${isMe ? 'bg-primary -translate-x-1/2' : 'bg-white border-t border-l border-primary/5 translate-x-1/2'}`} />
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Telegram Input Bar */}
          <div className="p-4 sm:p-8 bg-white/40 border-t border-primary/5 relative z-10 backdrop-blur-xl">
            <form onSubmit={sendMessage} className="flex gap-2 sm:gap-4 items-end max-w-4xl mx-auto">
              <div className="flex-1 relative group">
                <div className="absolute left-4 bottom-4 flex items-center gap-1 sm:gap-2">
                  <button type="button" className="p-2 text-primary/30 hover:text-primary hover:bg-primary/5 rounded-full transition-all"><Paperclip size={20} /></button>
                </div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message..."
                  className="w-full min-h-[56px] max-h-48 bg-white border border-primary/5 focus:border-primary/20 rounded-[24px] pl-14 pr-14 py-4 text-sm text-primary placeholder:text-primary/30 outline-none transition-all resize-none shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  <button type="button" className="p-2 text-primary/30 hover:text-primary hover:bg-primary/5 rounded-full transition-all"><Smile size={20} /></button>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                disabled={!newMessage.trim()} 
                className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all duration-300 shrink-0"
              >
                <Send size={22} className="ml-1" />
              </motion.button>
            </form>
          </div>
        </Card>

        {/* User Search Modal */}
        <AnimatePresence>
          {showUserSearch && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-primary/5">
                  <h3 className="text-lg font-black text-primary">New Message</h3>
                  <button onClick={() => setShowUserSearch(false)} className="p-2 hover:bg-primary/10 rounded-xl transition-all"><X size={20} /></button>
                </div>
                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
                    <input 
                      type="text"
                      placeholder="Search people..."
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3 pl-12 pr-4 text-sm outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    {allUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => startDM(u.id)}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-[18px] bg-surface-container-highest grid place-items-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          {u.full_name?.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm text-primary">{u.full_name}</p>
                          <div className="flex items-center gap-2">
                            {u.role && ROLE_CONFIG[u.role] && (
                              <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${ROLE_CONFIG[u.role].bg} ${ROLE_CONFIG[u.role].color}`}>
                                {ROLE_CONFIG[u.role].label}
                              </span>
                            )}
                            <p className="text-[10px] text-primary/40 uppercase font-black">Available</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
