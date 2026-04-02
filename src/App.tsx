import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, ConnectionStatus, Stats } from './types';
import { ChatRoom } from './components/ChatRoom';
import { MatchmakingScreen } from './components/MatchmakingScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Theme, themes } from './themes';
import { cn } from './lib/utils';

import { supabase } from './lib/supabase';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerUsername, setPartnerUsername] = useState<string>('Anonymous');
  const [stats, setStats] = useState<Stats>({ online: 0, waiting: 0, chatting: 0 });
  const [theme, setTheme] = useState<Theme>(themes[0]);

  // Supabase Presence for Online Count
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'user',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setStats(prev => ({ ...prev, online: count }));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('New users joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Users left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('anonchat-theme');
    if (savedTheme) {
      const found = themes.find(t => t.id === savedTheme);
      if (found) setTheme(found);
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('anonchat-theme', newTheme.id);
  };

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('stats_update', (newStats: Stats) => {
      setStats((prev) => ({
        ...prev,
        waiting: newStats.waiting,
        chatting: newStats.chatting
      }));
    });

    newSocket.on('waiting', () => {
      setStatus('waiting');
    });

    newSocket.on('matched', (data: { partnerId: string, partnerUsername: string }) => {
      setStatus('matched');
      setPartnerId(data.partnerId);
      setPartnerUsername(data.partnerUsername || 'Anonymous');
      setMessages([]);
      setIsPartnerTyping(false);
    });

    newSocket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('partner_typing', (isTyping: boolean) => {
      setIsPartnerTyping(isTyping);
    });

    newSocket.on('partner_disconnected', () => {
      setStatus('disconnected');
      setPartnerId(null);
      setIsPartnerTyping(false);
      
      // Add a "system" message to the chat
      const systemMsg: Message = {
        id: 'system-' + Date.now(),
        text: 'Partner has disconnected.',
        senderId: 'system',
        timestamp: Date.now(),
        type: 'text'
      };
      setMessages((prev) => [...prev, systemMsg]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const startChat = useCallback((username: string) => {
    if (socket) {
      socket.emit('join_queue', { username });
      setStatus('waiting');
    }
  }, [socket]);

  const sendMessage = useCallback((text: string) => {
    if (socket && status === 'matched') {
      const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        senderId: socket.id!,
        timestamp: Date.now(),
        type: 'text'
      };
      setMessages((prev) => [...prev, newMessage]);
      socket.emit('send_message', { text });
    }
  }, [socket, status]);

  const sendVoice = useCallback((audio: string) => {
    if (socket && status === 'matched') {
      const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        audio,
        senderId: socket.id!,
        timestamp: Date.now(),
        type: 'voice'
      };
      setMessages((prev) => [...prev, newMessage]);
      socket.emit('send_voice', { audio });
    }
  }, [socket, status]);

  const handleNext = useCallback(() => {
    if (socket) {
      socket.emit('next_partner');
      setMessages([]);
      setPartnerId(null);
      setStatus('waiting');
      socket.emit('join_queue');
    }
  }, [socket]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (socket && status === 'matched') {
      socket.emit('typing', isTyping);
    }
  }, [socket, status]);

  return (
    <div className={cn(
      "h-full w-full flex items-center justify-center p-0 md:p-4 lg:p-8 transition-colors duration-500",
      theme.bg
    )}>
      <AnimatePresence mode="wait">
        {status === 'idle' || status === 'waiting' ? (
          <motion.div
            key="matchmaking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full flex items-center justify-center"
          >
            <MatchmakingScreen 
              onStart={startChat} 
              isSearching={status === 'waiting'} 
              stats={stats}
              theme={theme}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full h-[100dvh] md:h-full"
          >
            <ChatRoom
              messages={messages}
              onSendMessage={sendMessage}
              onSendVoice={sendVoice}
              onNext={handleNext}
              isPartnerTyping={isPartnerTyping}
              onTyping={handleTyping}
              status={status}
              socketId={socket?.id || null}
              partnerUsername={partnerUsername}
              theme={theme}
              onThemeChange={handleThemeChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {status === 'disconnected_toast' && ( // Changed to a different status for the toast if needed, but for now I'll just remove the toast if it's confusing
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold z-50 flex items-center gap-3 border-2 border-white/20"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            Partner disconnected.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

