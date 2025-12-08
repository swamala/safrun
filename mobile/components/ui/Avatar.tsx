/**
 * SAFRUN Avatar Component
 * Circular avatar with optional gradient ring
 */

import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { fontWeight } from '@/theme/typography';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  source?: ImageSourcePropType | null;
  name?: string;
  size?: AvatarSize;
  showRing?: boolean;
  ringColor?: 'primary' | 'success' | 'danger' | 'warning';
  online?: boolean;
  style?: ViewStyle;
}

export function Avatar({
  source,
  name,
  size = 'md',
  showRing = false,
  ringColor = 'primary',
  online,
  style,
}: AvatarProps) {
  const { theme, isDark } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return { size: 24, fontSize: 10, ringWidth: 2, statusSize: 8 };
      case 'sm':
        return { size: 32, fontSize: 12, ringWidth: 2, statusSize: 10 };
      case 'lg':
        return { size: 56, fontSize: 20, ringWidth: 3, statusSize: 14 };
      case 'xl':
        return { size: 72, fontSize: 26, ringWidth: 3, statusSize: 16 };
      case '2xl':
        return { size: 96, fontSize: 34, ringWidth: 4, statusSize: 20 };
      default:
        return { size: 44, fontSize: 16, ringWidth: 3, statusSize: 12 };
    }
  };

  const getRingColors = (): [string, string] => {
    switch (ringColor) {
      case 'success':
        return [colors.safety[400], colors.safety[600]];
      case 'danger':
        return [colors.danger[400], colors.danger[600]];
      case 'warning':
        return [colors.warning[400], colors.warning[600]];
      default:
        return [colors.safrun.start, colors.safrun.end];
    }
  };

  const sizeStyles = getSizeStyles();
  const ringColors = getRingColors();

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const avatarContent = source ? (
    <Image
      source={source}
      style={[
        styles.image,
        {
          width: sizeStyles.size,
          height: sizeStyles.size,
          borderRadius: sizeStyles.size / 2,
        },
      ]}
    />
  ) : (
    <View
      style={[
        styles.placeholder,
        {
          width: sizeStyles.size,
          height: sizeStyles.size,
          borderRadius: sizeStyles.size / 2,
          backgroundColor: isDark
            ? 'rgba(255, 138, 0, 0.2)'
            : `${colors.safrun[500]}20`,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: sizeStyles.fontSize,
            color: colors.safrun[500],
          },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );

  const avatarWithStatus = (
    <View style={styles.avatarContainer}>
      {avatarContent}
      {online !== undefined && (
        <View
          style={[
            styles.statusDot,
            {
              width: sizeStyles.statusSize,
              height: sizeStyles.statusSize,
              borderRadius: sizeStyles.statusSize / 2,
              backgroundColor: online ? colors.safety[500] : colors.navy[400],
              borderWidth: 2,
              borderColor: isDark ? colors.navy[900] : colors.white,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );

  if (showRing) {
    return (
      <View style={style}>
        <LinearGradient
          colors={ringColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.ring,
            {
              width: sizeStyles.size + sizeStyles.ringWidth * 2 + 4,
              height: sizeStyles.size + sizeStyles.ringWidth * 2 + 4,
              borderRadius: (sizeStyles.size + sizeStyles.ringWidth * 2 + 4) / 2,
              padding: sizeStyles.ringWidth,
            },
          ]}
        >
          <View
            style={[
              styles.ringInner,
              {
                backgroundColor: isDark ? colors.navy[900] : colors.white,
                padding: 2,
                borderRadius: sizeStyles.size / 2 + 2,
              },
            ]}
          >
            {avatarWithStatus}
          </View>
        </LinearGradient>
      </View>
    );
  }

  return <View style={style}>{avatarWithStatus}</View>;
}

/**
 * Avatar Group - Stack multiple avatars
 */
interface AvatarGroupProps {
  avatars: Array<{
    source?: ImageSourcePropType | null;
    name?: string;
  }>;
  max?: number;
  size?: AvatarSize;
  style?: ViewStyle;
}

export function AvatarGroup({ avatars, max = 4, size = 'sm', style }: AvatarGroupProps) {
  const { theme, isDark } = useTheme();
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const getSizeValue = () => {
    const sizes = { xs: 24, sm: 32, md: 44, lg: 56, xl: 72, '2xl': 96 };
    return sizes[size];
  };

  const sizeValue = getSizeValue();
  const overlap = sizeValue * 0.3;

  return (
    <View style={[styles.avatarGroup, style]}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.avatarGroupItem,
            {
              marginLeft: index === 0 ? 0 : -overlap,
              zIndex: displayAvatars.length - index,
              borderWidth: 2,
              borderColor: isDark ? colors.navy[900] : colors.white,
              borderRadius: sizeValue / 2 + 2,
            },
          ]}
        >
          <Avatar source={avatar.source} name={avatar.name} size={size} />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.avatarGroupItem,
            styles.remainingBadge,
            {
              marginLeft: -overlap,
              zIndex: 0,
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.1)'
                : colors.navy[200],
              borderWidth: 2,
              borderColor: isDark ? colors.navy[900] : colors.white,
            },
          ]}
        >
          <Text
            style={[
              styles.remainingText,
              {
                fontSize: sizeValue * 0.35,
                color: theme.text.secondary,
              },
            ]}
          >
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: fontWeight.semibold,
  },
  statusDot: {
    position: 'absolute',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGroupItem: {
    backgroundColor: 'transparent',
  },
  remainingBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingText: {
    fontWeight: fontWeight.semibold,
  },
});

export default Avatar;

