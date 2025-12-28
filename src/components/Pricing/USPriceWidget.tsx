import React from 'react';
import { getTypicalSavingsRange } from '../../lib/procedureMapping';

interface USPriceWidgetProps {
  procedures: {
    name: string;
    price_range: string;
    wait_time?: string;
  }[];
  className?: string;
  compact?: boolean;
}

/**
 * Compact US Price Comparison Widget
 *
 * Shows estimated savings vs US prices for a facility's procedures.
 *
 * NOTE: API calls were disabled because they were causing 2500+ requests
 * on page load (500 cards × 5 procedures), freezing Chrome on low-RAM PCs.
 * Now shows estimated savings from typical procedure ranges instead.
 */
export default function USPriceWidget({
  procedures,
  className = '',
}: USPriceWidgetProps) {
  // Show estimated savings from typical ranges (no API calls)
  const typicalRange = getTypicalSavingsRange(procedures[0]?.name || '');

  if (!typicalRange) return null;

  return (
    <div className={`bg-gradient-to-r from-ocean-50 to-sage-50 rounded-lg border border-ocean-200 p-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-ocean-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs text-ocean-700 font-medium">
            Est. {typicalRange.min}-{typicalRange.max}% savings vs US
          </span>
        </div>
        <a
          href="/us-prices"
          className="text-xs text-ocean-500 hover:text-ocean-700 underline"
          aria-label="Compare US hospital prices"
        >
          Compare
        </a>
      </div>
    </div>
  );
}
