import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface VoiceRecorderProps {
  onSend: (audioBase64: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onRecordingStateChange, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldSendImmediatelyRef = useRef(false);

  const startRecording = async () => {
    if (typeof MediaRecorder === 'undefined') {
      alert("Your browser does not support voice recording. Please use a modern browser like Chrome or Safari.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to find a supported mime type
      const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
      const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (shouldSendImmediatelyRef.current && chunks.length > 0) {
          const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            onSend(base64);
            onRecordingStateChange?.(false);
            setAudioBlob(null);
            setRecordingTime(0);
            shouldSendImmediatelyRef.current = false;
          };
          reader.readAsDataURL(blob);
        } else {
          // If cancelled or not sent immediately, just reset
          onRecordingStateChange?.(false);
          setAudioBlob(null);
          setRecordingTime(0);
          shouldSendImmediatelyRef.current = false;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      onRecordingStateChange?.(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      shouldSendImmediatelyRef.current = true;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      shouldSendImmediatelyRef.current = false;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      shouldSendImmediatelyRef.current = false;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStateChange?.(false);
      setAudioBlob(null);
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const sendRecording = () => {
    // This is no longer needed but kept for interface consistency if called elsewhere
    cancelRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex items-center flex-1">
      <AnimatePresence mode="wait">
        {!isRecording && !audioBlob ? (
          <motion.button
            key="mic"
            type="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={startRecording}
            disabled={disabled}
            className={cn(
              "p-2 text-gray-500 hover:text-[#0084ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              disabled && "grayscale"
            )}
          >
            <Mic size={24} />
          </motion.button>
        ) : isRecording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2 md:gap-4">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} className="md:size-24" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs md:text-sm font-bold text-white">{formatTime(recordingTime)}</span>
              </div>
            </div>
            
            <div className="flex-1 px-2 md:px-4 flex items-center justify-center gap-0.5 md:gap-1 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [6, Math.random() * 16 + 6, 6] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                  className="w-[2px] md:w-[3px] bg-[#5b61e0] rounded-full opacity-60"
                />
              ))}
            </div>

            <motion.button
              type="button"
              onClick={stopAndSend}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                "bg-[#5b61e0] text-white"
              )}
            >
              <Send size={16} className="md:size-20 ml-0.5 md:ml-1" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between w-full"
          >
            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 size={24} />
            </button>
            
            <div className="flex-1 flex items-center justify-center gap-3">
              <div className="text-sm font-bold text-white">
                Voice Message ({formatTime(recordingTime)})
              </div>
            </div>

            <motion.button
              type="button"
              onClick={sendRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                "bg-[#5b61e0] text-white"
              )}
            >
              <Send size={18} className="md:size-20 ml-1" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
