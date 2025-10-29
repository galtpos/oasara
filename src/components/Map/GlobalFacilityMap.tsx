import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Facility } from '../../lib/supabase';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN!;

interface GlobalFacilityMapProps {
  facilities: Facility[];
  onFacilitySelect: (facility: Facility) => void;
  selectedFacility?: Facility | null;
}

const GlobalFacilityMap: React.FC<GlobalFacilityMapProps> = ({
  facilities,
  onFacilitySelect,
  selectedFacility
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark theme
      center: [20, 20], // Center of the world roughly
      zoom: 1.5,
      projection: { name: 'mercator' }
    });

    map.current.on('load', () => {
      setMapLoaded(true);

      // Add custom styling for better dark theme
      if (map.current) {
        map.current.setPaintProperty('water', 'fill-color', '#0A0A0A');
        map.current.setPaintProperty('land', 'background-color', '#1A1A1A');
      }
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing source and layers
    if (map.current.getSource('facilities')) {
      if (map.current.getLayer('clusters')) map.current.removeLayer('clusters');
      if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count');
      if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point');
      map.current.removeSource('facilities');
    }

    // Convert facilities to GeoJSON
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: facilities.map(facility => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [facility.lng, facility.lat]
        },
        properties: {
          id: facility.id,
          name: facility.name,
          city: facility.city,
          country: facility.country,
          rating: facility.google_rating,
          accepts_zano: facility.accepts_zano
        }
      }))
    };

    // Add source with clustering enabled
    map.current.addSource('facilities', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add cluster circles
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'facilities',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#D97925',  // Ignition Amber for small clusters
          10,
          '#C17754',  // Warm Clay for medium clusters
          30,
          '#D4AF37'   // Champagne Gold for large clusters
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,  // Small clusters
          10,
          30,  // Medium clusters
          30,
          40   // Large clusters
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFF8F0'
      }
    });

    // Add cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'facilities',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': '#FFF8F0'
      }
    });

    // Add individual facility points
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'facilities',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['get', 'accepts_zano'],
          '#D4AF37',  // Gold for Zano-accepting
          '#C17754'   // Warm Clay for regular
        ],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': [
          'case',
          ['get', 'accepts_zano'],
          '#D97925',
          'rgba(217, 121, 37, 0.3)'
        ]
      }
    });

    // Click handler for clusters - zoom in
    map.current.on('click', 'clusters', (e) => {
      if (!map.current) return;
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties?.cluster_id;
      const source = map.current.getSource('facilities') as mapboxgl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !map.current || !zoom) return;
        map.current.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom
        });
      });
    });

    // Click handler for individual facilities
    map.current.on('click', 'unclustered-point', (e) => {
      if (!e.features || !e.features[0].properties) return;
      const facilityId = e.features[0].properties.id;
      const facility = facilities.find(f => f.id === facilityId);
      if (facility) {
        onFacilitySelect(facility);
      }
    });

    // Hover popup for individual facilities
    map.current.on('mouseenter', 'unclustered-point', (e) => {
      if (!map.current || !e.features || !e.features[0].properties) return;
      map.current.getCanvas().style.cursor = 'pointer';

      const props = e.features[0].properties;
      const coordinates = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number];

      if (popupRef.current) {
        popupRef.current.remove();
      }

      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })
        .setLngLat(coordinates)
        .setHTML(`
          <div class="p-3">
            <h3 class="font-serif font-semibold text-ignition-amber">${props.name}</h3>
            <p class="text-sm text-cream/80">${props.city}, ${props.country}</p>
            <div class="flex items-center mt-1">
              <span class="text-champagne-gold text-sm">★ ${props.rating || 'N/A'}</span>
              ${props.accepts_zano ? '<span class="ml-2 text-xs px-2 py-0.5 rounded-full bg-ignition-amber/20 text-ignition-amber">Zano Ready</span>' : ''}
            </div>
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

    // Change cursor on cluster hover
    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

  }, [facilities, mapLoaded, onFacilitySelect]);

  // Fly to selected facility
  useEffect(() => {
    if (selectedFacility && map.current) {
      map.current.flyTo({
        center: [selectedFacility.lng, selectedFacility.lat],
        zoom: 12,
        duration: 1500
      });
    }
  }, [selectedFacility]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center glass-morphism rounded-lg">
          <div className="text-center">
            <div className="shimmer w-32 h-32 rounded-full mx-auto mb-4"></div>
            <p className="font-serif text-xl text-ignition-amber">Loading Your Oasis...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 glass-morphism p-4 rounded-lg">
        <h4 className="font-serif text-sm text-champagne-gold mb-2">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
                 style={{background: 'linear-gradient(135deg, #D97925 0%, #D4AF37 100%)'}}>
              <svg className="w-3 h-3 text-cream" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <span className="text-cream/90">Accepts Zano Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
                 style={{background: 'rgba(193, 119, 84, 0.8)', border: '2px solid rgba(217, 121, 37, 0.3)'}}>
              <svg className="w-3 h-3 text-cream" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="text-cream/90">JCI-Certified Facility</span>
          </div>
        </div>
      </div>

      {/* Facility count */}
      <div className="absolute top-6 left-6 glass-morphism px-4 py-2 rounded-lg">
        <p className="font-serif text-sm">
          <span className="text-champagne-gold font-semibold">{facilities.length}</span>
          <span className="text-cream/80 ml-1">Sanctuaries of Healing</span>
        </p>
      </div>
    </div>
  );
};

export default GlobalFacilityMap;
