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
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            )}
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
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your public profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar
                  src={profile?.avatarUrl}
                  name={displayName}
                  size="xl"
                />
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
              </div>

              <div>
                <label className="label">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Tell others about yourself..."
                />
              </div>

              <Button onClick={handleSaveProfile} isLoading={isSaving}>
                <Save className="w-5 h-5 mr-2" />
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
        >
          <Card>
            <CardHeader>
              <CardTitle>Safety Settings</CardTitle>
              <CardDescription>Configure your safety features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <div>
                  <p className="font-medium text-secondary-900">Auto SOS</p>
                  <p className="text-sm text-secondary-500">
                    Automatically trigger SOS based on motion detection
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetySettings.autoSOSEnabled}
                    onChange={(e) =>
                      setSafetySettings({ ...safetySettings, autoSOSEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <div>
                  <p className="font-medium text-secondary-900">Fall Detection</p>
                  <p className="text-sm text-secondary-500">
                    Detect falls and trigger SOS automatically
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetySettings.fallDetectionEnabled}
                    onChange={(e) =>
                      setSafetySettings({ ...safetySettings, fallDetectionEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="p-4 bg-secondary-50 rounded-xl">
                <p className="font-medium text-secondary-900 mb-2">
                  No Movement Timeout
                </p>
                <p className="text-sm text-secondary-500 mb-4">
                  Trigger SOS if no movement detected for this duration
                </p>
                <select
                  value={safetySettings.noMovementTimeout}
                  onChange={(e) =>
                    setSafetySettings({
                      ...safetySettings,
                      noMovementTimeout: parseInt(e.target.value),
                    })
                  }
                  className="input"
                >
                  <option value={120}>2 minutes</option>
                  <option value={180}>3 minutes</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                </select>
              </div>

              <div className="p-4 bg-secondary-50 rounded-xl">
                <p className="font-medium text-secondary-900 mb-2">
                  SOS Verification Time
                </p>
                <p className="text-sm text-secondary-500 mb-4">
                  Time to respond before SOS is activated
                </p>
                <select
                  value={safetySettings.sosVerificationTime}
                  onChange={(e) =>
                    setSafetySettings({
                      ...safetySettings,
                      sosVerificationTime: parseInt(e.target.value),
                    })
                  }
                  className="input"
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                </select>
              </div>

              <Button onClick={handleSaveSafety} isLoading={isSaving}>
                <Save className="w-5 h-5 mr-2" />
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
        >
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your visibility and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <div>
                  <p className="font-medium text-secondary-900">Show on Nearby Radar</p>
                  <p className="text-sm text-secondary-500">
                    Allow other runners to discover you nearby
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.showOnNearbyRadar}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, showOnNearbyRadar: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <div>
                  <p className="font-medium text-secondary-900">Allow Group Invites</p>
                  <p className="text-sm text-secondary-500">
                    Let others invite you to running sessions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowGroupInvites}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, allowGroupInvites: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <div>
                  <p className="font-medium text-secondary-900">Anonymous Mode</p>
                  <p className="text-sm text-secondary-500">
                    Hide your name and avatar from others
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.anonymousModeEnabled}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, anonymousModeEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Emergency Contacts Tab */}
      {activeTab === 'contacts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                People who will be notified when you trigger an SOS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <Phone className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-secondary-900">{contact.name}</p>
                            {contact.isPrimary && (
                              <span className="badge badge-primary">Primary</span>
                            )}
                            {contact.isVerified && (
                              <span className="badge badge-success">Verified</span>
                            )}
                          </div>
                          <p className="text-sm text-secondary-500">{contact.phone}</p>
                          <p className="text-xs text-secondary-400">{contact.relationship}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-5 h-5 text-danger-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Phone className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500">No emergency contacts added</p>
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full">
                <Plus className="w-5 h-5 mr-2" />
                Add Emergency Contact
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

