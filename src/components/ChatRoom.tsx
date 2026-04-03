import React, { useState, useEffect, useRef } from 'react';
import { Send, User, LogOut, Loader2, Volume2, Mic, Circle, Smile, Palette, MoreVertical, Play, Pause, Edit2, Trash2, Heart, ThumbsUp, Laugh, Frown } from 'lucide-react';
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
  onEditMessage: (messageId: string, newText: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
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
  onEditMessage,
  onDeleteMessage,
  onAddReaction,
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
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const themePickerRef = useRef<HTMLDivElement>(null);

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
      if (themePickerRef.current && !themePickerRef.current.contains(event.target as Node)) {
        setShowThemePicker(false);
      }
      // Deselect message if clicking outside message bubbles
      const target = event.target as HTMLElement;
      if (!target.closest('.message-bubble') && !target.closest('.message-actions')) {
        setSelectedMessageId(null);
        setShowReactionsFor(null);
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
                {partnerUsername || 'Stranger'}
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
          <div className="relative" ref={themePickerRef}>
            <motion.button
              onClick={() => setShowThemePicker(!showThemePicker)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
              title="Change Theme"
            >
              <Palette size={16} className="md:size-18" />
            </motion.button>

            <AnimatePresence>
              {showThemePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 bg-[#1a1b23]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl z-50 min-w-[200px]"
                >
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Professional Themes</div>
                  <div className="grid grid-cols-1 gap-1">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t);
                          setShowThemePicker(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all hover:bg-white/5 group",
                          theme.id === t.id && "bg-white/10"
                        )}
                      >
                        <div className={cn("w-4 h-4 rounded-full shadow-inner", t.primary)} />
                        <span className="text-xs font-bold text-white group-hover:translate-x-1 transition-transform">{t.name}</span>
                        {theme.id === t.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
            const canEdit = isMe && msg.type === 'text' && !msg.isDeleted && (Date.now() - msg.timestamp < 5 * 60 * 1000);
            const isSelected = selectedMessageId === msg.id;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col w-full relative group/message px-2 md:px-4",
                  isMe ? "items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "flex items-center gap-2 mb-2 px-1",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}>
                  <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">
                    {isMe ? "You" : partnerUsername || "Stranger"}
                  </span>
                  {msg.isEdited && (
                    <span className="text-[9px] font-bold text-gray-600 italic lowercase opacity-50">edited</span>
                  )}
                </div>

                <div className={cn(
                  "flex items-center gap-3 w-full",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}>
                  <motion.div 
                    onClick={() => setSelectedMessageId(isSelected ? null : msg.id)}
                    className={cn(
                      "px-4 md:px-6 py-2.5 md:py-3.5 shadow-2xl relative cursor-pointer active:scale-[0.99] transition-all duration-300 message-bubble w-fit",
                      "backdrop-blur-xl border border-white/10",
                      isMe 
                        ? (theme.primary + " text-white rounded-[20px] rounded-tr-none shadow-blue-500/10") 
                        : (theme.accent + " text-gray-100 rounded-[20px] rounded-tl-none shadow-black/20"),
                      msg.isDeleted && "opacity-30 grayscale italic",
                      isSelected && "ring-2 ring-white/40 scale-[1.01] z-20 shadow-white/10"
                    )}
                  >
                    {editingMessageId === msg.id ? (
                      <div className="flex flex-col gap-4 min-w-[240px] md:min-w-[300px]" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm md:text-base text-white focus:outline-none focus:border-white/40 resize-none placeholder:text-white/10 shadow-inner"
                          rows={4}
                          autoFocus
                          placeholder="Edit your message..."
                        />
                        <div className="flex justify-end gap-4">
                          <button 
                            onClick={() => {
                              setEditingMessageId(null);
                              setSelectedMessageId(null);
                            }}
                            className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => {
                              onEditMessage(msg.id, editText);
                              setEditingMessageId(null);
                              setSelectedMessageId(null);
                            }}
                            className="text-[11px] font-black uppercase tracking-[0.2em] text-white hover:underline decoration-2 underline-offset-8"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ) : msg.type === 'text' ? (
                      <p className="text-[15px] md:text-[16px] leading-relaxed whitespace-pre-wrap break-words font-medium tracking-tight">
                        {msg.text}
                      </p>
                    ) : (
                      <div className="flex items-center gap-4 md:gap-5 min-w-[200px] md:min-w-[260px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAudio(msg.id, msg.audio!);
                          }}
                          className={cn(
                            "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xl",
                            isMe ? "bg-white/30 text-white hover:bg-white/40" : "bg-white/10 text-[#8e94f2] hover:bg-white/20"
                          )}
                        >
                          {playingMessageId === msg.id && isAudioPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
                        </button>
                        <div className="flex-1 flex items-center gap-4 md:gap-5">
                          <div className="flex-1 flex gap-[3px] h-8 md:h-10 items-center">
                            {[...Array(16)].map((_, i) => (
                              <div 
                                key={i} 
                                className={cn(
                                  "w-[2px] md:w-[3px] rounded-full transition-all duration-700",
                                  isMe ? "bg-white/50" : "bg-white/30"
                                )}
                                style={{ 
                                  height: `${15 + Math.random() * 85}%`,
                                  opacity: playingMessageId === msg.id && isAudioPlaying ? 1 : 0.4
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] md:text-[12px] font-black font-mono opacity-40">
                            {formatAudioTime(audioDurations[msg.id] || 0)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Reactions Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="absolute -bottom-5 right-0 flex flex-wrap gap-1.5 z-30 justify-end">
                        {Object.entries(msg.reactions).map(([emoji, uids]) => {
                          const userIds = uids as string[];
                          const hasReacted = userIds.includes(socketId!);
                          return (
                            <motion.button 
                              initial={{ scale: 0, y: 5 }}
                              animate={{ scale: 1, y: 0 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              key={emoji}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddReaction(msg.id, emoji);
                              }}
                              className={cn(
                                "backdrop-blur-xl border rounded-full px-2.5 py-1.5 flex items-center gap-2 shadow-2xl transition-all",
                                hasReacted 
                                  ? "bg-white/20 border-white/30 ring-2 ring-white/10" 
                                  : "bg-[#1a1b23]/95 border-white/10"
                              )}
                              title={userIds.length > 1 ? `${userIds.length} reactions` : '1 reaction'}
                            >
                              <span className="text-sm leading-none">{emoji}</span>
                              {userIds.length > 1 && <span className="text-[10px] font-black text-gray-400">{userIds.length}</span>}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>

                  {/* Message Actions (Always show reaction trigger on hover or selection) */}
                  <div className={cn(
                    "flex items-center gap-2 message-actions transition-opacity duration-200",
                    isSelected ? "opacity-100" : "opacity-0 group-message:opacity-100"
                  )}>
                    {!msg.isDeleted && (
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReactionsFor(showReactionsFor === msg.id ? null : msg.id);
                            setSelectedMessageId(msg.id);
                          }}
                          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-all active:scale-90 border border-white/10 shadow-xl"
                        >
                          <Smile size={18} />
                        </button>
                        
                        <AnimatePresence>
                          {showReactionsFor === msg.id && (
                            <motion.div 
                              initial={{ opacity: 0, y: 15, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 15, scale: 0.9 }}
                              className={cn(
                                "absolute bottom-full mb-4 bg-[#1a1b23]/98 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-2 flex gap-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 ring-1 ring-white/10",
                                isMe ? "right-0" : "left-0"
                              )}
                            >
                              {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddReaction(msg.id, emoji);
                                    setShowReactionsFor(null);
                                    setSelectedMessageId(null);
                                  }}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-2xl transition-all text-2xl active:scale-150 hover:scale-125"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {canEdit && isSelected && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMessageId(msg.id);
                            setEditText(msg.text || '');
                          }}
                          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-all active:scale-90 border border-white/10 shadow-xl"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMessage(msg.id);
                            setSelectedMessageId(null);
                          }}
                          className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-all active:scale-90 border border-white/10 shadow-xl"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cn(
                  "text-[10px] mt-4 font-black text-gray-600 uppercase tracking-[0.2em] opacity-30",
                  isMe ? "mr-4" : "ml-4"
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
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className="flex flex-col items-start px-4 md:px-8 mb-8"
            >
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">
                  {partnerUsername || "Stranger"} is typing
                </span>
              </div>
              <div className={cn(
                "px-6 py-4 rounded-3xl rounded-tl-none backdrop-blur-xl border border-white/10 shadow-2xl",
                theme.accent
              )}>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [0, -6, 0],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut"
                      }}
                      className="w-2 h-2 bg-white/60 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                    />
                  ))}
                </div>
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

