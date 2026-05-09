import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { OSMFeature } from '../../types';
import type { GPSPosition } from '../../types';
import './HoleMap.css';

const FEATURE_STYLE: Record<string, { color: string; fillColor: string; fillOpacity: number; weight: number }> = {
  green:        { color: '#22c55e', fillColor: 'var(--color-map-green)',   fillOpacity: 0.55, weight: 2 },
  tee:          { color: '#4ade80', fillColor: 'var(--color-map-tee)',     fillOpacity: 0.5,  weight: 1.5 },
  fairway:      { color: '#15803d', fillColor: 'var(--color-map-fairway)', fillOpacity: 0.4,  weight: 1 },
  bunker:       { color: '#ca8a04', fillColor: 'var(--color-map-bunker)',  fillOpacity: 0.65, weight: 1.5 },
  water_hazard: { color: '#3b82f6', fillColor: 'var(--color-map-water)',   fillOpacity: 0.55, weight: 1.5 },
  rough:        { color: '#166534', fillColor: 'var(--color-map-rough)',   fillOpacity: 0.4,  weight: 1 },
  hole_path:    { color: '#facc15', fillColor: 'transparent',              fillOpacity: 0,    weight: 2 },
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const initialRef = useRef(false);
  useEffect(() => {
    if (!initialRef.current) {
      map.setView([lat, lng], 17);
      initialRef.current = true;
    }
  }, [map, lat, lng]);
  return null;
}

interface HoleMapProps {
  features: OSMFeature[];
  center: [number, number]; // [lat, lng]
  height?: number;
  position?: GPSPosition | null;
  distanceToPin?: number | null;
}

export function HoleMap({ features, center, height = 320, position, distanceToPin }: HoleMapProps) {
  return (
    <div className="hole-map-container" style={{ height }}>
      <MapContainer
        center={center}
        zoom={17}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <RecenterMap lat={center[0]} lng={center[1]} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {features.map((feature, i) => {
          const style = FEATURE_STYLE[feature.type] ?? FEATURE_STYLE.rough;
          const positions = feature.coordinates as [number, number][];

          if (feature.type === 'hole_path') {
            return (
              <Polyline
                key={i}
                positions={positions}
                color={style.color}
                weight={style.weight}
                dashArray="6 4"
              />
            );
          }

          return (
            <Polygon
              key={i}
              positions={positions}
              pathOptions={{
                color: style.color,
                fillColor: style.fillColor,
                fillOpacity: style.fillOpacity,
                weight: style.weight,
              }}
            />
          );
        })}

        {/* User GPS position */}
        {position && (
          <CircleMarker
            center={[position.latitude, position.longitude]}
            radius={8}
            pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
          />
        )}
      </MapContainer>

      {/* Distance to pin overlay */}
      {position && (
        <div className="gps-distance-panel">
          <span className="gps-distance-label">To Pin</span>
          {distanceToPin !== null && distanceToPin !== undefined ? (
            <>
              <span className="gps-distance-value">{Math.round(distanceToPin)}</span>
              <span className="gps-distance-unit">yds</span>
            </>
          ) : (
            <span className="gps-no-signal">calculating…</span>
          )}
        </div>
      )}

      <div className="hole-map-osm-badge">© OpenStreetMap</div>
    </div>
  );
}
