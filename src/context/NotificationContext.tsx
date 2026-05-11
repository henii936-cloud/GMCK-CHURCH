import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, MessageSquare, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, ...notification }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Global Listener for Messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('global_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, async (payload) => {
        const msg = payload.new;
        
        // Don't notify if we are the sender
        if (msg.sender_id === user.id) return;

        // Check if the message is relevant to us
        const isDM = !msg.channel && msg.recipient_id === user.id;
        const isRoleChannel = msg.channel?.startsWith('role:');
        const isGroupChannel = msg.channel?.startsWith('group:');

        let shouldNotify = false;
        let title = "New Message";
        let content = msg.content;
        let icon = MessageSquare;
        let color = "bg-primary";

        if (isDM) {
          shouldNotify = true;
          title = "Private Message";
        } else if (isRoleChannel) {
          const role = msg.channel.split(':')[1];
          // Admins see all role messages, others see only their role
          if (user.role === 'admin' || user.role === role) {
            shouldNotify = true;
            title = `${role.replace('_', ' ')} Update`;
          }
        } else if (isGroupChannel) {
          // Admins and Shepherds see group messages
          if (user.role === 'admin' || user.role === 'shepherd') {
            shouldNotify = true;
            title = "Fellowship Group";
          }
        }

        if (shouldNotify) {
          // Fetch sender name
          const { data: sender } = await supabase.from('profiles').select('full_name').eq('id', msg.sender_id).single();
          
          addNotification({
            title,
            message: `${sender?.full_name || 'Someone'}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            icon,
            color,
            type: 'message'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      
      {/* Global Notification Overlay */}
      <div className="fixed top-6 right-6 z-[2000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className="w-80 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 p-4 flex gap-4 relative overflow-hidden group">
                <div className={`w-12 h-12 rounded-xl ${n.color || 'bg-primary'} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                  {React.createElement(n.icon || Bell, { size: 22 })}
                </div>
                <div className="min-w-0 pr-6">
                  <h4 className="font-black text-xs text-primary uppercase tracking-widest">{n.title}</h4>
                  <p className="text-sm text-primary/60 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                <button 
                  onClick={() => removeNotification(n.id)}
                  className="absolute top-4 right-4 text-primary/20 hover:text-primary transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
