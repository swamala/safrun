/**
 * SAFRUN Modal Component
 * Bottom sheet or centered modal with dark scrim and smooth animation
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  ViewStyle,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { XIcon } from '@/components/Icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ModalVariant = 'center' | 'bottom';
type ModalSize = 'sm' | 'md' | 'lg' | 'full';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: ModalVariant;
  size?: ModalSize;
  title?: string;
  showCloseButton?: boolean;
  dismissOnBackdrop?: boolean;
  style?: ViewStyle;
}

export function Modal({
  visible,
  onClose,
  children,
  variant = 'center',
  size = 'md',
  title,
  showCloseButton = true,
  dismissOnBackdrop = true,
  style,
}: ModalProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(variant === 'bottom' ? 300 : 50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: variant === 'bottom' ? 300 : 50,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, variant, opacity, translateY]);

  const getMaxHeight = () => {
    switch (size) {
      case 'sm':
        return SCREEN_HEIGHT * 0.3;
      case 'lg':
        return SCREEN_HEIGHT * 0.8;
      case 'full':
        return SCREEN_HEIGHT - insets.top - 40;
      default:
        return SCREEN_HEIGHT * 0.6;
    }
  };

  const modalContentStyle: ViewStyle = {
    backgroundColor: isDark ? colors.navy[900] : colors.white,
    borderRadius: variant === 'bottom' ? radii.xl : radii.lg,
    borderBottomLeftRadius: variant === 'bottom' ? 0 : radii.lg,
    borderBottomRightRadius: variant === 'bottom' ? 0 : radii.lg,
    maxHeight: getMaxHeight(),
    ...(variant === 'center' && shadows.softLg),
  };

  const containerStyle: ViewStyle = variant === 'bottom'
    ? styles.bottomContainer
    : styles.centerContainer;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.wrapper}>
          {/* Backdrop */}
          <TouchableWithoutFeedback
            onPress={dismissOnBackdrop ? onClose : undefined}
          >
            <Animated.View
              style={[
                styles.backdrop,
                { opacity: opacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }) },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Modal Content */}
          <Animated.View
            style={[
              containerStyle,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <View
              style={[
                modalContentStyle,
                variant === 'bottom' && { paddingBottom: insets.bottom + spacing.md },
                style,
              ]}
            >
              {/* Handle for bottom sheet */}
              {variant === 'bottom' && (
                <View style={styles.handleContainer}>
                  <View
                    style={[
                      styles.handle,
                      { backgroundColor: isDark ? colors.navy[600] : colors.navy[300] },
                    ]}
                  />
                </View>
              )}

              {/* Header */}
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  <Text
                    style={[styles.title, { color: theme.text.primary }]}
                    numberOfLines={1}
                  >
                    {title}
                  </Text>
                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={onClose}
                      style={[
                        styles.closeButton,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : colors.navy[100],
                        },
                      ]}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <XIcon size={18} color={theme.text.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Content */}
              <View style={styles.content}>{children}</View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

/**
 * Modal Footer for actions
 */
interface ModalFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ModalFooter({ children, style }: ModalFooterProps) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[200],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...textStyles.h5,
    fontWeight: fontWeight.semibold,
    flex: 1,
    marginRight: spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    marginTop: spacing.sm,
  },
});

export default Modal;

