/**
 * SAFRUN Dead Man Timer Component
 * Prompts user for a check-in every X minutes during a run
 * If not responded, triggers SOS automatically
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Vibration, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button } from '@/components/Button';
import { ShieldIcon, AlertTriangleIcon, CheckIcon, ClockIcon } from '@/components/Icons';

interface DeadManTimerProps {
  isEnabled: boolean;
  checkInterval: number; // minutes between check-ins
  responseWindow: number; // seconds to respond before SOS triggers
  onSOSTriggered?: () => void;
  onDisable?: () => void;
}

export function DeadManTimer({
  isEnabled,
  checkInterval = 15,
  responseWindow = 60,
  onSOSTriggered,
  onDisable,
}: DeadManTimerProps) {
  const { theme, isDark } = useTheme();
  const [showPrompt, setShowPrompt] = useState(false);
  const [countdown, setCountdown] = useState(responseWindow);
  const [isArmed, setIsArmed] = useState(false);
  
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start the dead man timer
  const startTimer = useCallback(() => {
    if (!isEnabled) return;
    
    // Clear any existing timer
    if (checkTimer.current) {
      clearTimeout(checkTimer.current);
    }
    
    // Set timer for check-in prompt
    checkTimer.current = setTimeout(() => {
      setShowPrompt(true);
      setCountdown(responseWindow);
      setIsArmed(true);
      Vibration.vibrate([0, 500, 200, 500]);
    }, checkInterval * 60 * 1000);
  }, [isEnabled, checkInterval, responseWindow]);

  // Reset timer after check-in
  const handleCheckIn = useCallback(() => {
    setShowPrompt(false);
    setIsArmed(false);
    setCountdown(responseWindow);
    
    // Clear countdown
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    
    // Restart the check timer
    startTimer();
  }, [responseWindow, startTimer]);

  // Trigger SOS when countdown reaches 0
  const triggerSOS = useCallback(async () => {
    setShowPrompt(false);
    setIsArmed(false);
    Vibration.vibrate([0, 1000, 500, 1000, 500, 1000]);
    
    try {
      // Trigger SOS via SDK - need to get location first
      // This requires the location to be passed in or fetched
      // For now, we'll use a fallback approach
      onSOSTriggered?.();
    } catch (error) {
      console.error('Failed to trigger SOS:', error);
    }
  }, [onSOSTriggered]);

  // Handle countdown when armed
  useEffect(() => {
    if (isArmed && showPrompt) {
      countdownInterval.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current!);
            triggerSOS();
            return 0;
          }
          // Vibrate at 30, 15, 10, 5, 4, 3, 2, 1 seconds
          if ([30, 15, 10, 5, 4, 3, 2, 1].includes(prev - 1)) {
            Vibration.vibrate(100);
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, [isArmed, showPrompt, triggerSOS]);

  // Start timer when enabled
  useEffect(() => {
    if (isEnabled) {
      startTimer();
    } else {
      if (checkTimer.current) {
        clearTimeout(checkTimer.current);
      }
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    }
    
    return () => {
      if (checkTimer.current) {
        clearTimeout(checkTimer.current);
      }
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, [isEnabled, startTimer]);

  if (!isEnabled) return null;

  return (
    <Modal
      visible={showPrompt}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: isDark ? colors.navy[800] : colors.white,
            },
            shadows.lg,
          ]}
        >
          {/* Timer Circle */}
          <View style={styles.timerContainer}>
            <LinearGradient
              colors={countdown <= 10 ? [colors.danger[500], colors.danger[600]] : [colors.warning[500], colors.warning[600]]}
              style={styles.timerCircle}
            >
              <ClockIcon size={32} color={colors.white} />
              <Text style={styles.timerText}>{countdown}s</Text>
            </LinearGradient>
          </View>

          {/* Content */}
          <ShieldIcon size={40} color={colors.safety[500]} />
          
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Are you okay?
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Tap to confirm you're safe. SOS will trigger automatically in {countdown} seconds if no response.
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              size="lg"
              fullWidth
              leftIcon={<CheckIcon size={20} color={colors.white} />}
              onPress={handleCheckIn}
              style={{ backgroundColor: colors.safety[500] }}
            >
              I'm OK
            </Button>
            
            <TouchableOpacity
              style={[styles.skipButton, { backgroundColor: colors.danger[500] }]}
              onPress={triggerSOS}
            >
              <AlertTriangleIcon size={20} color={colors.white} />
              <Text style={styles.skipButtonText}>I Need Help!</Text>
            </TouchableOpacity>
          </View>

          {/* Disable Option */}
          <TouchableOpacity style={styles.disableLink} onPress={onDisable}>
            <Text style={[styles.disableLinkText, { color: theme.text.muted }]}>
              Disable Dead Man Timer for this run
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  timerContainer: {
    marginBottom: spacing.lg,
  },
  timerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    ...textStyles.h3,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  title: {
    ...textStyles.h4,
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  skipButtonText: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  disableLink: {
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  disableLinkText: {
    ...textStyles.bodySm,
    textDecorationLine: 'underline',
  },
});

export default DeadManTimer;

