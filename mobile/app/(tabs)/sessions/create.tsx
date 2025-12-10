/**
 * SAFRUN Create Session Screen
 * Create a new group running session
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { Button, Card, Header } from '@/components';
import { useRunnerStore } from '@/lib/store';
import {
  XIcon,
  UsersIcon,
  MapPinIcon,
  LockIcon,
  CheckIcon,
} from '@/components/Icons';

const MAX_PARTICIPANTS_OPTIONS = [5, 10, 20, 50, 100];

export default function CreateSessionScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { createSession, isLoading, error } = useRunnerStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(20);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a session name');
      return;
    }

    const session = await createSession({
      title: title.trim(),
      description: description.trim() || undefined,
    });

    if (session) {
      router.replace(`/(tabs)/sessions/${session.id}` as any);
    } else {
      Alert.alert('Error', error || 'Failed to create session');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <XIcon size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Create Session
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Session Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Session Name *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.navy[50],
                color: theme.text.primary,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.navy[200],
              },
            ]}
            placeholder="e.g., Morning Run Club"
            placeholderTextColor={theme.text.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
          <Text style={[styles.charCount, { color: theme.text.muted }]}>
            {title.length}/50
          </Text>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Description (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.navy[50],
                color: theme.text.primary,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.navy[200],
              },
            ]}
            placeholder="Tell runners about this session..."
            placeholderTextColor={theme.text.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: theme.text.muted }]}>
            {description.length}/200
          </Text>
        </View>

        {/* Max Participants */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <UsersIcon size={18} color={theme.text.muted} />
            <Text style={[styles.label, { color: theme.text.primary, marginLeft: spacing.xs }]}>
              Max Participants
            </Text>
          </View>
          <View style={styles.optionsRow}>
            {MAX_PARTICIPANTS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionButton,
                  maxParticipants === opt && styles.optionButtonActive,
                  {
                    backgroundColor: maxParticipants === opt
                      ? colors.safrun[500]
                      : isDark ? 'rgba(255,255,255,0.05)' : colors.navy[100],
                  },
                ]}
                onPress={() => setMaxParticipants(opt)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: maxParticipants === opt ? colors.white : theme.text.secondary },
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Privacy Setting */}
        <Card padding="none" style={styles.privacyCard}>
          <View style={styles.privacyContent}>
            <View style={styles.privacyLeft}>
              <View style={[styles.privacyIcon, { backgroundColor: `${colors.safrun[500]}15` }]}>
                <LockIcon size={20} color={colors.safrun[500]} />
              </View>
              <View>
                <Text style={[styles.privacyTitle, { color: theme.text.primary }]}>
                  Private Session
                </Text>
                <Text style={[styles.privacySubtitle, { color: theme.text.secondary }]}>
                  Only people with invite code can join
                </Text>
              </View>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: colors.navy[300], true: colors.safrun[400] }}
              thumbColor={colors.white}
            />
          </View>
        </Card>

        {/* Tips */}
        <Card
          padding="md"
          style={[
            styles.tipsCard,
            {
              backgroundColor: isDark ? 'rgba(255, 138, 0, 0.1)' : `${colors.safrun[500]}08`,
              borderColor: isDark ? 'rgba(255, 138, 0, 0.2)' : `${colors.safrun[500]}20`,
            },
          ]}
        >
          <Text style={[styles.tipsTitle, { color: theme.text.primary }]}>
            💡 Tips for a great session
          </Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <CheckIcon size={16} color={colors.safrun[500]} />
              <Text style={[styles.tipText, { color: theme.text.secondary }]}>
                Choose a descriptive name
              </Text>
            </View>
            <View style={styles.tipItem}>
              <CheckIcon size={16} color={colors.safrun[500]} />
              <Text style={[styles.tipText, { color: theme.text.secondary }]}>
                Include pace/distance info in description
              </Text>
            </View>
            <View style={styles.tipItem}>
              <CheckIcon size={16} color={colors.safrun[500]} />
              <Text style={[styles.tipText, { color: theme.text.secondary }]}>
                Share the invite code with friends
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Create Button */}
      <View style={[
        styles.footer,
        {
          backgroundColor: theme.background,
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.navy[200],
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}>
        <Button
          size="lg"
          fullWidth
          onPress={handleCreate}
          loading={isLoading}
          disabled={!title.trim()}
        >
          Create Session
        </Button>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.h5,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  field: {
    marginBottom: spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...textStyles.body,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  charCount: {
    ...textStyles.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  optionButtonActive: {},
  optionText: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
  },
  privacyCard: {
    marginBottom: spacing.xl,
  },
  privacyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  privacyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  privacyTitle: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
  },
  privacySubtitle: {
    ...textStyles.bodySm,
    marginTop: 2,
  },
  tipsCard: {
    borderWidth: 1,
  },
  tipsTitle: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipText: {
    ...textStyles.bodySm,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
});

