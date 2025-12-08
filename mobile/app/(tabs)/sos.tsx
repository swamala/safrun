/**
 * SAFRUN SOS Screen
 * Emergency SOS center with alert controls
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Vibration, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Header } from '@/components';
import {
  AlertTriangleIcon,
  ShieldIcon,
  UsersIcon,
  BellIcon,
  ChevronRightIcon,
  XIcon,
  CheckIcon,
} from '@/components/Icons';

// Mock nearby runners
const nearbyRunners = [
  { id: '1', name: 'Sarah C.', distance: '0.3km', status: 'available' },
  { id: '2', name: 'Mike J.', distance: '0.5km', status: 'available' },
  { id: '3', name: 'Emma W.', distance: '0.8km', status: 'running' },
];

export default function SOSScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const handleSOSPress = () => {
    Alert.alert(
      'Activate SOS Alert?',
      'This will notify nearby runners and your emergency contacts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate([0, 500, 200, 500]);
            setIsSOSActive(true);
          },
        },
      ]
    );
  };

  const handleCancelSOS = () => {
    setIsSOSActive(false);
    Vibration.cancel();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="SOS Center" />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* SOS Button */}
        <View style={styles.sosSection}>
          {isSOSActive ? (
            // Active SOS State
            <View style={styles.activeSOSContainer}>
              <View style={[styles.activeSOSIndicator, shadows.glowRed]}>
                <View style={styles.pulseRing} />
                <View style={styles.pulseRing2} />
                <LinearGradient
                  colors={[colors.danger[500], colors.danger[600]]}
                  style={styles.activeSOSButton}
                >
                  <AlertTriangleIcon size={48} color={colors.white} />
                </LinearGradient>
              </View>
              <Text style={[styles.activeSOSTitle, { color: colors.danger[500] }]}>
                SOS ACTIVE
              </Text>
              <Text style={[styles.activeSOSSubtitle, { color: theme.text.secondary }]}>
                Alerting nearby runners and emergency contacts...
              </Text>
              <Button
                variant="outline"
                onPress={handleCancelSOS}
                leftIcon={<XIcon size={20} color={theme.text.primary} />}
                style={{ marginTop: spacing.grid[4] }}
              >
                Cancel Alert
              </Button>
            </View>
          ) : (
            // Normal State
            <View style={styles.sosButtonContainer}>
              <TouchableOpacity
                onPress={handleSOSPress}
                activeOpacity={0.8}
                style={[styles.sosButton, shadows.glowRed]}
              >
                <LinearGradient
                  colors={[colors.danger[500], colors.danger[600]]}
                  style={styles.sosButtonGradient}
                >
                  <AlertTriangleIcon size={48} color={colors.white} />
                  <Text style={styles.sosButtonText}>SOS</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={[styles.sosHint, { color: theme.text.secondary }]}>
                Tap to activate emergency alert
              </Text>
            </View>
          )}
        </View>

        {/* Nearby Runners */}
        <Card padding="none" style={styles.sectionCard}>
          <CardHeader style={styles.cardHeader}>
            <CardTitle icon={<UsersIcon size={20} color={colors.safrun[500]} />}>
              Nearby Runners
            </CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            {nearbyRunners.map((runner) => (
              <View
                key={runner.id}
                style={[
                  styles.runnerItem,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.navy[50],
                  },
                ]}
              >
                <View style={styles.runnerAvatar}>
                  <Text style={styles.runnerInitial}>{runner.name.charAt(0)}</Text>
                </View>
                <View style={styles.runnerInfo}>
                  <Text style={[styles.runnerName, { color: theme.text.primary }]}>
                    {runner.name}
                  </Text>
                  <Text style={[styles.runnerDistance, { color: theme.text.secondary }]}>
                    {runner.distance} away
                  </Text>
                </View>
                <Badge variant={runner.status === 'available' ? 'success' : 'primary'} size="sm">
                  {runner.status === 'available' ? 'Available' : 'Running'}
                </Badge>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Safety Settings Quick Access */}
        <Card padding="none" style={styles.sectionCard}>
          <CardHeader style={styles.cardHeader}>
            <CardTitle icon={<ShieldIcon size={20} color={colors.safety[500]} />}>
              Safety Features
            </CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <View style={styles.featureItem}>
              <View style={styles.featureLeft}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: `${colors.safety[500]}15` },
                  ]}
                >
                  <BellIcon size={20} color={colors.safety[500]} />
                </View>
                <View>
                  <Text style={[styles.featureName, { color: theme.text.primary }]}>
                    Auto SOS Alert
                  </Text>
                  <Text style={[styles.featureDesc, { color: theme.text.secondary }]}>
                    Triggers when you stop moving
                  </Text>
                </View>
              </View>
              <Badge variant="success">On</Badge>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureLeft}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: `${colors.warning[500]}15` },
                  ]}
                >
                  <AlertTriangleIcon size={20} color={colors.warning[500]} />
                </View>
                <View>
                  <Text style={[styles.featureName, { color: theme.text.primary }]}>
                    Fall Detection
                  </Text>
                  <Text style={[styles.featureDesc, { color: theme.text.secondary }]}>
                    Detects sudden falls automatically
                  </Text>
                </View>
              </View>
              <Badge variant="secondary">Off</Badge>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureLeft}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: `${colors.safrun[500]}15` },
                  ]}
                >
                  <UsersIcon size={20} color={colors.safrun[500]} />
                </View>
                <View>
                  <Text style={[styles.featureName, { color: theme.text.primary }]}>
                    Emergency Contacts
                  </Text>
                  <Text style={[styles.featureDesc, { color: theme.text.secondary }]}>
                    3 contacts configured
                  </Text>
                </View>
              </View>
              <ChevronRightIcon size={20} color={theme.text.muted} />
            </View>
          </CardContent>
        </Card>

        {/* Emergency Info */}
        <Card
          padding="lg"
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : `${colors.danger[500]}08`,
              borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : `${colors.danger[500]}20`,
            },
          ]}
        >
          <View style={styles.infoIcon}>
            <AlertTriangleIcon size={24} color={colors.danger[500]} />
          </View>
          <Text style={[styles.infoTitle, { color: theme.text.primary }]}>
            How SOS Works
          </Text>
          <Text style={[styles.infoText, { color: theme.text.secondary }]}>
            When activated, your location is instantly shared with nearby runners within 5km and your emergency contacts receive an alert with your real-time location.
          </Text>
        </Card>
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
  sosSection: {
    alignItems: 'center',
    paddingVertical: spacing.grid[5],
    marginBottom: spacing.grid[4],
  },
  sosButtonContainer: {
    alignItems: 'center',
  },
  sosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  sosButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButtonText: {
    ...textStyles.h3,
    color: colors.white,
    fontWeight: fontWeight.bold,
    marginTop: spacing.grid[1],
  },
  sosHint: {
    ...textStyles.bodySm,
    marginTop: spacing.grid[3],
  },
  activeSOSContainer: {
    alignItems: 'center',
  },
  activeSOSIndicator: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: `${colors.danger[500]}20`,
  },
  pulseRing2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${colors.danger[500]}10`,
  },
  activeSOSButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSOSTitle: {
    ...textStyles.h3,
    fontWeight: fontWeight.bold,
    marginTop: spacing.grid[4],
  },
  activeSOSSubtitle: {
    ...textStyles.body,
    textAlign: 'center',
    marginTop: spacing.grid[1],
  },
  sectionCard: {
    marginBottom: spacing.grid[4],
  },
  cardHeader: {
    padding: spacing.grid[4],
    paddingBottom: 0,
  },
  cardContent: {
    padding: spacing.grid[4],
    paddingTop: spacing.grid[3],
  },
  runnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.grid[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing.grid[2],
  },
  runnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.safrun[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[3],
  },
  runnerInitial: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: 16,
  },
  runnerInfo: {
    flex: 1,
  },
  runnerName: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
  },
  runnerDistance: {
    ...textStyles.bodySm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.grid[3],
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.grid[3],
  },
  featureName: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
  },
  featureDesc: {
    ...textStyles.bodySm,
    marginTop: 2,
  },
  infoCard: {
    borderWidth: 1,
  },
  infoIcon: {
    marginBottom: spacing.grid[2],
  },
  infoTitle: {
    ...textStyles.h6,
    marginBottom: spacing.grid[1],
  },
  infoText: {
    ...textStyles.bodySm,
    lineHeight: 20,
  },
});

