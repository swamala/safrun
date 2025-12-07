export interface Runner {
  id: string;
  name: string;
  avatar: string;
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
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7755, lng: -122.4180 },
      { lat: 37.7765, lng: -122.4165 },
      { lat: 37.7780, lng: -122.4150 },
      { lat: 37.7795, lng: -122.4135 },
    ],
    startTime: '6:30 AM',
    isLive: true,
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
      { lat: 37.7720, lng: -122.4100 },
      { lat: 37.7735, lng: -122.4085 },
      { lat: 37.7750, lng: -122.4070 },
      { lat: 37.7765, lng: -122.4055 },
    ],
    startTime: '6:45 AM',
    isLive: true,
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
      { lat: 37.7800, lng: -122.4250 },
      { lat: 37.7815, lng: -122.4235 },
      { lat: 37.7830, lng: -122.4220 },
      { lat: 37.7845, lng: -122.4205 },
      { lat: 37.7860, lng: -122.4190 },
      { lat: 37.7875, lng: -122.4175 },
    ],
    startTime: '6:00 AM',
    isLive: true,
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
      { lat: 37.7680, lng: -122.4300 },
      { lat: 37.7695, lng: -122.4285 },
      { lat: 37.7710, lng: -122.4270 },
    ],
    startTime: '7:00 AM',
    isLive: true,
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
      { lat: 37.7850, lng: -122.4080 },
      { lat: 37.7865, lng: -122.4065 },
      { lat: 37.7880, lng: -122.4050 },
      { lat: 37.7895, lng: -122.4035 },
      { lat: 37.7910, lng: -122.4020 },
    ],
    startTime: '6:15 AM',
    isLive: true,
  },
];

export const mapCenter = { lat: 37.7749, lng: -122.4194 };
export const defaultZoom = 14;

