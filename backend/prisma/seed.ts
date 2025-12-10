/**
 * SAFRUN Database Seed Script
 * 
 * Populates the database with realistic test data for development and testing.
 * 
 * Usage: npx prisma db seed
 * 
 * This script creates:
 * - 12 users (10 regular + 2 admins) with profiles
 * - 1-3 devices per user with refresh tokens
 * - 5-10 run sessions with participants
 * - 1-3 solo runs per user
 * - Live locations for active users
 * - 5-10 SOS alerts with responders
 * - Emergency contacts
 * - Feed items and stats
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// =============================================================================
// Configuration
// =============================================================================

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'SafRun2024!';

// San Francisco Bay Area coordinates for realistic locations
const SF_CENTER = { lat: 37.7749, lng: -122.4194 };
const SF_RADIUS = 0.05; // ~5km radius

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a random UUID
 */
function uuid(): string {
  return crypto.randomUUID();
}

/**
 * Generate random coordinates near a center point
 */
function randomCoords(center = SF_CENTER, radius = SF_RADIUS): { lat: number; lng: number } {
  const lat = center.lat + (Math.random() - 0.5) * 2 * radius;
  const lng = center.lng + (Math.random() - 0.5) * 2 * radius;
  return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
}

/**
 * Generate a geohash-like string for coordinates (simplified)
 */
function simpleGeohash(lat: number, lng: number): string {
  const latStr = ((lat + 90) * 10000).toFixed(0).padStart(7, '0');
  const lngStr = ((lng + 180) * 10000).toFixed(0).padStart(7, '0');
  return `${latStr}${lngStr}`;
}

/**
 * Generate a random phone number
 */
function randomPhone(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const subscriber = Math.floor(Math.random() * 9000) + 1000;
  return `+1${area}${exchange}${subscriber}`;
}

/**
 * Generate random date within a range
 */
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate a date in the past N days
 */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Generate a date N hours ago
 */
function hoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

/**
 * Generate a random JWT-like token
 */
function generateToken(): string {
  return `${crypto.randomBytes(32).toString('base64url')}.${crypto.randomBytes(32).toString('base64url')}.${crypto.randomBytes(32).toString('base64url')}`;
}

/**
 * Generate an encoded polyline (simplified)
 */
function generatePolyline(startCoords: { lat: number; lng: number }, points: number): string {
  const coords: string[] = [];
  let lat = startCoords.lat;
  let lng = startCoords.lng;
  
  for (let i = 0; i < points; i++) {
    lat += (Math.random() - 0.3) * 0.002; // Slight northward bias
    lng += (Math.random() - 0.5) * 0.002;
    coords.push(`${lat.toFixed(6)},${lng.toFixed(6)}`);
  }
  
  // Simple encoding: base64 of comma-separated coords
  return Buffer.from(coords.join(';')).toString('base64');
}

/**
 * Generate random pace (min/km) - realistic range 4-8 min/km
 */
function randomPace(): number {
  return parseFloat((4 + Math.random() * 4).toFixed(2));
}

/**
 * Generate random distance (meters) - realistic range 1-15 km
 */
function randomDistance(): number {
  return Math.floor(1000 + Math.random() * 14000);
}

/**
 * Generate random duration based on distance and pace
 */
function calculateDuration(distanceMeters: number, paceMinPerKm: number): number {
  const distanceKm = distanceMeters / 1000;
  return Math.floor(distanceKm * paceMinPerKm * 60);
}

/**
 * Generate random calories based on distance
 */
function calculateCalories(distanceMeters: number): number {
  // Rough estimate: ~60 calories per km
  return Math.floor((distanceMeters / 1000) * 60 * (0.9 + Math.random() * 0.2));
}

/**
 * Pick random item from array
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick N random items from array (no duplicates)
 */
function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// =============================================================================
// User Data
// =============================================================================

