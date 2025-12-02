import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { StateTrustLaw, CriteriaKey, getScoreColor } from '../../types/trustLaws';
import { stateTrustLaws, getStateByCode, calculateFilteredScore } from '../../data/stateTrustLaws';

// US states TopoJSON from public CDN
const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// State FIPS to two-letter code mapping
const FIPS_TO_STATE: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY'
};

interface USStateTrustMapProps {
  selectedCriteria: CriteriaKey[];
  onStateSelect: (state: StateTrustLaw | null) => void;
  selectedState: StateTrustLaw | null;
}

const USStateTrustMap: React.FC<USStateTrustMapProps> = ({
  selectedCriteria,
  onStateSelect,
  selectedState
}) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Create a map of state codes to their filtered scores
  const stateScores = useMemo(() => {
    const scores: Record<string, { score: number; state: StateTrustLaw }> = {};
    stateTrustLaws.forEach(state => {
      const filteredScore = calculateFilteredScore(state, selectedCriteria);
      scores[state.stateCode] = { score: filteredScore, state };
    });
    return scores;
  }, [selectedCriteria]);

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPos({ x: event.clientX, y: event.clientY });
  };

  const handleStateClick = (stateCode: string) => {
    const stateData = getStateByCode(stateCode);
    if (stateData) {
      onStateSelect(selectedState?.stateCode === stateCode ? null : stateData);
    }
  };

  const getStateColor = (stateCode: string | undefined): string => {
    if (!stateCode) return '#e5e7eb'; // gray-200 for unknown
    
    const scoreData = stateScores[stateCode];
    if (!scoreData) return '#d1d5db'; // gray-300 for no data
    
    return getScoreColor(scoreData.score);
  };

  const hoveredStateData = hoveredState ? stateScores[hoveredState] : null;

  return (
    <div className="relative w-full h-full" onMouseMove={handleMouseMove}>
      <ComposableMap
        projection="geoAlbersUsa"
        className="w-full h-full"
        projectionConfig={{
          scale: 1000
        }}
      >
        <ZoomableGroup center={[-96, 38]} zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips = geo.id;
                const stateCode = FIPS_TO_STATE[fips];
                const isSelected = selectedState?.stateCode === stateCode;
                const isHovered = hoveredState === stateCode;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getStateColor(stateCode)}
                    stroke={isSelected ? '#1e3a5f' : isHovered ? '#374151' : '#fff'}
                    strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.5}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      },
                      hover: {
                        outline: 'none',
                        cursor: stateScores[stateCode] ? 'pointer' : 'default',
                        filter: stateScores[stateCode] ? 'brightness(1.1)' : 'none'
                      },
                      pressed: {
                        outline: 'none'
                      }
                    }}
                    onMouseEnter={() => setHoveredState(stateCode)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => handleStateClick(stateCode)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {hoveredState && hoveredStateData && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 12,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 px-4 py-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{hoveredStateData.state.state}</h3>
              <span
                className="text-white text-sm font-bold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: getScoreColor(hoveredStateData.score) }}
              >
                {hoveredStateData.score.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {hoveredStateData.state.tier} tier
            </p>
            {hoveredStateData.state.highlights.length > 0 && (
              <p className="text-sm text-gray-600 truncate">
                {hoveredStateData.state.highlights[0]}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">Click for details</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Favorability Score</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: getScoreColor(9) }} />
            <span className="text-xs text-gray-600">Excellent (8-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: getScoreColor(7) }} />
            <span className="text-xs text-gray-600">Good (6-8)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: getScoreColor(5) }} />
            <span className="text-xs text-gray-600">Moderate (4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: getScoreColor(3) }} />
            <span className="text-xs text-gray-600">Limited (2-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: getScoreColor(1) }} />
            <span className="text-xs text-gray-600">Poor (0-2)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
            <div className="w-5 h-5 rounded bg-gray-300" />
            <span className="text-xs text-gray-500">No data available</span>
          </div>
        </div>
      </div>

      {/* Data indicator */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 px-4 py-2">
        <p className="text-sm">
          <span className="font-bold text-teal-700">{stateTrustLaws.length}</span>
          <span className="text-gray-600 ml-1">states with data</span>
        </p>
      </div>
    </div>
  );
};

export default USStateTrustMap;

