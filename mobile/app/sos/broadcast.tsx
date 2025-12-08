/**
 * SAFRUN SOS Broadcast Screen
 * Active SOS with responders and map
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Vibration,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Card, Badge } from '@/components';
import { Avatar } from '@/components/ui/Avatar';
import {
  AlertTriangleIcon,
  MapPinIcon,
  CheckIcon,
  XIcon,
  UsersIcon,
  ShieldIcon,
} from '@/components/icons';
import { useSOSStore } from '@/lib/store';

export default function SOSBroadcastScreen() {
  const insets = useSafeAreaInsets();
  const {
    responders,
    activatedAt,
    location,
    resolveAlert,
    cancelAlert,
    broadcastRadius,
  } = useSOSStore();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  // Calculate time since activation
  const getElapsedTime = () => {
    if (!activatedAt) return '0:00';
    const elapsed = Math.floor((Date.now() - activatedAt) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [elapsedTime, setElapsedTime] = React.useState(getElapsedTime());

  // Update elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(getElapsedTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [activatedAt]);

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  // Periodic vibration
  useEffect(() => {
    const vibInterval = setInterval(() => {
      Vibration.vibrate(100);
    }, 5000);
    return () => clearInterval(vibInterval);
  }, []);

  const handleStopSOS = () => {
    resolveAlert();
    router.dismissAll();
  };

  const handleFalseAlarm = () => {
    cancelAlert();
    router.dismissAll();
  };

  const respondingCount = responders.filter(r => r.status === 'responding').length;
  const notifiedCount = responders.filter(r => r.status === 'notified').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Status Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.danger[500], colors.danger[600]]}
          style={styles.statusBanner}
        >
          <Animated.View
            style={[
              styles.statusPulse,
              { transform: [{ scale: pulseAnim }], opacity: glowAnim },
            ]}
          />
          <View style={styles.statusContent}>
            <AlertTriangleIcon size={32} color={colors.white} />
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>SOS ACTIVE</Text>
              <Text style={styles.statusSubtitle}>Broadcasting for {elapsedTime}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Map placeholder */}
        <Card padding="none" style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <MapPinIcon size={48} color={colors.danger[500]} />
            <Text style={styles.mapText}>Your location is being broadcast</Text>
            <View style={styles.radiusBadge}>
              <Text style={styles.radiusText}>{broadcastRadius}km radius</Text>
            </View>
          </View>
        </Card>

        {/* Responders Stats */}
        <View style={styles.statsRow}>
          <Card padding="md" style={styles.statCard}>
            <View style={styles.statIcon}>
              <UsersIcon size={20} color={colors.safrun[500]} />
            </View>
            <Text style={styles.statValue}>{notifiedCount + respondingCount}</Text>
            <Text style={styles.statLabel}>Notified</Text>
          </Card>
          <Card padding="md" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${colors.safety[500]}15` }]}>
              <ShieldIcon size={20} color={colors.safety[500]} />
            </View>
            <Text style={styles.statValue}>{respondingCount}</Text>
            <Text style={styles.statLabel}>Responding</Text>
          </Card>
        </View>

        {/* Responders List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Responders</Text>
          
          {responders.length === 0 ? (
            <Card padding="lg" style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Searching for nearby runners...
              </Text>
            </Card>
          ) : (
            responders.map((responder) => (
              <Card key={responder.id} padding="md" style={styles.responderCard}>
                <View style={styles.responderContent}>
                  <Avatar name={responder.name} size="md" />
                  <View style={styles.responderInfo}>
                    <Text style={styles.responderName}>{responder.name}</Text>
                    <Text style={styles.responderDistance}>
                      {responder.distance} away
                      {responder.eta && ` • ETA ${responder.eta}`}
                    </Text>
                  </View>
                  <Badge
                    variant={responder.status === 'responding' ? 'success' : 'secondary'}
                    dot
                  >
                    {responder.status === 'responding' ? 'Responding' : 'Notified'}
                  </Badge>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Card padding="md">
            <View style={styles.contactRow}>
              <CheckIcon size={20} color={colors.safety[500]} />
              <Text style={styles.contactText}>
                3 emergency contacts have been notified
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomActions,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Button
          variant="danger"
          size="lg"
          fullWidth
          leftIcon={<XIcon size={20} color={colors.white} />}
          onPress={handleStopSOS}
          style={shadows.glowRed}
        >
          I'm Safe - Stop SOS
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={handleFalseAlarm}
          style={styles.falseAlarmButton}
        >
          <Text style={styles.falseAlarmText}>False Alarm</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    paddingHorizontal: spacing.md,
  },
  statusBanner: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  statusPulse: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: colors.danger[400],
    borderRadius: borderRadius.lg,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  statusText: {
    marginLeft: spacing.md,
  },
  statusTitle: {
    ...textStyles.h4,
    color: colors.white,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
  },
  statusSubtitle: {
    ...textStyles.bodySm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  mapCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: colors.navy[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    ...textStyles.body,
    color: colors.white,
    marginTop: spacing.sm,
  },
  radiusBadge: {
    backgroundColor: `${colors.danger[500]}30`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  radiusText: {
    ...textStyles.bodySm,
    color: colors.danger[400],
    fontWeight: fontWeight.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.safrun[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...textStyles.h3,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    ...textStyles.bodySm,
    color: colors.navy[400],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.white,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyText: {
    ...textStyles.body,
    color: colors.navy[400],
  },
  responderCard: {
    marginBottom: spacing.sm,
  },
  responderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responderInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  responderName: {
    ...textStyles.body,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  responderDistance: {
    ...textStyles.bodySm,
    color: colors.navy[400],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactText: {
    ...textStyles.body,
    color: colors.white,
  },
  bottomActions: {
    padding: spacing.md,
    backgroundColor: colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  falseAlarmButton: {
    marginTop: spacing.sm,
  },
  falseAlarmText: {
    color: colors.navy[400],
  },
});

