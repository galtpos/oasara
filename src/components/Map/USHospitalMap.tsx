import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { HospitalMapItem, CaptureTier } from '../../types/hospital';
import { CAPTURE_TIER_CONFIG } from '../../types/hospital';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN!;

// US center coordinates
const US_CENTER: [number, number] = [-98.5795, 39.8283];

interface USHospitalMapProps {
  hospitals: HospitalMapItem[];
  loading?: boolean;
  onHospitalSelect?: (hospital: HospitalMapItem) => void;
  selectedHospitalId?: string | null;
  height?: string;
}

// Get color based on capture tier - adapted for Oasara palette
function getTierColor(tier: CaptureTier | null): string {
  if (!tier) return '#7A9A8D'; // sage-500 for unscored
  return CAPTURE_TIER_CONFIG[tier].color;
}

const USHospitalMap: React.FC<USHospitalMapProps> = ({
  hospitals,
  loading = false,
  onHospitalSelect,
  selectedHospitalId,
  height = '600px',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const hospitalsRef = useRef<HospitalMapItem[]>(hospitals);

  // Keep hospitals ref updated
  useEffect(() => {
    hospitalsRef.current = hospitals;
  }, [hospitals]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Light theme for Oasara
      center: US_CENTER,
      zoom: 3.5,
      minZoom: 2,
      maxZoom: 18,
      maxBounds: [
        [-170, 15],
        [-50, 72],
      ],
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update data when hospitals change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing layers and source
    if (map.current.getSource('hospitals')) {
      if (map.current.getLayer('clusters')) map.current.removeLayer('clusters');
      if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count');
      if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point');
      map.current.removeSource('hospitals');
    }

    // Convert to GeoJSON
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: hospitals.map((hospital) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [hospital.longitude, hospital.latitude],
        },
        properties: {
          id: hospital.id,
          name: hospital.name,
          city: hospital.city,
          state: hospital.state,
          hospital_type: hospital.hospital_type,
          ownership_type: hospital.ownership_type,
          capture_tier: hospital.capture_tier,
          total_capture_score: hospital.total_capture_score,
          emergency_services: hospital.emergency_services,
          mrf_published: hospital.mrf_published,
        },
      })),
    };

    // Add source with clustering
    map.current.addSource('hospitals', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    // Cluster circles - Oasara ocean/gold palette
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'hospitals',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#1E6068', // ocean-600 for small clusters
          50,
          '#3E95A0', // ocean-400 for medium
          200,
          '#F59E0B', // gold-500 for large
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          50,
          30,
          200,
          40,
        ],
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'hospitals',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14,
      },
      paint: {
        'text-color': '#ffffff',
      },
    });

    // Individual hospital markers - colored by capture tier
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'hospitals',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'capture_tier'],
          'TRANSPARENT', CAPTURE_TIER_CONFIG.TRANSPARENT.color,
          'OPAQUE', CAPTURE_TIER_CONFIG.OPAQUE.color,
          'CAPTURED', CAPTURE_TIER_CONFIG.CAPTURED.color,
          'PREDATORY', CAPTURE_TIER_CONFIG.PREDATORY.color,
          '#7A9A8D', // sage-500 for unscored
        ],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Click on cluster - zoom in
    map.current.on('click', 'clusters', (e) => {
      if (!map.current) return;
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      });
      const clusterId = features[0].properties?.cluster_id;
      const source = map.current.getSource('hospitals') as mapboxgl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !map.current || !zoom) return;
        map.current.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom,
        });
      });
    });

    // Click on hospital - select it
    map.current.on('click', 'unclustered-point', (e) => {
      if (!e.features || !e.features[0].properties) return;
      const hospitalId = e.features[0].properties.id;
      const hospital = hospitalsRef.current.find((h) => h.id === hospitalId);
      if (hospital && onHospitalSelect) {
        onHospitalSelect(hospital);
      }
    });

    // Hover popup
    map.current.on('mouseenter', 'unclustered-point', (e) => {
      if (!map.current || !e.features || !e.features[0].properties) return;
      map.current.getCanvas().style.cursor = 'pointer';

      const props = e.features[0].properties;
      const coordinates = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      const tierColor = getTierColor(props.capture_tier as CaptureTier | null);
      const tierLabel = props.capture_tier ? CAPTURE_TIER_CONFIG[props.capture_tier as CaptureTier].label : 'Not Scored';

      if (popupRef.current) {
        popupRef.current.remove();
      }

      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'hospital-popup',
      })
        .setLngLat(coordinates)
        .setHTML(`
          <div style="background: #ffffff; color: #0D2A2E; padding: 12px; border-radius: 8px; max-width: 280px; border: 2px solid #DCE5E0;">
            <h3 style="font-weight: 600; margin: 0 0 4px 0; font-size: 14px; color: #1E6068;">${props.name}</h3>
            <p style="color: #5A7A6C; margin: 0 0 8px 0; font-size: 12px;">${props.city}, ${props.state}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${tierColor};"></span>
              <span style="font-size: 12px; font-weight: 500; color: ${tierColor};">${tierLabel}</span>
              ${props.total_capture_score ? `<span style="color: #7A9A8D; font-size: 11px;">(${props.total_capture_score}/100)</span>` : ''}
            </div>
            <div style="font-size: 11px; color: #7A9A8D;">
              ${props.hospital_type || 'Hospital'} ${props.emergency_services ? '• ER Available' : ''}
            </div>
            ${!props.mrf_published ? '<div style="margin-top: 6px; padding: 4px 8px; background: #FEF3C7; color: #92400E; font-size: 10px; border-radius: 4px;">Price File Not Published</div>' : ''}
          </div>
        `)
        .addTo(map.current);
    });

    map.current.on('mouseleave', 'unclustered-point', () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = '';
      if (popupRef.current) {
        popupRef.current.remove();
      }
    });

    // Cursor on cluster hover
    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  }, [hospitals, mapLoaded, onHospitalSelect]);

  // Fly to selected hospital
  useEffect(() => {
    if (selectedHospitalId && map.current) {
      const hospital = hospitals.find((h) => h.id === selectedHospitalId);
      if (hospital) {
        map.current.flyTo({
          center: [hospital.longitude, hospital.latitude],
          zoom: 12,
          duration: 1500,
        });
      }
    }
  }, [selectedHospitalId, hospitals]);

  return (
    <div className="relative" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-[1000] flex items-center justify-center">
          <div className="text-ocean-700 text-lg flex items-center gap-3">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading hospitals...
          </div>
        </div>
      )}

      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden border-2 border-sage-200"
        role="application"
        aria-label={`Interactive map showing ${hospitals.length} US hospitals`}
      />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-ocean-700 font-display text-lg">Loading map...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur rounded-lg p-4 text-xs border-2 border-sage-200 shadow-lg">
        <div className="font-display font-semibold text-ocean-700 mb-3">Price Transparency Score</div>
        {Object.entries(CAPTURE_TIER_CONFIG).map(([tier, config]) => (
          <div key={tier} className="flex items-center gap-2 mb-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-sage-700">{config.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-sage-200">
          <div className="w-3 h-3 rounded-full bg-sage-500" />
          <span className="text-sage-500">Not Yet Scored</span>
        </div>
      </div>

      {/* Hospital count */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-lg px-4 py-3 border-2 border-sage-200 shadow-lg">
        <span className="text-sage-600">Showing:</span>{' '}
        <span className="text-ocean-700 font-bold text-lg">{hospitals.length.toLocaleString()}</span>{' '}
        <span className="text-sage-600">hospitals</span>
      </div>
    </div>
  );
};

export default USHospitalMap;
