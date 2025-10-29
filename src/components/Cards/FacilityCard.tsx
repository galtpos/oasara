import React from 'react';
import { motion } from 'framer-motion';
import { Facility } from '../../lib/supabase';
import RequestZanoButton from '../Outreach/RequestZanoButton';

interface FacilityCardProps {
  facility: Facility;
  onClick?: () => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="glass-morphism-hover rounded-xl p-6 cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-serif text-xl text-cream font-semibold mb-1">
            {facility.name}
          </h3>
          <p className="text-sm text-cream/70">
            {facility.city}, {facility.country}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-champagne-gold/20">
          <svg className="w-4 h-4 text-champagne-gold" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span className="text-champagne-gold font-semibold text-sm">
            {facility.google_rating}
          </span>
          <span className="text-cream/60 text-xs">
            ({facility.review_count})
          </span>
        </div>
      </div>

      {/* Zano Badge */}
      {facility.accepts_zano && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ignition-amber/20 mb-4">
          <svg className="w-4 h-4 text-ignition-amber" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
          </svg>
          <span className="text-ignition-amber text-sm font-medium">Zano Payment Ready</span>
        </div>
      )}

      {/* Specialties */}
      <div className="mb-4">
        <h4 className="text-xs text-champagne-gold uppercase tracking-wide mb-2">
          Specialties
        </h4>
        <div className="flex flex-wrap gap-2">
          {facility.specialties.slice(0, 4).map((specialty, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-deep-teal/30 text-cream text-xs border border-deep-teal/50"
            >
              {specialty}
            </span>
          ))}
          {facility.specialties.length > 4 && (
            <span className="px-3 py-1 rounded-full bg-warm-clay/30 text-cream text-xs">
              +{facility.specialties.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Popular Procedures */}
      {facility.popular_procedures && facility.popular_procedures.length > 0 && (
        <div className="mb-4 pb-4 border-b border-cream/10">
          <h4 className="text-xs text-champagne-gold uppercase tracking-wide mb-2">
            Popular Procedures
          </h4>
          <div className="space-y-2">
            {facility.popular_procedures.slice(0, 2).map((procedure, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-cream font-medium">{procedure.name}</p>
                  <p className="text-xs text-cream/60">{procedure.wait_time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-warm-clay font-semibold">
                    {procedure.price_range}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Information */}
      {(facility.website || facility.phone) && (
        <div className="mb-4 pb-4 border-b border-cream/10">
          <div className="flex items-center justify-between gap-3">
            {facility.website && (
              <a
                href={facility.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ignition-amber/20 hover:bg-ignition-amber/30 text-ignition-amber transition-colors text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Website
              </a>
            )}

            {facility.phone && (
              <a
                href={`tel:${facility.phone}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-champagne-gold/20 hover:bg-champagne-gold/30 text-champagne-gold transition-colors text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-cream/60">
          {/* JCI Badge */}
          {facility.jci_accredited && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-champagne-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>JCI Certified</span>
            </div>
          )}

          {/* Distance */}
          {facility.airport_distance && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>{facility.airport_distance}</span>
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
