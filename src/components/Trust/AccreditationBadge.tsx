import React, { useState } from 'react';

interface AccreditationBadgeProps {
  type: 'jci' | 'iso9001' | 'national';
  name?: string; // For national accreditations
}

const badgeInfo = {
  jci: {
    icon: '/badges/jci-accredited.svg',
    label: 'JCI Accredited',
    title: 'JCI Accredited',
    description: 'Joint Commission International: Gold standard for patient safety and quality care. Recognized globally as the highest level of healthcare accreditation.',
    learnMoreUrl: 'https://www.jointcommissioninternational.org/about-jci/jci-accredited-organizations/',
  },
  iso9001: {
    icon: '/badges/iso-9001.svg',
    label: 'ISO 9001',
    title: 'ISO 9001 Certified',
    description: 'International quality management standard ensuring consistent, high-quality service delivery and continuous improvement.',
    learnMoreUrl: 'https://www.iso.org/iso-9001-quality-management.html',
  },
  national: {
    icon: '/badges/national-accreditation.svg',
    label: 'Accredited',
    title: 'National Accreditation',
    description: 'Certified by national healthcare accreditation body, meeting country-specific quality and safety standards.',
    learnMoreUrl: null,
  },
};

export default function AccreditationBadge({ type, name }: AccreditationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const info = badgeInfo[type];
  const displayLabel = name || info.label;

  return (
    <div className="relative inline-block">
      {/* Badge */}
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="px-2.5 py-1 rounded bg-gold-100 border-2 border-gold-300 hover:border-gold-400 transition-colors flex items-center gap-1.5"
        aria-label={`${displayLabel} - Click for more information`}
      >
        {/* Icon */}
        <svg className="w-4 h-4 text-gold-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-gold-700 font-bold text-xs">{displayLabel}</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 left-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-xl border-2 border-ocean-200 p-4 pointer-events-none">
          {/* Arrow */}
          <div className="absolute left-4 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" style={{ marginTop: '-2px' }} />
          <div className="absolute left-4 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-ocean-200" />

          {/* Content */}
          <div className="flex items-start gap-3 mb-3">
            <svg className="w-6 h-6 text-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-display font-bold text-ocean-700 text-sm mb-1">
                {info.title}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {info.description}
              </p>
            </div>
          </div>

          {info.learnMoreUrl && (
            <a
              href={info.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-ocean-600 hover:text-ocean-700 font-semibold"
            >
              Learn more
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
