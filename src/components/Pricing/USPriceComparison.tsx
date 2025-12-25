import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface USPriceData {
  procedure: {
    code: string;
    name: string;
    category: string;
  };
  us_prices: {
    hospital_count: number;
    cash_price: {
      min: number | null;
      max: number | null;
      average: number | null;
    };
    transparent_hospitals_percent: number;
  };
  source: string;
  disclaimer: string;
}

interface USPriceComparisonProps {
  procedureName: string;
  oasaraPrice: number;
  facilityCountry: string;
  className?: string;
}

const OWNNOTHING_API = 'https://ownnothing.org/.netlify/functions/us-prices';
// Fallback for local dev
const OWNNOTHING_API_DEV = 'http://localhost:8888/.netlify/functions/us-prices';

// CPT code mapping for common procedures
const PROCEDURE_CODE_MAP: Record<string, string> = {
  'mri': '70553',
  'brain mri': '70553',
  'mri brain': '70553',
  'mri brain scan': '70553',
  'ct scan': '74177',
  'abdominal ct': '74177',
  'knee replacement': '27447',
  'total knee': '27447',
  'hip replacement': '27130',
  'total hip': '27130',
  'colonoscopy': '45378',
  'c-section': '59510',
  'cesarean': '59510',
  'mammogram': '77067',
  'chest x-ray': '71046',
  'blood test': '80053',
  'metabolic panel': '80053',
};

export default function USPriceComparison({
  procedureName,
  oasaraPrice,
  facilityCountry,
  className = '',
}: USPriceComparisonProps) {
  const [usData, setUsData] = useState<USPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchUSPrices() {
      setLoading(true);
      setError(null);

      // Find matching CPT code
      const normalizedName = procedureName.toLowerCase().trim();
      const cptCode = PROCEDURE_CODE_MAP[normalizedName] ||
        Object.entries(PROCEDURE_CODE_MAP).find(([key]) =>
          normalizedName.includes(key)
        )?.[1];

      if (!cptCode) {
        // Try searching by name
        try {
          const res = await fetch(`${OWNNOTHING_API}?procedure=${encodeURIComponent(procedureName)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setUsData(data);
              return;
            }
          }
        } catch {
          // Fall through to error state
        }
        setError('Procedure not found in US database');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${OWNNOTHING_API}?code=${cptCode}`);
        if (!res.ok) throw new Error('API request failed');

        const data = await res.json();
        if (data.success) {
          setUsData(data);
        } else {
          setError(data.error || 'Failed to load US prices');
        }
      } catch (e) {
        setError('Could not connect to price database');
      } finally {
        setLoading(false);
      }
    }

    fetchUSPrices();
  }, [procedureName]);

  // Calculate savings
  const calculateSavings = () => {
    if (!usData?.us_prices?.cash_price?.average) return null;

    const usAvg = usData.us_prices.cash_price.average;
    const savings = usAvg - oasaraPrice;
    const percent = Math.round((savings / usAvg) * 100);

    return { savings, percent, usAvg };
  };

  const savingsData = calculateSavings();

  if (loading) {
    return (
      <div className={`bg-ocean-50 border border-ocean-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-ocean-200 rounded" />
          <div className="flex-1">
            <div className="h-4 bg-ocean-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-ocean-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !usData || !savingsData) {
    return null; // Don't show anything if we can't get US prices
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-ocean-50 to-sage-50 border-2 border-ocean-200 rounded-lg overflow-hidden ${className}`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-ocean-50/50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ocean-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-ocean-700 uppercase tracking-wide">
                US Price Comparison
              </h4>
              <p className="text-xs text-sage-500">
                vs. {usData.us_prices.hospital_count} compliant US hospitals
              </p>
            </div>
          </div>

          {/* Savings Badge */}
          <div className="text-right">
            <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold-500 text-white rounded-lg">
              <span className="font-display text-lg font-black">
                {savingsData.percent}%
              </span>
              <span className="text-xs font-semibold">SAVINGS</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-3 flex items-center gap-4 text-sm">
          <div>
            <span className="text-sage-500">US Avg:</span>{' '}
            <span className="text-red-600 font-bold line-through">
              ${savingsData.usAvg.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-sage-500">{facilityCountry}:</span>{' '}
            <span className="text-ocean-600 font-bold">
              ${oasaraPrice.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-sage-500">You Save:</span>{' '}
            <span className="text-gold-600 font-bold">
              ${savingsData.savings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Expand indicator */}
        <div className="mt-2 flex items-center justify-center">
          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            className="w-5 h-5 text-ocean-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-ocean-200"
          >
            <div className="p-4 space-y-4">
              {/* US Price Range */}
              <div className="bg-white rounded-lg p-4 border border-sage-200">
                <h5 className="text-xs font-bold text-ocean-600 uppercase tracking-wide mb-3">
                  US Hospital Prices ({usData.procedure.name})
                </h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-sage-500 mb-1">Lowest</p>
                    <p className="font-display text-lg font-bold text-sage-700">
                      ${usData.us_prices.cash_price.min?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center border-x border-sage-200">
                    <p className="text-xs text-sage-500 mb-1">Average</p>
                    <p className="font-display text-lg font-bold text-red-600">
                      ${usData.us_prices.cash_price.average?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-sage-500 mb-1">Highest</p>
                    <p className="font-display text-lg font-bold text-sage-700">
                      ${usData.us_prices.cash_price.max?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      {usData.us_prices.transparent_hospitals_percent}% of US hospitals publish prices
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {usData.disclaimer}
                    </p>
                  </div>
                </div>
              </div>

              {/* Source Attribution */}
              <div className="flex items-center justify-between text-xs text-sage-400">
                <a
                  href={`https://ownnothing.org/prices?procedure=${usData.procedure.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-ocean-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View full US price data on OwnNothing.org
                </a>
                <span>CPT: {usData.procedure.code}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
