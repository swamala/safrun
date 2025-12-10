/**
 * SAFRUN SessionCard Component
 * Card display for running sessions with SAFRUN design system
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Badge } from '../Badge';
import { UsersIcon, MapPinIcon, ClockIcon, ChevronRightIcon, PlayIcon } from '../Icons';
import type { Session } from '@safrun/sdk';

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
  onJoin?: () => void;
  variant?: 'default' | 'compact';
}

export function SessionCard({ session, onPress, onJoin, variant = 'default' }: SessionCardProps) {
  const { theme, isDark } = useTheme();

  const isActive = session.status === 'ACTIVE';
  const isScheduled = session.status === 'SCHEDULED';

  const getStatusBadge = () => {
    if (isActive) return { variant: 'success' as const, text: 'Live', dot: true };
    if (isScheduled) return { variant: 'primary' as const, text: 'Scheduled', dot: false };
    return { variant: 'secondary' as const, text: session.status, dot: false };
  };

  const statusBadge = getStatusBadge();

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    
    if (diff < 0) {
      const mins = Math.abs(Math.floor(diff / 60000));
      if (mins < 60) return `${mins}m ago`;
      if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
      return d.toLocaleDateString();
    }
    
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `in ${mins}m`;
    if (mins < 1440) return `in ${Math.floor(mins / 60)}h`;
    return d.toLocaleDateString();
  };

  const host = session.participants.find(p => p.role === 'HOST');

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[
          styles.compactCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[200],
          },
          isDark ? shadows.softSm : shadows.card,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactLeft}>
            <Text style={[styles.compactTitle, { color: theme.text.primary }]} numberOfLines={1}>
              {session.title}
            </Text>
            <View style={styles.compactMeta}>
              <UsersIcon size={12} color={theme.text.muted} />
              <Text style={[styles.compactMetaText, { color: theme.text.secondary }]}>
                {session.participantCount}
              </Text>
            </View>
          </View>
          <Badge variant={statusBadge.variant} dot={statusBadge.dot} size="sm">
            {statusBadge.text}
          </Badge>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : `${colors.navy[200]}99`,
        },
        isDark ? shadows.softMd : shadows.card,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.safrun[500]}15` }]}>
          <UsersIcon size={24} color={colors.safrun[500]} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
            {session.title}
          </Text>
          {host && (
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              by {host.displayName}
            </Text>
          )}
        </View>
        <Badge variant={statusBadge.variant} dot={statusBadge.dot}>
          {statusBadge.text}
        </Badge>
      </View>

      {/* Description */}
      {session.description && (
        <Text style={[styles.description, { color: theme.text.secondary }]} numberOfLines={2}>
          {session.description}
        </Text>
      )}

      {/* Meta Info */}
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <UsersIcon size={14} color={theme.text.muted} />
          <Text style={[styles.metaText, { color: theme.text.secondary }]}>
            {session.participantCount}/{session.maxParticipants || '∞'}
          </Text>
        </View>
        {(session.scheduledAt || session.startedAt) && (
          <View style={styles.metaItem}>
            <ClockIcon size={14} color={theme.text.muted} />
            <Text style={[styles.metaText, { color: theme.text.secondary }]}>
              {formatDate(session.startedAt || session.scheduledAt)}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[100] }]}>
        <View style={styles.hostInfo}>
          <View style={styles.hostAvatar}>
            <Text style={styles.hostInitial}>
              {host?.displayName?.charAt(0) || 'H'}
            </Text>
          </View>
          <Text style={[styles.hostName, { color: theme.text.secondary }]}>
            {host?.displayName || 'Host'}
          </Text>
        </View>

        {(isActive || isScheduled) && onJoin ? (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onJoin();
            }}
          >
            <PlayIcon size={14} color={colors.white} />
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        ) : (
          <ChevronRightIcon size={20} color={theme.text.muted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  subtitle: {
    ...textStyles.bodySm,
  },
  description: {
    ...textStyles.bodySm,
    marginBottom: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...textStyles.bodySm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hostAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.navy[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostInitial: {
    ...textStyles.caption,
    color: colors.navy[600],
    fontWeight: fontWeight.semibold,
  },
  hostName: {
    ...textStyles.bodySm,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.safrun[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  joinButtonText: {
    ...textStyles.bodySm,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  // Compact styles
  compactCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  compactTitle: {
    ...textStyles.bodySm,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactMetaText: {
    ...textStyles.caption,
  },
});

export default SessionCard;

