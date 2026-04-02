import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Globe, MessageSquare, Clock } from 'lucide-react';
import { Theme } from '@/src/themes';
import { cn } from '@/src/lib/utils';

interface GlobalMessage {
  id: string;
  content: string;
  created_at: string;
  theme_id: string;
}

interface GlobalWallProps {
  theme: Theme;
}

export const GlobalWall: React.FC<GlobalWallProps> = ({ theme }) => {
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!supabase) return;
    setConnectionError(null);
    const { data, error } = await supabase
      .from('global_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error("Supabase fetch error:", error);
      setConnectionError(error.message);
    } else if (data) {
      setMessages(data);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Real-time subscription
    if (!supabase) return;
    const channel = supabase
      .channel('global_wall_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_messages' }, 
        (payload) => {
          setMessages(prev => [payload.new as GlobalMessage, ...prev].slice(0, 20));
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setConnectionError("Realtime connection failed. Check your Supabase settings.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !supabase || isLoading) return;

    const content = inputText.trim();
    setInputText('');
    setIsLoading(true);
    setConnectionError(null);

    // Optimistic update
    const optimisticMsg: GlobalMessage = {
      id: Math.random().toString(),
      content,
      created_at: new Date().toISOString(),
      theme_id: theme.id
    };
    setMessages(prev => [optimisticMsg, ...prev].slice(0, 20));

    const { error } = await supabase
      .from('global_messages')
      .insert([
        { 
          content, 
          theme_id: theme.id 
        }
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
      setConnectionError(error.message);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    }
    
    setIsLoading(false);
  };

  if (!supabase) {
    return (
      <div className={cn(
        "p-12 text-center rounded-3xl border-2 border-dashed flex flex-col items-center justify-center min-h-[300px]",
        theme.id === 'light' ? "bg-gray-50 border-gray-200" : "bg-gray-800/50 border-gray-700"
      )}>
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-pulse",
          theme.id === 'light' ? "bg-blue-100 text-blue-600" : "bg-gray-700 text-gray-400"
        )}>
          <Globe size={32} />
        </div>
        <h3 className={cn("text-xl font-black mb-2", theme.text)}>Global Feed Locked</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-[200px] mx-auto">
          Connect your Supabase project to unlock the worldwide anonymous wall.
        </p>
        <div className={cn(
          "px-4 py-3 rounded-xl text-[10px] font-mono text-left w-full",
          theme.id === 'light' ? "bg-white border border-gray-100" : "bg-gray-900 border border-gray-800"
        )}>
          <p className="text-gray-400 mb-1">// Add these to your secrets:</p>
          <p className={theme.id === 'light' ? "text-blue-600" : "text-indigo-400"}>VITE_SUPABASE_URL</p>
          <p className={theme.id === 'light' ? "text-blue-600" : "text-indigo-400"}>VITE_SUPABASE_ANON_KEY</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] w-full max-w-md mx-auto bg-opacity-50 rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
      <div className={cn(
        "px-4 py-3 flex items-center justify-between border-b",
        theme.id === 'light' ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-gray-800 border-gray-700 text-white"
      )}>
        <div className="flex items-center gap-2">
          <Globe size={18} className="animate-spin-slow" />
          <h3 className="font-bold text-sm uppercase tracking-widest">Worldwide Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchMessages}
            className={cn(
              "p-1.5 rounded-lg transition-all active:rotate-180 duration-500",
              theme.id === 'light' ? "hover:bg-blue-100 text-blue-600" : "hover:bg-gray-700 text-gray-400"
            )}
            title="Refresh Feed"
          >
            <Clock size={14} />
          </button>
          <div className={cn(
            "w-2 h-2 rounded-full",
            connectionError ? "bg-red-500" : "bg-green-500"
          )} />
          <span className="text-[10px] font-bold opacity-70">
            {connectionError ? "Offline" : "Live"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {connectionError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-600 font-medium mb-2">
            <strong>Database Error:</strong> {connectionError}
            <br/>
            <button 
              onClick={fetchMessages}
              className="mt-1 underline hover:no-underline"
            >
              Try reconnecting
            </button>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "p-3 rounded-2xl text-sm shadow-sm border",
                theme.id === 'light' ? "bg-white border-gray-100" : "bg-gray-800 border-gray-700"
              )}
            >
              <p className={cn("mb-1", theme.text)}>{msg.content}</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                <Clock size={10} />
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-xs italic">
            No global messages yet. Be the first!
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className={cn(
        "p-3 border-t flex gap-2",
        theme.id === 'light' ? "bg-white border-gray-100" : "bg-gray-900 border-gray-800"
      )}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Say something to the world..."
          className={cn(
            "flex-1 px-4 py-2 rounded-full text-xs border-none focus:ring-2 transition-all",
            theme.id === 'light' ? "bg-gray-100 focus:ring-blue-500" : "bg-gray-800 focus:ring-indigo-500 text-white"
          )}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={cn(
            "p-2 text-white rounded-full transition-all active:scale-90 disabled:opacity-50",
            theme.primary
          )}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
