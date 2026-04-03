export type MessageType = 'text' | 'voice' | 'system';

export interface Message {
  id: string;
  text?: string;
  audio?: string; // Base64 encoded audio
  senderId: string;
  timestamp: number;
  type: MessageType;
  isEdited?: boolean;
  isDeleted?: boolean;
  reactions?: { [emoji: string]: string[] }; // emoji -> list of userIds
}

export type ConnectionStatus = 'idle' | 'waiting' | 'matched' | 'disconnected';

export interface HistoryItem {
  id: string;
  partnerUsername: string;
  timestamp: number;
  messages: Message[];
}

export interface Stats {
  online: number;
  waiting: number;
  chatting: number;
}

export interface SessionStats {
  duration: number; // in milliseconds
  messageCount: number;
  partnerUsername: string;
}
