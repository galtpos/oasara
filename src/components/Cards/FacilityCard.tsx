import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Facility } from '../../lib/supabase';
import RequestZanoButton from '../Outreach/RequestZanoButton';

interface FacilityCardProps {
  facility: Facility;
  onClick?: () => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onClick }) => {
  const [showEnrichedData, setShowEnrichedData] = useState(false);

  const hasEnrichedData =
    (facility.doctors?.length || 0) > 0 ||
    (facility.procedure_pricing?.length || 0) > 0 ||
    (facility.testimonials?.length || 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="glass-morphism-hover rounded-2xl p-8 cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <h3 className="font-serif text-2xl text-deep-teal font-semibold mb-2">
            {facility.name}
          </h3>
          <p className="text-sm text-warm-clay font-medium">
            {facility.city}, {facility.country}
          </p>
        </div>

        {/* Rating - Text only */}
        <div className="px-4 py-2 rounded-full bg-champagne-gold/15 border border-champagne-gold/20">
          <span className="text-champagne-gold font-bold text-sm">
            {facility.google_rating}
          </span>
          <span className="text-deep-teal/50 text-sm ml-1">
            ({facility.review_count})
          </span>
        </div>
      </div>

      {/* Zano Badge - Text only */}
      {facility.accepts_zano && (
        <div className="inline-flex px-4 py-2 rounded-full bg-champagne-gold text-white mb-5">
          <span className="text-sm font-semibold">Zano Payment Ready</span>
        </div>
      )}

      {/* Specialties */}
      <div className="mb-5">
        <h4 className="text-sm text-champagne-gold uppercase tracking-wide mb-3 font-semibold">
          Specialties
        </h4>
        <div className="flex flex-wrap gap-2">
          {facility.specialties.slice(0, 4).map((specialty, index) => (
            <span
              key={index}
              className="px-4 py-2 rounded-full bg-deep-teal/10 text-deep-teal text-sm font-medium border border-deep-teal/20"
            >
              {specialty}
            </span>
          ))}
          {facility.specialties.length > 4 && (
            <span className="px-4 py-2 rounded-full bg-warm-clay/10 text-warm-clay text-sm font-medium">
              +{facility.specialties.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Popular Procedures */}
      {facility.popular_procedures && facility.popular_procedures.length > 0 && (
        <div className="mb-5 pb-5 border-b border-warm-clay/10">
          <h4 className="text-sm text-champagne-gold uppercase tracking-wide mb-3 font-semibold">
            Popular Procedures
          </h4>
          <div className="space-y-3">
            {facility.popular_procedures.slice(0, 2).map((procedure, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-deep-teal font-semibold">{procedure.name}</p>
                  <p className="text-sm text-warm-clay/70">{procedure.wait_time}</p>
                </div>
                <div className="text-right">
                  <p className="text-base text-ignition-amber font-bold">
                    {procedure.price_range}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enriched Data Badges */}
      {hasEnrichedData && (
        <div className="mb-5 pb-5 border-b border-warm-clay/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {facility.doctors && facility.doctors.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-champagne-gold/10 text-champagne-gold text-sm font-medium border border-champagne-gold/20">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  {facility.doctors.length} Doctors
                </div>
              )}
              {facility.procedure_pricing && facility.procedure_pricing.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ignition-amber/10 text-ignition-amber text-sm font-medium border border-ignition-amber/20">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                  {facility.procedure_pricing.length} Prices
                </div>
              )}
              {facility.testimonials && facility.testimonials.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-deep-teal/10 text-deep-teal text-sm font-medium border border-deep-teal/20">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-warm-clay/10 hover:bg-warm-clay/20 text-warm-clay text-sm font-medium transition-colors border border-warm-clay/20"
            >
              {showEnrichedData ? 'Hide' : 'View'}
              <svg
                className={`w-3 h-3 transition-transform ${showEnrichedData ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Expandable Enriched Data Details */}
          <AnimatePresence>
            {showEnrichedData && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4">
                  {/* Doctors List */}
                  {facility.doctors && facility.doctors.length > 0 && (
                    <div>
                      <h5 className="text-sm text-champagne-gold uppercase tracking-wide mb-3 flex items-center gap-1 font-semibold">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                        Medical Staff
                      </h5>
                      <div className="space-y-2">
                        {facility.doctors.slice(0, 5).map((doctor) => (
                          <div key={doctor.id} className="bg-desert-sand/20 rounded-lg p-3 border border-warm-clay/10">
                            <p className="text-sm text-deep-teal font-semibold">{doctor.name}</p>
                            {doctor.specialty && (
                              <p className="text-sm text-warm-clay">{doctor.specialty}</p>
                            )}
                            {doctor.qualifications && (
                              <p className="text-sm text-deep-teal/60 mt-1">{doctor.qualifications}</p>
                            )}
                          </div>
                        ))}
                        {facility.doctors.length > 5 && (
                          <p className="text-sm text-warm-clay italic">
                            +{facility.doctors.length - 5} more doctors
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pricing List */}
                  {facility.procedure_pricing && facility.procedure_pricing.length > 0 && (
                    <div>
                      <h5 className="text-sm text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                        </svg>
                        Procedure Pricing
                      </h5>
                      <div className="space-y-2">
                        {facility.procedure_pricing.slice(0, 5).map((pricing) => (
                          <div key={pricing.id} className="flex justify-between items-start bg-cream/5 rounded-lg p-2">
                            <div className="flex-1">
                              <p className="text-sm text-cream font-medium">{pricing.procedure_name}</p>
                              {pricing.description && (
                                <p className="text-sm text-cream/60 mt-1">{pricing.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              {pricing.price ? (
                                <p className="text-sm text-green-400 font-semibold">
                                  {pricing.currency || '$'}{pricing.price.toLocaleString()}
                                </p>
                              ) : pricing.price_min && pricing.price_max ? (
                                <p className="text-sm text-green-400 font-semibold">
                                  {pricing.currency || '$'}{pricing.price_min.toLocaleString()} - {pricing.price_max.toLocaleString()}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                        {facility.procedure_pricing.length > 5 && (
                          <p className="text-sm text-cream/60 italic">
                            +{facility.procedure_pricing.length - 5} more procedures
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Testimonials List */}
                  {facility.testimonials && facility.testimonials.length > 0 && (
                    <div>
                      <h5 className="text-sm text-ignition-amber uppercase tracking-wide mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                        </svg>
                        Seeker Reviews
                      </h5>
                      <div className="space-y-2">
                        {facility.testimonials.slice(0, 3).map((testimonial) => (
                          <div key={testimonial.id} className="bg-cream/5 rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              {testimonial.patient_name && (
                                <p className="text-sm text-cream font-medium">{testimonial.patient_name}</p>
                              )}
                              {testimonial.rating && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-3 h-3 text-ignition-amber" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                  <span className="text-sm text-ignition-amber">{testimonial.rating}</span>
                                </div>
                              )}
                            </div>
                            {testimonial.procedure && (
                              <p className="text-sm text-cream/60 mb-1">Procedure: {testimonial.procedure}</p>
                            )}
                            {testimonial.review_text && (
                              <p className="text-sm text-cream/70">{testimonial.review_text}</p>
                            )}
                          </div>
                        ))}
                        {facility.testimonials.length > 3 && (
                          <p className="text-sm text-cream/60 italic">
                            +{facility.testimonials.length - 3} more reviews
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Contact Information - Text only buttons */}
      {(facility.website || facility.phone) && (
        <div className="mb-5 pb-5 border-b border-warm-clay/10">
          <div className="flex items-center justify-between gap-4">
            {facility.website && (
              <a
                href={facility.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center px-6 py-3 rounded-xl bg-ignition-amber hover:bg-warm-clay text-white transition-all text-base font-semibold"
                onClick={(e) => e.stopPropagation()}
              >
                Visit Website
              </a>
            )}

            {facility.phone && (
              <a
                href={`tel:${facility.phone}`}
                className="flex-1 flex items-center justify-center px-6 py-3 rounded-xl bg-white hover:bg-cream text-deep-teal transition-all text-base font-semibold border-2 border-desert-sand"
                onClick={(e) => e.stopPropagation()}
              >
                Call Facility
              </a>
            )}
          </div>
        </div>
      )}

      {/* Footer - Text badges only */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          {/* JCI Badge */}
          {facility.jci_accredited && (
            <div className="px-3 py-1 rounded-lg bg-champagne-gold/10 border border-champagne-gold/20">
              <span className="text-champagne-gold font-semibold">JCI Certified</span>
            </div>
          )}

          {/* Distance */}
          {facility.airport_distance && (
            <div className="px-3 py-1 rounded-lg bg-desert-sand/30">
              <span className="text-warm-clay font-medium">{facility.airport_distance}</span>
            </div>
          )}
        </div>

        {/* Request Zano Button */}
        {!facility.accepts_zano && (
          <RequestZanoButton facility={facility} />
        )}
      </div>
    </motion.div>
  );
};

export default FacilityCard;
