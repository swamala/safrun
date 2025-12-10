/**
 * SAFRUN Chat View Component
 * Full chat UI with messages and input
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import type { ChatMessage } from './types';

interface ChatViewProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSend: (message: string, type: 'text' | 'emoji') => void;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  header?: React.ReactNode;
}

const ChatView: React.FC<ChatViewProps> = ({
  messages,
  currentUserId,
  onSend,
  title,
  subtitle,
  isLoading = false,
  header,
}) => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Mark messages as own
  const enhancedMessages = messages.map(m => ({
    ...m,
    isOwn: m.userId === currentUserId,
  }));

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom && flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isAtBottom]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isBottom = contentOffset.y >= contentSize.height - layoutMeasurement.height - 50;
    setIsAtBottom(isBottom);
  }, []);

  // Group messages by sender for avatar display
  const shouldShowAvatar = (index: number) => {
    if (index === 0) return true;
    const current = enhancedMessages[index];
    const previous = enhancedMessages[index - 1];
    return current.userId !== previous.userId;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      {/* Header */}
      {(title || header) && (
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          {header || (
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{title}</Text>
              {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
            </View>
          )}
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={enhancedMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MessageBubble
            message={item}
            showAvatar={shouldShowAvatar(index)}
          />
        )}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading messages...' : 'No messages yet. Say hi! 👋'}
            </Text>
          </View>
        }
      />

      {/* Input */}
      <View style={{ paddingBottom: insets.bottom }}>
        <ChatInput onSend={onSend} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.navy[100],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...textStyles.h5,
    color: colors.navy[900],
  },
  headerSubtitle: {
    ...textStyles.bodySm,
    color: colors.navy[500],
    marginTop: 2,
  },
  messagesList: {
    paddingTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 3,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.navy[400],
  },
});

export default ChatView;

