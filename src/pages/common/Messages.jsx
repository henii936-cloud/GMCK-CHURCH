import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Send, Users, Shield, 
  MessageCircle, Hash, Search, MoreVertical,
  Smile, Image as ImageIcon, Paperclip, Phone, Video
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { format } from "date-fns";
import { Card, Button, Input } from "../../components/common/UI";

export default function Messages() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState("global");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState({});
  const messagesEndRef = useRef(null);

  const channels = [
    { id: "global", name: "Global Church", icon: MessageCircle, description: "Everyone in the church can chat here", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: `role:${user?.role}`, name: `${user?.role?.replace('_', ' ')}s Only`, icon: Shield, description: "Private channel for your role", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  if (user?.role === 'admin' || user?.role === 'shepherd') {
    channels.push({ id: "role:admin_shepherd", name: "Admin & Shepherd", icon: Hash, description: "Leadership collaboration channel", color: "text-amber-500", bg: "bg-amber-500/10" });
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    fetchProfiles();
    
    const channel = supabase
      .channel(`chat:${activeChannel}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel=eq.${activeChannel}` 
      }, payload => {
        setMessages(current => [...current, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel]);

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
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('channel', activeChannel)
      .order('created_at', { ascending: true })
      .limit(100);

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
    if (!error) setNewMessage("");
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto h-full flex gap-8">
        
        {/* Left Sidebar: Channels */}
        <div className="w-80 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="display-sm text-primary">Messages</h1>
            <button className="w-10 h-10 rounded-xl bg-surface-container-high grid place-items-center text-primary/40 hover:text-primary transition-all">
              <Plus size={20} />
            </button>
          </div>

          <Card className="flex-1 p-4 overflow-y-auto scrollbar-hide">
            <div className="space-y-2">
              <p className="label-sm font-black uppercase tracking-widest text-primary/30 mb-4 px-2">Channels</p>
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 group ${
                    activeChannel === ch.id 
                    ? 'bg-primary text-on-primary shadow-xl scale-[1.02]' 
                    : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl grid place-items-center shadow-inner ${
                    activeChannel === ch.id ? 'bg-on-primary/20' : ch.bg
                  }`}>
                    <ch.icon size={22} className={activeChannel === ch.id ? 'text-on-primary' : ch.color} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className={`font-black text-sm truncate ${activeChannel === ch.id ? 'text-on-primary' : 'text-primary'}`}>
                      {ch.name}
                    </p>
                    <p className={`text-[10px] truncate opacity-60 ${activeChannel === ch.id ? 'text-on-primary/70' : 'text-primary/40'}`}>
                      {ch.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-12 space-y-2">
              <p className="label-sm font-black uppercase tracking-widest text-primary/30 mb-4 px-2">Recent Chats</p>
              {/* This could be populated from a 'conversations' table or distinct senders */}
              <div className="p-4 text-center opacity-20">
                <Users size={24} className="mx-auto mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">More coming soon</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col p-0 overflow-hidden relative">
          {/* Header */}
          <div className="p-6 border-b border-outline-variant/5 flex items-center justify-between bg-surface-container/20">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl grid place-items-center shadow-lg ${channels.find(c => c.id === activeChannel)?.bg}`}>
                {React.createElement(channels.find(c => c.id === activeChannel)?.icon || MessageSquare, { 
                  size: 24,
                  className: channels.find(c => c.id === activeChannel)?.color
                })}
              </div>
              <div>
                <h2 className="headline-sm text-primary">
                  {channels.find(c => c.id === activeChannel)?.name}
                </h2>
                <p className="label-sm opacity-40 lowercase tracking-widest">Active now • {messages.length} messages</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" icon={Phone} className="w-12 h-12 !p-0 rounded-2xl opacity-40 cursor-not-allowed" />
              <Button variant="secondary" icon={Video} className="w-12 h-12 !p-0 rounded-2xl opacity-40 cursor-not-allowed" />
              <Button variant="secondary" icon={MoreVertical} className="w-12 h-12 !p-0 rounded-2xl" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-surface/10">
            {loading ? (
              <div className="h-full grid place-items-center">
                <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-[40px] bg-primary/5 flex items-center justify-center text-primary/10 mb-6 animate-pulse">
                  <MessageSquare size={48} />
                </div>
                <h3 className="headline-sm text-primary/20">No messages here yet</h3>
                <p className="label-sm text-primary/10 mt-2">Be the first to break the silence!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender_id === user.id;
                const sender = profiles[msg.sender_id];
                const showHeader = idx === 0 || messages[idx-1].sender_id !== msg.sender_id;

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showHeader && (
                      <div className={`flex items-center gap-2 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-lg grid place-items-center font-black text-[10px] ${isMe ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-primary'}`}>
                          {sender?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                          {isMe ? 'You' : sender?.full_name} • {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`max-w-[70%] p-5 rounded-[24px] text-sm leading-relaxed shadow-whisper ${
                        isMe 
                        ? 'bg-primary text-on-primary rounded-tr-none' 
                        : 'bg-surface-container-highest text-primary rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </motion.div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-8 bg-surface-container/30 border-t border-outline-variant/5">
            <form onSubmit={sendMessage} className="flex gap-4 items-end">
              <div className="flex-1 relative group">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full min-h-[56px] max-h-32 bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm text-primary placeholder:text-primary/30 outline-none transition-all resize-none pr-32"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  <button type="button" className="p-2 text-primary/30 hover:text-primary transition-colors"><Smile size={20} /></button>
                  <button type="button" className="p-2 text-primary/30 hover:text-primary transition-colors"><ImageIcon size={20} /></button>
                  <button type="button" className="p-2 text-primary/30 hover:text-primary transition-colors"><Paperclip size={20} /></button>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={!newMessage.trim()} 
                variant="primary" 
                icon={Send}
                className="h-14 w-14 !p-0 shadow-xl"
              />
            </form>
          </div>
        </Card>

      </div>
    </div>
  );
}