const USER_DATA = [
  // Admin users
  { email: 'admin@safrun.com', displayName: 'Admin User', isAdmin: true },
  { email: 'moderator@safrun.com', displayName: 'Mod Smith', isAdmin: true },
  // Regular users with varied statuses
  { email: 'sarah.chen@example.com', phone: '+14155551001', displayName: 'Sarah Chen', status: 'ACTIVE' },
  { email: 'marcus.johnson@example.com', phone: '+14155551002', displayName: 'Marcus Johnson', status: 'ACTIVE' },
  { email: 'emily.rodriguez@example.com', phone: '+14155551003', displayName: 'Emily Rodriguez', status: 'ACTIVE' },
  { email: 'david.kim@example.com', phone: '+14155551004', displayName: 'David Kim', status: 'ACTIVE' },
  { email: 'aisha.patel@example.com', phone: '+14155551005', displayName: 'Aisha Patel', status: 'ACTIVE' },
  { email: 'jake.thompson@example.com', phone: '+14155551006', displayName: 'Jake Thompson', status: 'INACTIVE' },
  { email: 'lisa.wang@example.com', phone: '+14155551007', displayName: 'Lisa Wang', status: 'ACTIVE' },
  { email: 'omar.hassan@example.com', phone: '+14155551008', displayName: 'Omar Hassan', status: 'ACTIVE' },
  { email: 'jennifer.lee@example.com', phone: '+14155551009', displayName: 'Jennifer Lee', status: 'SUSPENDED' },
  { email: 'michael.brown@example.com', phone: '+14155551010', displayName: 'Michael Brown', status: 'ACTIVE' },
];

const DEVICE_MODELS = [
  { type: 'IOS', model: 'iPhone 15 Pro', os: 'iOS 17.2' },
  { type: 'IOS', model: 'iPhone 14', os: 'iOS 17.1' },
  { type: 'IOS', model: 'iPhone 13', os: 'iOS 16.5' },
  { type: 'ANDROID', model: 'Pixel 8 Pro', os: 'Android 14' },
  { type: 'ANDROID', model: 'Samsung Galaxy S24', os: 'Android 14' },
  { type: 'ANDROID', model: 'OnePlus 12', os: 'Android 14' },
  { type: 'WEB', model: 'Chrome Browser', os: 'macOS 14.2' },
];

const RELATIONSHIPS = ['spouse', 'parent', 'sibling', 'friend', 'partner', 'roommate'];

const FEED_METADATA_TEMPLATES = {
  RUN_STARTED: { message: 'Started a run' },
  RUN_COMPLETED: (distance: number, duration: number) => ({
    message: 'Completed a run',
    distance,
    duration,
    pace: (duration / 60) / (distance / 1000),
  }),
  SOS_TRIGGERED: { message: 'Triggered SOS alert', severity: 'high' },
  SOS_RESOLVED: { message: 'SOS alert resolved', outcome: 'safe' },
  MILESTONE_REACHED: (milestone: string, value: number) => ({
    message: `Reached ${milestone}`,
    milestone,
    value,
  }),
  SESSION_JOINED: { message: 'Joined a group run' },
  SESSION_CREATED: { message: 'Created a group run session' },
};

// =============================================================================
// Main Seed Function
// =============================================================================

