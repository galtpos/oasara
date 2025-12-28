import React, { useState, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { Facility } from '../../lib/supabase';
import RequestZanoButton from '../Outreach/RequestZanoButton';
import ContactOptionsMenu from '../Contact/ContactOptionsMenu';
import ContactFacilityModal from '../Contact/ContactFacilityModal';
import USPriceWidget from '../Pricing/USPriceWidget';

interface FacilityCardProps {
  facility: Facility;
  onClick?: () => void;
}

const FacilityCard: React.FC<FacilityCardProps> = memo(({ facility, onClick }) => {
  const [showEnrichedData, setShowEnrichedData] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Memoize sliced arrays to prevent recreation on every render
  const displaySpecialties = useMemo(() => facility.specialties.slice(0, 4), [facility.specialties]);
  const displayProcedures = useMemo(() => facility.popular_procedures?.slice(0, 2) || [], [facility.popular_procedures]);
  const displayDoctors = useMemo(() => facility.doctors?.slice(0, 5) || [], [facility.doctors]);
  const displayPricing = useMemo(() => facility.procedure_pricing?.slice(0, 5) || [], [facility.procedure_pricing]);
  const displayTestimonials = useMemo(() => facility.testimonials?.slice(0, 3) || [], [facility.testimonials]);
  const contactProcedures = useMemo(() => [
    ...facility.specialties,
    ...(facility.popular_procedures?.map(p => p.name) || [])
  ], [facility.specialties, facility.popular_procedures]);

  const hasEnrichedData =
    (facility.doctors?.length || 0) > 0 ||
    (facility.procedure_pricing?.length || 0) > 0 ||
    (facility.testimonials?.length || 0) > 0;

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-display text-xl text-sage-800 font-bold mb-1">
            {facility.name}
          </h3>
          <p className="text-sm text-sage-500 font-medium">
            {facility.city}, {facility.country}
          </p>
        </div>

        {/* Rating */}
        <div className="px-3 py-1.5 rounded bg-gold-100 border border-gold-200">
          <span className="text-gold-700 font-bold text-sm">
            {facility.google_rating}
          </span>
          <span className="text-sage-400 text-sm ml-1">
            ({facility.review_count})
          </span>
        </div>
      </div>

      {/* Zano Badge */}
      {facility.accepts_zano && (
        <div className="inline-flex px-3 py-1.5 rounded bg-ocean-600 text-white mb-4">
          <span className="text-sm font-semibold">Zano Payment Ready</span>
        </div>
      )}

      {/* Specialties */}
      <div className="mb-4">
        <h4 className="text-xs text-ocean-600 uppercase tracking-wider mb-2 font-bold">
          Specialties
        </h4>
        <div className="flex flex-wrap gap-2">
          {displaySpecialties.map((specialty, index) => (
            <span
              key={index}
              className="px-3 py-1.5 rounded bg-sage-100 text-sage-700 text-sm font-medium border border-sage-200"
            >
              {specialty}
            </span>
          ))}
          {facility.specialties.length > 4 && (
            <span className="px-3 py-1.5 rounded bg-ocean-50 text-ocean-600 text-sm font-medium">
              +{facility.specialties.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Popular Procedures */}
      {facility.popular_procedures && facility.popular_procedures.length > 0 && (
        <div className="mb-4 pb-4 border-b border-sage-200">
          <h4 className="text-xs text-ocean-600 uppercase tracking-wider mb-2 font-bold">
            Popular Procedures
          </h4>
          <div className="space-y-2">
            {displayProcedures.map((procedure, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-sage-700 font-semibold">{procedure.name}</p>
                  <p className="text-xs text-sage-400">{procedure.wait_time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gold-600 font-bold">
                    {procedure.price_range}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* US Price Comparison Widget */}
          <USPriceWidget
            procedures={facility.popular_procedures}
            className="mt-3"
            compact={true}
          />
        </div>
      )}

      {/* Enriched Data Badges */}
      {hasEnrichedData && (
        <div className="mb-4 pb-4 border-b border-sage-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {facility.doctors && facility.doctors.length > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-ocean-50 text-ocean-600 text-xs font-semibold border border-ocean-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  {facility.doctors.length} Doctors
                </div>
              )}
              {facility.procedure_pricing && facility.procedure_pricing.length > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-gold-50 text-gold-700 text-xs font-semibold border border-gold-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                  {facility.procedure_pricing.length} Prices
                </div>
              )}
              {facility.testimonials && facility.testimonials.length > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-sage-100 text-sage-600 text-xs font-semibold border border-sage-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                  </svg>
                  {facility.testimonials.length} Reviews
                </div>
              )}
            </div>

            {/* Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEnrichedData(!showEnrichedData);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-ocean-100 hover:bg-ocean-200 text-ocean-700 text-xs font-semibold transition-colors border border-ocean-200"
            >
              {showEnrichedData ? 'Hide' : 'View'}
              <svg
                className={`w-3 h-3 transition-transform ${showEnrichedData ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Expandable Enriched Data Details */}
            {showEnrichedData && (
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  animation: 'slideDown 0.3s ease-in-out'
                }}
              >
                <div className="mt-4 space-y-4">
                  {/* Doctors List */}
                  {facility.doctors && facility.doctors.length > 0 && (
                    <div>
                      <h5 className="text-xs text-ocean-600 uppercase tracking-wider mb-2 flex items-center gap-1 font-bold">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                        Medical Staff
                      </h5>
                      <div className="space-y-2">
                        {displayDoctors.map((doctor) => (
                          <div key={doctor.id} className="bg-sage-50 rounded p-3 border border-sage-200">
                            <p className="text-sm text-sage-800 font-semibold">{doctor.name}</p>
                            {doctor.specialty && (
                              <p className="text-sm text-ocean-600">{doctor.specialty}</p>
                            )}
                            {doctor.qualifications && (
                              <p className="text-xs text-sage-500 mt-1">{doctor.qualifications}</p>
                            )}
                          </div>
                        ))}
                        {facility.doctors.length > 5 && (
                          <p className="text-xs text-sage-400 italic">
                            +{facility.doctors.length - 5} more doctors
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pricing List */}
                  {facility.procedure_pricing && facility.procedure_pricing.length > 0 && (
                    <div>
                      <h5 className="text-xs text-gold-700 uppercase tracking-wider mb-2 flex items-center gap-1 font-bold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                        </svg>
                        Procedure Pricing
                      </h5>
                      <div className="space-y-2">
                        {displayPricing.map((pricing) => (
                          <div key={pricing.id} className="flex justify-between items-start bg-gold-50 rounded p-2 border border-gold-200">
                            <div className="flex-1">
                              <p className="text-sm text-sage-800 font-medium">{pricing.procedure_name}</p>
                              {pricing.description && (
                                <p className="text-xs text-sage-500 mt-1">{pricing.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              {pricing.price ? (
                                <p className="text-sm text-gold-700 font-bold">
                                  {pricing.currency || '$'}{pricing.price.toLocaleString()}
                                </p>
                              ) : pricing.price_min && pricing.price_max ? (
                                <p className="text-sm text-gold-700 font-bold">
                                  {pricing.currency || '$'}{pricing.price_min.toLocaleString()} - {pricing.price_max.toLocaleString()}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                        {facility.procedure_pricing.length > 5 && (
                          <p className="text-xs text-sage-400 italic">
                            +{facility.procedure_pricing.length - 5} more procedures
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Testimonials List */}
                  {facility.testimonials && facility.testimonials.length > 0 && (
                    <div>
                      <h5 className="text-xs text-sage-600 uppercase tracking-wider mb-2 flex items-center gap-1 font-bold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                        </svg>
                        Seeker Reviews
                      </h5>
                      <div className="space-y-2">
                        {displayTestimonials.map((testimonial) => (
                          <div key={testimonial.id} className="bg-sage-50 rounded p-2 border border-sage-200">
                            <div className="flex items-center justify-between mb-1">
                              {testimonial.patient_name && (
                                <p className="text-sm text-sage-800 font-medium">{testimonial.patient_name}</p>
                              )}
                              {testimonial.rating && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-3 h-3 text-gold-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                  <span className="text-xs text-gold-600 font-semibold">{testimonial.rating}</span>
                                </div>
                              )}
                            </div>
                            {testimonial.procedure && (
                              <p className="text-xs text-sage-500 mb-1">Procedure: {testimonial.procedure}</p>
                            )}
                            {testimonial.review_text && (
                              <p className="text-xs text-sage-600">{testimonial.review_text}</p>
                            )}
                          </div>
                        ))}
                        {facility.testimonials.length > 3 && (
                          <p className="text-xs text-sage-400 italic">
                            +{facility.testimonials.length - 3} more reviews
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Contact Information */}
      {(facility.website || facility.phone) && (
        <div className="mb-4 pb-4 border-b border-sage-200">
          <div className="flex items-center justify-between gap-3">
            {facility.website && (
              <a
                href={facility.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center px-4 py-2.5 rounded bg-ocean-600 hover:bg-ocean-700 text-white transition-colors text-sm font-semibold"
                onClick={(e) => e.stopPropagation()}
              >
                Visit Website
              </a>
            )}

            {facility.phone && (
              <ContactOptionsMenu
                phone={facility.phone}
                facilityName={facility.name}
                email={facility.contact_email}
              />
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-4 flex gap-2">
        {/* Contact Facility Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowContactModal(true);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
          style={{ boxShadow: '0 3px 0 #8B6914' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact
        </button>

        {/* View Details Link */}
        <Link
          to={`/facility/${facility.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded bg-ocean-600 hover:bg-ocean-700 text-white text-sm font-semibold transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Details
        </Link>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {/* JCI Badge */}
          {facility.jci_accredited && (
            <div className="px-2.5 py-1 rounded bg-gold-100 border border-gold-200">
              <span className="text-gold-700 font-bold">JCI Certified</span>
            </div>
          )}

          {/* Distance */}
          {facility.airport_distance && (
            <div className="px-2.5 py-1 rounded bg-sage-100">
              <span className="text-sage-600 font-medium">{facility.airport_distance}</span>
            </div>
          )}
        </div>

        {/* Request Zano Button */}
        {!facility.accepts_zano && (
          <RequestZanoButton facility={facility} />
        )}
      </div>

      {/* Contact Modal - Only mount when open to avoid 500+ useAuthState hooks */}
      {showContactModal && (
        <ContactFacilityModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          facilityId={facility.id}
          facilityName={facility.name}
          facilityEmail={facility.contact_email}
          procedures={contactProcedures}
        />
      )}
    </div>
  );
});

export default FacilityCard;
