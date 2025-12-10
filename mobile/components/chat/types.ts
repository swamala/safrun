export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  content: string;
  type: 'text' | 'emoji' | 'system' | 'sos';
  timestamp: Date;
  isOwn?: boolean;
}

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[];
}

