import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import ContactFacilityModal from './ContactFacilityModal';

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
  procedureType: string;
  shortlistedFacilities: ShortlistedFacility[];
  isLoading: boolean;
  onOpenChatbot?: () => void;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  journeyId,
  procedureType,
  shortlistedFacilities,
  isLoading,
  onOpenChatbot
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [editingRatingId, setEditingRatingId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const handleSaveNote = async (journeyFacilityId: string) => {
    setSavingNoteId(journeyFacilityId);
    try {
      const { error } = await supabase
        .from('journey_facilities')
        .update({ notes: noteContent.trim() })
        .eq('id', journeyFacilityId);

      if (error) throw error;

      setEditingNoteId(null);
      setNoteContent('');
      window.location.reload();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleSaveRating = async (journeyFacilityId: string) => {
    try {
      const { error } = await supabase
        .from('journey_facilities')
        .update({ rating: ratingValue })
        .eq('id', journeyFacilityId);

      if (error) throw error;

      setEditingRatingId(null);
      setRatingValue(0);
      window.location.reload();
    } catch (error) {
      console.error('Error saving rating:', error);
      alert('Failed to save rating');
    }
  };

  const handleContactFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setContactModalOpen(true);
  };

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
          Your comparison list is empty
        </h3>
        <p className="text-ocean-600 mb-4">
          To compare facilities, you need to add them to your shortlist first.
        </p>
        <div className="bg-sage-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
          <p className="text-sm text-ocean-700 font-medium mb-2">How to add facilities:</p>
          <ul className="text-sm text-ocean-600 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-ocean-500">1.</span>
              <span>Scroll down to see <strong>Recommended Facilities</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ocean-500">2.</span>
              <span>Click the <strong>"Add"</strong> button on facilities you want to compare</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ocean-500">3.</span>
              <span>Or chat with our AI to search and add facilities</span>
            </li>
          </ul>
        </div>
        <button
          onClick={onOpenChatbot}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Chat to Find Facilities
        </button>
      </div>
    );
  }

  if (shortlistedFacilities.length === 1) {
    const facility = shortlistedFacilities[0].facilities;
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ocean-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-display text-ocean-800 mb-2">
          You're off to a great start!
        </h3>
        <p className="text-ocean-600 mb-4">
          <strong>{facility.name}</strong> is on your list. Comparing a few more options will give you confidence you're making the right choice for your health.
        </p>
        <button
          onClick={onOpenChatbot}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Let's Find More Options
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
                {editingRatingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          onClick={() => setRatingValue(i + 1)}
                          className={`w-6 h-6 cursor-pointer hover:scale-110 transition-transform ${
                            i < ratingValue ? 'text-red-400' : 'text-sage-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSaveRating(item.id)}
                      className="px-2 py-1 bg-ocean-600 text-white rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingRatingId(null);
                        setRatingValue(0);
                      }}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setEditingRatingId(item.id);
                      setRatingValue(item.rating || 0);
                    }}
                    className="cursor-pointer hover:opacity-75 transition-opacity"
                  >
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
                      <span className="text-sage-500 text-sm hover:text-ocean-600">How do you feel about this one?</span>
                    )}
                  </div>
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
                {editingNoteId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Your thoughts, questions, or concerns about this facility..."
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-ocean-300 rounded-lg focus:border-ocean-600 focus:outline-none text-sm resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveNote(item.id)}
                        disabled={savingNoteId === item.id}
                        className="px-3 py-1.5 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 text-xs font-medium disabled:opacity-50"
                      >
                        {savingNoteId === item.id ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setNoteContent('');
                        }}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setEditingNoteId(item.id);
                      setNoteContent(item.notes || '');
                    }}
                    className="cursor-pointer hover:bg-ocean-50 rounded p-2 transition-colors"
                  >
                    {item.notes ? (
                      <div className="text-sm text-ocean-800 max-w-xs whitespace-pre-wrap">
                        {item.notes}
                      </div>
                    ) : (
                      <span className="text-sage-500 text-sm italic">Jot down your thoughts here</span>
                    )}
                  </div>
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
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/facilities/${item.facilities.id}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm font-medium"
                  >
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleContactFacility(item.facilities)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-sage-600 to-sage-700 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Request Quote
                  </button>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </motion.table>

      {/* Contact Facility Modal */}
      {selectedFacility && (
        <ContactFacilityModal
          isOpen={contactModalOpen}
          onClose={() => {
            setContactModalOpen(false);
            setSelectedFacility(null);
          }}
          facility={selectedFacility}
          journeyId={journeyId}
          procedureType={procedureType}
        />
      )}
    </div>
  );
};

export default ComparisonTable;
