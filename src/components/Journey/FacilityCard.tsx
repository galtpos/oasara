import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTypicalSavingsRange } from '../../lib/procedureMapping';

interface Procedure {
  name: string;
  price_range: string;
  wait_time?: string;
}

interface FacilityCardProps {
  facility: {
    id: string;
    name: string;
    city: string;
    country: string;
    jci_accredited: boolean;
    google_rating?: number;
    review_count?: number;
    popular_procedures?: Procedure[];
    accepts_zano?: boolean;
  };
  procedureType?: string;
  onAddToShortlist?: (facilityName: string) => void;
  isInShortlist?: boolean;
  compact?: boolean;
}

/**
 * Enhanced Facility Card for Conversational Journey
 * Shows facility info with US price comparison and savings
 */
const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  procedureType,
  onAddToShortlist,
  isInShortlist = false,
  compact = false
}) => {
  // Find matching procedure for price display
  const matchingProcedure = facility.popular_procedures?.find(p =>
    procedureType && p.name.toLowerCase().includes(procedureType.toLowerCase())
  ) || facility.popular_procedures?.[0];

  // Get savings estimate
  const savingsRange = matchingProcedure
    ? getTypicalSavingsRange(matchingProcedure.name)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border-2 border-sage-200 hover:border-ocean-300 transition-all ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      {/* Header: Name + Location */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link
            to={`/facilities/${facility.id}`}
            className="text-lg font-semibold text-ocean-800 hover:text-ocean-600 transition-colors"
          >
            {facility.name}
          </Link>
          <div className="flex items-center gap-2 mt-1 text-sm text-ocean-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {facility.city}, {facility.country}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-1 items-end">
          {facility.jci_accredited && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              JCI
            </span>
          )}
          {facility.accepts_zano && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              Zano
            </span>
          )}
        </div>
      </div>

      {/* Rating */}
      {facility.google_rating && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold text-ocean-800">{facility.google_rating.toFixed(1)}</span>
          </div>
          {facility.review_count && (
            <span className="text-sm text-ocean-500">({facility.review_count.toLocaleString()} reviews)</span>
          )}
        </div>
      )}

      {/* Price & Savings */}
      {matchingProcedure && (
        <div className="bg-gradient-to-r from-sage-50 to-ocean-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-ocean-600 mb-1">{matchingProcedure.name}</div>
              <div className="text-lg font-bold text-gold-600">{matchingProcedure.price_range}</div>
            </div>
            {savingsRange && (
              <div className="text-right">
                <div className="text-xs text-ocean-600">vs US price</div>
                <div className="text-lg font-bold text-green-600">
                  {savingsRange.min}-{savingsRange.max}% less
                </div>
              </div>
            )}
          </div>
          {matchingProcedure.wait_time && (
            <div className="mt-2 text-xs text-ocean-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Wait time: {matchingProcedure.wait_time}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onAddToShortlist && (
          <button
            onClick={() => onAddToShortlist(facility.name)}
            disabled={isInShortlist}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              isInShortlist
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-ocean-500 hover:bg-ocean-600 text-white'
            }`}
          >
            {isInShortlist ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                In Shortlist
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add to Shortlist
              </>
            )}
          </button>
        )}
        <Link
          to={`/facilities/${facility.id}`}
          className="flex-1 px-4 py-2 bg-white border-2 border-ocean-300 hover:border-ocean-500 text-ocean-600 rounded-lg text-sm font-medium transition-colors text-center"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default FacilityCard;
