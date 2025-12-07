import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const user1 = await prisma.user.upsert({
    where: { email: 'runner1@example.com' },
    update: {},
    create: {
      email: 'runner1@example.com',
      phone: '+1234567890',
      passwordHash,
      isEmailVerified: true,
      isPhoneVerified: true,
      profile: {
        create: {
          displayName: 'Alex Runner',
          bio: 'Marathon enthusiast | Safety advocate',
          totalDistance: 250000, // 250 km
          totalRuns: 45,
          totalDuration: 86400, // 24 hours total
          averagePace: 5.5, // 5.5 min/km
          autoSOSEnabled: true,
          fallDetectionEnabled: true,
          showOnNearbyRadar: true,
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'runner2@example.com' },
    update: {},
    create: {
      email: 'runner2@example.com',
      phone: '+1234567891',
      passwordHash,
      isEmailVerified: true,
      isPhoneVerified: true,
      profile: {
        create: {
          displayName: 'Sam Jogger',
          bio: 'Morning runs, coffee, and good vibes',
          totalDistance: 150000, // 150 km
          totalRuns: 30,
          totalDuration: 54000, // 15 hours
          averagePace: 6.0, // 6 min/km
          autoSOSEnabled: true,
          fallDetectionEnabled: false,
          showOnNearbyRadar: true,
        },
      },
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'runner3@example.com' },
    update: {},
    create: {
      email: 'runner3@example.com',
      phone: '+1234567892',
      passwordHash,
      isEmailVerified: true,
      isPhoneVerified: false,
      profile: {
        create: {
          displayName: 'Jordan Speed',
          bio: 'Track & field athlete',
          totalDistance: 500000, // 500 km
          totalRuns: 100,
          totalDuration: 150000, // ~42 hours
          averagePace: 4.5, // 4.5 min/km
          autoSOSEnabled: true,
          fallDetectionEnabled: true,
          showOnNearbyRadar: true,
          anonymousModeEnabled: false,
        },
      },
    },
  });

  console.log('✅ Created test users:', { user1: user1.id, user2: user2.id, user3: user3.id });

  // Create emergency contacts for user1
  await prisma.emergencyContact.upsert({
    where: { id: 'ec-1' },
    update: {},
    create: {
      id: 'ec-1',
      userId: user1.id,
      name: 'Emergency Contact 1',
      phone: '+1234567899',
      email: 'emergency@example.com',
      relationship: 'spouse',
      isPrimary: true,
      canReceiveSOS: true,
      canViewLocation: true,
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  console.log('✅ Created emergency contacts');

  // Create a sample running session
  const session = await prisma.runSession.upsert({
    where: { id: 'session-1' },
    update: {},
    create: {
      id: 'session-1',
      creatorId: user1.id,
      name: 'Morning Run Group',
      description: 'Daily 5K morning run through the park',
      status: 'SCHEDULED',
      privacy: 'PUBLIC',
      scheduledStartAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startLatitude: 37.7749,
      startLongitude: -122.4194,
      plannedDistance: 5000, // 5 km
      maxParticipants: 20,
      allowLateJoin: true,
      shareRoutePublic: true,
    },
  });

  // Add participants
  await prisma.runParticipant.upsert({
    where: {
      sessionId_userId: {
        sessionId: session.id,
        userId: user1.id,
      },
    },
    update: {},
    create: {
      sessionId: session.id,
      userId: user1.id,
      role: 'ADMIN',
      status: 'JOINED',
    },
  });

  await prisma.runParticipant.upsert({
    where: {
      sessionId_userId: {
        sessionId: session.id,
        userId: user2.id,
      },
    },
    update: {},
    create: {
      sessionId: session.id,
      userId: user2.id,
      role: 'MEMBER',
      status: 'JOINED',
    },
  });

  console.log('✅ Created sample session with participants');

  console.log('🌱 Database seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

