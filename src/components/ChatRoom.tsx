import React, { useState, useEffect, useRef } from 'react';
import { Send, User, LogOut, Loader2, Volume2, Mic, Circle, Smile, Palette } from 'lucide-react';
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
      "flex flex-col h-full w-full max-w-2xl mx-auto md:shadow-2xl md:rounded-2xl overflow-hidden border-x border-gray-100 transition-colors duration-300",
      theme.bg
    )}>
      {/* Header */}
      <header className={cn(
        "border-b px-6 py-4 flex items-center justify-between z-20 backdrop-blur-md bg-opacity-80 sticky top-0",
        theme.bg === 'bg-white' ? "border-gray-100 bg-white" : "border-gray-800 bg-opacity-90"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            theme.accent
          )}>
            <User size={24} className={theme.id === 'light' ? "text-blue-600" : "text-white"} />
          </div>
          <div>
            <h2 className={cn("font-bold", theme.text)}>{partnerUsername}</h2>
            <div className="flex items-center gap-1.5">
              <Circle 
                size={8} 
                className={cn(
                  status === 'matched' ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300 animate-pulse"
                )} 
              />
              <span className="text-xs text-gray-500 font-medium">
                {status === 'matched' ? "Connected" : "Finding partner..."}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className={cn(
                "p-2 rounded-full transition-colors",
                theme.id === 'light' ? "hover:bg-gray-100 text-gray-600" : "hover:bg-gray-800 text-gray-400"
              )}
              title="Change Theme"
            >
              <Palette size={20} />
            </button>
            <AnimatePresence>
              {showThemePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className={cn(
                    "absolute right-0 mt-2 p-2 rounded-xl shadow-xl border z-50 flex flex-col gap-1 min-w-[120px]",
                    theme.id === 'light' ? "bg-white border-gray-100" : "bg-gray-800 border-gray-700"
                  )}
                >
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onThemeChange(t);
                        setShowThemePicker(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                        theme.id === t.id 
                          ? (theme.id === 'light' ? "bg-blue-50 text-blue-600" : "bg-gray-700 text-white")
                          : (theme.id === 'light' ? "hover:bg-gray-50 text-gray-600" : "hover:bg-gray-700 text-gray-400")
                      )}
                    >
                      <div className={cn("w-3 h-3 rounded-full", t.primary)} />
                      {t.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={onNext}
            animate={status === 'disconnected' ? { scale: [1, 1.05, 1] } : {}}
            transition={status === 'disconnected' ? { repeat: Infinity, duration: 1.5 } : {}}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95",
              status === 'disconnected' 
                ? (theme.id === 'light' ? "bg-blue-600 text-white shadow-lg" : "bg-indigo-600 text-white shadow-lg")
                : (theme.id === 'light' ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : "bg-gray-800 hover:bg-gray-700 text-gray-200")
            )}
            title="Find Next Partner"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Next</span>
          </motion.button>
        </div>
      </header>

      {/* Messages Area */}
      <div className={cn(
        "flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative",
        theme.id === 'light' ? "bg-gray-50/50" : "bg-black/20"
      )}>
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
                  "flex w-full",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[80%] px-4 py-3 rounded-2xl shadow-sm",
                  isMe 
                    ? (theme.primary + " text-white rounded-tr-none") 
                    : (theme.id === 'light' ? "bg-white text-gray-800 border border-gray-100" : "bg-gray-800 text-gray-100 border border-gray-700") + " rounded-tl-none"
                )}>
                  {msg.type === 'text' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  ) : (
                    <button
                      onClick={() => playAudio(msg.audio!)}
                      className={cn(
                        "flex items-center gap-3 group transition-opacity active:opacity-70",
                        isMe ? "text-white" : (theme.id === 'light' ? "text-blue-600" : "text-indigo-400")
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-full",
                        isMe ? "bg-white/20" : (theme.id === 'light' ? "bg-blue-50" : "bg-gray-700")
                      )}>
                        <Volume2 size={20} />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">Voice Message</span>
                        <span className="text-[10px] opacity-60">Click to play</span>
                      </div>
                    </button>
                  )}
                  <div className={cn(
                    "text-[10px] mt-1.5 opacity-50",
                    isMe ? "text-right" : "text-left"
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {isPartnerTyping && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-gray-400 text-xs font-medium italic ml-2"
          >
            <div className="flex gap-1">
              <Circle size={4} className="fill-gray-400 text-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <Circle size={4} className="fill-gray-400 text-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <Circle size={4} className="fill-gray-400 text-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            Partner is typing...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className={cn(
        "p-4 border-t transition-colors duration-300 relative",
        theme.id === 'light' ? "bg-white border-gray-100" : "bg-gray-900 border-gray-800"
      )}>
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              ref={emojiPickerRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full right-4 mb-4 z-50"
            >
              <EmojiPicker 
                onEmojiClick={onEmojiClick} 
                theme={theme.id === 'light' ? EmojiTheme.LIGHT : EmojiTheme.DARK}
                width={300}
                height={400}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="flex items-center gap-3">
          <div className="flex-1 relative flex items-center">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={cn(
                "absolute left-3 p-1.5 rounded-full transition-colors z-10",
                theme.id === 'light' ? "text-gray-400 hover:bg-gray-200" : "text-gray-500 hover:bg-gray-800"
              )}
            >
              <Smile size={20} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              disabled={status !== 'matched'}
              placeholder={
                status === 'matched' 
                  ? "Type a message..." 
                  : status === 'disconnected' 
                    ? "Partner disconnected. Click Next." 
                    : "Waiting for partner..."
              }
              className={cn(
                "w-full pl-12 pr-12 py-3 border-none rounded-full text-sm focus:ring-2 transition-all disabled:opacity-50",
                theme.id === 'light' ? "bg-gray-100 focus:ring-blue-500 text-gray-900" : "bg-gray-800 focus:ring-indigo-500 text-white"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
               <VoiceRecorder onSend={onSendVoice} disabled={status !== 'matched'} />
            </div>
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || status !== 'matched'}
            className={cn(
              "p-3 text-white rounded-full transition-all active:scale-90 disabled:opacity-50",
              theme.primary,
              theme.id === 'light' ? "hover:bg-blue-700" : "hover:brightness-110"
            )}
          >
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
};

