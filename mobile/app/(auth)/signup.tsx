/**
 * SAFRUN Sign Up Screen
 * Mobile-first registration screen with SAFRUN design system
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
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Input, PasswordInput, LogoHeader } from '@/components';
import {
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  CheckIcon,
} from '@/components/Icons';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!agreedToTerms) {
      // Show error
      return;
    }
    if (password !== confirmPassword) {
      // Show error
      return;
    }

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
            <Text style={[styles.title, { color: theme.text.primary }]}>Create your account</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Start your safe running journey today
            </Text>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Display Name"
                placeholder="Your name"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                leftIcon={<UserIcon size={20} color={theme.text.muted} />}
              />

              <Input
                label="Email"
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

              <PasswordInput
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                leftIcon={<LockIcon size={20} color={theme.text.muted} />}
                showPasswordIcon={<EyeIcon size={20} color={theme.text.muted} />}
                hidePasswordIcon={<EyeOffIcon size={20} color={theme.text.muted} />}
              />

              {/* Terms Agreement */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: agreedToTerms ? colors.safrun[500] : 'transparent',
                      borderColor: agreedToTerms
                        ? colors.safrun[500]
                        : isDark
                        ? 'rgba(255, 255, 255, 0.2)'
                        : colors.navy[300],
                    },
                  ]}
                >
                  {agreedToTerms && <CheckIcon size={12} color={colors.white} />}
                </View>
                <Text style={[styles.termsText, { color: theme.text.secondary }]}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Sign Up Button */}
              <Button
                onPress={handleSignUp}
                fullWidth
                size="lg"
                loading={isLoading}
                disabled={!agreedToTerms}
                rightIcon={!isLoading && <ArrowRightIcon size={20} color={colors.white} />}
                style={{ marginTop: spacing.grid[3] }}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </View>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.navy[200] },
                ]}
              />
              <Text style={[styles.signInText, { color: theme.text.secondary }]}>
                Already have an account?{' '}
                <Link href="/(auth)/signin" asChild>
                  <Text style={styles.signInLink}>Sign in</Text>
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.grid[2],
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[2],
    marginTop: 2,
  },
  termsText: {
    ...textStyles.bodySm,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.safrun[500],
    fontWeight: fontWeight.medium,
  },
  signInContainer: {
    marginTop: spacing.grid[4],
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: spacing.grid[4],
  },
  signInText: {
    ...textStyles.body,
    textAlign: 'center',
  },
  signInLink: {
    color: colors.safrun[500],
    fontWeight: fontWeight.semibold,
  },
});

