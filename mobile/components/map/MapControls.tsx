/**
 * SAFRUN Map Controls Component
 * Floating buttons for map interactions: recenter, compass, etc.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { MapPinIcon, NavigationIcon } from '@/components/Icons';
import Svg, { Path, Circle } from 'react-native-svg';

interface MapControlsProps {
  onRecenter?: () => void;
  onToggleCompass?: () => void;
  compassHeading?: number;
  showCompass?: boolean;
  locationAccuracy?: number;
  showAccuracyIndicator?: boolean;
}

// Custom compass icon with rotation
function CompassIcon({ size = 24, heading = 0, color = colors.navy[500] }: { size?: number; heading?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: `${heading}deg` }] }}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Path
        d="M12 2L14 6L12 4L10 6L12 2Z"
        fill={colors.danger[500]}
      />
      <Path
        d="M12 22L14 18L12 20L10 18L12 22Z"
        fill={color}
      />
      <Path
        d="M22 12L18 14L20 12L18 10L22 12Z"
        fill={color}
      />
      <Path
        d="M2 12L6 14L4 12L6 10L2 12Z"
        fill={color}
      />
    </Svg>
  );
}

// Accuracy indicator
function AccuracyIndicator({ accuracy, color }: { accuracy: number; color: string }) {
  const getAccuracyLabel = () => {
    if (accuracy <= 5) return { text: 'Excellent', color: colors.safety[500] };
    if (accuracy <= 15) return { text: 'Good', color: colors.safrun[500] };
    if (accuracy <= 30) return { text: 'Fair', color: colors.warning[500] };
    return { text: 'Poor', color: colors.danger[500] };
  };

  const label = getAccuracyLabel();

  return (
    <View style={[styles.accuracyContainer, { backgroundColor: `${label.color}20` }]}>
      <View style={[styles.accuracyDot, { backgroundColor: label.color }]} />
      <Text style={[styles.accuracyText, { color: label.color }]}>
        ±{Math.round(accuracy)}m
      </Text>
    </View>
  );
}

export function MapControls({
  onRecenter,
  onToggleCompass,
  compassHeading = 0,
  showCompass = true,
  locationAccuracy,
  showAccuracyIndicator = true,
}: MapControlsProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Accuracy Indicator - Top Center */}
      {showAccuracyIndicator && locationAccuracy !== undefined && (
        <View style={styles.topCenter}>
          <AccuracyIndicator accuracy={locationAccuracy} color={theme.text.primary} />
        </View>
      )}

      {/* Right Side Controls */}
      <View style={styles.rightControls}>
        {/* Compass Button */}
        {showCompass && (
          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: isDark ? colors.navy[800] : colors.white,
              },
              shadows.md,
            ]}
            onPress={onToggleCompass}
            activeOpacity={0.8}
          >
            <CompassIcon size={24} heading={compassHeading} color={theme.text.primary} />
          </TouchableOpacity>
        )}

        {/* Recenter Button */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: isDark ? colors.navy[800] : colors.white,
            },
            shadows.md,
          ]}
          onPress={onRecenter}
          activeOpacity={0.8}
        >
          <NavigationIcon size={22} color={colors.safrun[500]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  topCenter: {
    position: 'absolute',
    top: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  rightControls: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    gap: spacing.md,
    transform: [{ translateY: -50 }],
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  accuracyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accuracyText: {
    ...textStyles.caption,
    fontWeight: fontWeight.medium,
  },
});

export default MapControls;

