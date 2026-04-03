import React, { useState, useEffect, useRef } from 'react';
import { Send, User, LogOut, Loader2, Volume2, Mic, Circle, Smile, Palette, MoreVertical, Play, Pause, Edit2, Trash2, Heart, ThumbsUp, Laugh, Frown, Reply, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, ConnectionStatus } from '@/src/types';
import { VoiceRecorder } from './VoiceRecorder';
import { Logo } from './Logo';
import { cn } from '@/src/lib/utils';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { Theme, themes } from '@/src/themes';

interface ChatRoomProps {
  messages: Message[];
  onSendMessage: (text: string, replyToId?: string) => void;
  onSendVoice: (audio: string, replyToId?: string) => void;
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
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const themePickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      onSendMessage(inputText.trim(), replyToId || undefined);
      setInputText('');
      setReplyToId(null);
      onTyping(false);
      setShowEmojiPicker(false);
      
      // Keep focus on input for mobile keyboard persistence
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
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
    <div className={cn("flex flex-col h-full w-full relative overflow-hidden", theme.bg)}>
      {/* Header */}
      <header className={cn(
        "h-16 md:h-20 border-b flex items-center justify-between px-4 md:px-8 z-40 backdrop-blur-md sticky top-0",
        theme.sidebar,
        theme.border
      )}>
        <div className="flex items-center gap-3 md:gap-4 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#8e94f2] to-[#5b61e0] flex items-center justify-center shadow-lg shadow-[#8e94f2]/20 overflow-hidden">
              <Logo size={24} showText={false} theme={theme} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0a0b0d] shadow-sm" />
          </div>
          <div className="flex flex-col">
            <span className={cn("text-xs md:text-sm font-bold tracking-tight", theme.text)}>
              {partnerUsername || 'Stranger'}
            </span>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-1 h-1 md:w-1.5 md:h-1.5 rounded-full animate-pulse",
                status === 'matched' ? "bg-green-500" : "bg-red-500"
              )} />
              <span className={cn("text-[8px] md:text-[10px] font-bold uppercase tracking-widest", theme.textMuted)}>
                {status === 'matched' ? 'Online' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative" ref={themePickerRef}>
            <motion.button
              onClick={() => setShowThemePicker(!showThemePicker)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all border",
                theme.accent,
                theme.text,
                theme.border,
                "hover:opacity-80"
              )}
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
                  className={cn(
                    "absolute right-0 mt-4 border rounded-3xl p-3 shadow-2xl z-50 min-w-[200px] backdrop-blur-2xl",
                    theme.card,
                    theme.border
                  )}
                >
                  <div className={cn("text-[10px] font-black uppercase tracking-widest mb-3 px-2", theme.textMuted)}>Professional Themes</div>
                  <div className="grid grid-cols-1 gap-1">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t);
                          setShowThemePicker(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all group",
                          theme.id === t.id ? theme.accent : "hover:bg-white/5"
                        )}
                      >
                        <div className={cn("w-4 h-4 rounded-full shadow-inner", t.primary)} />
                        <span className={cn("text-xs font-bold group-hover:translate-x-1 transition-transform", theme.text)}>{t.name}</span>
                        {theme.id === t.id && <div className={cn("ml-auto w-1.5 h-1.5 rounded-full animate-pulse", t.primary)} />}
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
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-6 md:space-y-8 custom-scrollbar relative">
        {/* Date Separator */}
        <div className="flex justify-center my-4 md:my-8">
          <div className={cn("px-3 md:px-4 py-1 rounded-full border", theme.accent, theme.border)}>
            <span className={cn("text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase", theme.textMuted)}>Today</span>
          </div>
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((msg) => {
            if (msg.senderId === 'system') {
              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="flex justify-center w-full my-4"
                >
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                    theme.accent,
                    theme.textMuted,
                    theme.border
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
                  <span className={cn("text-[10px] font-black tracking-[0.2em] uppercase", theme.textMuted)}>
                    {isMe ? "You" : partnerUsername || "Stranger"}
                  </span>
                  {msg.isEdited && (
                    <span className={cn("text-[9px] font-bold italic lowercase opacity-50", theme.textMuted)}>edited</span>
                  )}
                </div>

                <div className={cn(
                  "flex items-center gap-3 w-full",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}>
                  <motion.div 
                    layout
                    onClick={() => setSelectedMessageId(isSelected ? null : msg.id)}
                    className={cn(
                      "px-4 md:px-6 py-2.5 md:py-3.5 shadow-2xl relative cursor-pointer active:scale-[0.99] transition-all duration-300 message-bubble w-fit",
                      "backdrop-blur-xl border",
                      isMe 
                        ? (theme.primary + " text-white rounded-[20px] rounded-tr-none shadow-blue-500/10 border-white/10") 
                        : (theme.accent + " " + theme.text + " rounded-[20px] rounded-tl-none shadow-black/20 " + theme.border),
                      msg.isDeleted && "opacity-30 grayscale italic",
                      isSelected && "ring-2 ring-blue-500/40 scale-[1.01] z-20 shadow-blue-500/10"
                    )}
                  >
                    {msg.replyToId && !msg.isDeleted && (
                      <div className={cn(
                        "mb-3 p-3 rounded-xl border-l-4 text-xs bg-black/10 backdrop-blur-md",
                        isMe ? "border-white/40" : "border-blue-500/40"
                      )}>
                        {(() => {
                          const repliedMsg = messages.find(m => m.id === msg.replyToId);
                          if (!repliedMsg) return <span className="italic opacity-50">Original message unavailable</span>;
                          return (
                            <>
                              <div className="font-black mb-1 uppercase tracking-widest opacity-70">
                                {repliedMsg.senderId === socketId ? "You" : partnerUsername || "Stranger"}
                              </div>
                              <div className="truncate max-w-[200px] font-medium opacity-90">
                                {repliedMsg.isDeleted ? "This message was deleted" : (repliedMsg.type === 'voice' ? "Voice message" : repliedMsg.text)}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    {editingMessageId === msg.id ? (
                      <div className="flex flex-col gap-4 min-w-[240px] md:min-w-[300px]" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className={cn(
                            "w-full border rounded-2xl p-4 text-sm md:text-base focus:outline-none resize-none shadow-inner",
                            theme.input,
                            theme.text,
                            theme.border,
                            "focus:border-blue-500/40"
                          )}
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
                            className={cn("text-[11px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity", theme.text)}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => {
                              onEditMessage(msg.id, editText);
                              setEditingMessageId(null);
                              setSelectedMessageId(null);
                            }}
                            className={cn("text-[11px] font-black uppercase tracking-[0.2em] hover:underline decoration-2 underline-offset-8", theme.text)}
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
                            isMe ? "bg-white/30 text-white hover:bg-white/40" : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
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
                                  isMe ? "bg-white/50" : "bg-blue-500/30"
                                )}
                                style={{ 
                                  height: `${15 + Math.random() * 85}%`,
                                  opacity: playingMessageId === msg.id && isAudioPlaying ? 1 : 0.4
                                }}
                              />
                            ))}
                          </div>
                          <span className={cn("text-[10px] md:text-[12px] font-black font-mono opacity-40", isMe ? "text-white" : theme.text)}>
                            {formatAudioTime(audioDurations[msg.id] || 0)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Reactions Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className={cn(
                        "absolute -bottom-5 flex flex-wrap gap-1.5 z-30",
                        isMe ? "right-0 justify-end" : "left-0 justify-start"
                      )}>
                        {Object.entries(msg.reactions).map(([emoji, uids]) => {
                          const userIds = uids as string[];
                          const hasReacted = userIds.includes(socketId!);
                          return (
                            <motion.button 
                              initial={{ scale: 0, y: 5 }}
                              animate={{ scale: 1, y: 0 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              layout
                              key={emoji}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddReaction(msg.id, emoji);
                              }}
                              className={cn(
                                "backdrop-blur-xl border rounded-full px-2.5 py-1.5 flex items-center gap-2 shadow-2xl transition-all",
                                hasReacted 
                                  ? "bg-blue-500/20 border-blue-500/30 ring-2 ring-blue-500/10 text-blue-500" 
                                  : cn(theme.card, theme.border, theme.text)
                              )}
                              title={userIds.length > 1 ? `${userIds.length} reactions` : '1 reaction'}
                            >
                              <AnimatePresence mode="wait">
                                <motion.span 
                                  key={userIds.length}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="text-sm leading-none"
                                >
                                  {emoji}
                                </motion.span>
                              </AnimatePresence>
                              {userIds.length > 1 && (
                                <AnimatePresence mode="wait">
                                  <motion.span 
                                    key={userIds.length}
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={cn("text-[10px] font-black", theme.textMuted)}
                                  >
                                    {userIds.length}
                                  </motion.span>
                                </AnimatePresence>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>

                  {/* Message Actions */}
                  <div className={cn(
                    "flex items-center gap-1.5 md:gap-2 message-actions transition-all duration-200 opacity-100 scale-100 pointer-events-auto",
                    isMe ? "flex-row-reverse" : "flex-row"
                  )}>
                    {!msg.isDeleted && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyToId(msg.id);
                          setSelectedMessageId(null);
                        }}
                        className={cn(
                          "p-2 md:p-2.5 rounded-full transition-all active:scale-90 border shadow-xl",
                          theme.accent,
                          theme.textMuted,
                          "hover:" + theme.text,
                          theme.border
                        )}
                        title="Reply"
                      >
                        <Reply size={16} className="md:size-[18px]" />
                      </button>
                    )}

                    {!msg.isDeleted && (
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReactionsFor(showReactionsFor === msg.id ? null : msg.id);
                            setSelectedMessageId(msg.id);
                          }}
                          className={cn(
                            "p-2 md:p-2.5 rounded-full transition-all active:scale-90 border shadow-xl",
                            theme.accent,
                            theme.textMuted,
                            "hover:" + theme.text,
                            theme.border
                          )}
                        >
                          <Smile size={16} className="md:size-[18px]" />
                        </button>
                        
                        <AnimatePresence>
                          {showReactionsFor === msg.id && (
                            <motion.div 
                              initial={{ opacity: 0, y: 15, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 15, scale: 0.9 }}
                              className={cn(
                                "absolute bottom-full mb-4 border rounded-[2rem] p-1.5 md:p-2 flex gap-1 md:gap-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 backdrop-blur-2xl",
                                theme.card,
                                theme.border,
                                isMe ? "right-0 origin-bottom-right" : "left-0 origin-bottom-left",
                                "max-w-[90vw] md:max-w-none overflow-x-auto no-scrollbar"
                              )}
                            >
                              <div className="flex gap-1 md:gap-1.5 px-1">
                                {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAddReaction(msg.id, emoji);
                                      setShowReactionsFor(null);
                                      setSelectedMessageId(null);
                                    }}
                                    className={cn(
                                      "w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-2xl transition-all text-xl md:text-2xl active:scale-150 hover:scale-125 shrink-0", 
                                      "hover:bg-white/10"
                                    )}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
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
                          className={cn(
                            "p-2.5 rounded-full transition-all active:scale-90 border shadow-xl",
                            theme.accent,
                            theme.textMuted,
                            "hover:" + theme.text,
                            theme.border
                          )}
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
                          className={cn(
                            "p-2.5 rounded-full transition-all active:scale-90 border shadow-xl",
                            theme.accent,
                            theme.textMuted,
                            "hover:bg-red-500/20 hover:text-red-500",
                            theme.border
                          )}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cn(
                  "text-[10px] mt-4 font-black uppercase tracking-[0.2em] opacity-30",
                  theme.textMuted,
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
                <span className={cn("text-[10px] font-black tracking-[0.2em] uppercase", theme.textMuted)}>
                  {partnerUsername || "Stranger"} is typing
                </span>
              </div>
              <div className={cn(
                "px-6 py-4 rounded-3xl rounded-tl-none backdrop-blur-xl border shadow-2xl",
                theme.accent,
                theme.border
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
                      className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.2)]"
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
      <footer className={cn("p-3 md:p-8 relative border-t", theme.sidebar, theme.border)}>
        <AnimatePresence>
          {replyToId && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "mb-4 p-4 rounded-3xl border flex items-center justify-between backdrop-blur-3xl shadow-2xl max-w-4xl mx-auto",
                theme.card,
                theme.border
              )}
            >
              {(() => {
                const replyingTo = messages.find(m => m.id === replyToId);
                if (!replyingTo) return null;
                return (
                  <>
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-1 h-10 bg-blue-500 rounded-full shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", theme.textMuted)}>
                          Replying to {replyingTo.senderId === socketId ? "yourself" : partnerUsername || "Stranger"}
                        </span>
                        <span className={cn("text-sm font-medium truncate", theme.text)}>
                          {replyingTo.isDeleted ? "This message was deleted" : (replyingTo.type === 'voice' ? "Voice message" : replyingTo.text)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setReplyToId(null)}
                      className={cn("p-2 rounded-full hover:bg-white/10 transition-colors", theme.textMuted)}
                    >
                      <X size={18} />
                    </button>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
        <div className={cn(
          "w-full rounded-full px-4 md:px-6 py-1.5 md:py-3 flex items-center gap-2 md:gap-4 transition-all duration-300 border shadow-2xl",
          theme.input,
          theme.border,
          "focus-within:border-blue-500/30"
        )}>
          <form onSubmit={handleSend} className="flex-1 flex items-center gap-2 md:gap-4">
            {!isRecordingVoice && (
              <div className="relative" ref={emojiPickerRef}>
                <motion.button 
                  type="button"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9, rotate: -5 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={cn(
                    "p-2.5 rounded-full transition-all border shadow-lg",
                    showEmojiPicker ? "bg-blue-500 text-white border-blue-400" : cn(theme.accent, theme.textMuted, theme.border, "hover:" + theme.text)
                  )}
                >
                  <Smile size={20} />
                </motion.button>
                
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
                      className={cn(
                        "absolute bottom-full mb-6 left-0 z-50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden border backdrop-blur-2xl will-change-transform",
                        theme.card,
                        theme.border
                      )}
                    >
                      <div className={cn("p-4 border-b flex items-center justify-between", theme.border)}>
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", theme.textMuted)}>Select Reaction</span>
                        <button 
                          onClick={() => setShowEmojiPicker(false)}
                          className={cn("p-1.5 rounded-full hover:bg-white/10 transition-colors", theme.textMuted)}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                      <EmojiPicker 
                        onEmojiClick={onEmojiClick}
                        theme={theme.id === 'light' ? EmojiTheme.LIGHT : EmojiTheme.DARK}
                        lazyLoadEmojis={true}
                        previewConfig={{ showPreview: false }}
                        skinTonesDisabled={true}
                        searchDisabled={false}
                        height={380}
                        width={300}
                        autoFocusSearch={false}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!isRecordingVoice && (
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={handleInputChange}
                disabled={status !== 'matched'}
                placeholder="Whisper something..."
                className={cn(
                  "flex-1 bg-transparent border-none text-sm md:text-base focus:ring-0 placeholder:text-gray-500",
                  theme.text,
                  "disabled:opacity-50 min-w-0 py-2 md:py-0"
                )}
              />
            )}
            
            <div className={cn("flex items-center gap-2 md:gap-4 shrink-0", isRecordingVoice && "flex-1")}>
              <VoiceRecorder 
                onSend={(audio) => {
                  onSendVoice(audio, replyToId || undefined);
                  setReplyToId(null);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                }} 
                onRecordingStateChange={setIsRecordingVoice}
                disabled={status !== 'matched'} 
                theme={theme}
              />
              
              {!isRecordingVoice && (
                <motion.button
                  type="submit"
                  disabled={!inputText.trim() || status !== 'matched'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                    inputText.trim() && status === 'matched'
                      ? "bg-blue-500 text-white shadow-blue-500/20"
                      : cn(theme.accent, theme.textMuted, "opacity-50")
                  )}
                >
                  <Send size={16} className="md:size-20 ml-0.5 md:ml-1" />
                </motion.button>
              )}
            </div>
          </form>
        </div>
        <p className={cn("text-[10px] font-bold text-center mt-3 uppercase tracking-widest opacity-30", theme.textMuted)}>
          Messages are end-to-end encrypted and vanish instantly.
        </p>
      </footer>
    </div>
  );
};

