import React, { useState } from 'react';
import { MessageSquare, Users, Shield, Zap, Loader2, Globe, LayoutGrid, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Stats } from '@/src/types';
import { Theme } from '@/src/themes';
import { cn } from '@/src/lib/utils';
import { GlobalWall } from './GlobalWall';

interface MatchmakingScreenProps {
  onStart: (username: string) => void;
  isSearching: boolean;
  stats: Stats;
  theme: Theme;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ onStart, isSearching, stats, theme }) => {
  const [activeTab, setActiveTab] = useState<'matchmaking' | 'global'>('matchmaking');
  const [username, setUsername] = useState('');

  const handleStart = () => {
    onStart(username.trim() || 'Anonymous');
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-full w-full max-w-md mx-auto text-center px-6 py-12 transition-colors duration-500",
      theme.bg
    )}>
      {/* Tab Switcher */}
      <div className={cn(
        "flex p-1.5 rounded-full mb-10 border transition-all shadow-sm",
        theme.id === 'light' ? "bg-gray-100 border-gray-200" : "bg-gray-800 border-gray-700"
      )}>
        <button
          onClick={() => setActiveTab('matchmaking')}
          className={cn(
            "flex items-center gap-2 px-8 py-2.5 rounded-full text-xs font-black transition-all uppercase tracking-widest",
            activeTab === 'matchmaking' 
              ? (theme.id === 'light' ? "bg-white text-blue-600 shadow-md" : "bg-gray-700 text-white shadow-md")
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <LayoutGrid size={14} />
          Match
        </button>
        <button
          onClick={() => setActiveTab('global')}
          className={cn(
            "flex items-center gap-2 px-8 py-2.5 rounded-full text-xs font-black transition-all uppercase tracking-widest",
            activeTab === 'global' 
              ? (theme.id === 'light' ? "bg-white text-blue-600 shadow-md" : "bg-gray-700 text-white shadow-md")
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Globe size={14} />
          Global
        </button>
      </div>

      <div className="w-full flex-1 flex flex-col items-center">
        {activeTab === 'matchmaking' ? (
          <motion.div
            key="matchmaking-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "mb-8 p-6 rounded-3xl shadow-2xl transition-colors duration-500",
                theme.primary,
                theme.id === 'light' ? "shadow-blue-200" : "shadow-black/50"
              )}
            >
              <MessageSquare size={64} className="text-white" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn("text-4xl font-black mb-4 tracking-tight", theme.text)}
            >
              Nocturne
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 mb-8 leading-relaxed max-w-xs"
            >
              Connect with strangers worldwide. No logs, just real conversations.
            </motion.p>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "flex items-center justify-center gap-6 mb-10 py-4 px-6 rounded-2xl border transition-colors duration-500 w-full",
                theme.id === 'light' ? "bg-blue-50 border-blue-100" : "bg-gray-800 border-gray-700"
              )}
            >
              <div className="flex flex-col items-center">
                <Globe size={16} className={cn("mb-1", theme.id === 'light' ? "text-blue-400" : "text-gray-500")} />
                <span className={cn("text-xl font-black", theme.id === 'light' ? "text-blue-700" : "text-white")}>{stats.online}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Online</span>
              </div>
              <div className={cn("w-px h-8", theme.id === 'light' ? "bg-blue-200" : "bg-gray-700")} />
              <div className="flex flex-col items-center">
                <Users size={16} className={cn("mb-1", theme.id === 'light' ? "text-blue-400" : "text-gray-500")} />
                <span className={cn("text-xl font-black", theme.id === 'light' ? "text-blue-700" : "text-white")}>{stats.chatting}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Chatting</span>
              </div>
              <div className={cn("w-px h-8", theme.id === 'light' ? "bg-blue-200" : "bg-gray-700")} />
              <div className="flex flex-col items-center">
                <Zap size={16} className={cn("mb-1", theme.id === 'light' ? "text-blue-400" : "text-gray-500")} />
                <span className={cn("text-xl font-black", theme.id === 'light' ? "text-blue-700" : "text-white")}>{stats.waiting}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">In Queue</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="w-full mb-6"
            >
              <div className="relative group">
                <div className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                  theme.id === 'light' ? "text-gray-400 group-focus-within:text-blue-500" : "text-gray-500 group-focus-within:text-indigo-400"
                )}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.slice(0, 15))}
                  disabled={isSearching}
                  placeholder="Enter a username (optional)"
                  className={cn(
                    "w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-medium border-2 transition-all outline-none",
                    theme.id === 'light' 
                      ? "bg-white border-gray-100 focus:border-blue-500 text-gray-900" 
                      : "bg-gray-800 border-gray-700 focus:border-indigo-500 text-white"
                  )}
                />
              </div>
              <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-left ml-2">
                Your partner will see this name
              </p>
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={handleStart}
              disabled={isSearching}
              className={cn(
                "group relative w-full py-4 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98] disabled:opacity-80",
                theme.primary,
                theme.id === 'light' ? "shadow-blue-100" : "shadow-black/30"
              )}
            >
              {isSearching ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin" size={24} />
                  <span>Finding someone...</span>
                </div>
              ) : (
                "Start Chatting"
              )}
            </motion.button>
            
            {isSearching && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn("mt-4 text-sm font-medium animate-pulse", theme.id === 'light' ? "text-blue-600" : "text-indigo-400")}
              >
                Waiting for a match...
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="global-wall-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <GlobalWall theme={theme} />
            <p className="mt-6 text-xs text-gray-500 font-medium leading-relaxed">
              This is a public feed for all anonymous users worldwide.<br/>
              Messages are ephemeral and visible to everyone.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay, theme }: { icon: React.ReactNode, title: string, desc: string, delay: number, theme: Theme }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay }}
    className={cn(
      "p-4 border rounded-2xl text-left shadow-sm transition-colors duration-500",
      theme.id === 'light' ? "bg-white border-gray-100" : "bg-gray-800 border-gray-700"
    )}
  >
    <div className={cn("mb-2", theme.id === 'light' ? "text-blue-600" : "text-indigo-400")}>{icon}</div>
    <h3 className={cn("font-bold text-sm", theme.text)}>{title}</h3>
    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{desc}</p>
  </motion.div>
);

