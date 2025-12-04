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
      style: 'mapbox://styles/mapbox/light-v11', // Light warm theme
      center: [20, 20], // Center of the world roughly
      zoom: 1.5,
      projection: { name: 'mercator' }
    });

    map.current.on('load', () => {
      setMapLoaded(true);
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
          '#C9A54F',  // Gold-600 for small clusters
          10,
          '#B8923A',  // Gold-700 for medium clusters
          30,
          '#2A6B72'   // Ocean-600 for large clusters
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
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF'
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
        'text-size': 16
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': '#2A6B72',
        'text-halo-width': 2,
        'text-halo-blur': 1
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
          '#D4B86A',  // Gold-500 for Zano-accepting
          '#2A6B72'   // Ocean-600 for regular
        ],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': [
          'case',
          ['get', 'accepts_zano'],
          '#B8923A',  // Gold-700 border
          '#1F525A'   // Ocean-700 border
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
          <div class="p-3 bg-white rounded-lg">
            <h3 class="font-display font-semibold text-ocean-700">${props.name}</h3>
            <p class="text-sm text-ocean-600/80">${props.city}, ${props.country}</p>
            <div class="flex items-center mt-1">
              <span class="text-gold-600 text-sm">★ ${props.rating || 'N/A'}</span>
              ${props.accepts_zano ? '<span class="ml-2 text-xs px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 border border-gold-200">Zano Ready</span>' : ''}
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
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
        role="application"
        aria-label={`Interactive map showing ${facilities.length} medical facilities worldwide. Use mouse or touch to pan and zoom.`}
        tabIndex={0}
      />

      {/* Screen reader accessible facility summary */}
      <div className="sr-only" aria-live="polite">
        Displaying {facilities.length} JCI-accredited medical facilities across the world.
        Contact any facility to request Zano or Freedom Dollar payment options.
      </div>

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg">
          <div className="text-center">
            <div className="shimmer w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-r from-gold-400 to-gold-600"></div>
            <p className="font-display text-xl text-ocean-600">Loading Your Oasis...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className="absolute bottom-6 left-6 bg-white p-5 rounded-xl border-2 border-sage-200 shadow-lg max-w-xs"
        role="region"
        aria-label="Map legend"
      >
        <h2 className="font-display text-base text-ocean-600 mb-3 font-semibold">Legend</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{background: '#2A6B72', border: '2px solid #1F525A'}}>
              <span className="text-white font-bold text-xs">J</span>
            </div>
            <span className="text-ocean-700 font-medium">JCI-Certified Facility</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{background: 'linear-gradient(135deg, #D4B86A 0%, #B8923A 100%)'}}>
              <span className="text-white font-bold text-xs">Z</span>
            </div>
            <div>
              <span className="text-ocean-700 font-medium block">Request Zano</span>
              <span className="text-sage-500 text-xs">Ask about privacy payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Facility count */}
      <div className="absolute top-6 left-6 bg-white px-5 py-3 rounded-xl border-2 border-sage-200 shadow-lg">
        <p className="font-display text-base">
          <span className="text-gold-600 font-bold text-lg">{facilities.length}</span>
          <span className="text-ocean-700 ml-2 font-medium tracking-wide uppercase text-sm">Sanctuaries of Healing</span>
        </p>
      </div>
    </div>
  );
};

export default GlobalFacilityMap;
