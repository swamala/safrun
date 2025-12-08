/**
 * Milestone types for user achievements
 */
export enum MilestoneType {
  // Distance milestones (in meters)
  DISTANCE_10K = 'distance_10k',
  DISTANCE_21K = 'distance_21k',
  DISTANCE_42K = 'distance_42k',
  DISTANCE_100K = 'distance_100k',
  DISTANCE_500K = 'distance_500k',
  DISTANCE_1000K = 'distance_1000k',
  
  // Session count milestones
  SESSIONS_10 = 'sessions_10',
  SESSIONS_50 = 'sessions_50',
  SESSIONS_100 = 'sessions_100',
  SESSIONS_200 = 'sessions_200',
  SESSIONS_500 = 'sessions_500',
  
  // SOS responder milestones
  SOS_RESPONDER_10 = 'sos_responder_10',
  SOS_RESPONDER_50 = 'sos_responder_50',
  SOS_RESPONDER_100 = 'sos_responder_100',
  SOS_RESPONDER_200 = 'sos_responder_200',
  
  // Streak milestones
  STREAK_7_DAYS = 'streak_7_days',
  STREAK_30_DAYS = 'streak_30_days',
  STREAK_100_DAYS = 'streak_100_days',
}

/**
 * Milestone configuration with thresholds
 */
export const MILESTONE_CONFIG: Record<MilestoneType, { threshold: number; field: string; title: string; description: string }> = {
  [MilestoneType.DISTANCE_10K]: {
    threshold: 10000,
    field: 'totalDistance',
    title: '10K Runner',
    description: 'You\'ve run 10 kilometers total!',
  },
  [MilestoneType.DISTANCE_21K]: {
    threshold: 21000,
    field: 'totalDistance',
    title: 'Half Marathon',
    description: 'You\'ve run a half marathon distance!',
  },
  [MilestoneType.DISTANCE_42K]: {
    threshold: 42000,
    field: 'totalDistance',
    title: 'Marathon Runner',
    description: 'You\'ve completed a marathon distance!',
  },
  [MilestoneType.DISTANCE_100K]: {
    threshold: 100000,
    field: 'totalDistance',
    title: 'Ultra Runner',
    description: 'You\'ve run 100 kilometers total!',
  },
  [MilestoneType.DISTANCE_500K]: {
    threshold: 500000,
    field: 'totalDistance',
    title: 'Elite Runner',
    description: 'You\'ve run 500 kilometers total!',
  },
  [MilestoneType.DISTANCE_1000K]: {
    threshold: 1000000,
    field: 'totalDistance',
    title: 'Legend Runner',
    description: 'You\'ve run 1000 kilometers total!',
  },
  [MilestoneType.SESSIONS_10]: {
    threshold: 10,
    field: 'totalRuns',
    title: 'Getting Started',
    description: 'You\'ve completed 10 running sessions!',
  },
  [MilestoneType.SESSIONS_50]: {
    threshold: 50,
    field: 'totalRuns',
    title: 'Committed Runner',
    description: 'You\'ve completed 50 running sessions!',
  },
  [MilestoneType.SESSIONS_100]: {
    threshold: 100,
    field: 'totalRuns',
    title: 'Century Club',
    description: 'You\'ve completed 100 running sessions!',
  },
  [MilestoneType.SESSIONS_200]: {
    threshold: 200,
    field: 'totalRuns',
    title: 'Dedicated Athlete',
    description: 'You\'ve completed 200 running sessions!',
  },
  [MilestoneType.SESSIONS_500]: {
    threshold: 500,
    field: 'totalRuns',
    title: 'Running Master',
    description: 'You\'ve completed 500 running sessions!',
  },
  [MilestoneType.SOS_RESPONDER_10]: {
    threshold: 10,
    field: 'sosResponded',
    title: 'Community Helper',
    description: 'You\'ve responded to 10 SOS alerts!',
  },
  [MilestoneType.SOS_RESPONDER_50]: {
    threshold: 50,
    field: 'sosResponded',
    title: 'Guardian Angel',
    description: 'You\'ve responded to 50 SOS alerts!',
  },
  [MilestoneType.SOS_RESPONDER_100]: {
    threshold: 100,
    field: 'sosResponded',
    title: 'Community Hero',
    description: 'You\'ve responded to 100 SOS alerts!',
  },
  [MilestoneType.SOS_RESPONDER_200]: {
    threshold: 200,
    field: 'sosResponded',
    title: 'Safety Champion',
    description: 'You\'ve responded to 200 SOS alerts!',
  },
  [MilestoneType.STREAK_7_DAYS]: {
    threshold: 7,
    field: 'currentStreak',
    title: 'Week Warrior',
    description: 'You\'ve maintained a 7-day running streak!',
  },
  [MilestoneType.STREAK_30_DAYS]: {
    threshold: 30,
    field: 'currentStreak',
    title: 'Month Master',
    description: 'You\'ve maintained a 30-day running streak!',
  },
  [MilestoneType.STREAK_100_DAYS]: {
    threshold: 100,
    field: 'currentStreak',
    title: 'Unstoppable',
    description: 'You\'ve maintained a 100-day running streak!',
  },
};

