import React from 'react';
import { motion } from 'motion/react';
import { Link2Off, UserPlus, Home, Clock, MessageCircle } from 'lucide-react';
import { SessionStats } from '@/src/types';
import { Theme } from '@/src/themes';
import { cn } from '@/src/lib/utils';

interface SessionEndedScreenProps {
  stats: SessionStats;
  theme: Theme;
  onFindNew: () => void;
  onGoHome: () => void;
}

export const SessionEndedScreen: React.FC<SessionEndedScreenProps> = ({ stats, theme, onFindNew, onGoHome }) => {
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}m`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "flex flex-col items-center justify-center h-full w-full px-6 py-12 text-center overflow-y-auto custom-scrollbar",
        theme.bg
      )}
    >
      {/* Background Icon */}
      <div className="relative mb-12">
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-[48px] bg-white/5 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#8e94f2]/10 to-transparent opacity-50" />
          <Link2Off size={80} className="text-[#8e94f2] relative z-10 opacity-80" />
          
          {/* Animated dots */}
          <div className="absolute bottom-8 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-[#8e94f2] rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl w-full">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
          Session Ended
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-8 font-medium leading-relaxed max-w-md mx-auto">
          Your partner has left the chat. Want to meet someone else?
        </p>

        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/5 mb-12">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            {Math.floor(stats.duration / 60000)}-MINUTE CONVERSATION ENDED
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onFindNew}
            className="w-full sm:w-auto px-10 py-5 rounded-3xl bg-[#8e94f2] text-white font-black text-lg shadow-xl shadow-[#8e94f2]/20 flex items-center justify-center gap-3"
          >
            <UserPlus size={22} />
            Find New Partner
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGoHome}
            className="w-full sm:w-auto px-10 py-5 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <Home size={22} />
            Go Home
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="bg-[#111216] border border-white/5 p-6 rounded-[32px] text-left">
            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">
              <Clock size={12} />
              <span>Duration</span>
            </div>
            <div className="text-2xl font-black text-white">
              {formatDuration(stats.duration)}
            </div>
          </div>

          <div className="bg-[#111216] border border-white/5 p-6 rounded-[32px] text-left">
            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">
              <MessageCircle size={12} />
              <span>Messages</span>
            </div>
            <div className="text-2xl font-black text-white">
              {stats.messageCount} exchanged
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
