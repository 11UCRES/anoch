import React, { useState } from 'react';
import { MessageSquare, Users, Shield, Zap, Loader2, Globe, LayoutGrid, MessageCircle, User, Clock, Lock, Settings, MoreHorizontal, Radio, ArrowLeft, Trash2, X, Mail, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Stats, HistoryItem } from '@/src/types';
import { Theme } from '@/src/themes';
import { cn } from '@/src/lib/utils';
import { Logo } from './Logo';

interface MatchmakingScreenProps {
  onStart: (username: string) => void;
  isSearching: boolean;
  stats: Stats;
  theme: Theme;
  history: HistoryItem[];
  socketId: string | null;
  onDeleteHistory: (id: string) => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ onStart, isSearching, stats, theme, history, socketId, onDeleteHistory }) => {
  const [activeTab, setActiveTab] = useState<'matchmaking' | 'history' | 'privacy'>('matchmaking');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [hoveredHistoryId, setHoveredHistoryId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean, type: 'tos' | 'privacy' | 'cookies' | 'contact' | null }>({
    isOpen: false,
    type: null
  });

  const handleStart = () => {
    onStart(username.trim() || 'Anonymous');
  };

  return (
    <div className={cn("flex flex-col md:flex-row h-full w-full overflow-hidden", theme.bg)}>
      {/* Sidebar (Desktop) */}
      <aside className={cn(
        "hidden md:flex w-72 border-r flex-col z-30",
        theme.sidebar,
        theme.border
      )}>
        <div className="p-6">
          <Logo size={28} theme={theme} />
          <p className={cn("text-xs mt-2 font-medium", theme.textMuted)}>Secure & Encrypted</p>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          <SidebarItem 
            icon={<MessageCircle size={18} />} 
            label="Current Session" 
            active={activeTab === 'matchmaking'} 
            theme={theme}
            onClick={() => {
              setActiveTab('matchmaking');
              setSelectedHistoryItem(null);
            }}
          />
          <SidebarItem 
            icon={<Clock size={18} />} 
            label="History" 
            active={activeTab === 'history'} 
            theme={theme}
            onClick={() => {
              setActiveTab('history');
              setSelectedHistoryItem(null);
            }}
          />
          <SidebarItem 
            icon={<Lock size={18} />} 
            label="Privacy" 
            active={activeTab === 'privacy'} 
            theme={theme}
            onClick={() => {
              setActiveTab('privacy');
              setSelectedHistoryItem(null);
            }}
          />
        </nav>

        <div className={cn("p-6 border-t", theme.border)}>
        </div>
      </aside>

      {/* Bottom Navigation (Mobile) */}
      <nav className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-4 z-50",
        theme.sidebar,
        theme.border
      )}>
        <MobileNavItem 
          icon={<MessageCircle size={20} />} 
          active={activeTab === 'matchmaking'} 
          theme={theme}
          onClick={() => {
            setActiveTab('matchmaking');
            setSelectedHistoryItem(null);
          }}
        />
        <MobileNavItem 
          icon={<Clock size={20} />} 
          active={activeTab === 'history'} 
          theme={theme}
          onClick={() => {
            setActiveTab('history');
            setSelectedHistoryItem(null);
          }}
        />
        <MobileNavItem 
          icon={<Lock size={20} />} 
          active={activeTab === 'privacy'} 
          theme={theme}
          onClick={() => {
            setActiveTab('privacy');
            setSelectedHistoryItem(null);
          }}
        />
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col overflow-y-auto custom-scrollbar pb-20 md:pb-0">
        {/* Top Header */}
        <header className="w-full max-w-7xl mx-auto p-4 md:p-8 flex justify-between items-center z-20">
          <div className="flex items-center gap-8">
            <Logo size={24} className="md:hidden cursor-pointer hover:opacity-80 transition-opacity" theme={theme} />
          </div>
          <div className="flex items-center gap-4">
            <div className={cn(
              "px-4 py-2 rounded-full border flex items-center gap-2.5 backdrop-blur-md",
              theme.accent,
              theme.border
            )}>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className={cn("text-[10px] md:text-xs font-bold uppercase tracking-widest", theme.text)}>
                {stats.online.toLocaleString()} <span className="hidden sm:inline">Active</span>
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-12 py-8 md:py-16 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'matchmaking' && (
              <motion.div
                key="matchmaking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl text-center"
              >
                <h1 className={cn("text-5xl md:text-8xl font-black mb-4 md:mb-8 tracking-tighter leading-[0.9]", theme.text)}>
                  Secure <br className="hidden md:block" />
                  <span className="text-[#8e94f2] italic">Anonymous Chat</span>
                </h1>
                <p className={cn("text-base md:text-xl mb-10 md:mb-16 max-w-xl mx-auto leading-relaxed font-medium", theme.textMuted)}>
                  Experience the best random stranger messaging platform. Instant 1-to-1 private chat with no registration. Find your frequency in the digital nocturne.
                </p>

                <div className={cn(
                  "border rounded-[32px] md:rounded-[48px] p-6 md:p-16 shadow-2xl relative overflow-hidden group max-w-xl mx-auto",
                  theme.card,
                  theme.border
                )}>
                  <div className="absolute inset-0 bg-gradient-to-b from-[#8e94f2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#8e94f2]/20 flex items-center justify-center text-[#8e94f2] mb-6 md:mb-8 shadow-inner">
                      <Radio size={32} className={isSearching ? "animate-pulse" : ""} />
                    </div>

                    <h3 className={cn("text-xl md:text-2xl font-bold mb-2", theme.text)}>
                      {isSearching ? "Searching for a partner..." : "Ready to match?"}
                    </h3>
                    <p className={cn("mb-8 md:mb-10 font-medium text-sm md:text-base", theme.textMuted)}>
                      {isSearching ? "Finding someone compatible..." : "Your identity remains hidden."}
                    </p>

                    {/* Real-time stats display */}
                    <div className="flex items-center justify-center gap-8 mb-10">
                      <div className="flex flex-col items-center">
                        <span className={cn("text-2xl font-black", theme.text)}>{stats.waiting}</span>
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", theme.textMuted)}>Waiting</span>
                      </div>
                      <div className={cn("w-px h-8", theme.border, "bg-current opacity-10")} />
                      <div className="flex flex-col items-center">
                        <span className={cn("text-2xl font-black", theme.text)}>{stats.chatting}</span>
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", theme.textMuted)}>Chatting</span>
                      </div>
                    </div>

                    {isSearching ? (
                      <div className="w-full max-w-xs space-y-6">
                        <div className={cn("h-1.5 w-full rounded-full overflow-hidden", theme.accent)}>
                          <motion.div 
                            className="h-full bg-[#8e94f2]"
                            animate={{ x: [-200, 400] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          />
                        </div>
                        <button 
                          onClick={handleStart}
                          className={cn(
                            "w-full py-4 rounded-2xl font-bold transition-all border",
                            theme.accent,
                            theme.text,
                            theme.border,
                            "hover:opacity-80"
                          )}
                        >
                          Cancel Search
                        </button>
                      </div>
                    ) : (
                      <div className="w-full max-w-sm space-y-4 md:space-y-6">
                        <div className="relative">
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.slice(0, 15))}
                            placeholder="Username (optional)"
                            className={cn(
                              "w-full border rounded-2xl px-6 py-4 outline-none transition-all text-center font-bold",
                              theme.input,
                              theme.text,
                              theme.border,
                              "focus:border-[#8e94f2]/50"
                            )}
                          />
                        </div>
                        <button 
                          onClick={handleStart}
                          className="w-full py-4 md:py-5 rounded-2xl bg-[#8e94f2] text-white font-black text-lg md:text-xl shadow-xl shadow-[#8e94f2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Start Matchmaking
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feature Grid */}
                <div className="w-full max-w-4xl mt-20 md:mt-32">
                  <h2 className={cn("text-2xl md:text-4xl font-black mb-8 md:mb-12 text-center", theme.text)}>
                    Why Choose Nocturne for <span className="text-[#8e94f2]">Private Messaging</span>?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left">
                    <FeatureItem 
                      icon={<Zap className="text-pink-500" size={20} />}
                      title="Instant Random Match"
                      desc="Our advanced matchmaking algorithm connects you with the best partner in seconds for seamless random chat."
                      theme={theme}
                    />
                    <FeatureItem 
                      icon={<User className="text-blue-500" size={20} />}
                      title="Real People, No Bots"
                      desc="Engage in authentic conversations with real strangers from around the world. No AI, just human connection."
                      theme={theme}
                    />
                    <FeatureItem 
                      icon={<Lock className="text-green-500" size={20} />}
                      title="End-to-End Privacy"
                      desc="Your identity is hidden and conversations vanish instantly. We prioritize your digital safety and anonymity."
                      theme={theme}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-2xl"
              >
                {selectedHistoryItem ? (
                  <div className="w-full">
                    <div className="flex items-center gap-4 mb-8">
                      <button 
                        onClick={() => setSelectedHistoryItem(null)}
                        className={cn("p-2 rounded-full transition-all", theme.accent, theme.textMuted, "hover:" + theme.text)}
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="text-left">
                        <h2 className={cn("text-2xl font-black", theme.text)}>Chat with {selectedHistoryItem.partnerUsername}</h2>
                        <p className={cn("text-sm font-medium", theme.textMuted)}>
                          {new Date(selectedHistoryItem.timestamp).toLocaleDateString()} at {new Date(selectedHistoryItem.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className={cn(
                      "space-y-4 border p-6 rounded-[40px] max-h-[60vh] overflow-y-auto custom-scrollbar",
                      theme.card,
                      theme.border
                    )}>
                      {selectedHistoryItem.messages.map((msg) => (
                        <div key={msg.id} className={cn(
                          "flex flex-col",
                          msg.senderId === 'system' ? "items-center" : (msg.senderId === socketId ? "items-end" : "items-start")
                        )}>
                          {msg.senderId === 'system' ? (
                            <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", theme.accent, theme.textMuted)}>
                              {msg.text}
                            </div>
                          ) : (
                            <div className={cn(
                              "max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium",
                              msg.senderId === socketId ? "bg-[#8e94f2] text-white" : cn(theme.accent, theme.text)
                            )}>
                              {msg.type === 'text' ? msg.text : "Voice Message"}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-12 text-center">
                      <h2 className={cn("text-4xl font-black mb-4", theme.text)}>Chat History</h2>
                      <p className={cn("font-medium", theme.textMuted)}>Recent connections from this session.</p>
                    </div>

                    <div className="space-y-4">
                      {history.length > 0 ? (
                        history.map((item) => (
                          <div key={item.id} className="relative group/item">
                            <button 
                              onClick={() => setSelectedHistoryItem(item)}
                              onMouseEnter={() => setHoveredHistoryId(item.id)}
                              onMouseLeave={() => setHoveredHistoryId(null)}
                              className={cn(
                                "w-full border p-6 rounded-3xl flex items-center justify-between group transition-all text-left relative overflow-hidden",
                                theme.card,
                                theme.border,
                                "hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5"
                              )}
                            >
                              <div className="flex items-center gap-5">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110", theme.accent, theme.textMuted)}>
                                  <Logo size={28} showText={false} theme={theme} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={cn("text-lg font-black tracking-tight mb-0.5", theme.text)}>{item.partnerUsername}</h4>
                                  <p className={cn("text-xs font-medium opacity-60", theme.textMuted)}>
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.messages.filter(m => m.senderId !== 'system').length} messages
                                  </p>
                                </div>
                              </div>
                              <div className={cn("p-2 transition-all group-hover:translate-x-1", theme.textMuted, "group-hover:" + theme.text)}>
                                <Clock size={20} />
                              </div>

                              {/* Hover Preview */}
                              <AnimatePresence>
                                {hoveredHistoryId === item.id && (
                                  <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={cn(
                                      "absolute right-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-end pointer-events-none",
                                      "max-w-[200px]"
                                    )}
                                  >
                                    <div className={cn(
                                      "px-4 py-2 rounded-2xl border backdrop-blur-xl shadow-2xl text-[11px] font-medium line-clamp-2",
                                      theme.accent,
                                      theme.border,
                                      theme.text
                                    )}>
                                      {item.messages.filter(m => m.type === 'text').slice(-1)[0]?.text || "Voice message"}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteHistory(item.id);
                              }}
                              className={cn(
                                "absolute -right-2 top-1/2 -translate-y-1/2 p-3 rounded-full opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-full transition-all hover:bg-red-500/20 hover:text-red-500",
                                theme.textMuted
                              )}
                              title="Delete History"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className={cn("text-center py-20 border rounded-[40px]", theme.card, theme.border)}>
                          <Clock size={48} className={cn("mx-auto mb-4 opacity-20", theme.text)} />
                          <p className={cn("font-bold", theme.text)}>No history yet.</p>
                          <p className={cn("text-sm mt-1", theme.textMuted)}>Start a chat to see it here.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl text-center"
              >
                <Shield size={64} className="text-green-500 mx-auto mb-8" />
                <h2 className={cn("text-4xl font-black mb-6", theme.text)}>Privacy First</h2>
                <div className={cn("border p-8 rounded-[40px] text-left space-y-6", theme.card, theme.border)}>
                  <p className={cn("leading-relaxed", theme.textMuted)}>
                    Nocturne is built on the principle of absolute anonymity. We do not track your IP address, we do not store chat logs on our servers, and we do not use cookies for tracking.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                      <span className={cn("text-sm font-medium", theme.text)}>Messages are ephemeral and deleted immediately after a session ends.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                      <span className={cn("text-sm font-medium", theme.text)}>No account required. Your identity is generated randomly.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                      <span className={cn("text-sm font-medium", theme.text)}>Peer-to-peer communication principles where possible.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {legalModal.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLegalModal({ isOpen: false, type: null })}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={cn(
                  "relative w-full max-w-2xl max-h-[80vh] overflow-hidden border rounded-[40px] shadow-2xl flex flex-col",
                  theme.card,
                  theme.border
                )}
              >
                <div className={cn("p-6 md:p-8 border-b flex items-center justify-between", theme.border)}>
                  <h2 className={cn("text-2xl font-black tracking-tight", theme.text)}>
                    {legalModal.type === 'tos' && "Terms of Service"}
                    {legalModal.type === 'privacy' && "Privacy Policy"}
                    {legalModal.type === 'cookies' && "Cookie Policy"}
                    {legalModal.type === 'contact' && "Contact Us"}
                  </h2>
                  <button 
                    onClick={() => setLegalModal({ isOpen: false, type: null })}
                    className={cn("p-2 rounded-full transition-all", theme.accent, theme.textMuted, "hover:" + theme.text)}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                  <div className={cn("space-y-6 text-sm md:text-base leading-relaxed", theme.textMuted)}>
                    {legalModal.type === 'tos' && (
                      <>
                        <p>Welcome to Nocturne. By using our service, you agree to these terms.</p>
                        <section className="space-y-3">
                          <h3 className={cn("text-lg font-bold", theme.text)}>1. Use of Service</h3>
                          <p>Nocturne provides an anonymous 1-to-1 chat platform. You must be at least 18 years old to use this service.</p>
                        </section>
                        <section className="space-y-3">
                          <h3 className={cn("text-lg font-bold", theme.text)}>2. Prohibited Conduct</h3>
                          <p>You agree not to use Nocturne for any illegal purposes, harassment, spam, or distribution of harmful content. We reserve the right to terminate access for violations.</p>
                        </section>
                        <section className="space-y-3">
                          <h3 className={cn("text-lg font-bold", theme.text)}>3. Disclaimer</h3>
                          <p>The service is provided "as is". We are not responsible for the content of messages exchanged between users.</p>
                        </section>
                      </>
                    )}
                    {legalModal.type === 'privacy' && (
                      <>
                        <p>Your privacy is our core mission.</p>
                        <section className="space-y-3">
                          <h3 className={cn("text-lg font-bold", theme.text)}>1. Data Collection</h3>
                          <p>We do not collect personal information, IP addresses, or browser fingerprints. No registration is required.</p>
                        </section>
                        <section className="space-y-3">
                          <h3 className={cn("text-lg font-bold", theme.text)}>2. Message Ephemerality</h3>
                          <p>All messages are stored in-memory only and are permanently deleted once a session ends or a user disconnects.</p>
                        </section>
                        <section className="space-y-3">
                          <h3 className={cn("text-lg font-bold", theme.text)}>3. Third Parties</h3>
                          <p>We do not share any data with third parties because we do not store any data to share.</p>
                        </section>
                      </>
                    )}
                    {legalModal.type === 'cookies' && (
                      <>
                        <p>Nocturne uses minimal cookies for essential functionality.</p>
                        <section className="space-y-3">
                          <h3 className={cn("text-lg font-bold", theme.text)}>1. Essential Cookies</h3>
                          <p>We use session-based storage to maintain your connection state and theme preferences during your visit.</p>
                        </section>
                        <section className="space-y-3">
                          <h3 className={cn("text-lg font-bold", theme.text)}>2. No Tracking</h3>
                          <p>We do not use advertising or tracking cookies. Your browsing behavior is not monitored.</p>
                        </section>
                      </>
                    )}
                    {legalModal.type === 'contact' && (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
                        <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                          <Mail size={40} />
                        </div>
                        <div>
                          <h3 className={cn("text-2xl font-black mb-2", theme.text)}>Get in Touch</h3>
                          <p className="max-w-xs mx-auto">Have questions or feedback? We'd love to hear from you.</p>
                        </div>
                        <a 
                          href="mailto:support@nocturne.chat" 
                          className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                          Email Support <ExternalLink size={18} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className={cn("p-12 border-t", theme.sidebar, theme.border)}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <h2 className={cn("font-black text-xl tracking-tighter", theme.text)}>NOCTURNE</h2>
              <p className={cn("text-xs font-bold uppercase tracking-widest", theme.textMuted)}>© 2024 Nocturne Secure Messaging. All rights reserved.</p>
            </div>
            <div className={cn("flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest", theme.textMuted)}>
              <button onClick={() => setLegalModal({ isOpen: true, type: 'tos' })} className={cn("transition-colors hover:" + theme.text)}>Terms of Service</button>
              <button onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })} className={cn("transition-colors hover:" + theme.text)}>Privacy Policy</button>
              <button onClick={() => setLegalModal({ isOpen: true, type: 'cookies' })} className={cn("transition-colors hover:" + theme.text)}>Cookies</button>
              <button onClick={() => setLegalModal({ isOpen: true, type: 'contact' })} className={cn("transition-colors hover:" + theme.text)}>Contact</button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

const MobileNavItem = ({ icon, active, theme, onClick }: { icon: React.ReactNode, active: boolean, theme: Theme, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "p-3 rounded-full transition-all",
      active ? "bg-[#8e94f2]/20 text-[#8e94f2]" : theme.textMuted
    )}
  >
    {icon}
  </button>
);

const SidebarItem = ({ icon, label, active, theme, onClick }: { icon: React.ReactNode, label: string, active: boolean, theme: Theme, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
      active 
        ? "bg-[#8e94f2]/10 text-[#8e94f2] shadow-inner" 
        : cn(theme.textMuted, "hover:" + theme.text, "hover:bg-white/5")
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const FeatureItem = ({ icon, title, desc, theme }: { icon: React.ReactNode, title: string, desc: string, theme: Theme }) => (
  <div className={cn("p-6 border rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-300", theme.card, theme.border)}>
    <div className="mb-4">{icon}</div>
    <h4 className={cn("font-bold mb-2", theme.text)}>{title}</h4>
    <p className={cn("text-sm font-medium leading-relaxed", theme.textMuted)}>{desc}</p>
  </div>
);

