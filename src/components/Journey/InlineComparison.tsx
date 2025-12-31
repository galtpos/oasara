import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTypicalSavingsRange } from '../../lib/procedureMapping';

interface Procedure {
  name: string;
  price_range: string;
  wait_time?: string;
}

interface Facility {
  id: string;
  name: string;
  city: string;
  country: string;
  jci_accredited: boolean;
  google_rating?: number;
  review_count?: number;
  popular_procedures?: Procedure[];
  accepts_zano?: boolean;
}

interface InlineComparisonProps {
  facilities: Facility[];
  procedureType?: string;
}

/**
 * Inline Comparison Component for Chat
 * Shows facilities side-by-side in a scrollable table
 */
const InlineComparison: React.FC<InlineComparisonProps> = ({
  facilities,
  procedureType
}) => {
  if (facilities.length === 0) return null;

  // Get matching procedure for each facility
  const getMatchingProcedure = (facility: Facility) => {
    return facility.popular_procedures?.find(p =>
      procedureType && p.name.toLowerCase().includes(procedureType.toLowerCase())
    ) || facility.popular_procedures?.[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-white rounded-xl border-2 border-sage-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-semibold">Your Comparison ({facilities.length} facilities)</span>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-sage-200 bg-sage-50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-ocean-700 sticky left-0 bg-sage-50 z-10 min-w-[120px]">
                Compare
              </th>
              {facilities.map(facility => (
                <th key={facility.id} className="py-3 px-4 min-w-[200px]">
                  <Link
                    to={`/facilities/${facility.id}`}
                    className="text-ocean-800 hover:text-ocean-600 font-semibold block text-left"
                  >
                    {facility.name}
                  </Link>
                  <div className="text-xs text-ocean-500 font-normal mt-1">
                    {facility.city}, {facility.country}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Accreditation */}
            <tr className="border-b border-sage-100">
              <td className="py-3 px-4 text-sm font-medium text-ocean-700 sticky left-0 bg-white z-10">
                Accreditation
              </td>
              {facilities.map(facility => (
                <td key={facility.id} className="py-3 px-4">
                  {facility.jci_accredited ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      JCI
                    </span>
                  ) : (
                    <span className="text-sage-400 text-sm">-</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="border-b border-sage-100">
              <td className="py-3 px-4 text-sm font-medium text-ocean-700 sticky left-0 bg-white z-10">
                Rating
              </td>
              {facilities.map(facility => (
                <td key={facility.id} className="py-3 px-4">
                  {facility.google_rating ? (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-ocean-800">{facility.google_rating.toFixed(1)}</span>
                      {facility.review_count && (
                        <span className="text-xs text-ocean-500">({facility.review_count})</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sage-400 text-sm">-</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Price */}
            <tr className="border-b border-sage-100">
              <td className="py-3 px-4 text-sm font-medium text-ocean-700 sticky left-0 bg-white z-10">
                Price
              </td>
              {facilities.map(facility => {
                const proc = getMatchingProcedure(facility);
                return (
                  <td key={facility.id} className="py-3 px-4">
                    {proc ? (
                      <div>
                        <div className="font-bold text-gold-600">{proc.price_range}</div>
                        <div className="text-xs text-ocean-500">{proc.name}</div>
                      </div>
                    ) : (
                      <span className="text-sage-400 text-sm">Contact for quote</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Savings */}
            <tr className="border-b border-sage-100">
              <td className="py-3 px-4 text-sm font-medium text-ocean-700 sticky left-0 bg-white z-10">
                vs US Price
              </td>
              {facilities.map(facility => {
                const proc = getMatchingProcedure(facility);
                const savings = proc ? getTypicalSavingsRange(proc.name) : null;
                return (
                  <td key={facility.id} className="py-3 px-4">
                    {savings ? (
                      <span className="font-bold text-green-600">
                        {savings.min}-{savings.max}% less
                      </span>
                    ) : (
                      <span className="text-sage-400 text-sm">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Wait Time */}
            <tr className="border-b border-sage-100">
              <td className="py-3 px-4 text-sm font-medium text-ocean-700 sticky left-0 bg-white z-10">
                Wait Time
              </td>
              {facilities.map(facility => {
                const proc = getMatchingProcedure(facility);
                return (
                  <td key={facility.id} className="py-3 px-4">
                    {proc?.wait_time ? (
                      <span className="text-ocean-700">{proc.wait_time}</span>
                    ) : (
                      <span className="text-sage-400 text-sm">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Zano */}
            <tr className="border-b border-sage-100">
              <td className="py-3 px-4 text-sm font-medium text-ocean-700 sticky left-0 bg-white z-10">
                Accepts Zano
              </td>
              {facilities.map(facility => (
                <td key={facility.id} className="py-3 px-4">
                  {facility.accepts_zano ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Yes
                    </span>
                  ) : (
                    <span className="text-sage-400 text-sm">No</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Actions */}
            <tr>
              <td className="py-3 px-4 text-sm font-medium text-ocean-700 sticky left-0 bg-white z-10">
                Actions
              </td>
              {facilities.map(facility => (
                <td key={facility.id} className="py-3 px-4">
                  <Link
                    to={`/facilities/${facility.id}`}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-sage-50 px-4 py-3 text-center">
        <Link
          to="/my-journey"
          className="text-sm text-ocean-600 hover:text-ocean-800 font-medium"
        >
          View full comparison on dashboard →
        </Link>
      </div>
    </motion.div>
  );
};

export default InlineComparison;
