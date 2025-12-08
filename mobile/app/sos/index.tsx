/**
 * SAFRUN SOS Activation Screen
 * Full-screen red gradient with press-and-hold panic button
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Vibration,
  TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { Button } from '@/components';
import { AlertTriangleIcon, XIcon, ShieldIcon } from '@/components/icons';
import { useSOSStore } from '@/lib/store';

const HOLD_DURATION = 3000; // 3 seconds to activate

export default function SOSActivationScreen() {
  const insets = useSafeAreaInsets();
  const { initiateAlert } = useSOSStore();
  
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Pulse animation for button
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
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

  const handlePressIn = useCallback(() => {
    setIsHolding(true);
    Vibration.vibrate(50);

    // Scale down animation
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    }).start();

    // Update progress state for UI
    let progress = 0;
    progressInterval.current = setInterval(() => {
      progress += 100 / (HOLD_DURATION / 100);
      setHoldProgress(Math.min(progress, 100));
    }, 100);

    // Timer to trigger SOS
    holdTimer.current = setTimeout(() => {
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);
      initiateAlert();
      router.push('/sos/confirming');
    }, HOLD_DURATION);
  }, [initiateAlert, progressAnim, scaleAnim]);

  const handlePressOut = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);

    // Clear timers
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    // Reset animations
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    progressAnim.setValue(0);
  }, [progressAnim, scaleAnim]);

  const handleCancel = () => {
    router.back();
  };

  const progressInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#1a0a0a', '#2d0f0f', '#1a0a0a']}
      style={styles.container}
    >
      {/* Background pulse rings */}
      <View style={styles.backgroundRings}>
        <View style={[styles.ring, styles.ring1]} />
        <View style={[styles.ring, styles.ring2]} />
        <View style={[styles.ring, styles.ring3]} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Button
          variant="ghost"
          leftIcon={<XIcon size={24} color={colors.white} />}
          onPress={handleCancel}
        >
          Cancel
        </Button>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <ShieldIcon size={32} color={colors.danger[400]} />
          <Text style={styles.title}>Emergency SOS</Text>
          <Text style={styles.subtitle}>
            Press and hold the button for 3 seconds to activate emergency alert
          </Text>
        </View>

        {/* SOS Button */}
        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.buttonContainer}>
            {/* Progress ring */}
            {isHolding && (
              <View style={styles.progressContainer}>
                <Animated.View
                  style={[
                    styles.progressRing,
                    {
                      borderColor: colors.danger[500],
                      borderWidth: 4,
                    },
                  ]}
                />
              </View>
            )}

            <Animated.View
              style={[
                styles.sosButtonOuter,
                {
                  transform: [
                    { scale: isHolding ? scaleAnim : pulseAnim },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={
                  isHolding
                    ? [colors.danger[600], colors.danger[700]]
                    : [colors.danger[500], colors.danger[600]]
                }
                style={styles.sosButton}
              >
                <AlertTriangleIcon size={64} color={colors.white} />
                <Text style={styles.sosText}>SOS</Text>
              </LinearGradient>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        {/* Progress indicator */}
        {isHolding && (
          <View style={styles.holdIndicator}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressInterpolate },
                ]}
              />
            </View>
            <Text style={styles.holdText}>
              Hold for {Math.ceil((100 - holdProgress) / 100 * 3)}s...
            </Text>
          </View>
        )}

        {!isHolding && (
          <Text style={styles.hint}>Press and hold to activate</Text>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens when activated?</Text>
          <Text style={styles.infoText}>
            • Your location is shared with nearby runners{'\n'}
            • Emergency contacts are notified{'\n'}
            • Your live location is broadcast for 15 minutes
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundRings: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: `${colors.danger[500]}10`,
  },
  ring1: {
    width: 300,
    height: 300,
  },
  ring2: {
    width: 400,
    height: 400,
  },
  ring3: {
    width: 500,
    height: 500,
  },
  header: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  title: {
    ...textStyles.h2,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    maxWidth: 280,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  sosButtonOuter: {
    shadowColor: colors.danger[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 16,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    ...textStyles.h2,
    color: colors.white,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
    letterSpacing: 4,
  },
  holdIndicator: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.danger[500],
  },
  holdText: {
    ...textStyles.body,
    color: colors.danger[400],
    marginTop: spacing.sm,
    fontWeight: fontWeight.semibold,
  },
  hint: {
    ...textStyles.body,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    ...textStyles.label,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...textStyles.bodySm,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 22,
  },
});