async function main() {
  console.log('🌱 Starting SAFRUN database seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.feedItem.deleteMany();
  await prisma.monthlyStats.deleteMany();
  await prisma.weeklyStats.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.sOSResponder.deleteMany();
  await prisma.sOSAlert.deleteMany();
  await prisma.liveLocation.deleteMany();
  await prisma.runParticipant.deleteMany();
  await prisma.runSession.deleteMany();
  await prisma.soloRun.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.device.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // ==========================================================================
  // 1. CREATE USERS WITH PROFILES
  // ==========================================================================
  console.log('\n👥 Creating users and profiles...');
  
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  const users: Array<{ id: string; email: string | null; displayName: string; isAdmin: boolean }> = [];

  for (const userData of USER_DATA) {
    const userId = uuid();
    const coords = randomCoords();
    
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: userData.email,
        phone: (userData as any).phone || null,
        passwordHash,
        isEmailVerified: true,
        isPhoneVerified: !!(userData as any).phone,
        status: ((userData as any).status as any) || 'ACTIVE',
        lastLoginAt: randomDate(daysAgo(7), new Date()),
        createdAt: randomDate(daysAgo(365), daysAgo(30)),
        profile: {
          create: {
            displayName: userData.displayName,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.displayName)}`,
            avatarThumbnailUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.displayName)}&size=64`,
            bio: `Runner from San Francisco. Love morning runs! 🏃`,
            // Running stats
            totalDistance: Math.floor(Math.random() * 500000) + 50000, // 50-550 km
            totalRuns: Math.floor(Math.random() * 150) + 10,
            totalDuration: Math.floor(Math.random() * 180000) + 18000, // 5-55 hours
            averagePace: randomPace(),
            longestRun: Math.floor(Math.random() * 21000) + 5000, // 5-26 km
            fastestPace: 3.5 + Math.random() * 2, // 3.5-5.5 min/km
            currentStreak: Math.floor(Math.random() * 30),
            longestStreak: Math.floor(Math.random() * 60) + 10,
            lastRunAt: randomDate(daysAgo(7), new Date()),
            // Safety settings
            autoSOSEnabled: Math.random() > 0.5,
            fallDetectionEnabled: Math.random() > 0.6,
            noMovementTimeout: pickRandom([180, 300, 600]),
            sosVerificationTime: pickRandom([5, 10, 15]),
            shareLocationDefault: true,
            showOnNearbyRadar: Math.random() > 0.2,
            // SOS stats
            sosTriggered: Math.floor(Math.random() * 3),
            sosResponded: Math.floor(Math.random() * 5),
          },
        },
      },
    });

    users.push({
      id: user.id,
      email: user.email,
      displayName: userData.displayName,
      isAdmin: !!(userData as any).isAdmin,
    });
  }

  console.log(`   ✅ Created ${users.length} users`);

  // Get regular (non-admin) users for session/SOS creation
  const regularUsers = users.filter(u => !u.isAdmin);

  // ==========================================================================
  // 2. CREATE DEVICES AND REFRESH TOKENS
  // ==========================================================================
  console.log('\n📱 Creating devices and tokens...');
  
  let deviceCount = 0;
  let tokenCount = 0;

  for (const user of users) {
    const numDevices = 1 + Math.floor(Math.random() * 3); // 1-3 devices
    
    for (let i = 0; i < numDevices; i++) {
      const deviceInfo = pickRandom(DEVICE_MODELS);
      const deviceId = uuid();
      
      await prisma.device.create({
        data: {
          userId: user.id,
          deviceType: deviceInfo.type as any,
          deviceId: `device_${crypto.randomBytes(16).toString('hex')}`,
          deviceName: `${user.displayName}'s ${deviceInfo.model}`,
          deviceModel: deviceInfo.model,
          osVersion: deviceInfo.os,
          appVersion: '1.0.0',
          pushToken: `ExponentPushToken[${crypto.randomBytes(20).toString('base64url')}]`,
          voipToken: deviceInfo.type !== 'WEB' ? crypto.randomBytes(32).toString('hex') : null,
          fingerprint: crypto.randomBytes(16).toString('hex'),
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          isActive: i === 0, // First device is active
          lastActiveAt: randomDate(daysAgo(7), new Date()),
        },
      });
      deviceCount++;

      // Create refresh token for active devices
      if (i === 0) {
        await prisma.refreshToken.create({
          data: {
            userId: user.id,
            token: generateToken(),
            deviceId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            isRevoked: false,
          },
        });
        tokenCount++;
      }
    }
  }

  console.log(`   ✅ Created ${deviceCount} devices`);
  console.log(`   ✅ Created ${tokenCount} refresh tokens`);

  // ==========================================================================
  // 3. CREATE RUN SESSIONS WITH PARTICIPANTS
  // ==========================================================================
  console.log('\n🏃 Creating run sessions...');
  
  const sessionNames = [
    'Golden Gate Park Morning Run',
    'Embarcadero Sunrise Sprint',
    'Mission District Jog',
    'Presidio Trail Adventure',
    'Marina Green 5K',
    'Twin Peaks Challenge',
    'SOMA Speed Session',
    'Sunset Beach Run',
    'Dolores Park Loop',
    'Ferry Building Dash',
  ];

  const sessions: string[] = [];
  const statuses: Array<'SCHEDULED' | 'ACTIVE' | 'COMPLETED'> = ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'COMPLETED', 'COMPLETED'];
  
  for (let i = 0; i < 8; i++) {
    const creator = pickRandom(regularUsers);
    const sessionId = uuid();
    const status = pickRandom(statuses);
    const startCoords = randomCoords();
    const distance = randomDistance();
    const sessionStart = status === 'SCHEDULED' 
      ? randomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      : randomDate(daysAgo(30), daysAgo(1));

    const session = await prisma.runSession.create({
      data: {
        id: sessionId,
        creatorId: creator.id,
        name: sessionNames[i] || `Group Run #${i + 1}`,
        description: `Join us for a fun group run around the city! All paces welcome.`,
        scheduledStartAt: sessionStart,
        actualStartAt: status !== 'SCHEDULED' ? sessionStart : null,
        endedAt: status === 'COMPLETED' ? new Date(sessionStart.getTime() + calculateDuration(distance, randomPace()) * 1000) : null,
        status,
        privacy: pickRandom(['PUBLIC', 'PUBLIC', 'PUBLIC', 'PRIVATE', 'FRIENDS_ONLY']) as any,
        startLatitude: startCoords.lat,
        startLongitude: startCoords.lng,
        plannedDistance: distance,
        actualDistance: status === 'COMPLETED' ? distance * (0.9 + Math.random() * 0.2) : null,
        routePolyline: status === 'COMPLETED' ? generatePolyline(startCoords, Math.floor(distance / 100)) : null,
        maxParticipants: pickRandom([10, 20, 50, 100]),
        allowLateJoin: true,
      },
    });

    sessions.push(session.id);

    // Add participants (including creator)
    const participants = pickRandomN(regularUsers, 2 + Math.floor(Math.random() * 6));
    if (!participants.find(p => p.id === creator.id)) {
      participants.unshift(creator);
    }

    for (let j = 0; j < participants.length; j++) {
      const participant = participants[j];
      const participantDistance = distance * (0.8 + Math.random() * 0.4);
      const participantPace = randomPace();

      await prisma.runParticipant.create({
        data: {
          sessionId: session.id,
          userId: participant.id,
          role: participant.id === creator.id ? 'ADMIN' : 'MEMBER',
          status: status === 'COMPLETED' ? 'LEFT' : 'JOINED',
          joinedAt: sessionStart,
          leftAt: status === 'COMPLETED' ? new Date(sessionStart.getTime() + calculateDuration(participantDistance, participantPace) * 1000) : null,
          distance: status === 'COMPLETED' ? participantDistance : 0,
          duration: status === 'COMPLETED' ? calculateDuration(participantDistance, participantPace) : 0,
          averagePace: status === 'COMPLETED' ? participantPace : null,
          maxSpeed: status === 'COMPLETED' ? (1000 / (participantPace * 60)) * 1.3 : null,
          calories: status === 'COMPLETED' ? calculateCalories(participantDistance) : null,
        },
      });
    }
  }

  console.log(`   ✅ Created ${sessions.length} sessions with participants`);

  // ==========================================================================
  // 4. CREATE SOLO RUNS
  // ==========================================================================
  console.log('\n🏃‍♂️ Creating solo runs...');
  
  let soloRunCount = 0;
  const soloRuns: Array<{ id: string; userId: string; distance: number; duration: number }> = [];

  for (const user of regularUsers) {
    const numRuns = 1 + Math.floor(Math.random() * 3); // 1-3 solo runs
    
    for (let i = 0; i < numRuns; i++) {
      const startCoords = randomCoords();
      const distance = randomDistance();
      const pace = randomPace();
      const duration = calculateDuration(distance, pace);
      const startedAt = randomDate(daysAgo(30), daysAgo(1));
      const runId = uuid();

      await prisma.soloRun.create({
        data: {
          id: runId,
          userId: user.id,
          startedAt,
          endedAt: new Date(startedAt.getTime() + duration * 1000),
          isPaused: false,
          startLatitude: startCoords.lat,
          startLongitude: startCoords.lng,
          endLatitude: startCoords.lat + (Math.random() - 0.5) * 0.02,
          endLongitude: startCoords.lng + (Math.random() - 0.5) * 0.02,
          routePolyline: generatePolyline(startCoords, Math.floor(distance / 100)),
          distance,
          duration,
          pausedDuration: Math.random() > 0.7 ? Math.floor(Math.random() * 300) : 0,
          averagePace: pace,
          maxSpeed: (1000 / (pace * 60)) * 1.3,
          calories: calculateCalories(distance),
          elevationGain: Math.floor(Math.random() * 200),
        },
      });
      
      soloRuns.push({ id: runId, userId: user.id, distance, duration });
      soloRunCount++;
    }
  }

  console.log(`   ✅ Created ${soloRunCount} solo runs`);

  // ==========================================================================
  // 5. CREATE LIVE LOCATIONS
  // ==========================================================================
  console.log('\n📍 Creating live locations...');
  
  let locationCount = 0;

  // Create recent locations for all users (simulating active tracking)
  for (const user of regularUsers) {
    const numLocations = 5 + Math.floor(Math.random() * 20); // 5-25 locations
    let coords = randomCoords();
    
    for (let i = 0; i < numLocations; i++) {
      // Simulate movement
      coords = {
        lat: coords.lat + (Math.random() - 0.5) * 0.001,
        lng: coords.lng + (Math.random() - 0.5) * 0.001,
      };
      
      const speed = Math.random() > 0.3 ? 2 + Math.random() * 4 : 0; // m/s
      
      await prisma.liveLocation.create({
        data: {
          userId: user.id,
          latitude: coords.lat,
          longitude: coords.lng,
          altitude: 10 + Math.random() * 50,
          accuracy: 5 + Math.random() * 15,
          speed,
          heading: Math.random() * 360,
          smoothedLat: coords.lat + (Math.random() - 0.5) * 0.0001,
          smoothedLng: coords.lng + (Math.random() - 0.5) * 0.0001,
          smoothedSpeed: speed > 0 ? speed * (0.9 + Math.random() * 0.2) : 0,
          timestamp: new Date(Date.now() - (numLocations - i) * 5000), // Every 5 seconds
          batteryLevel: 0.3 + Math.random() * 0.7,
          isCharging: Math.random() > 0.8,
          networkType: pickRandom(['wifi', '5g', '4g', 'lte']),
        },
      });
      locationCount++;
    }
  }

  console.log(`   ✅ Created ${locationCount} live locations`);

  // ==========================================================================
  // 6. CREATE SOS ALERTS WITH RESPONDERS
  // ==========================================================================
  console.log('\n🆘 Creating SOS alerts...');
  
  const sosStatuses: Array<'PENDING' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED' | 'FALSE_ALARM'> = [
    'PENDING', 'ACTIVE', 'RESOLVED', 'RESOLVED', 'RESOLVED', 'CANCELLED', 'FALSE_ALARM'
  ];
  const triggerTypes: Array<'MANUAL' | 'FALL_DETECTION' | 'NO_MOVEMENT'> = ['MANUAL', 'MANUAL', 'FALL_DETECTION', 'NO_MOVEMENT'];
  
  const sosAlerts: string[] = [];
  
  for (let i = 0; i < 8; i++) {
    const alertUser = pickRandom(regularUsers);
    const coords = randomCoords();
    const status = pickRandom(sosStatuses);
    const triggeredAt = randomDate(daysAgo(30), hoursAgo(1));
    const alertId = uuid();

    const alert = await prisma.sOSAlert.create({
      data: {
        id: alertId,
        userId: alertUser.id,
        triggerType: pickRandom(triggerTypes),
        status,
        escalationLevel: status === 'ACTIVE' ? 'LEVEL_2' : 'LEVEL_1',
        latitude: coords.lat,
        longitude: coords.lng,
        approxLatitude: coords.lat + (Math.random() - 0.5) * 0.01,
        approxLongitude: coords.lng + (Math.random() - 0.5) * 0.01,
        countdownStartedAt: triggeredAt,
        countdownSeconds: 5,
        triggeredAt,
        activatedAt: status !== 'PENDING' ? new Date(triggeredAt.getTime() + 5000) : null,
        acknowledgedAt: ['RESOLVED', 'FALSE_ALARM'].includes(status) ? new Date(triggeredAt.getTime() + 60000) : null,
        resolvedAt: status === 'RESOLVED' ? new Date(triggeredAt.getTime() + 300000) : null,
        cancelledAt: status === 'CANCELLED' ? new Date(triggeredAt.getTime() + 3000) : null,
        notes: status === 'FALSE_ALARM' ? 'False alarm - user is safe' : null,
        batteryLevel: 0.2 + Math.random() * 0.6,
        lastKnownAddress: '123 Market St, San Francisco, CA 94102',
      },
    });

    sosAlerts.push(alert.id);

    // Add responders (only for non-pending alerts)
    if (status !== 'PENDING' && status !== 'CANCELLED') {
      const potentialResponders = regularUsers.filter(u => u.id !== alertUser.id);
      const responders = pickRandomN(potentialResponders, 1 + Math.floor(Math.random() * 3));
      
      for (const responder of responders) {
        const responderCoords = randomCoords();
        const responderStatus = status === 'RESOLVED' 
          ? pickRandom(['ACCEPTED', 'ARRIVED', 'DECLINED'] as const)
          : pickRandom(['NOTIFIED', 'ACCEPTED', 'EN_ROUTE'] as const);

        await prisma.sOSResponder.create({
          data: {
            sosAlertId: alert.id,
            responderId: responder.id,
            status: responderStatus,
            notifiedAt: new Date(triggeredAt.getTime() + 6000),
            acceptedAt: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED'].includes(responderStatus) 
              ? new Date(triggeredAt.getTime() + 30000) : null,
            arrivedAt: responderStatus === 'ARRIVED' ? new Date(triggeredAt.getTime() + 180000) : null,
            declinedAt: responderStatus === 'DECLINED' ? new Date(triggeredAt.getTime() + 20000) : null,
            distanceMeters: 100 + Math.random() * 2000,
            estimatedETA: Math.floor(60 + Math.random() * 300),
            lastLatitude: responderCoords.lat,
            lastLongitude: responderCoords.lng,
          },
        });
      }
    }
  }

  console.log(`   ✅ Created ${sosAlerts.length} SOS alerts with responders`);

  // ==========================================================================
  // 7. CREATE EMERGENCY CONTACTS
  // ==========================================================================
  console.log('\n📞 Creating emergency contacts...');
  
  const contactNames = [
    'Mom', 'Dad', 'John (Spouse)', 'Sarah (Sister)', 'Mike (Brother)',
    'Lisa (Friend)', 'Tom (Roommate)', 'Emma (Partner)', 'Chris (Parent)',
  ];
  
  let contactCount = 0;

  for (const user of regularUsers) {
    const numContacts = 1 + Math.floor(Math.random() * 3); // 1-3 contacts
    const usedNames = new Set<string>();
    
    for (let i = 0; i < numContacts; i++) {
      let contactName = pickRandom(contactNames);
      while (usedNames.has(contactName)) {
        contactName = pickRandom(contactNames);
      }
      usedNames.add(contactName);

      // Sometimes link to another user as guardian
      const isLinkedGuardian = Math.random() > 0.7;
      const guardian = isLinkedGuardian ? pickRandom(regularUsers.filter(u => u.id !== user.id)) : null;

      await prisma.emergencyContact.create({
        data: {
          userId: user.id,
          guardianId: guardian?.id || null,
          name: contactName,
          phone: randomPhone(),
          email: `${contactName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
          relationship: pickRandom(RELATIONSHIPS),
          canViewLocation: true,
          canReceiveSOS: true,
          isPrimary: i === 0,
          isVerified: Math.random() > 0.3,
          verifiedAt: Math.random() > 0.3 ? randomDate(daysAgo(60), daysAgo(1)) : null,
        },
      });
      contactCount++;
    }
  }

  console.log(`   ✅ Created ${contactCount} emergency contacts`);

  // ==========================================================================
  // 8. CREATE FEED ITEMS
  // ==========================================================================
  console.log('\n📰 Creating feed items...');
  
  const feedTypes: Array<'RUN_STARTED' | 'RUN_COMPLETED' | 'SOS_TRIGGERED' | 'SOS_RESOLVED' | 'MILESTONE_REACHED' | 'SESSION_JOINED' | 'SESSION_CREATED'> = [
    'RUN_STARTED', 'RUN_COMPLETED', 'RUN_COMPLETED', 'RUN_COMPLETED',
    'SOS_TRIGGERED', 'SOS_RESOLVED', 'MILESTONE_REACHED', 'SESSION_JOINED', 'SESSION_CREATED'
  ];

  let feedCount = 0;

  // Create feed items from solo runs
  for (const run of soloRuns) {
    await prisma.feedItem.create({
      data: {
        userId: run.userId,
        type: 'RUN_COMPLETED',
        soloRunId: run.id,
        metadata: {
          message: 'Completed a solo run',
          distance: run.distance,
          duration: run.duration,
          pace: (run.duration / 60) / (run.distance / 1000),
        },
        isPublic: Math.random() > 0.2,
        createdAt: randomDate(daysAgo(30), new Date()),
      },
    });
    feedCount++;
  }

  // Create milestone feed items
  const milestones = [
    { milestone: '100km Total', value: 100000 },
    { milestone: '50 Runs', value: 50 },
    { milestone: '10km Single Run', value: 10000 },
    { milestone: '30 Day Streak', value: 30 },
  ];

  for (let i = 0; i < 10; i++) {
    const user = pickRandom(regularUsers);
    const milestone = pickRandom(milestones);
    
    await prisma.feedItem.create({
      data: {
        userId: user.id,
        type: 'MILESTONE_REACHED',
        metadata: {
          message: `Reached ${milestone.milestone}`,
          milestone: milestone.milestone,
          value: milestone.value,
        },
        isPublic: true,
        createdAt: randomDate(daysAgo(60), new Date()),
      },
    });
    feedCount++;
  }

  // Create SOS-related feed items
  for (let i = 0; i < 5; i++) {
    const user = pickRandom(regularUsers);
    const isResolved = Math.random() > 0.3;
    
    await prisma.feedItem.create({
      data: {
        userId: user.id,
        type: isResolved ? 'SOS_RESOLVED' : 'SOS_TRIGGERED',
        metadata: isResolved 
          ? { message: 'SOS alert resolved', outcome: 'safe' }
          : { message: 'Triggered SOS alert', severity: 'high' },
        isPublic: isResolved,
        createdAt: randomDate(daysAgo(30), new Date()),
      },
    });
    feedCount++;
  }

  console.log(`   ✅ Created ${feedCount} feed items`);

  // ==========================================================================
  // 9. CREATE WEEKLY AND MONTHLY STATS
  // ==========================================================================
  console.log('\n📊 Creating user stats...');
  
  let weeklyCount = 0;
  let monthlyCount = 0;

  for (const user of regularUsers) {
    // Create weekly stats for last 8 weeks
    for (let week = 0; week < 8; week++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (week * 7)); // Monday of each week
      weekStart.setHours(0, 0, 0, 0);

      const weeklyDistance = 5000 + Math.random() * 50000; // 5-55 km per week
      const weeklyRuns = 1 + Math.floor(Math.random() * 6);
      const weeklyDuration = Math.floor(weeklyDistance / (1000 / (randomPace() * 60)));

      await prisma.weeklyStats.create({
        data: {
          userId: user.id,
          weekStart,
          totalDistance: weeklyDistance,
          totalDuration: weeklyDuration,
          totalRuns: weeklyRuns,
          avgPace: randomPace(),
          calories: calculateCalories(weeklyDistance),
          sosTriggered: Math.random() > 0.9 ? 1 : 0,
          sosResponded: Math.random() > 0.8 ? Math.floor(Math.random() * 2) : 0,
        },
      });
      weeklyCount++;
    }

    // Create monthly stats for last 6 months
    for (let month = 0; month < 6; month++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - month);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthlyDistance = 20000 + Math.random() * 200000; // 20-220 km per month
      const monthlyRuns = 4 + Math.floor(Math.random() * 20);
      const monthlyDuration = Math.floor(monthlyDistance / (1000 / (randomPace() * 60)));

      await prisma.monthlyStats.create({
        data: {
          userId: user.id,
          monthStart,
          totalDistance: monthlyDistance,
          totalDuration: monthlyDuration,
          totalRuns: monthlyRuns,
          avgPace: randomPace(),
          calories: calculateCalories(monthlyDistance),
          sosTriggered: Math.random() > 0.85 ? Math.floor(Math.random() * 2) : 0,
          sosResponded: Math.random() > 0.75 ? Math.floor(Math.random() * 3) : 0,
          longestRun: 5000 + Math.random() * 16000,
          fastestPace: 3.5 + Math.random() * 2,
        },
      });
      monthlyCount++;
    }
  }

  console.log(`   ✅ Created ${weeklyCount} weekly stats`);
  console.log(`   ✅ Created ${monthlyCount} monthly stats`);

  // ==========================================================================
  // 10. CREATE AUDIT LOGS
  // ==========================================================================
  console.log('\n📝 Creating audit logs...');
  
  const auditActions: Array<'CREATE' | 'LOGIN' | 'LOGOUT' | 'SOS_TRIGGER' | 'LOCATION_UPDATE' | 'SESSION_JOIN'> = [
    'LOGIN', 'LOGIN', 'LOGOUT', 'SOS_TRIGGER', 'LOCATION_UPDATE', 'SESSION_JOIN'
  ];
  
  let auditCount = 0;

  for (const user of users) {
    const numLogs = 3 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < numLogs; i++) {
      const action = pickRandom(auditActions);
      
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action,
          resource: action === 'LOGIN' || action === 'LOGOUT' ? 'auth' 
            : action === 'SOS_TRIGGER' ? 'sos' 
            : action === 'LOCATION_UPDATE' ? 'location' 
            : 'session',
          resourceId: uuid(),
          details: { action, timestamp: new Date().toISOString() },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: 'SafRun/1.0.0 (iOS 17.2; iPhone 15 Pro)',
          createdAt: randomDate(daysAgo(30), new Date()),
        },
      });
      auditCount++;
    }
  }

  console.log(`   ✅ Created ${auditCount} audit logs`);

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('\n' + '═'.repeat(50));
  console.log('✨ SAFRUN Database Seed Complete!');
  console.log('═'.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   Users:             ${users.length} (${users.filter(u => u.isAdmin).length} admins)`);
  console.log(`   Devices:           ${deviceCount}`);
  console.log(`   Refresh Tokens:    ${tokenCount}`);
  console.log(`   Run Sessions:      ${sessions.length}`);
  console.log(`   Solo Runs:         ${soloRunCount}`);
  console.log(`   Live Locations:    ${locationCount}`);
  console.log(`   SOS Alerts:        ${sosAlerts.length}`);
  console.log(`   Emergency Contacts:${contactCount}`);
  console.log(`   Feed Items:        ${feedCount}`);
  console.log(`   Weekly Stats:      ${weeklyCount}`);
  console.log(`   Monthly Stats:     ${monthlyCount}`);
  console.log(`   Audit Logs:        ${auditCount}`);
  console.log('\n🔑 Test Credentials:');
  console.log(`   Admin:    admin@safrun.com / ${DEFAULT_PASSWORD}`);
  console.log(`   User:     sarah.chen@example.com / ${DEFAULT_PASSWORD}`);
  console.log('\n');
}

// =============================================================================
// Execute
// =============================================================================

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
