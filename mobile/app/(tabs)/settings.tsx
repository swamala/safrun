/**
 * SAFRUN Settings Screen
 * User preferences and account settings
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { Button, Card, Header } from '@/components';
import {
  UserIcon,
  ShieldIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  UsersIcon,
  MapPinIcon,
  LockIcon,
} from '@/components/Icons';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme, mode, setMode } = useTheme();

  const SettingItem = ({
    icon,
    iconBg,
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text.primary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (onPress && <ChevronRightIcon size={20} color={theme.text.muted} />)}
    </TouchableOpacity>
  );

  const SettingSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>{title}</Text>
      <Card padding="none" style={styles.sectionCard}>
        {children}
      </Card>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Settings" />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <TouchableOpacity
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.white,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.navy[200],
            },
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text.primary }]}>John Doe</Text>
            <Text style={[styles.profileEmail, { color: theme.text.secondary }]}>
              john.doe@example.com
            </Text>
          </View>
          <ChevronRightIcon size={20} color={theme.text.muted} />
        </TouchableOpacity>

        {/* Appearance */}
        <SettingSection title="APPEARANCE">
          <SettingItem
            icon={isDark ? <MoonIcon size={20} color={colors.safrun[500]} /> : <SunIcon size={20} color={colors.safrun[500]} />}
            iconBg={`${colors.safrun[500]}15`}
            title="Dark Mode"
            subtitle={isDark ? 'On' : 'Off'}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.navy[200], true: `${colors.safrun[500]}50` }}
                thumbColor={isDark ? colors.safrun[500] : colors.navy[100]}
              />
            }
          />
        </SettingSection>

        {/* Safety */}
        <SettingSection title="SAFETY">
          <SettingItem
            icon={<AlertTriangleIcon size={20} color={colors.danger[500]} />}
            iconBg={`${colors.danger[500]}15`}
            title="Auto SOS"
            subtitle="Alert when you stop moving"
            rightElement={
              <Switch
                value={true}
                trackColor={{ false: colors.navy[200], true: `${colors.safety[500]}50` }}
                thumbColor={colors.safety[500]}
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.navy[100] }]} />
          <SettingItem
            icon={<ShieldIcon size={20} color={colors.safety[500]} />}
            iconBg={`${colors.safety[500]}15`}
            title="Fall Detection"
            subtitle="Detect sudden falls"
            rightElement={
              <Switch
                value={false}
                trackColor={{ false: colors.navy[200], true: `${colors.safety[500]}50` }}
                thumbColor={colors.navy[300]}
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.navy[100] }]} />
          <SettingItem
            icon={<UsersIcon size={20} color={colors.safrun[500]} />}
            iconBg={`${colors.safrun[500]}15`}
            title="Emergency Contacts"
            subtitle="3 contacts"
            onPress={() => {}}
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="NOTIFICATIONS">
          <SettingItem
            icon={<BellIcon size={20} color="#3B82F6" />}
            iconBg="rgba(59, 130, 246, 0.15)"
            title="Push Notifications"
            subtitle="SOS alerts, session updates"
            onPress={() => {}}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.navy[100] }]} />
          <SettingItem
            icon={<MapPinIcon size={20} color={colors.safety[500]} />}
            iconBg={`${colors.safety[500]}15`}
            title="Location Sharing"
            subtitle="Share with running group"
            onPress={() => {}}
          />
        </SettingSection>

        {/* Account */}
        <SettingSection title="ACCOUNT">
          <SettingItem
            icon={<LockIcon size={20} color={colors.navy[500]} />}
            iconBg={`${colors.navy[500]}15`}
            title="Change Password"
            onPress={() => {}}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.navy[100] }]} />
          <SettingItem
            icon={<UserIcon size={20} color={colors.navy[500]} />}
            iconBg={`${colors.navy[500]}15`}
            title="Privacy Settings"
            onPress={() => {}}
          />
        </SettingSection>

        {/* Sign Out */}
        <Button
          variant="outline"
          fullWidth
          onPress={() => router.replace('/')}
          style={styles.signOutButton}
        >
          Sign Out
        </Button>

        {/* App Version */}
        <Text style={[styles.version, { color: theme.text.muted }]}>
          SAFRUN v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.grid[3],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.grid[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.grid[4],
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.safrun[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[3],
  },
  profileInitial: {
    color: colors.white,
    fontSize: 20,
    fontWeight: fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...textStyles.h5,
    marginBottom: 2,
  },
  profileEmail: {
    ...textStyles.bodySm,
  },
  section: {
    marginBottom: spacing.grid[4],
  },
  sectionTitle: {
    ...textStyles.caption,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing.grid[2],
    marginLeft: spacing.grid[1],
  },
  sectionCard: {},
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.grid[3],
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[3],
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
  },
  settingSubtitle: {
    ...textStyles.bodySm,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: spacing.grid[3] + 40 + spacing.grid[3],
  },
  signOutButton: {
    marginTop: spacing.grid[2],
  },
  version: {
    ...textStyles.caption,
    textAlign: 'center',
    marginTop: spacing.grid[4],
  },
});

