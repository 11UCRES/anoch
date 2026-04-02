import React, { useState, useEffect, useRef } from 'react';
import { Send, User, LogOut, Loader2, Volume2, Mic, Circle, Smile, Palette, MoreVertical, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, ConnectionStatus } from '@/src/types';
import { VoiceRecorder } from './VoiceRecorder';
import { Logo } from './Logo';
import { cn } from '@/src/lib/utils';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { Theme, themes } from '@/src/themes';

interface ChatRoomProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendVoice: (audio: string) => void;
  onNext: () => void;
  onLogout: () => void;
  isPartnerTyping: boolean;
  onTyping: (isTyping: boolean) => void;
  status: ConnectionStatus;
  socketId: string | null;
  username: string;
  partnerUsername: string;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  messages,
  onSendMessage,
  onSendVoice,
  onNext,
  onLogout,
  isPartnerTyping,
  onTyping,
  status,
  socketId,
  username,
  partnerUsername,
  theme,
  onThemeChange
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState<{ [key: string]: number }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isPartnerTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      onTyping(false);
      setShowEmojiPicker(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (status === 'matched') {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setInputText(prev => prev + emojiData.emoji);
  };

  const [audioDurations, setAudioDurations] = useState<{ [key: string]: number }>({});

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = (messageId: string, base64: string) => {
    if (playingMessageId === messageId && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsAudioPlaying(true);
      } else {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      const audio = new Audio(base64);
      audioRef.current = audio;
      setPlayingMessageId(messageId);
      setIsAudioPlaying(true);
      
      audio.addEventListener('loadedmetadata', () => {
        setAudioDurations(prev => ({ ...prev, [messageId]: audio.duration }));
      });

      audio.addEventListener('timeupdate', () => {
        setAudioProgress(prev => ({
          ...prev,
          [messageId]: (audio.currentTime / audio.duration) * 100
        }));
      });
      
      audio.addEventListener('ended', () => {
        setPlayingMessageId(null);
        setIsAudioPlaying(false);
        setAudioProgress(prev => ({ ...prev, [messageId]: 0 }));
      });
      
      audio.play().catch(err => {
        console.error("Error playing audio:", err);
        setPlayingMessageId(null);
        setIsAudioPlaying(false);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className={cn(
      "flex flex-col h-full w-full max-w-4xl mx-auto overflow-hidden transition-colors duration-300",
      theme.bg
    )}>
      {/* Header */}
      <header className={cn(
        "px-4 md:px-6 py-4 md:py-6 flex items-center justify-between z-20 border-b border-white/5",
        theme.bg
      )}>
        <div className="flex items-center gap-4">
          <Logo size={24} showText={false} className="hidden md:flex" />
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
              <User size={16} className="md:size-20" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-bold text-white tracking-tight">
                {username || 'Anon'}
              </span>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-1 h-1 md:w-1.5 md:h-1.5 rounded-full animate-pulse",
                  status === 'matched' ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {status === 'matched' ? 'Online' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
            title="Logout"
          >
            <LogOut size={16} className="md:size-18" />
          </motion.button>
        </div>
      </header>

      {/* Messages Area */}
      <div className={cn(
        "flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-6 md:space-y-8 custom-scrollbar relative",
        theme.bg
      )}>
        {/* Date Separator */}
        <div className="flex justify-center my-4 md:my-8">
          <div className="bg-white/5 px-3 md:px-4 py-1 rounded-full border border-white/5">
            <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Today</span>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            if (msg.senderId === 'system') {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center w-full my-4"
                >
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                    theme.id === 'light' ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-gray-800 text-gray-400 border-gray-700"
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              );
            }

            const isMe = msg.senderId === socketId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col w-full",
                  isMe ? "items-end" : "items-start"
                )}
              >
                <span className={cn(
                  "text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2",
                  isMe ? "mr-2" : "ml-2"
                )}>
                  {isMe ? "You" : "Stranger"}
                </span>

                <div className={cn(
                  "max-w-[90%] md:max-w-[85%] px-4 md:px-5 py-3 md:py-4 rounded-2xl shadow-sm",
                  isMe 
                    ? (theme.primary + " text-white") 
                    : (theme.accent + " text-gray-100")
                )}>
                  {msg.type === 'text' ? (
                    <p className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap break-words font-medium">
                      {msg.text}
                    </p>
                  ) : (
                    <div className="flex items-center gap-3 md:gap-4 min-w-[160px] md:min-w-[200px]">
                      <button
                        onClick={() => toggleAudio(msg.id, msg.audio!)}
                        className={cn(
                          "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
                          isMe ? "bg-white/20 text-white" : "bg-white/10 text-[#8e94f2]"
                        )}
                      >
                        {playingMessageId === msg.id && isAudioPlaying ? <Pause size={16} className="md:size-20" fill="currentColor" /> : <Play size={16} className="md:size-20 ml-1" fill="currentColor" />}
                      </button>
                      <div className="flex-1 flex items-center gap-2 md:gap-4">
                        <div className="flex-1 flex gap-[1px] md:gap-[2px] h-6 md:h-8 items-center">
                          {[...Array(8)].map((_, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "w-[2px] rounded-full",
                                isMe ? "bg-white/40" : "bg-white/20"
                              )}
                              style={{ height: `${Math.random() * 100}%` }}
                            />
                          ))}
                        </div>
                        <span className="text-[8px] md:text-[10px] font-mono opacity-60">
                          {formatAudioTime(audioDurations[msg.id] || 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className={cn(
                  "text-[10px] mt-2 font-medium text-gray-600",
                  isMe ? "mr-2" : "ml-2"
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <AnimatePresence>
          {isPartnerTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className="flex flex-col items-start ml-2 mb-4"
            >
              <div className={cn(
                "px-4 py-3 rounded-2xl flex items-center gap-1.5 shadow-sm",
                theme.accent
              )}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      y: [0, -3, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.8, 
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="p-3 md:p-8 relative">
        <div className={cn(
          "w-full rounded-full px-4 md:px-6 py-1.5 md:py-3 flex items-center gap-2 md:gap-4 transition-all duration-300",
          "bg-[#1a1b1e] border border-white/5 shadow-2xl focus-within:border-white/10 focus-within:ring-0 outline-none"
        )}>
          <form onSubmit={handleSend} className="flex-1 flex items-center gap-2 md:gap-4">
            {!isRecordingVoice && (
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                disabled={status !== 'matched'}
                placeholder="Whisper something..."
                className={cn(
                  "flex-1 bg-transparent border-none text-sm md:text-base focus:ring-0 placeholder:text-gray-600 text-white",
                  "disabled:opacity-50 min-w-0 py-2 md:py-0"
                )}
              />
            )}
            
            <div className={cn("flex items-center gap-2 md:gap-4 shrink-0", isRecordingVoice && "flex-1")}>
              <VoiceRecorder 
                onSend={onSendVoice} 
                onRecordingStateChange={setIsRecordingVoice}
                disabled={status !== 'matched'} 
              />
              
              {!isRecordingVoice && (
                <motion.button
                  type="submit"
                  disabled={!inputText.trim() || status !== 'matched'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                    "bg-[#5b61e0] text-white disabled:opacity-50 disabled:grayscale"
                  )}
                >
                  <Send size={16} className="md:size-20 ml-0.5 md:ml-1" />
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
};

