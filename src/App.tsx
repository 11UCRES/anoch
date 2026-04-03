import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, ConnectionStatus, Stats, HistoryItem, SessionStats } from './types';
import { ChatRoom } from './components/ChatRoom';
import { MatchmakingScreen } from './components/MatchmakingScreen';
import { SessionEndedScreen } from './components/SessionEndedScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Theme, themes } from './themes';
import { cn } from './lib/utils';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerUsername, setPartnerUsername] = useState<string>('Anonymous');
  const [username, setUsername] = useState<string>('Anon');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<Stats>({ online: 0, waiting: 0, chatting: 0 });
  const [theme, setTheme] = useState<Theme>(themes[0]);
  
  // Session Stats
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [showSessionEnded, setShowSessionEnded] = useState(false);

  // Refs to avoid stale closures in socket listeners
  const messagesRef = useRef<Message[]>([]);
  const sessionStartTimeRef = useRef<number | null>(null);
  const partnerUsernameRef = useRef<string>('Anonymous');

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    sessionStartTimeRef.current = sessionStartTime;
  }, [sessionStartTime]);

  useEffect(() => {
    partnerUsernameRef.current = partnerUsername;
  }, [partnerUsername]);

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
      setStats({
        online: newStats.online,
        waiting: newStats.waiting,
        chatting: newStats.chatting
      });
    });

    newSocket.on('waiting', () => {
      setStatus('waiting');
    });

    newSocket.on('matched', (data: { partnerId: string, partnerUsername: string }) => {
      setStatus('matched');
      setPartnerId(data.partnerId);
      const pName = data.partnerUsername || 'Anonymous';
      setPartnerUsername(pName);
      partnerUsernameRef.current = pName;
      setSessionStartTime(null);
      sessionStartTimeRef.current = null;
      setShowSessionEnded(false);
      setMessages([]);
      setIsPartnerTyping(false);
    });

    newSocket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (!sessionStartTimeRef.current) {
        const startTime = Date.now();
        setSessionStartTime(startTime);
        sessionStartTimeRef.current = startTime;
      }
    });

    newSocket.on('partner_typing', (isTyping: boolean) => {
      setIsPartnerTyping(isTyping);
    });

    newSocket.on('partner_disconnected', () => {
      setStatus('disconnected');
      setIsPartnerTyping(false);
      setPartnerId(null);
      
      // Add a system message to the chat
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

  const startChat = useCallback((name: string) => {
    if (socket) {
      const finalName = name.trim() || 'Anon';
      setUsername(finalName);
      socket.emit('join_queue', { username: finalName });
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
      if (!sessionStartTimeRef.current) {
        const startTime = Date.now();
        setSessionStartTime(startTime);
        sessionStartTimeRef.current = startTime;
      }
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
      if (!sessionStartTimeRef.current) {
        const startTime = Date.now();
        setSessionStartTime(startTime);
        sessionStartTimeRef.current = startTime;
      }
      socket.emit('send_voice', { audio });
    }
  }, [socket, status]);

  const handleNext = useCallback(() => {
    if (socket) {
      // Calculate session stats before moving on
      const duration = sessionStartTime ? Date.now() - sessionStartTime : 0;
      const messageCount = messages.filter(m => m.senderId !== 'system').length;
      setSessionStats({
        duration,
        messageCount,
        partnerUsername
      });
      setShowSessionEnded(true);

      // Add current session to history before moving on
      const chatMessages = messages.filter(m => m.senderId !== 'system');
      if (chatMessages.length > 0) {
        setHistory(h => [
          {
            id: Math.random().toString(36).substr(2, 9),
            partnerUsername: partnerUsername,
            timestamp: Date.now(),
            messages: [...messages]
          },
          ...h
        ]);
      }

      socket.emit('next_partner');
      setMessages([]);
      setPartnerId(null);
      setSessionStartTime(null);
      setStatus('waiting');
      socket.emit('join_queue');
    }
  }, [socket, messages, partnerUsername, sessionStartTime]);

  const handleLogout = useCallback(() => {
    if (socket) {
      // Calculate session stats before logging out
      const duration = sessionStartTime ? Date.now() - sessionStartTime : 0;
      const messageCount = messages.filter(m => m.senderId !== 'system').length;
      setSessionStats({
        duration,
        messageCount,
        partnerUsername
      });
      setShowSessionEnded(true);

      // Add current session to history before logging out
      const chatMessages = messages.filter(m => m.senderId !== 'system');
      if (chatMessages.length > 0) {
        setHistory(h => [
          {
            id: Math.random().toString(36).substr(2, 9),
            partnerUsername: partnerUsername,
            timestamp: Date.now(),
            messages: [...messages]
          },
          ...h
        ]);
      }

      socket.emit('next_partner');
      setMessages([]);
      setPartnerId(null);
      setSessionStartTime(null);
      setStatus('idle');
    }
  }, [socket, messages, partnerUsername, sessionStartTime]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (socket && status === 'matched') {
      socket.emit('typing', isTyping);
    }
  }, [socket, status]);

  return (
    <div className={cn(
      "h-[100dvh] w-full flex items-center justify-center p-0 transition-colors duration-500 overflow-hidden",
      theme.bg
    )}>
      <AnimatePresence mode="wait">
        {showSessionEnded && sessionStats ? (
          <SessionEndedScreen
            key="session-ended"
            stats={sessionStats}
            theme={theme}
            onFindNew={() => {
              setSessionStats(null);
              setShowSessionEnded(false);
              setMessages([]);
              setStatus('waiting');
              socket?.emit('join_queue');
            }}
            onGoHome={() => {
              setSessionStats(null);
              setShowSessionEnded(false);
              setMessages([]);
              setStatus('idle');
            }}
          />
        ) : status === 'idle' || status === 'waiting' ? (
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
              history={history}
              socketId={socket?.id || null}
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
              onLogout={handleLogout}
              isPartnerTyping={isPartnerTyping}
              onTyping={handleTyping}
              status={status}
              socketId={socket?.id || null}
              username={username}
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

