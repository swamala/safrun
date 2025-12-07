'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { mockRunners, mapCenter, defaultZoom, Runner } from '@/data/mockRunners';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
const createCustomIcon = (status: Runner['safetyStatus']) => {
  const colors = {
    safe: '#22c55e',
    sos: '#ef4444',
    inactive: '#94a3b8',
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${colors[status]};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        ${status === 'sos' ? `
          <div style="
            position: absolute;
            inset: -8px;
            border-radius: 50%;
            background: ${colors[status]};
            opacity: 0.4;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[500px] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center">
        <span className="text-slate-500 dark:text-slate-400">Loading map...</span>
      </div>
    );
  }

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-content {
          margin: 0;
          min-width: 220px;
        }
        .leaflet-popup-tip {
          background: white;
        }
        .dark .leaflet-popup-content-wrapper {
          background: #1e293b;
        }
        .dark .leaflet-popup-tip {
          background: #1e293b;
        }
      `}</style>
      
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapController isDark={isDark} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />

        {mockRunners.map((runner) => (
          <div key={runner.id}>
            {/* Runner route */}
            <Polyline
              positions={runner.route.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: runner.safetyStatus === 'sos' ? '#ef4444' : '#f97316',
                weight: 4,
                opacity: 0.8,
                dashArray: runner.safetyStatus === 'sos' ? undefined : '10, 10',
              }}
            />
            
            {/* Runner marker */}
            <Marker
              position={[runner.location.lat, runner.location.lng]}
              icon={createCustomIcon(runner.safetyStatus)}
            >
              <Popup>
                <div className={`p-4 ${isDark ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      runner.safetyStatus === 'sos' ? 'bg-red-500' : 'bg-orange-500'
                    }`}>
                      {runner.avatar}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {runner.name}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          runner.safetyStatus === 'safe' ? 'bg-green-500' :
                          runner.safetyStatus === 'sos' ? 'bg-red-500 animate-pulse' :
                          'bg-slate-400'
                        }`} />
                        <span className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {runner.safetyStatus === 'sos' ? 'SOS Alert!' : runner.safetyStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`grid grid-cols-2 gap-2 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pace</p>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{runner.pace}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Distance</p>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{runner.distance}</p>
                    </div>
                  </div>

                  {runner.safetyStatus === 'sos' && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        ⚠️ Emergency alert triggered
                      </p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>

      {/* Map overlay stats */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">Live Tracking</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockRunners.length}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Active runners nearby</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Status</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">SOS Alert</span>
          </div>
        </div>
      </div>
    </div>
  );
}

