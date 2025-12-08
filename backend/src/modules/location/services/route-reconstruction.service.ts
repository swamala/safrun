import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { LocationSmoothingService } from './location-smoothing.service';

export interface RoutePoint {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: Date;
}

export interface ReconstructedRoute {
  points: RoutePoint[];
  totalDistance: number;
  totalDuration: number;
  averagePace?: number | null;
  polyline: string;
}

@Injectable()
export class RouteReconstructionService {
  private readonly logger = new Logger(RouteReconstructionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smoothingService: LocationSmoothingService,
  ) {}

  /**
   * Reconstruct route for a session
   */
  async reconstructSessionRoute(sessionId: string): Promise<ReconstructedRoute> {
    const locations = await this.prisma.liveLocation.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
      select: {
        latitude: true,
        longitude: true,
        altitude: true,
        speed: true,
        heading: true,
        timestamp: true,
      },
    });

    return this.processRoute(locations);
  }

  /**
   * Reconstruct route for a solo run
   */
  async reconstructSoloRunRoute(soloRunId: string): Promise<ReconstructedRoute> {
    const locations = await this.prisma.liveLocation.findMany({
      where: { soloRunId },
      orderBy: { timestamp: 'asc' },
      select: {
        latitude: true,
        longitude: true,
        altitude: true,
        speed: true,
        heading: true,
        timestamp: true,
      },
    });

    return this.processRoute(locations);
  }

  /**
   * Reconstruct route for a user's session participation
   */
  async reconstructUserSessionRoute(
    userId: string,
    sessionId: string,
  ): Promise<ReconstructedRoute> {
    const locations = await this.prisma.liveLocation.findMany({
      where: { userId, sessionId },
      orderBy: { timestamp: 'asc' },
      select: {
        latitude: true,
        longitude: true,
        altitude: true,
        speed: true,
        heading: true,
        timestamp: true,
      },
    });

    return this.processRoute(locations);
  }

  /**
   * Get simplified route (fewer points for quick display)
   */
  async getSimplifiedRoute(
    sessionId: string,
    maxPoints = 100,
  ): Promise<RoutePoint[]> {
    const fullRoute = await this.reconstructSessionRoute(sessionId);

    if (fullRoute.points.length <= maxPoints) {
      return fullRoute.points;
    }

    // Douglas-Peucker simplification
    return this.simplifyRoute(fullRoute.points, maxPoints);
  }

  /**
   * Encode route to polyline format (Google Polyline Algorithm)
   */
  encodePolyline(points: { latitude: number; longitude: number }[]): string {
    if (points.length === 0) return '';

    let encoded = '';
    let prevLat = 0;
    let prevLng = 0;

    for (const point of points) {
      const lat = Math.round(point.latitude * 1e5);
      const lng = Math.round(point.longitude * 1e5);

      encoded += this.encodeSignedNumber(lat - prevLat);
      encoded += this.encodeSignedNumber(lng - prevLng);

      prevLat = lat;
      prevLng = lng;
    }

    return encoded;
  }

  /**
   * Decode polyline to points
   */
  decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
    const points: { latitude: number; longitude: number }[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;

      do {
        let byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (encoded.charCodeAt(index - 1) >= 0x40);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        let byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (encoded.charCodeAt(index - 1) >= 0x40);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }

  private processRoute(
    locations: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      speed: number | null;
      heading: number | null;
      timestamp: Date;
    }[],
  ): ReconstructedRoute {
    if (locations.length === 0) {
      return {
        points: [],
        totalDistance: 0,
        totalDuration: 0,
        averagePace: null,
        polyline: '',
      };
    }

    // Remove jitter
    const locationPoints = locations.map((l) => ({
      latitude: l.latitude,
      longitude: l.longitude,
      speed: l.speed,
      timestamp: l.timestamp.getTime(),
    }));

    const smoothed = this.smoothingService.removeJitter(locationPoints, 3, 30);

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < smoothed.length; i++) {
      totalDistance += this.calculateDistance(
        smoothed[i - 1].latitude,
        smoothed[i - 1].longitude,
        smoothed[i].latitude,
        smoothed[i].longitude,
      );
    }

    // Calculate duration
    const firstTime = locations[0].timestamp.getTime();
    const lastTime = locations[locations.length - 1].timestamp.getTime();
    const totalDuration = Math.round((lastTime - firstTime) / 1000);

    // Calculate average pace
    const averagePace =
      totalDuration > 0 && totalDistance > 0
        ? totalDuration / (totalDistance / 1000) / 60
        : null;

    // Map back to route points
    const points: RoutePoint[] = smoothed.map((s, i) => ({
      latitude: s.latitude,
      longitude: s.longitude,
      altitude: locations[i]?.altitude || null,
      speed: locations[i]?.speed || null,
      heading: locations[i]?.heading || null,
      timestamp: new Date(s.timestamp),
    }));

    // Generate polyline
    const polyline = this.encodePolyline(points);

    return {
      points,
      totalDistance,
      totalDuration,
      averagePace,
      polyline,
    };
  }

  private simplifyRoute(
    points: RoutePoint[],
    maxPoints: number,
  ): RoutePoint[] {
    if (points.length <= maxPoints) return points;

    // Calculate step size for even distribution
    const step = Math.ceil(points.length / maxPoints);
    const simplified: RoutePoint[] = [];

    for (let i = 0; i < points.length; i += step) {
      simplified.push(points[i]);
    }

    // Always include the last point
    if (simplified[simplified.length - 1] !== points[points.length - 1]) {
      simplified.push(points[points.length - 1]);
    }

    return simplified;
  }

  private encodeSignedNumber(num: number): string {
    let sgnNum = num << 1;
    if (num < 0) {
      sgnNum = ~sgnNum;
    }

    let encoded = '';
    while (sgnNum >= 0x20) {
      encoded += String.fromCharCode((0x20 | (sgnNum & 0x1f)) + 63);
      sgnNum >>= 5;
    }
    encoded += String.fromCharCode(sgnNum + 63);

    return encoded;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

