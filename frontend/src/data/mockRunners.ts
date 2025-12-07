export interface Runner {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  pace: string;
  distance: string;
  safetyStatus: 'safe' | 'sos' | 'inactive';
  location: {
    lat: number;
    lng: number;
  };
  route: Array<{ lat: number; lng: number }>;
  startTime: string;
  isLive: boolean;
  heartRate?: number;
  elevation?: string;
  groupName?: string;
}

export const mockRunners: Runner[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'SC',
    pace: "5'45\"/km",
    distance: '4.2 km',
    safetyStatus: 'safe',
    location: { lat: 37.7749, lng: -122.4194 },
    route: [
      { lat: 37.7710, lng: -122.4230 },
      { lat: 37.7720, lng: -122.4215 },
      { lat: 37.7735, lng: -122.4200 },
      { lat: 37.7749, lng: -122.4194 },
    ],
    startTime: '6:30 AM',
    isLive: true,
    heartRate: 142,
    elevation: '+45m',
    groupName: 'Morning Warriors',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: 'MJ',
    pace: "6'12\"/km",
    distance: '3.8 km',
    safetyStatus: 'safe',
    location: { lat: 37.7720, lng: -122.4100 },
    route: [
      { lat: 37.7680, lng: -122.4140 },
      { lat: 37.7695, lng: -122.4125 },
      { lat: 37.7710, lng: -122.4110 },
      { lat: 37.7720, lng: -122.4100 },
    ],
    startTime: '6:45 AM',
    isLive: true,
    heartRate: 156,
    elevation: '+32m',
    groupName: 'Morning Warriors',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'ER',
    pace: "5'30\"/km",
    distance: '6.1 km',
    safetyStatus: 'safe',
    location: { lat: 37.7800, lng: -122.4250 },
    route: [
      { lat: 37.7740, lng: -122.4320 },
      { lat: 37.7760, lng: -122.4290 },
      { lat: 37.7780, lng: -122.4270 },
      { lat: 37.7800, lng: -122.4250 },
    ],
    startTime: '6:00 AM',
    isLive: true,
    heartRate: 138,
    elevation: '+78m',
    groupName: 'Trail Blazers',
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'DK',
    pace: "7'00\"/km",
    distance: '2.5 km',
    safetyStatus: 'safe',
    location: { lat: 37.7680, lng: -122.4300 },
    route: [
      { lat: 37.7650, lng: -122.4340 },
      { lat: 37.7665, lng: -122.4320 },
      { lat: 37.7680, lng: -122.4300 },
    ],
    startTime: '7:00 AM',
    isLive: true,
    heartRate: 128,
    elevation: '+15m',
  },
  {
    id: '5',
    name: 'Aisha Patel',
    avatar: 'AP',
    pace: "5'55\"/km",
    distance: '5.0 km',
    safetyStatus: 'sos',
    location: { lat: 37.7850, lng: -122.4080 },
    route: [
      { lat: 37.7810, lng: -122.4120 },
      { lat: 37.7825, lng: -122.4105 },
      { lat: 37.7840, lng: -122.4090 },
      { lat: 37.7850, lng: -122.4080 },
    ],
    startTime: '6:15 AM',
    isLive: true,
    heartRate: 168,
    elevation: '+52m',
    groupName: 'Trail Blazers',
  },
  {
    id: '6',
    name: 'Jake Thompson',
    avatar: 'JT',
    pace: "6'30\"/km",
    distance: '3.2 km',
    safetyStatus: 'safe',
    location: { lat: 37.7770, lng: -122.4150 },
    route: [
      { lat: 37.7740, lng: -122.4180 },
      { lat: 37.7755, lng: -122.4165 },
      { lat: 37.7770, lng: -122.4150 },
    ],
    startTime: '7:15 AM',
    isLive: true,
    heartRate: 145,
    elevation: '+28m',
    groupName: 'Morning Warriors',
  },
  {
    id: '7',
    name: 'Lisa Wang',
    avatar: 'LW',
    pace: "5'15\"/km",
    distance: '8.3 km',
    safetyStatus: 'safe',
    location: { lat: 37.7820, lng: -122.4180 },
    route: [
      { lat: 37.7760, lng: -122.4230 },
      { lat: 37.7780, lng: -122.4210 },
      { lat: 37.7800, lng: -122.4195 },
      { lat: 37.7820, lng: -122.4180 },
    ],
    startTime: '5:45 AM',
    isLive: true,
    heartRate: 152,
    elevation: '+95m',
  },
];

export const mapCenter = { lat: 37.7760, lng: -122.4180 };
export const defaultZoom = 14;

// Route colors based on safety status
export const routeColors = {
  safe: {
    color: '#f97316',
    weight: 4,
    opacity: 0.8,
  },
  sos: {
    color: '#ef4444',
    weight: 5,
    opacity: 1,
  },
  inactive: {
    color: '#94a3b8',
    weight: 3,
    opacity: 0.5,
  },
};

// Group statistics
export const groupStats = {
  activeRunners: mockRunners.filter(r => r.isLive).length,
  totalDistance: mockRunners.reduce((sum, r) => sum + parseFloat(r.distance), 0).toFixed(1),
  sosAlerts: mockRunners.filter(r => r.safetyStatus === 'sos').length,
  groups: [...new Set(mockRunners.filter(r => r.groupName).map(r => r.groupName))],
};
