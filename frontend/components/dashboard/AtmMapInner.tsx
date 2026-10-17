'use client';

import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from 'react-leaflet';
import type { Atm } from '@/lib/types';
import { formatCompact } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  online: '#16a34a',
  offline: '#dc2626',
  maintenance: '#f59e0b',
};

export default function AtmMapInner({ atms }: { atms: Atm[] }) {
  return (
    <MapContainer
      center={[23.8103, 90.4125]}
      zoom={12}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {atms.map((atm) => {
        const color = STATUS_COLOR[atm.status] ?? '#64748b';
        return (
          <CircleMarker
            key={atm._id}
            center={[atm.location.lat, atm.location.lng]}
            radius={atm.status === 'offline' ? 9 : 7}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: color,
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {atm.atmId} · {atm.area}
            </Tooltip>
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="text-sm font-semibold">{atm.name}</p>
                <p className="text-muted-foreground">{atm.atmId}</p>
                <p>{atm.location.address}</p>
                <p>
                  Status:{' '}
                  <span style={{ color }} className="font-semibold capitalize">
                    {atm.status}
                  </span>
                </p>
                <p>
                  Cash: {formatCompact(atm.cash)} / {formatCompact(atm.capacity)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
