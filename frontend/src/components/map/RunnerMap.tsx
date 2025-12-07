'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { mockRunners, mapCenter, defaultZoom, groupStats, Runner } from '@/data/mockRunners';
import 'leaflet/dist/leaflet.css';

// Create custom animated marker icon
const createCustomIcon = (status: Runner['safetyStatus'], isHovered: boolean = false) => {
  const colors = {
    safe: '#22c55e',
    sos: '#ef4444',
    inactive: '#94a3b8',
  };

  const size = isHovered ? 44 : 36;
  const bounce = isHovered ? 'transform: translateY(-8px);' : '';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container" style="
        width: ${size}px;
        height: ${size}px;
        ${bounce}
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      ">
        <div style="
          width: 100%;
          height: 100%;
          background: ${colors[status]};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
        ">
          ${status === 'sos' ? `
            <div style="
              position: absolute;
              inset: -10px;
              border-radius: 50%;
              background: ${colors[status]};
              opacity: 0.4;
              animation: sos-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: absolute;
              inset: -5px;
              border-radius: 50%;
              background: ${colors[status]};
              opacity: 0.6;
              animation: sos-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              animation-delay: 0.5s;
            "></div>
          ` : ''}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="position: relative; z-index: 1;">
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
          </svg>
        </div>
        ${status === 'safe' ? `
          <div style="
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #22c55e;
            border: 2px solid white;
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 5],
  });
};

function MapController({ isDark }: { isDark: boolean }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
}

interface RunnerMapProps {
  isDark?: boolean;
}

export default function RunnerMap({ isDark = false }: RunnerMapProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredRunner, setHoveredRunner] = useState<string | null>(null);
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[500px] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3 animate-pulse" />
          <span className="text-slate-500 dark:text-slate-400">Loading map...</span>
        </div>
      </div>
    );
  }

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
      <style jsx global>{`
        @keyframes sos-ping {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .leaflet-container {
          font-family: var(--font-plus-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif;
          background: ${isDark ? '#0f172a' : '#f8fafc'};
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
        }
        .leaflet-popup-content {
          margin: 0;
          min-width: 240px;
        }
        .leaflet-popup-tip {
          background: ${isDark ? '#1e293b' : 'white'};
          border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
        }
        .leaflet-popup-close-button {
          color: ${isDark ? '#94a3b8' : '#64748b'} !important;
          font-size: 20px !important;
          padding: 8px !important;
        }
        .custom-marker:hover .marker-container {
          transform: translateY(-8px) scale(1.1);
        }
        .leaflet-marker-icon {
          transition: transform 0.3s ease;
        }
        .leaflet-marker-icon:hover {
          z-index: 1000 !important;
        }
      `}</style>

      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <MapController isDark={isDark} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />

        {mockRunners.map((runner) => (
          <div key={runner.id}>
            {/* Runner route polyline */}
            <Polyline
              positions={runner.route.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: runner.safetyStatus === 'sos' ? '#ef4444' : '#f97316',
                weight: runner.safetyStatus === 'sos' ? 5 : 4,
                opacity: hoveredRunner === runner.id ? 1 : 0.7,
                dashArray: runner.safetyStatus === 'sos' ? undefined : '8, 12',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Runner marker */}
            <Marker
              position={[runner.location.lat, runner.location.lng]}
              icon={createCustomIcon(runner.safetyStatus, hoveredRunner === runner.id)}
              eventHandlers={{
                mouseover: () => setHoveredRunner(runner.id),
                mouseout: () => setHoveredRunner(null),
                click: () => setSelectedRunner(runner),
              }}
            >
              <Popup>
                <div className={`${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                  {/* Header */}
                  <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          runner.safetyStatus === 'sos'
                            ? 'bg-gradient-to-br from-red-500 to-rose-600'
                            : 'bg-gradient-to-br from-orange-500 to-amber-500'
                        }`}
                      >
                        {runner.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {runner.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              runner.safetyStatus === 'safe'
                                ? 'bg-green-500'
                                : runner.safetyStatus === 'sos'
                                ? 'bg-red-500 animate-pulse'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {runner.safetyStatus === 'sos' ? '🚨 SOS Alert!' : runner.isLive ? 'Running' : 'Inactive'}
                          </span>
                          {runner.groupName && (
                            <>
                              <span className={`${isDark ? 'text-slate-600' : 'text-slate-300'}`}>•</span>
                              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {runner.groupName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className={`grid grid-cols-2 gap-px ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <div className={`p-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pace</p>
                      <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{runner.pace}</p>
                    </div>
                    <div className={`p-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Distance</p>
                      <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{runner.distance}</p>
                    </div>
                    {runner.heartRate && (
                      <div className={`p-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Heart Rate</p>
                        <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {runner.heartRate} <span className="text-xs font-normal">bpm</span>
                        </p>
                      </div>
                    )}
                    {runner.elevation && (
                      <div className={`p-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Elevation</p>
                        <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{runner.elevation}</p>
                      </div>
                    )}
                  </div>

                  {/* SOS Alert Banner */}
                  {runner.safetyStatus === 'sos' && (
                    <div className="p-3 bg-gradient-to-r from-red-500 to-rose-500">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🚨</span>
                        <div>
                          <p className="text-white font-semibold text-sm">Emergency Alert Active</p>
                          <p className="text-red-100 text-xs">Tap to respond and help</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className={`p-3 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Started at {runner.startTime}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>

      {/* Overlay: Live Tracking Stats */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-green-500 block" />
            <span className="w-3 h-3 rounded-full bg-green-500 absolute inset-0 animate-ping opacity-75" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Live Tracking</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{groupStats.activeRunners}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">runners</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {groupStats.totalDistance} km total distance
          </p>
        </div>
      </div>

      {/* Overlay: SOS Alert */}
      {groupStats.sosAlerts > 0 && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-500 text-white rounded-2xl p-4 shadow-xl animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <div>
              <p className="font-semibold text-sm">{groupStats.sosAlerts} SOS Alert</p>
              <p className="text-xs text-red-100">Tap marker for details</p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay: Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">Status</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-green-500 shadow-sm" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Safe & Running</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-4 h-4 rounded-full bg-red-500 block shadow-sm" />
              <span className="w-4 h-4 rounded-full bg-red-500 absolute inset-0 animate-ping opacity-50" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">SOS Alert</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-slate-400 shadow-sm" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Inactive</span>
          </div>
        </div>
      </div>

      {/* Overlay: Groups */}
      {groupStats.groups.length > 0 && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">Active Groups</p>
          <div className="space-y-2">
            {groupStats.groups.map((group, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{group}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
