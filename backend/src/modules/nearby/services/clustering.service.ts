import { Injectable, Logger } from '@nestjs/common';
import { PaceCalculationService } from '@/modules/location/services/pace-calculation.service';

interface RunnerLocation {
  userId: string;
  latitude: number;
  longitude: number;
  displayName?: string;
  avatarUrl?: string;
}

interface Cluster {
  id: string;
  centerLatitude: number;
  centerLongitude: number;
  runners: RunnerLocation[];
  size: number;
  radiusMeters: number;
}

@Injectable()
export class ClusteringService {
  private readonly logger = new Logger(ClusteringService.name);

  // Maximum distance for runners to be considered in same cluster
  private readonly CLUSTER_RADIUS_METERS = 20;

  constructor(private readonly paceService: PaceCalculationService) {}

  /**
   * Cluster nearby runners based on proximity
   * Uses simple DBSCAN-like algorithm
   */
  clusterRunners(runners: RunnerLocation[]): Cluster[] {
    if (runners.length === 0) {
      return [];
    }

    const clusters: Cluster[] = [];
    const visited = new Set<string>();
    const clustered = new Set<string>();

    for (const runner of runners) {
      if (visited.has(runner.userId)) {
        continue;
      }

      visited.add(runner.userId);

      // Find all neighbors within cluster radius
      const neighbors = this.findNeighbors(runner, runners, this.CLUSTER_RADIUS_METERS);

      if (neighbors.length >= 1) {
        // Create a new cluster
        const cluster = this.createCluster(runner, neighbors);
        
        // Mark all in cluster as clustered
        cluster.runners.forEach((r) => clustered.add(r.userId));
        
        clusters.push(cluster);
      }
    }

    // Add remaining unclustered runners as single-runner clusters
    for (const runner of runners) {
      if (!clustered.has(runner.userId)) {
        clusters.push({
          id: `cluster_${runner.userId}`,
          centerLatitude: runner.latitude,
          centerLongitude: runner.longitude,
          runners: [runner],
          size: 1,
          radiusMeters: 0,
        });
      }
    }

    this.logger.debug(`Clustered ${runners.length} runners into ${clusters.length} clusters`);

    return clusters;
  }

  /**
   * Find all runners within radius of a point
   */
  private findNeighbors(
    center: RunnerLocation,
    runners: RunnerLocation[],
    radiusMeters: number,
  ): RunnerLocation[] {
    return runners.filter((runner) => {
      if (runner.userId === center.userId) {
        return true; // Include center runner
      }

      const distance = this.paceService.calculateDistance(
        center.latitude,
        center.longitude,
        runner.latitude,
        runner.longitude,
      );

      return distance <= radiusMeters;
    });
  }

  /**
   * Create a cluster from a set of runners
   */
  private createCluster(seed: RunnerLocation, neighbors: RunnerLocation[]): Cluster {
    const allRunners = neighbors;

    // Calculate centroid
    let sumLat = 0;
    let sumLng = 0;
    for (const runner of allRunners) {
      sumLat += runner.latitude;
      sumLng += runner.longitude;
    }

    const centerLat = sumLat / allRunners.length;
    const centerLng = sumLng / allRunners.length;

    // Calculate max radius from center
    let maxRadius = 0;
    for (const runner of allRunners) {
      const dist = this.paceService.calculateDistance(
        centerLat,
        centerLng,
        runner.latitude,
        runner.longitude,
      );
      if (dist > maxRadius) {
        maxRadius = dist;
      }
    }

    return {
      id: `cluster_${seed.userId}_${Date.now()}`,
      centerLatitude: centerLat,
      centerLongitude: centerLng,
      runners: allRunners,
      size: allRunners.length,
      radiusMeters: Math.round(maxRadius),
    };
  }

  /**
   * Merge overlapping clusters
   */
  mergeClusters(clusters: Cluster[]): Cluster[] {
    if (clusters.length <= 1) {
      return clusters;
    }

    const merged: Cluster[] = [];
    const mergedIds = new Set<string>();

    for (let i = 0; i < clusters.length; i++) {
      if (mergedIds.has(clusters[i].id)) {
        continue;
      }

      let currentCluster = clusters[i];

      for (let j = i + 1; j < clusters.length; j++) {
        if (mergedIds.has(clusters[j].id)) {
          continue;
        }

        const distance = this.paceService.calculateDistance(
          currentCluster.centerLatitude,
          currentCluster.centerLongitude,
          clusters[j].centerLatitude,
          clusters[j].centerLongitude,
        );

        // If clusters overlap, merge them
        if (distance <= currentCluster.radiusMeters + clusters[j].radiusMeters + this.CLUSTER_RADIUS_METERS) {
          currentCluster = this.mergeTwoClusters(currentCluster, clusters[j]);
          mergedIds.add(clusters[j].id);
        }
      }

      merged.push(currentCluster);
    }

    return merged;
  }

  /**
   * Merge two clusters into one
   */
  private mergeTwoClusters(a: Cluster, b: Cluster): Cluster {
    const allRunners = [...a.runners, ...b.runners];
    
    // Remove duplicates
    const uniqueRunners = allRunners.filter(
      (runner, index, self) =>
        index === self.findIndex((r) => r.userId === runner.userId),
    );

    // Recalculate center
    let sumLat = 0;
    let sumLng = 0;
    for (const runner of uniqueRunners) {
      sumLat += runner.latitude;
      sumLng += runner.longitude;
    }

    const centerLat = sumLat / uniqueRunners.length;
    const centerLng = sumLng / uniqueRunners.length;

    // Calculate max radius
    let maxRadius = 0;
    for (const runner of uniqueRunners) {
      const dist = this.paceService.calculateDistance(
        centerLat,
        centerLng,
        runner.latitude,
        runner.longitude,
      );
      if (dist > maxRadius) {
        maxRadius = dist;
      }
    }

    return {
      id: `merged_${a.id}_${b.id}`,
      centerLatitude: centerLat,
      centerLongitude: centerLng,
      runners: uniqueRunners,
      size: uniqueRunners.length,
      radiusMeters: Math.round(maxRadius),
    };
  }
}

