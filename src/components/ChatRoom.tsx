import React, { useState, useEffect, useRef } from 'react';
import { Send, User, LogOut, Loader2, Volume2, Mic, Circle, Smile, Palette, MoreVertical, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, ConnectionStatus } from '@/src/types';
import { VoiceRecorder } from './VoiceRecorder';
import { cn } from '@/src/lib/utils';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { Theme, themes } from '@/src/themes';

interface ChatRoomProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendVoice: (audio: string) => void;
  onNext: () => void;
  isPartnerTyping: boolean;
  onTyping: (isTyping: boolean) => void;
  status: ConnectionStatus;
  socketId: string | null;
  partnerUsername: string;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  messages,
  onSendMessage,
  onSendVoice,
  onNext,
  isPartnerTyping,
  onTyping,
  status,
  socketId,
  partnerUsername,
  theme,
  onThemeChange
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const playAudio = (base64: string) => {
    const audio = new Audio(base64);
    audio.play().catch(err => console.error("Error playing audio:", err));
  };

  return (
    <div className={cn(
      "flex flex-col h-full w-full max-w-4xl mx-auto overflow-hidden transition-colors duration-300",
      theme.bg
    )}>
      {/* Header */}
      <header className={cn(
        "px-6 py-6 flex items-center justify-between z-20",
        theme.bg
      )}>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tighter text-white">Nocturne</h1>
          {status === 'matched' && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
              <span className="text-[10px] font-bold tracking-widest text-gray-300 uppercase">Matched</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              "bg-[#8e94f2] text-white shadow-[0_0_15px_rgba(142,148,242,0.3)]"
            )}
          >
            Skip
          </motion.button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className={cn(
        "flex-1 overflow-y-auto px-6 py-4 space-y-8 custom-scrollbar relative",
        theme.bg
      )}>
        {/* Date Separator */}
        <div className="flex justify-center my-8">
          <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Today</span>
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
                  "max-w-[85%] px-5 py-4 rounded-2xl shadow-sm",
                  isMe 
                    ? (theme.primary + " text-white") 
                    : (theme.accent + " text-gray-100")
                )}>
                  {msg.type === 'text' ? (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words font-medium">
                      {msg.text}
                    </p>
                  ) : (
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <button
                        onClick={() => playAudio(msg.audio!)}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
                          isMe ? "bg-white/20 text-white" : "bg-white/10 text-[#8e94f2]"
                        )}
                      >
                        <Volume2 size={20} fill="currentColor" />
                      </button>
                      <div className="flex-1 h-8 flex items-center gap-[2px]">
                        {[...Array(12)].map((_, i) => (
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
                      <span className="text-[10px] font-mono opacity-60">0:12</span>
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
        
        {isPartnerTyping && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-start ml-2"
          >
            <div className="flex items-center gap-3 text-gray-500 text-xs font-medium italic">
              <div className="flex gap-1">
                <Circle size={4} className="fill-gray-600 text-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <Circle size={4} className="fill-gray-600 text-gray-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <Circle size={4} className="fill-gray-600 text-gray-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[13px] text-gray-500">Stranger is typing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="p-8 relative">
        <div className={cn(
          "max-w-4xl mx-auto rounded-full px-6 py-3 flex items-center gap-4 transition-all duration-300",
          "bg-[#1a1b1e] border border-white/5 shadow-2xl"
        )}>
          <button className="text-gray-500 hover:text-white transition-colors">
            <Plus size={24} />
          </button>
          
          <form onSubmit={handleSend} className="flex-1 flex items-center gap-4">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              disabled={status !== 'matched'}
              placeholder="Whisper something..."
              className={cn(
                "w-full bg-transparent border-none text-base focus:ring-0 placeholder:text-gray-600 text-white",
                "disabled:opacity-50"
              )}
            />
            
            <div className="flex items-center gap-4">
              <button 
                type="button"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Mic size={24} />
              </button>
              
              <motion.button
                type="submit"
                disabled={!inputText.trim() || status !== 'matched'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                  "bg-[#5b61e0] text-white disabled:opacity-50 disabled:grayscale"
                )}
              >
                <Send size={20} className="ml-1" />
              </motion.button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
};

