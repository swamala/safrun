/**
 * SAFRUN Edit Profile Screen
 * Update profile information including avatar
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { textStyles, fontWeight } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { Button, Card, Header } from '@/components';
import { LoadingOverlay } from '@/components/ui';
import { sdk } from '@/lib/sdk';
import { useAuthStore } from '@/lib/store';
import {
  ArrowLeftIcon,
  UserIcon,
  CameraIcon,
  CheckIcon,
} from '@/components/Icons';
import type { Profile } from '@safrun/sdk';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await sdk.profile.getProfile();
      setProfile(data);
      setDisplayName(data.displayName);
      setBio(data.bio || '');
      setAvatarUri(data.avatarUrl || null);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to fetch profile:', error);
      }
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permission to update your avatar.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permission to take a photo.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleAvatarPress = () => {
    Alert.alert('Update Profile Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setIsSaving(true);
    try {
      let avatarUrl = profile?.avatarUrl;

      // Upload avatar if changed
      if (avatarUri && avatarUri !== profile?.avatarUrl) {
        try {
          // Create form data for upload
          const formData = new FormData();
          const filename = avatarUri.split('/').pop() || 'avatar.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          formData.append('avatar', {
            uri: avatarUri,
            name: filename,
            type,
          } as any);

          // Upload avatar (cast to any to bypass FormData type mismatch)
          const response = await (sdk.profile.uploadAvatar as any)(formData);
          avatarUrl = response.avatarUrl;
        } catch (error) {
          if (__DEV__) {
            console.error('Avatar upload failed:', error);
          }
          Alert.alert('Warning', 'Avatar upload failed, but profile will be updated.');
        }
      }

      // Update profile (avatarUrl is updated via the uploadAvatar endpoint)
      await sdk.profile.updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to update profile:', error);
      }
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LoadingOverlay visible={isLoading || isSaving} message={isSaving ? 'Saving...' : 'Loading...'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeftIcon size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Edit Profile
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: isDark ? colors.navy[700] : colors.navy[100],
                },
                shadows.md,
              ]}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <UserIcon size={64} color={colors.safrun[500]} />
              )}
              <View style={styles.cameraButton}>
                <CameraIcon size={20} color={colors.white} />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: theme.text.secondary }]}>
            Tap to change photo
          </Text>
        </View>

        {/* Form Fields */}
        <Card padding="lg" style={styles.formCard}>
          {/* Display Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.primary }]}>
              Display Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.navy[800] : colors.navy[50],
                  color: theme.text.primary,
                  borderColor: isDark ? colors.navy[600] : colors.navy[200],
                },
              ]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor={theme.text.muted}
              maxLength={50}
            />
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Bio</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDark ? colors.navy[800] : colors.navy[50],
                  color: theme.text.primary,
                  borderColor: isDark ? colors.navy[600] : colors.navy[200],
                },
              ]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={theme.text.muted}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            <Text style={[styles.charCount, { color: theme.text.muted }]}>
              {bio.length}/200
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Save Button */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + spacing.md,
            backgroundColor: theme.background,
            borderTopColor: isDark ? colors.navy[800] : colors.navy[200],
          },
          shadows.lg,
        ]}
      >
        <Button
          onPress={handleSave}
          disabled={!displayName.trim() || isSaving}
          leftIcon={<CheckIcon size={20} color={colors.white} />}
          style={styles.saveButton}
        >
          Save Changes
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.h4,
    fontWeight: fontWeight.bold,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.safrun[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarHint: {
    ...textStyles.bodySm,
    marginTop: spacing.sm,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  input: {
    ...textStyles.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  charCount: {
    ...textStyles.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  saveButton: {
    width: '100%',
  },
});

