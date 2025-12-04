import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { CommentsSection } from '../components/Comments';
import { ActivityWidget } from '../components/Activity';
import ContactFacilityModal from '../components/Contact/ContactFacilityModal';

interface Facility {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  jci_accredited: boolean;
  specialties: string[];
  languages: string[];
  website?: string;
  phone?: string;
  contact_email?: string;
  google_rating?: number;
  review_count?: number;
  accepts_zano: boolean;
  description?: string;
  popular_procedures?: { name: string; price_range: string; wait_time: string }[];
}

const FacilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showContactModal, setShowContactModal] = useState(false);

  const { data: facility, isLoading, error } = useQuery({
    queryKey: ['facility', id],
    queryFn: async () => {
      if (!id) throw new Error('No facility ID');
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Facility;
    },
    enabled: !!id
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-sage-200 rounded w-1/4" />
            <div className="h-64 bg-sage-200 rounded-2xl" />
            <div className="h-48 bg-sage-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-ocean-800 mb-4">Facility not found</h2>
          <Link to="/" className="text-ocean-600 hover:text-ocean-800">
            Return to marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sage-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-ocean-600 hover:text-ocean-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Marketplace</span>
            </Link>
            <Link to="/" className="font-display text-2xl text-ocean-700">
              OASARA
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Facility Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-200 shadow-card overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-ocean-800 mb-1">{facility.name}</h1>
                    <p className="text-ocean-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {facility.city}, {facility.country}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {facility.jci_accredited && (
                      <span className="px-3 py-1 bg-gold-100 text-gold-700 text-xs font-medium rounded-full">
                        JCI Accredited
                      </span>
                    )}
                    {facility.accepts_zano && (
                      <span className="px-3 py-1 bg-ocean-100 text-ocean-700 text-xs font-medium rounded-full">
                        Accepts Zano
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {facility.google_rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(facility.google_rating!) ? 'text-gold-400' : 'text-sage-200'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-ocean-700 font-medium">{facility.google_rating}</span>
                    {facility.review_count && (
                      <span className="text-ocean-500 text-sm">({facility.review_count} reviews)</span>
                    )}
                  </div>
                )}

                {/* Specialties */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-ocean-700 mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {facility.specialties.map(specialty => (
                      <span key={specialty} className="px-3 py-1 bg-sage-100 text-sage-700 text-sm rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                {facility.languages && facility.languages.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-ocean-700 mb-2">Languages Spoken</h3>
                    <div className="flex flex-wrap gap-2">
                      {facility.languages.map(lang => (
                        <span key={lang} className="px-3 py-1 bg-ocean-50 text-ocean-600 text-sm rounded-full">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-sage-100">
                  {/* Primary Contact Button */}
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(180deg, #D4B86A 0%, #B8923A 100%)',
                      boxShadow: '0 4px 0 #8B6914, 0 6px 16px rgba(139, 105, 20, 0.3)'
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Facility
                  </button>

                  {facility.website && (
                    <a
                      href={facility.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Website
                    </a>
                  )}
                  {facility.phone && (
                    <a
                      href={`tel:${facility.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {facility.phone}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Popular Procedures */}
            {facility.popular_procedures && facility.popular_procedures.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-200 shadow-card overflow-hidden"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-gold-50 to-sage-50/30 border-b border-sage-200">
                  <h2 className="text-lg font-semibold text-ocean-800">Popular Procedures</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {facility.popular_procedures.map((proc, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-sage-100 last:border-0">
                        <span className="text-ocean-700 font-medium">{proc.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gold-600 font-semibold">{proc.price_range}</span>
                          {proc.wait_time && (
                            <span className="text-ocean-500 text-sm">{proc.wait_time}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CommentsSection facilityId={facility.id} facilityName={facility.name} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-200 shadow-card overflow-hidden"
            >
              <div className="h-48 bg-sage-200">
                <iframe
                  title="Facility Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_EMBED_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'}&q=${encodeURIComponent(facility.name + ' ' + facility.city)}`}
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.name + ' ' + facility.city + ' ' + facility.country)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-ocean-600 hover:text-ocean-800 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in Google Maps
                </a>
              </div>
            </motion.div>

            {/* Activity Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ActivityWidget />
            </motion.div>

            {/* Request Zano Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-2xl p-6 text-white"
            >
              <h3 className="text-lg font-semibold mb-2">Pay with Privacy</h3>
              <p className="text-ocean-100 text-sm mb-4">
                Request this facility to accept Zano cryptocurrency for private, secure payments.
              </p>
              <button className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium transition-colors">
                Request Zano Payment
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Contact Modal */}
      <ContactFacilityModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        facilityId={facility.id}
        facilityName={facility.name}
        facilityEmail={facility.contact_email}
        procedures={[
          ...facility.specialties,
          ...(facility.popular_procedures?.map(p => p.name) || [])
        ]}
      />
    </div>
  );
};

export default FacilityDetail;
