/**
 * SAFRUN Message Bubble Component
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import type { ChatMessage } from './types';

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, showAvatar = true }) => {
  const isOwn = message.isOwn;
  const isSystem = message.type === 'system';
  const isSOS = message.type === 'sos';

  if (isSystem) {
    return (
      <View style={styles.systemContainer}>
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    );
  }

  if (isSOS) {
    return (
      <View style={styles.sosContainer}>
        <Text style={styles.sosText}>🆘 {message.userName} triggered SOS!</Text>
      </View>
    );
  }

  if (message.type === 'emoji') {
    return (
      <View style={[styles.container, isOwn && styles.containerOwn]}>
        {!isOwn && showAvatar && (
          <View style={styles.avatar}>
            {message.userAvatarUrl ? (
              <Image source={{ uri: message.userAvatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitial}>{message.userName.charAt(0)}</Text>
            )}
          </View>
        )}
        <View style={[styles.emojiContent, isOwn && styles.emojiContentOwn]}>
          <Text style={styles.emojiText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isOwn && styles.containerOwn]}>
      {!isOwn && showAvatar && (
        <View style={styles.avatar}>
          {message.userAvatarUrl ? (
            <Image source={{ uri: message.userAvatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitial}>{message.userName.charAt(0)}</Text>
          )}
        </View>
      )}
      <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
        {!isOwn && (
          <Text style={[styles.userName, { color: colors.safrun[600] }]}>
            {message.userName}
          </Text>
        )}
        <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
          {message.content}
        </Text>
        <Text style={[styles.timestamp, isOwn && styles.timestampOwn]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  containerOwn: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarInitial: {
    color: colors.navy[600],
    fontWeight: fontWeight.semibold,
    fontSize: 14,
  },
  bubble: {
    maxWidth: '75%',
    backgroundColor: colors.navy[100],
    borderRadius: borderRadius.lg,
    borderTopLeftRadius: 4,
    padding: spacing.md,
  },
  bubbleOwn: {
    backgroundColor: colors.safrun[500],
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: 4,
    marginRight: spacing.sm,
  },
  userName: {
    ...textStyles.caption,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  messageText: {
    ...textStyles.body,
    color: colors.navy[900],
  },
  messageTextOwn: {
    color: colors.white,
  },
  timestamp: {
    ...textStyles.caption,
    color: colors.navy[500],
    marginTop: 4,
    textAlign: 'right',
  },
  timestampOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emojiContent: {
    padding: spacing.sm,
  },
  emojiContentOwn: {
    marginRight: spacing.sm,
  },
  emojiText: {
    fontSize: 40,
  },
  systemContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  systemText: {
    ...textStyles.caption,
    color: colors.navy[500],
    textAlign: 'center',
  },
  sosContainer: {
    alignItems: 'center',
    backgroundColor: colors.danger[100],
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  sosText: {
    ...textStyles.body,
    color: colors.danger[700],
    fontWeight: fontWeight.semibold,
  },
});

export default MessageBubble;

