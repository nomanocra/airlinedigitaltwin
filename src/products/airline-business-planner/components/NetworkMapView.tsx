import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Select } from '@/design-system/components/Select';
import { IconButton } from '@/design-system/components/IconButton';
import { ChartCard } from '@/design-system/composites/ChartCard';
import './NetworkMapView.css';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Airport coordinates (lat, lng)
const AIRPORT_COORDS: Record<string, [number, number]> = {
  AMS: [52.3086, 4.7639],
  ATL: [33.6407, -84.4277],
  BCN: [41.2974, 2.0833],
  BKK: [13.6900, 100.7501],
  BOM: [19.0896, 72.8656],
  BOS: [42.3656, -71.0096],
  CDG: [49.0097, 2.5479],
  DEL: [28.5562, 77.1000],
  DEN: [39.8561, -104.6737],
  DFW: [32.8998, -97.0403],
  DOH: [25.2731, 51.6081],
  DUB: [53.4264, -6.2499],
  DXB: [25.2532, 55.3657],
  EWR: [40.6895, -74.1745],
  FCO: [41.8003, 12.2389],
  FRA: [50.0379, 8.5622],
  GRU: [-23.4356, -46.4731],
  HKG: [22.3080, 113.9185],
  HND: [35.5494, 139.7798],
  IAD: [38.9531, -77.4565],
  IAH: [29.9902, -95.3368],
  ICN: [37.4602, 126.4407],
  IST: [41.2753, 28.7519],
  JFK: [40.6413, -73.7781],
  JNB: [-26.1392, 28.2460],
  KUL: [2.7456, 101.7099],
  LAX: [33.9425, -118.4081],
  LGA: [40.7769, -73.8740],
  LHR: [51.4700, -0.4543],
  LIS: [38.7813, -9.1359],
  MAD: [40.4983, -3.5676],
  MEX: [19.4363, -99.0721],
  MIA: [25.7959, -80.2870],
  MRS: [43.4393, 5.2214],
  MUC: [48.3538, 11.7861],
  NCE: [43.6584, 7.2159],
  NRT: [35.7720, 140.3929],
  ORD: [41.9742, -87.9073],
  ORY: [48.7262, 2.3652],
  PEK: [40.0799, 116.6031],
  PVG: [31.1443, 121.8083],
  SFO: [37.6213, -122.3790],
  SIN: [1.3644, 103.9915],
  SYD: [-33.9461, 151.1772],
  TLS: [43.6291, 1.3638],
  YUL: [45.4706, -73.7408],
  YYZ: [43.6777, -79.6248],
  ZRH: [47.4647, 8.5492],
};

interface RouteEntry {
  id: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}

interface NetworkMapViewProps {
  routeEntries: RouteEntry[];
  startDate?: Date;
  endDate?: Date;
}

export function NetworkMapView({ routeEntries, startDate, endDate }: NetworkMapViewProps) {
  const [yearFilter, setYearFilter] = useState('all');
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10, 30]);

  // Year options for filter
  const yearOptions = useMemo(() => {
    const opts = [{ value: 'all', label: 'All' }];
    if (startDate && endDate) {
      for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
        opts.push({ value: String(y), label: String(y) });
      }
    }
    return opts;
  }, [startDate, endDate]);

  // Filter routes by year
  const filteredRouteEntries = useMemo(() => {
    if (yearFilter === 'all') return routeEntries;
    const selectedYear = parseInt(yearFilter, 10);
    return routeEntries.filter(r => {
      const startYear = r.startDate.getFullYear();
      const endYear = r.endDate.getFullYear();
      return startYear <= selectedYear && endYear >= selectedYear;
    });
  }, [routeEntries, yearFilter]);

  // Map routes
  const mapRoutes = useMemo(() => {
    return filteredRouteEntries
      .filter(r => AIRPORT_COORDS[r.origin] && AIRPORT_COORDS[r.destination])
      .map(r => ({
        from: AIRPORT_COORDS[r.origin],
        to: AIRPORT_COORDS[r.destination],
        id: r.id,
      }));
  }, [filteredRouteEntries]);

  // Filtered airports
  const filteredAirports = useMemo(() => {
    const set = new Set<string>();
    filteredRouteEntries.forEach(r => {
      set.add(r.origin);
      set.add(r.destination);
    });
    return set;
  }, [filteredRouteEntries]);

  const mapMarkers = useMemo(() => {
    return Array.from(filteredAirports)
      .filter(code => AIRPORT_COORDS[code])
      .map(code => ({
        code,
        coords: AIRPORT_COORDS[code],
      }));
  }, [filteredAirports]);

  return (
    <ChartCard
      title="Network Map"
      headerCenter={
        <span className="network-map-view__filter-inline">
          <span className="network-map-view__filter-label body-regular">Year</span>
          <Select
            options={yearOptions}
            value={yearFilter}
            onValueChange={setYearFilter}
            size="XS"
            showLabel={false}
          />
        </span>
      }
      actions={
        <IconButton icon="open_in_full" size="XS" variant="Ghost" alt="Fullscreen" />
      }
      className="network-map-view__chart-card"
    >
      <div className="network-map-view__map-wrapper">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130 }}
          width={900}
          height={400}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={mapZoom}
            center={mapCenter}
            onMoveEnd={({ coordinates, zoom }) => {
              setMapCenter(coordinates as [number, number]);
              setMapZoom(zoom);
            }}
            minZoom={1}
            maxZoom={8}
            translateExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="var(--sea-blue-10)"
                    stroke="var(--cool-grey-30)"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Route lines */}
            {mapRoutes.map(route => (
              <Line
                key={route.id}
                from={[route.from[1], route.from[0]]}
                to={[route.to[1], route.to[0]]}
                stroke="var(--primary-default, #063b9e)"
                strokeWidth={1.5 / mapZoom}
                strokeLinecap="round"
              />
            ))}

            {/* Airport markers */}
            {mapMarkers.map(marker => (
              <Marker key={marker.code} coordinates={[marker.coords[1], marker.coords[0]]}>
                <circle r={3 / mapZoom} fill="var(--primary-default, #063b9e)" />
                <text
                  textAnchor="middle"
                  y={-7 / mapZoom}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: `${12 / mapZoom}px`,
                    fontWeight: 600,
                    fill: 'var(--text-corporate, #00205b)',
                    stroke: '#ffffff',
                    strokeWidth: 3 / mapZoom,
                    paintOrder: 'stroke fill',
                  }}
                >
                  {marker.code}
                </text>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
        <div className="network-map-view__zoom-controls">
          <IconButton icon="add" size="XS" variant="Ghost" alt="Zoom in" onClick={() => setMapZoom(z => Math.min(z * 1.5, 8))} />
          <IconButton icon="remove" size="XS" variant="Ghost" alt="Zoom out" onClick={() => setMapZoom(z => Math.max(z / 1.5, 1))} />
        </div>
      </div>
    </ChartCard>
  );
}

export default NetworkMapView;
