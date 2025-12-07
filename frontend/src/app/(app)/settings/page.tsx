'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Phone,
  Eye,
  Lock,
  ChevronRight,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Profile {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  safetySettings: {
    autoSOSEnabled: boolean;
    fallDetectionEnabled: boolean;
    noMovementTimeout: number;
    sosVerificationTime: number;
  };
  privacySettings: {
    profileVisibility: string;
    showOnNearbyRadar: boolean;
    allowGroupInvites: boolean;
    anonymousModeEnabled: boolean;
  };
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  isVerified: boolean;
}

// Toggle Switch Component
function Toggle({ 
  checked, 
  onChange,
  label,
  description,
}: { 
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div 
      className="flex items-center justify-between p-4 rounded-xl"
      style={{
        background: 'rgba(var(--muted), 0.3)',
      }}
    >
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'safety' | 'privacy' | 'contacts'>('profile');

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [safetySettings, setSafetySettings] = useState({
    autoSOSEnabled: false,
    fallDetectionEnabled: false,
    noMovementTimeout: 300,
    sosVerificationTime: 10,
  });
  const [privacySettings, setPrivacySettings] = useState({
    showOnNearbyRadar: true,
    allowGroupInvites: true,
    anonymousModeEnabled: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, contactsData] = await Promise.all([
          api.getProfile(),
          api.getEmergencyContacts(),
        ]);
        setProfile(profileData);
        setContacts(contactsData);
        setDisplayName(profileData.displayName);
        setBio(profileData.bio || '');
        setSafetySettings(profileData.safetySettings);
        setPrivacySettings({
          showOnNearbyRadar: profileData.privacySettings.showOnNearbyRadar,
          allowGroupInvites: profileData.privacySettings.allowGroupInvites,
          anonymousModeEnabled: profileData.privacySettings.anonymousModeEnabled,
        });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile({ displayName, bio });
      setUser({ ...user!, displayName });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSafety = async () => {
    setIsSaving(true);
    try {
      await api.updateSafetySettings(safetySettings);
      toast.success('Safety settings updated');
    } catch {
      toast.error('Failed to update safety settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
        Settings
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap',
              activeTab === tab.id
                ? 'text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            )}
            style={activeTab === tab.id ? {
              background: 'linear-gradient(135deg, #FF8A2B 0%, #FF6A00 100%)',
              boxShadow: '0 4px 12px rgba(255, 140, 0, 0.25)',
            } : {
              background: 'rgba(var(--muted), 0.3)',
            }}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your public profile details</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <Avatar
                  src={profile?.avatarUrl}
                  name={displayName}
                  size="xl"
                />
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
              </div>

              <Input
                label="Display Name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              <Textarea
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={4}
              />

              <Button 
                onClick={handleSaveProfile} 
                isLoading={isSaving}
                leftIcon={<Save className="w-5 h-5" />}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Safety Tab */}
      {activeTab === 'safety' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Safety Settings</CardTitle>
              <CardDescription>Configure your safety features</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Toggle
                checked={safetySettings.autoSOSEnabled}
                onChange={(checked) => setSafetySettings({ ...safetySettings, autoSOSEnabled: checked })}
                label="Auto SOS"
                description="Automatically trigger SOS based on motion detection"
              />

              <Toggle
                checked={safetySettings.fallDetectionEnabled}
                onChange={(checked) => setSafetySettings({ ...safetySettings, fallDetectionEnabled: checked })}
                label="Fall Detection"
                description="Detect falls and trigger SOS automatically"
              />

              <div 
                className="p-4 rounded-xl space-y-3"
                style={{ background: 'rgba(var(--muted), 0.3)' }}
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">No Movement Timeout</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Trigger SOS if no movement detected for this duration
                  </p>
                </div>
                <select
                  value={safetySettings.noMovementTimeout}
                  onChange={(e) => setSafetySettings({ ...safetySettings, noMovementTimeout: parseInt(e.target.value) })}
                  className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  <option value={120}>2 minutes</option>
                  <option value={180}>3 minutes</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                </select>
              </div>

              <div 
                className="p-4 rounded-xl space-y-3"
                style={{ background: 'rgba(var(--muted), 0.3)' }}
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">SOS Verification Time</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Time to respond before SOS is activated
                  </p>
                </div>
                <select
                  value={safetySettings.sosVerificationTime}
                  onChange={(e) => setSafetySettings({ ...safetySettings, sosVerificationTime: parseInt(e.target.value) })}
                  className="w-full h-12 px-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                </select>
              </div>

              <Button 
                onClick={handleSaveSafety} 
                isLoading={isSaving}
                leftIcon={<Save className="w-5 h-5" />}
              >
                Save Safety Settings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your visibility and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Toggle
                checked={privacySettings.showOnNearbyRadar}
                onChange={(checked) => setPrivacySettings({ ...privacySettings, showOnNearbyRadar: checked })}
                label="Show on Nearby Radar"
                description="Allow other runners to discover you nearby"
              />

              <Toggle
                checked={privacySettings.allowGroupInvites}
                onChange={(checked) => setPrivacySettings({ ...privacySettings, allowGroupInvites: checked })}
                label="Allow Group Invites"
                description="Let others invite you to running sessions"
              />

              <Toggle
                checked={privacySettings.anonymousModeEnabled}
                onChange={(checked) => setPrivacySettings({ ...privacySettings, anonymousModeEnabled: checked })}
                label="Anonymous Mode"
                description="Hide your name and avatar from others"
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Emergency Contacts Tab */}
      {activeTab === 'contacts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                People who will be notified when you trigger an SOS
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 mb-6">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: 'rgba(var(--muted), 0.3)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center">
                          <Phone className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 dark:text-white">{contact.name}</p>
                            {contact.isPrimary && (
                              <span className="badge badge-primary">Primary</span>
                            )}
                            {contact.isVerified && (
                              <span className="badge badge-success">Verified</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{contact.phone}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{contact.relationship}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon-sm">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Phone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No emergency contacts added</p>
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                fullWidth
                leftIcon={<Plus className="w-5 h-5" />}
              >
                Add Emergency Contact
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
