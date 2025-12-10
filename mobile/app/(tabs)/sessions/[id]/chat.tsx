/**
 * SAFRUN Session Chat Screen
 * Real-time chat for session participants
 */

import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { ChatView } from '@/components/chat';
import { sdk } from '@/lib/sdk';
import { useAuthStore } from '@/lib/store';
import { ArrowLeftIcon, UsersIcon } from '@/components/Icons';
import type { ChatMessage } from '@/components/chat/types';
import type { Session } from '@safrun/sdk';

export default function SessionChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch session info
  useEffect(() => {
    if (!id) return;
    
    sdk.sessions.getSession(id)
      .then(setSession)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  // Subscribe to chat messages (simulated - in production you'd have a chat service)
  useEffect(() => {
    // Simulate some existing messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        userId: 'system',
        userName: 'System',
        content: 'Session chat started',
        type: 'system',
        timestamp: new Date(Date.now() - 600000),
      },
      {
        id: '2',
        userId: 'user1',
        userName: 'Sarah',
        content: 'Hey everyone! Ready for the run? 🏃',
        type: 'text',
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: '3',
        userId: 'user2',
        userName: 'Mike',
        content: '💪',
        type: 'emoji',
        timestamp: new Date(Date.now() - 180000),
      },
    ];
    
    setMessages(mockMessages);

    // In production, subscribe to WebSocket chat events
    // const unsubscribe = sdk.socket.on('chat:message', (data) => {
    //   setMessages(prev => [...prev, data]);
    // });
    // return () => unsubscribe();
  }, [id]);

  // Send message
  const handleSend = useCallback((content: string, type: 'text' | 'emoji') => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.displayName,
      userAvatarUrl: user.avatarUrl || undefined,
      content,
      type,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages(prev => [...prev, newMessage]);

    // In production, send via WebSocket
    // sdk.socket.emit('chat:send', { sessionId: id, content, type });
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ChatView
        messages={messages}
        currentUserId={user?.id || ''}
        onSend={handleSend}
        isLoading={isLoading}
        header={
          <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeftIcon size={24} color={theme.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
                {session?.title || 'Session Chat'}
              </Text>
              <View style={styles.headerMeta}>
                <UsersIcon size={14} color={theme.text.muted} />
                <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
                  {session?.participantCount || 0} participants
                </Text>
              </View>
            </View>
            <View style={{ width: 40 }} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.navy[100],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...textStyles.h6,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSubtitle: {
    ...textStyles.caption,
  },
});

