'use client';

/**
 * SAFRUN Web MapView Component
 * Main map component using Mapbox GL JS
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token from environment
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export interface MapMarker {
  id: string;
  coordinates: [number, number]; // [lng, lat]
  color?: string;
  label?: string;
  type?: 'runner' | 'sos' | 'responder' | 'start' | 'end';
  popup?: string;
}

export interface MapRoute {
  id: string;
  coordinates: [number, number][]; // Array of [lng, lat]
  color?: string;
  width?: number;
}

export interface MapViewProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: MapMarker[];
  routes?: MapRoute[];
  style?: React.CSSProperties;
  className?: string;
  onMarkerClick?: (markerId: string) => void;
  onMapClick?: (coordinates: [number, number]) => void;
  showUserLocation?: boolean;
  fitBounds?: boolean;
}

export function MapView({
  center = [-73.935242, 40.73061], // NYC default
  zoom = 13,
  markers = [],
  routes = [],
  style,
  className,
  onMarkerClick,
  onMapClick,
  showUserLocation = false,
  fitBounds = false,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
    });

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick([e.lngLat.lng, e.lngLat.lat]);
      });
    }

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location control if enabled
    if (showUserLocation) {
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update center
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    map.current.setCenter(center);
  }, [center, isLoaded]);

  // Update zoom
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    map.current.setZoom(zoom);
  }, [zoom, isLoaded]);

  // Update markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove old markers that are no longer in the list
    const currentMarkerIds = new Set(markers.map((m) => m.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    markers.forEach((markerData) => {
      let marker = markersRef.current.get(markerData.id);

      if (marker) {
        // Update position
        marker.setLngLat(markerData.coordinates);
      } else {
        // Create new marker
        const el = createMarkerElement(markerData);
        
        marker = new mapboxgl.Marker({ element: el })
          .setLngLat(markerData.coordinates)
          .addTo(map.current!);

        if (markerData.popup) {
          marker.setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(markerData.popup)
          );
        }

        if (onMarkerClick) {
          el.addEventListener('click', () => onMarkerClick(markerData.id));
        }

        markersRef.current.set(markerData.id, marker);
      }
    });
  }, [markers, isLoaded, onMarkerClick]);

  // Update routes
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    routes.forEach((route) => {
      const sourceId = `route-${route.id}`;
      const layerId = `route-layer-${route.id}`;

      const source = map.current!.getSource(sourceId) as mapboxgl.GeoJSONSource;
      
      if (source) {
        // Update existing route
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates,
          },
        });
      } else {
        // Add new route source
        map.current!.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route.coordinates,
            },
          },
        });

        // Add route layer
        map.current!.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': route.color || '#4CAF50',
            'line-width': route.width || 4,
            'line-opacity': 0.8,
          },
        });
      }
    });
  }, [routes, isLoaded]);

  // Fit bounds to show all markers
  useEffect(() => {
    if (!map.current || !isLoaded || !fitBounds || markers.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    markers.forEach((marker) => {
      bounds.extend(marker.coordinates);
    });
    routes.forEach((route) => {
      route.coordinates.forEach((coord) => {
        bounds.extend(coord);
      });
    });

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 16,
    });
  }, [markers, routes, isLoaded, fitBounds]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
      className={className}
    />
  );
}

// Helper function to create custom marker elements
function createMarkerElement(marker: MapMarker): HTMLElement {
  const el = document.createElement('div');
  el.className = 'mapbox-marker';
  
  const size = marker.type === 'sos' ? 32 : 28;
  const color = marker.color || getMarkerColor(marker.type);
  
  el.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background-color: ${color};
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
  `;
  
  if (marker.type === 'sos') {
    el.innerHTML = '⚠';
    el.style.animation = 'pulse 1.5s infinite';
  } else if (marker.label) {
    el.innerHTML = marker.label;
  } else if (marker.type === 'runner') {
    el.innerHTML = '🏃';
  }
  
  return el;
}

function getMarkerColor(type?: string): string {
  switch (type) {
    case 'runner':
      return '#4CAF50';
    case 'sos':
      return '#F44336';
    case 'responder':
      return '#2196F3';
    case 'start':
      return '#4CAF50';
    case 'end':
      return '#FF9800';
    default:
      return '#9C27B0';
  }
}

export default MapView;

