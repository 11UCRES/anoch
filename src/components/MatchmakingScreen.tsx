import React, { useState } from 'react';
import { MessageSquare, Users, Shield, Zap, Loader2, Globe, LayoutGrid, MessageCircle, User, Clock, Lock, Settings, MoreHorizontal, Radio, ArrowLeft } from 'lucide-react';
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
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ onStart, isSearching, stats, theme, history, socketId }) => {
  const [activeTab, setActiveTab] = useState<'matchmaking' | 'history' | 'privacy'>('matchmaking');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [username, setUsername] = useState('');

  const handleStart = () => {
    onStart(username.trim() || 'Anonymous');
  };

  return (
    <div className={cn("flex flex-col md:flex-row h-full w-full overflow-hidden", theme.bg)}>
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-72 border-r border-white/5 flex-col bg-[#0a0b0d] z-30">
        <div className="p-6">
          <Logo size={28} />
          <p className="text-gray-500 text-xs mt-2 font-medium">Secure & Encrypted</p>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          <SidebarItem 
            icon={<MessageCircle size={18} />} 
            label="Current Session" 
            active={activeTab === 'matchmaking'} 
            onClick={() => {
              setActiveTab('matchmaking');
              setSelectedHistoryItem(null);
            }}
          />
          <SidebarItem 
            icon={<Clock size={18} />} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => {
              setActiveTab('history');
              setSelectedHistoryItem(null);
            }}
          />
          <SidebarItem 
            icon={<Lock size={18} />} 
            label="Privacy" 
            active={activeTab === 'privacy'} 
            onClick={() => {
              setActiveTab('privacy');
              setSelectedHistoryItem(null);
            }}
          />
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 text-gray-500 text-xs font-bold uppercase tracking-widest">
            <Settings size={14} />
            <span>Settings</span>
          </div>
        </div>
      </aside>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0b0d] border-t border-white/5 flex items-center justify-around px-4 z-50">
        <MobileNavItem 
          icon={<MessageCircle size={20} />} 
          active={activeTab === 'matchmaking'} 
          onClick={() => {
            setActiveTab('matchmaking');
            setSelectedHistoryItem(null);
          }}
        />
        <MobileNavItem 
          icon={<Clock size={20} />} 
          active={activeTab === 'history'} 
          onClick={() => {
            setActiveTab('history');
            setSelectedHistoryItem(null);
          }}
        />
        <MobileNavItem 
          icon={<Lock size={20} />} 
          active={activeTab === 'privacy'} 
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
            <Logo size={24} className="md:hidden" />
            <nav className="hidden lg:flex items-center gap-8">
              <button className="text-blue-400 text-sm font-bold hover:opacity-80 transition-all">Chat</button>
              <button className="text-gray-500 text-sm font-bold hover:text-white transition-all">How it works</button>
              <button className="text-gray-500 text-sm font-bold hover:text-white transition-all">Safety</button>
              <button className="text-gray-500 text-sm font-bold hover:text-white transition-all">Community</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2.5 backdrop-blur-md">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] md:text-xs font-bold text-gray-300 uppercase tracking-widest">
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
                <h1 className="text-5xl md:text-8xl font-black text-white mb-4 md:mb-8 tracking-tighter leading-[0.9]">
                  Connect <br className="hidden md:block" />
                  <span className="text-[#8e94f2] italic">Anonymously</span>
                </h1>
                <p className="text-gray-400 text-base md:text-xl mb-10 md:mb-16 max-w-xl mx-auto leading-relaxed font-medium">
                  Instant 1-to-1 chat. No login. No strings attached. <br className="hidden md:block" />
                  Find your frequency in the digital nocturne.
                </p>

                <div className="bg-[#111216] border border-white/5 rounded-[32px] md:rounded-[48px] p-6 md:p-16 shadow-2xl relative overflow-hidden group max-w-xl mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#8e94f2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#8e94f2]/20 flex items-center justify-center text-[#8e94f2] mb-6 md:mb-8 shadow-inner">
                      <Radio size={32} className={isSearching ? "animate-pulse" : ""} />
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                      {isSearching ? "Searching for a partner..." : "Ready to match?"}
                    </h3>
                    <p className="text-gray-500 mb-8 md:mb-10 font-medium text-sm md:text-base">
                      {isSearching ? "Finding someone compatible..." : "Your identity remains hidden."}
                    </p>

                    {/* Real-time stats display */}
                    <div className="flex items-center justify-center gap-8 mb-10">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-white">{stats.waiting}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Waiting</span>
                      </div>
                      <div className="w-px h-8 bg-white/5" />
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-white">{stats.chatting}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Chatting</span>
                      </div>
                    </div>

                    {isSearching ? (
                      <div className="w-full max-w-xs space-y-6">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-[#8e94f2]"
                            animate={{ x: [-200, 400] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          />
                        </div>
                        <button 
                          onClick={handleStart}
                          className="w-full py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5"
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
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#8e94f2]/50 transition-all text-center font-bold"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-16 text-left">
                  <FeatureItem 
                    icon={<Zap className="text-pink-500" size={20} />}
                    title="Instant Match"
                    desc="Matches you with the best partner in seconds."
                  />
                  <FeatureItem 
                    icon={<User className="text-blue-500" size={20} />}
                    title="Real People"
                    desc="Always talking to a real human being."
                  />
                  <FeatureItem 
                    icon={<Lock className="text-green-500" size={20} />}
                    title="End-to-End"
                    desc="Your conversations vanish instantly."
                  />
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
                        className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white transition-all"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="text-left">
                        <h2 className="text-2xl font-black text-white">Chat with {selectedHistoryItem.partnerUsername}</h2>
                        <p className="text-gray-500 text-sm font-medium">
                          {new Date(selectedHistoryItem.timestamp).toLocaleDateString()} at {new Date(selectedHistoryItem.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 bg-[#111216] border border-white/5 p-6 rounded-[40px] max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {selectedHistoryItem.messages.map((msg) => (
                        <div key={msg.id} className={cn(
                          "flex flex-col",
                          msg.senderId === 'system' ? "items-center" : (msg.senderId === socketId ? "items-end" : "items-start")
                        )}>
                          {msg.senderId === 'system' ? (
                            <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              {msg.text}
                            </div>
                          ) : (
                            <div className={cn(
                              "max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium",
                              msg.senderId === socketId ? "bg-[#8e94f2] text-white" : "bg-white/10 text-gray-200"
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
                      <h2 className="text-4xl font-black text-white mb-4">Chat History</h2>
                      <p className="text-gray-500 font-medium">Recent connections from this session.</p>
                    </div>

                    <div className="space-y-4">
                      {history.length > 0 ? (
                        history.map((item) => (
                          <button 
                            key={item.id} 
                            onClick={() => setSelectedHistoryItem(item)}
                            className="w-full bg-[#111216] border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-white/10 transition-all text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                <User size={24} />
                              </div>
                              <div>
                                <h4 className="text-white font-bold">{item.partnerUsername}</h4>
                                <p className="text-gray-500 text-xs font-medium">
                                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.messages.filter(m => m.senderId !== 'system').length} messages
                                </p>
                              </div>
                            </div>
                            <div className="p-2 text-gray-600 group-hover:text-white transition-colors">
                              <Clock size={20} />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-20 bg-[#111216] border border-white/5 rounded-[40px]">
                          <Clock size={48} className="text-gray-700 mx-auto mb-4" />
                          <p className="text-gray-500 font-bold">No history yet.</p>
                          <p className="text-gray-600 text-sm mt-1">Start a chat to see it here.</p>
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
                <h2 className="text-4xl font-black text-white mb-6">Privacy First</h2>
                <div className="bg-[#111216] border border-white/5 p-8 rounded-[40px] text-left space-y-6">
                  <p className="text-gray-400 leading-relaxed">
                    Nocturne is built on the principle of absolute anonymity. We do not track your IP address, we do not store chat logs on our servers, and we do not use cookies for tracking.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                      <span className="text-gray-300 text-sm font-medium">Messages are ephemeral and deleted immediately after a session ends.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                      <span className="text-gray-300 text-sm font-medium">No account required. Your identity is generated randomly.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                      <span className="text-gray-300 text-sm font-medium">Peer-to-peer communication principles where possible.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="p-12 border-t border-white/5 bg-[#050607]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <h2 className="text-white font-black text-xl tracking-tighter">NOCTURNE</h2>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">© 2024 Nocturne Secure Messaging. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Cookies</button>
              <button className="hover:text-white transition-colors">Contact</button>
            </div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors border border-white/10">
                <Globe size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors border border-white/10">
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

const MobileNavItem = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "p-3 rounded-full transition-all",
      active ? "bg-[#8e94f2]/20 text-[#8e94f2]" : "text-gray-500"
    )}
  >
    {icon}
  </button>
);

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
      active 
        ? "bg-[#8e94f2]/10 text-[#8e94f2] shadow-inner" 
        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-6 bg-[#111216] border border-white/5 rounded-3xl">
    <div className="mb-4">{icon}</div>
    <h4 className="text-white font-bold mb-2">{title}</h4>
    <p className="text-gray-500 text-sm font-medium leading-relaxed">{desc}</p>
  </div>
);

