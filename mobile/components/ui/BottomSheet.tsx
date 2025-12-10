/**
 * SAFRUN BottomSheet Component
 * Reusable bottom sheet with SAFRUN design system
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnap?: number;
  showHandle?: boolean;
  showOverlay?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  showHandle = true,
  showOverlay = true,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  const currentSnapIndex = useRef(initialSnap);
  const snapHeights = snapPoints.map(p => SCREEN_HEIGHT * (1 - p));

  useEffect(() => {
    if (visible) {
      const targetY = snapHeights[currentSnapIndex.current];
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: targetY,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const currentY = snapHeights[currentSnapIndex.current];
        const newY = currentY + gestureState.dy;
        
        if (newY >= 0) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentY = snapHeights[currentSnapIndex.current] + gestureState.dy;
        
        // Close if dragged down significantly
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          if (currentSnapIndex.current === 0) {
            onClose();
          } else {
            currentSnapIndex.current = Math.max(0, currentSnapIndex.current - 1);
            Animated.spring(translateY, {
              toValue: snapHeights[currentSnapIndex.current],
              useNativeDriver: true,
              tension: 65,
              friction: 11,
            }).start();
          }
        }
        // Expand if dragged up
        else if (gestureState.dy < -100 || gestureState.vy < -0.5) {
          currentSnapIndex.current = Math.min(snapPoints.length - 1, currentSnapIndex.current + 1);
          Animated.spring(translateY, {
            toValue: snapHeights[currentSnapIndex.current],
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
        // Snap back to current position
        else {
          Animated.spring(translateY, {
            toValue: snapHeights[currentSnapIndex.current],
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Overlay */}
      {showOverlay && (
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.overlay,
              { opacity: overlayOpacity },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: isDark ? colors.navy[900] : colors.white,
            transform: [{ translateY }],
            paddingBottom: insets.bottom,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Handle */}
        {showHandle && (
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? colors.navy[600] : colors.navy[300] },
              ]}
            />
          </View>
        )}

        {/* Title */}
        {title && (
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.navy[200],
  },
  title: {
    ...textStyles.h5,
    fontWeight: fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
});

export default BottomSheet;

