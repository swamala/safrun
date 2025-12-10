/**
 * SAFRUN SOS Confirming Screen
 * Countdown confirmation before broadcasting SOS
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { Button } from '@/components';
import { AlertTriangleIcon, XIcon } from '@/components/Icons';
import { useSOSStore } from '@/lib/store';
import * as Location from 'expo-location';

const COUNTDOWN_SECONDS = 5;

export default function SOSConfirmingScreen() {
  const insets = useSafeAreaInsets();
  const { confirmAlert, cancelAlert, updateCountdown, confirmationCountdown } = useSOSStore();
  
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Entry animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      // Get location and broadcast SOS
      broadcastSOS();
      return;
    }

    const timer = setTimeout(() => {
      Vibration.vibrate(100);
      setCountdown(countdown - 1);
      updateCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, updateCountdown]);

  const broadcastSOS = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      confirmAlert({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      });

      router.replace('/sos/broadcast');
    } catch (error) {
      // Broadcast even without precise location
      confirmAlert({
        latitude: 0,
        longitude: 0,
        timestamp: Date.now(),
      });
      router.replace('/sos/broadcast');
    }
  };

  const handleCancel = () => {
    cancelAlert();
    router.dismissAll();
  };

  return (
    <LinearGradient
      colors={[colors.danger[600], colors.danger[700], '#1a0505']}
      style={styles.container}
    >
      {/* Animated rings */}
      <View style={styles.ringsContainer}>
        <Animated.View
          style={[
            styles.ring,
            styles.ring1,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring2,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring3,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <Animated.View
          style={[
            styles.centerContent,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Warning icon */}
          <View style={styles.iconContainer}>
            <AlertTriangleIcon size={80} color={colors.white} />
          </View>

          {/* Countdown */}
          <Text style={styles.countdown}>{countdown}</Text>
          <Text style={styles.title}>Broadcasting SOS</Text>
          <Text style={styles.subtitle}>
            Emergency alert will be sent to nearby runners and your emergency contacts
          </Text>

          {/* Cancel button */}
          <Button
            variant="outline"
            size="lg"
            leftIcon={<XIcon size={20} color={colors.white} />}
            onPress={handleCancel}
            style={styles.cancelButton}
          >
            Cancel Alert
          </Button>
        </Animated.View>
      </View>

      {/* Footer info */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.footerText}>
          Tap cancel to stop the emergency broadcast
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ringsContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ring1: {
    width: 200,
    height: 200,
  },
  ring2: {
    width: 300,
    height: 300,
  },
  ring3: {
    width: 400,
    height: 400,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  centerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  countdown: {
    fontSize: 96,
    fontWeight: fontWeight.bold,
    color: colors.white,
    lineHeight: 100,
  },
  title: {
    ...textStyles.h3,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: spacing.xl * 2,
  },
  cancelButton: {
    minWidth: 200,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    ...textStyles.bodySm,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});

