import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import {
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
  EmergencyContactResponseDto,
} from '../dto/profile.dto';

@Injectable()
export class EmergencyContactService {
  private readonly logger = new Logger(EmergencyContactService.name);
  private readonly MAX_CONTACTS = 5;

  constructor(private readonly prisma: PrismaService) {}

  async getContacts(userId: string): Promise<EmergencyContactResponseDto[]> {
    const contacts = await this.prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    return contacts.map(this.mapToResponse);
  }

  async createContact(
    userId: string,
    dto: CreateEmergencyContactDto,
  ): Promise<EmergencyContactResponseDto> {
    // Check max contacts limit
    const existingCount = await this.prisma.emergencyContact.count({
      where: { userId },
    });

    if (existingCount >= this.MAX_CONTACTS) {
      throw new BadRequestException(`Maximum ${this.MAX_CONTACTS} emergency contacts allowed`);
    }

    // If this is primary, unset other primary contacts
    if (dto.isPrimary) {
      await this.prisma.emergencyContact.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Check if guardian is also a user
    const guardianUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: dto.phone }, { email: dto.email }],
      },
    });

    const contact = await this.prisma.emergencyContact.create({
      data: {
        userId,
        guardianId: guardianUser?.id,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        relationship: dto.relationship,
        canViewLocation: dto.canViewLocation ?? true,
        canReceiveSOS: dto.canReceiveSOS ?? true,
        isPrimary: dto.isPrimary ?? false,
      },
    });

    this.logger.log(`Emergency contact created for user ${userId}: ${contact.id}`);

    return this.mapToResponse(contact);
  }

  async updateContact(
    userId: string,
    contactId: string,
    dto: UpdateEmergencyContactDto,
  ): Promise<EmergencyContactResponseDto> {
    const existing = await this.prisma.emergencyContact.findFirst({
      where: { id: contactId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Emergency contact not found');
    }

    // If setting as primary, unset other primary contacts
    if (dto.isPrimary) {
      await this.prisma.emergencyContact.updateMany({
        where: { userId, isPrimary: true, id: { not: contactId } },
        data: { isPrimary: false },
      });
    }

    const contact = await this.prisma.emergencyContact.update({
      where: { id: contactId },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        relationship: dto.relationship,
        canViewLocation: dto.canViewLocation,
        canReceiveSOS: dto.canReceiveSOS,
        isPrimary: dto.isPrimary,
      },
    });

    this.logger.log(`Emergency contact updated: ${contactId}`);

    return this.mapToResponse(contact);
  }

  async deleteContact(userId: string, contactId: string): Promise<void> {
    const existing = await this.prisma.emergencyContact.findFirst({
      where: { id: contactId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Emergency contact not found');
    }

    await this.prisma.emergencyContact.delete({
      where: { id: contactId },
    });

    this.logger.log(`Emergency contact deleted: ${contactId}`);
  }

  async getSOSContacts(userId: string): Promise<EmergencyContactResponseDto[]> {
    const contacts = await this.prisma.emergencyContact.findMany({
      where: { userId, canReceiveSOS: true },
      orderBy: { isPrimary: 'desc' },
    });

    return contacts.map(this.mapToResponse);
  }

  private mapToResponse(contact: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    relationship: string;
    canViewLocation: boolean;
    canReceiveSOS: boolean;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt: Date | null;
  }): EmergencyContactResponseDto {
    return {
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      relationship: contact.relationship,
      canViewLocation: contact.canViewLocation,
      canReceiveSOS: contact.canReceiveSOS,
      isPrimary: contact.isPrimary,
      isVerified: contact.isVerified,
      verifiedAt: contact.verifiedAt,
    };
  }
}

