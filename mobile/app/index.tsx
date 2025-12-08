/**
 * SAFRUN Welcome/Splash Screen
 * Entry point that redirects to auth or main app
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { Button } from '@/components';
import { ShieldIcon, ArrowRightIcon, MapPinIcon, UsersIcon } from '@/components/Icons';

const features = [
  { icon: MapPinIcon, text: 'Real-time location tracking' },
  { icon: ShieldIcon, text: 'Emergency SOS alerts' },
  { icon: UsersIcon, text: 'Community protection' },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(255, 138, 0, 0.15)', 'transparent']
              : ['rgba(255, 138, 0, 0.08)', 'transparent']
          }
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
        />
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + spacing.grid[5] }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <ShieldIcon size={32} color={colors.white} />
          </View>
          <Text style={styles.logoText}>
            <Text style={{ color: theme.text.primary }}>SAF</Text>
            <Text style={{ color: colors.safrun[500] }}>RUN</Text>
          </Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: theme.text.primary }]}>
            Run Safe,{'\n'}
            <Text style={styles.heroTitleGradient}>Run Together</Text>
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.text.secondary }]}>
            Join thousands of runners who trust SAFRUN to keep them safe during every run.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[
                styles.featureItem,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.white,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200],
                },
              ]}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: `${colors.safrun[500]}15` },
                ]}
              >
                <feature.icon size={20} color={colors.safrun[500]} />
              </View>
              <Text style={[styles.featureText, { color: theme.text.secondary }]}>
                {feature.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.grid[4] }]}>
        <Button
          onPress={() => router.push('/(auth)/signup')}
          fullWidth
          size="lg"
          rightIcon={<ArrowRightIcon size={20} color={colors.white} />}
        >
          Get Started
        </Button>

        <Button
          onPress={() => router.push('/(auth)/signin')}
          variant="ghost"
          fullWidth
          size="lg"
          style={{ marginTop: spacing.grid[2] }}
        >
          <Text style={{ color: theme.text.secondary }}>
            Already have an account?{' '}
            <Text style={{ color: colors.safrun[500], fontWeight: fontWeight.semibold }}>
              Sign In
            </Text>
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.grid[4],
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.grid[5],
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.safrun[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[2],
  },
  logoText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  heroSection: {
    marginBottom: spacing.grid[5],
  },
  heroTitle: {
    ...textStyles.h1,
    marginBottom: spacing.grid[3],
  },
  heroTitleGradient: {
    color: colors.safrun[500],
  },
  heroSubtitle: {
    ...textStyles.bodyLg,
    lineHeight: 28,
  },
  features: {
    gap: spacing.grid[2],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.grid[3],
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[3],
  },
  featureText: {
    ...textStyles.body,
    flex: 1,
  },
  bottomActions: {
    paddingHorizontal: spacing.grid[4],
    paddingTop: spacing.grid[4],
  },
});

