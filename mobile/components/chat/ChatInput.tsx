/**
 * SAFRUN Chat Input Component
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles } from '@/theme/typography';
import { SendIcon } from '@/components/Icons';

const QUICK_EMOJIS = ['👍', '💪', '🔥', '🏃', '👏', '❤️', '😊', '🎉'];

interface ChatInputProps {
  onSend: (message: string, type: 'text' | 'emoji') => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleEmojiPress = (emoji: string) => {
    onSend(emoji, 'emoji');
    setShowEmojis(false);
  };

  return (
    <View style={styles.container}>
      {/* Quick Emoji Bar */}
      {showEmojis && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.emojiBar}
          contentContainerStyle={styles.emojiBarContent}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiButton}
              onPress={() => handleEmojiPress(emoji)}
            >
              <TextInput
                style={styles.emojiText}
                value={emoji}
                editable={false}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.emojiToggle}
          onPress={() => setShowEmojis(!showEmojis)}
        >
          <TextInput
            style={styles.emojiToggleText}
            value="😊"
            editable={false}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.navy[400]}
          value={message}
          onChangeText={setMessage}
          editable={!disabled}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <SendIcon size={20} color={message.trim() && !disabled ? colors.white : colors.navy[400]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.navy[100],
  },
  emojiBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.navy[100],
  },
  emojiBarContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    flexDirection: 'row',
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  emojiText: {
    fontSize: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  emojiToggle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiToggleText: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    backgroundColor: colors.navy[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    ...textStyles.body,
    color: colors.navy[900],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.safrun[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.navy[100],
  },
});

export default ChatInput;

