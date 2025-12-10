import { HttpClient } from './client';
import type {
  Profile,
  UpdateProfileRequest,
  SafetySettings,
  PrivacySettings,
  EmergencyContact,
  CreateEmergencyContactRequest,
} from './types';

export class ProfileApi {
  constructor(private http: HttpClient) {}

  async getProfile(): Promise<Profile> {
    return this.http.get<Profile>('/profile');
  }

  async getPublicProfile(userId: string): Promise<Partial<Profile>> {
    return this.http.get<Partial<Profile>>(`/profile/${userId}/public`);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<Profile> {
    return this.http.put<Profile>('/profile', data);
  }

  async uploadAvatar(formData: FormData | { avatar: File | Blob }): Promise<{ avatarUrl: string; thumbnailUrl: string }> {
    // If formData is already FormData, use it directly
    if (formData instanceof FormData) {
      return this.http.upload('/profile/avatar', formData);
    }
    
    // Otherwise, create FormData
    const data = new FormData();
    data.append('avatar', formData.avatar);
    return this.http.upload('/profile/avatar', data);
  }

  async updateSafetySettings(settings: SafetySettings): Promise<Profile> {
    return this.http.patch<Profile>('/profile/safety', settings);
  }

  async updatePrivacySettings(settings: PrivacySettings): Promise<Profile> {
    return this.http.patch<Profile>('/profile/privacy', settings);
  }

  // Emergency Contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return this.http.get<EmergencyContact[]>('/profile/emergency-contacts');
  }

  async addEmergencyContact(data: CreateEmergencyContactRequest): Promise<EmergencyContact> {
    return this.http.put<EmergencyContact>('/profile/emergency-contacts', data);
  }

  async updateEmergencyContact(
    contactId: string,
    data: Partial<CreateEmergencyContactRequest>
  ): Promise<EmergencyContact> {
    return this.http.patch<EmergencyContact>(`/profile/emergency-contacts/${contactId}`, data);
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    await this.http.patch(`/profile/emergency-contacts/${contactId}/delete`, {});
  }
}

