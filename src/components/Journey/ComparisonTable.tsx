import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Facility {
  id: string;
  name: string;
  city: string;
  country: string;
  jci_accredited: boolean;
  google_rating?: number;
  popular_procedures?: Array<{
    name: string;
    price_range: string;
    wait_time: string;
  }>;
}

interface ShortlistedFacility {
  id: string;
  journey_id: string;
  facility_id: string;
  notes: string | null;
  rating: number | null;
  added_at: string;
  facilities: Facility;
}

interface ComparisonTableProps {
  journeyId: string;
  shortlistedFacilities: ShortlistedFacility[];
  isLoading: boolean;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  journeyId,
  shortlistedFacilities,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-12 bg-sage-200 rounded" />
        <div className="animate-pulse h-64 bg-sage-200 rounded" />
      </div>
    );
  }

  if (shortlistedFacilities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-display text-ocean-800 mb-2">
          No facilities to compare yet
        </h3>
        <p className="text-ocean-600 mb-6">
          Add facilities to your shortlist to see a side-by-side comparison
        </p>
        <button
          onClick={() => {
            const chatButton = document.querySelector('[data-chatbot-toggle]') as HTMLButtonElement;
            if (chatButton && !chatButton.getAttribute('data-is-open')) {
              chatButton.click();
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Ask AI for Facilities
        </button>
      </div>
    );
  }

  if (shortlistedFacilities.length === 1) {
    const facility = shortlistedFacilities[0].facilities;
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-display text-ocean-800 mb-2">
          Add more facilities to compare
        </h3>
        <p className="text-ocean-600 mb-4">
          You have <strong>{facility.name}</strong> in your shortlist. Add at least one more to see a comparison.
        </p>
        <button
          onClick={() => {
            const chatButton = document.querySelector('[data-chatbot-toggle]') as HTMLButtonElement;
            if (chatButton && !chatButton.getAttribute('data-is-open')) {
              chatButton.click();
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Ask AI to Add More
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <motion.table
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full border-collapse"
      >
        <thead>
          <tr className="border-b-2 border-sage-200">
            <th className="text-left py-4 px-4 text-sm font-semibold text-ocean-700 bg-sage-50 sticky left-0 z-10">
              Facility
            </th>
            {shortlistedFacilities.map((item) => (
              <th key={item.id} className="py-4 px-4 min-w-[250px]">
                <div className="text-left">
                  <Link
                    to={`/facilities/${item.facilities.id}`}
                    className="text-lg font-display text-ocean-800 hover:text-ocean-600 transition-colors"
                  >
                    {item.facilities.name}
                  </Link>
                  <div className="text-sm text-ocean-600 mt-1">
                    {item.facilities.city}, {item.facilities.country}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Location Row */}
          <tr className="border-b border-sage-200 hover:bg-sage-50/50">
            <td className="py-4 px-4 text-sm font-medium text-ocean-700 bg-sage-50 sticky left-0 z-10">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </div>
            </td>
            {shortlistedFacilities.map((item) => (
              <td key={item.id} className="py-4 px-4 text-ocean-800">
                {item.facilities.city}, {item.facilities.country}
              </td>
            ))}
          </tr>

          {/* Accreditation Row */}
          <tr className="border-b border-sage-200 hover:bg-sage-50/50">
            <td className="py-4 px-4 text-sm font-medium text-ocean-700 bg-sage-50 sticky left-0 z-10">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Accreditation
              </div>
            </td>
            {shortlistedFacilities.map((item) => (
              <td key={item.id} className="py-4 px-4">
                {item.facilities.jci_accredited ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    JCI Accredited
                  </span>
                ) : (
                  <span className="text-sage-500 text-sm">Not JCI</span>
                )}
              </td>
            ))}
          </tr>

          {/* Rating Row */}
          <tr className="border-b border-sage-200 hover:bg-sage-50/50">
            <td className="py-4 px-4 text-sm font-medium text-ocean-700 bg-sage-50 sticky left-0 z-10">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Rating
              </div>
            </td>
            {shortlistedFacilities.map((item) => (
              <td key={item.id} className="py-4 px-4">
                {item.facilities.google_rating ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-ocean-800">
                      {item.facilities.google_rating.toFixed(1)}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.facilities.google_rating!)
                              ? 'text-yellow-400'
                              : 'text-sage-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-sage-500 text-sm">No rating</span>
                )}
              </td>
            ))}
          </tr>

          {/* Your Rating Row */}
          <tr className="border-b border-sage-200 hover:bg-sage-50/50">
            <td className="py-4 px-4 text-sm font-medium text-ocean-700 bg-sage-50 sticky left-0 z-10">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Your Rating
              </div>
            </td>
            {shortlistedFacilities.map((item) => (
              <td key={item.id} className="py-4 px-4">
                {item.rating ? (
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < item.rating! ? 'text-red-400' : 'text-sage-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                ) : (
                  <span className="text-sage-500 text-sm">Not rated</span>
                )}
              </td>
            ))}
          </tr>

          {/* Notes Row */}
          <tr className="border-b border-sage-200 hover:bg-sage-50/50">
            <td className="py-4 px-4 text-sm font-medium text-ocean-700 bg-sage-50 sticky left-0 z-10">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Your Notes
              </div>
            </td>
            {shortlistedFacilities.map((item) => (
              <td key={item.id} className="py-4 px-4">
                {item.notes ? (
                  <div className="text-sm text-ocean-800 max-w-xs">
                    {item.notes}
                  </div>
                ) : (
                  <span className="text-sage-500 text-sm italic">No notes</span>
                )}
              </td>
            ))}
          </tr>

          {/* Actions Row */}
          <tr>
            <td className="py-4 px-4 text-sm font-medium text-ocean-700 bg-sage-50 sticky left-0 z-10">
              Actions
            </td>
            {shortlistedFacilities.map((item) => (
              <td key={item.id} className="py-4 px-4">
                <Link
                  to={`/facilities/${item.facilities.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm font-medium"
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
      </motion.table>
    </div>
  );
};

export default ComparisonTable;
