/**
 * SAFRUN Sign In Screen
 * Mobile-first authentication screen with SAFRUN design system
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Input, PasswordInput, LogoHeader } from '@/components';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  MapPinIcon,
  ShieldIcon,
  UsersIcon,
} from '@/components/Icons';

const features = [
  { icon: MapPinIcon, text: 'Real-time location tracking' },
  { icon: ShieldIcon, text: 'Emergency SOS alerts' },
  { icon: UsersIcon, text: 'Community protection' },
];

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.grid[4] },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo and Theme Toggle */}
          <LogoHeader
            showThemeToggle
            themeIcon={
              isDark ? (
                <SunIcon size={20} color={theme.text.secondary} />
              ) : (
                <MoonIcon size={20} color={theme.text.secondary} />
              )
            }
            onThemeToggle={toggleTheme}
          />

          {/* Form Card */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : `${colors.navy[200]}99`,
              },
              isDark ? shadows.softMd : shadows.soft,
            ]}
          >
            {/* Title */}
            <Text style={[styles.title, { color: theme.text.primary }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Sign in to continue your safe running journey
            </Text>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Email or Phone"
                placeholder="runner@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<MailIcon size={20} color={theme.text.muted} />}
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                leftIcon={<LockIcon size={20} color={theme.text.muted} />}
                showPasswordIcon={<EyeIcon size={20} color={theme.text.muted} />}
                hidePasswordIcon={<EyeOffIcon size={20} color={theme.text.muted} />}
              />

              {/* Remember & Forgot */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: rememberMe ? colors.safrun[500] : 'transparent',
                        borderColor: rememberMe
                          ? colors.safrun[500]
                          : isDark
                          ? 'rgba(255, 255, 255, 0.2)'
                          : colors.navy[300],
                      },
                    ]}
                  >
                    {rememberMe && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={[styles.rememberText, { color: theme.text.secondary }]}>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <Link href={'/(auth)/forgot-password' as any} asChild>
                  <TouchableOpacity>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Sign In Button */}
              <Button
                onPress={handleSignIn}
                fullWidth
                size="lg"
                loading={isLoading}
                rightIcon={!isLoading && <ArrowRightIcon size={20} color={colors.white} />}
                style={{ marginTop: spacing.grid[3] }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200] },
                ]}
              />
              <Text style={[styles.signUpText, { color: theme.text.secondary }]}>
                Don't have an account?{' '}
                <Link href="/(auth)/signup" asChild>
                  <Text style={styles.signUpLink}>Sign up for free</Text>
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.grid[4],
  },
  formCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.grid[4],
    borderWidth: 1,
    marginTop: spacing.grid[4],
  },
  title: {
    ...textStyles.h3,
    marginBottom: spacing.grid[1],
  },
  subtitle: {
    ...textStyles.body,
    marginBottom: spacing.grid[4],
  },
  form: {
    gap: spacing.grid[1],
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.grid[1],
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[1],
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  rememberText: {
    ...textStyles.bodySm,
  },
  forgotText: {
    ...textStyles.bodySm,
    color: colors.safrun[500],
    fontWeight: fontWeight.medium,
  },
  signUpContainer: {
    marginTop: spacing.grid[4],
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: spacing.grid[4],
  },
  signUpText: {
    ...textStyles.body,
    textAlign: 'center',
  },
  signUpLink: {
    color: colors.safrun[500],
    fontWeight: fontWeight.semibold,
  },
});

