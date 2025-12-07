import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StateTrustLaw, 
  CriteriaKey, 
  CRITERIA_LABELS, 
  getScoreColor, 
  getScoreGradient,
  getTierLabel,
  getTierColor
} from '../../types/trustLaws';

interface StateDetailPanelProps {
  state: StateTrustLaw | null;
  onClose: () => void;
}

const CriterionIcon: React.FC<{ criterion: CriteriaKey }> = ({ criterion }) => {
  const icons: Record<CriteriaKey, React.ReactNode> = {
    assetProtection: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    selfSettledTrusts: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    statuteOfLimitations: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    domesticForeignRules: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    taxTreatment: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    spendthriftProvisions: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    privacyProtections: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    healthcareSpecific: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  };
  return <>{icons[criterion]}</>;
};

const ScoreBar: React.FC<{ score: number }> = ({ score }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score * 10}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: getScoreColor(score) }}
      />
    </div>
    <span 
      className="text-sm font-bold min-w-[2.5rem] text-right"
      style={{ color: getScoreColor(score) }}
    >
      {score.toFixed(1)}
    </span>
  </div>
);

interface CollapsibleSectionProps {
  criterion: CriteriaKey;
  data: StateTrustLaw['criteria'][CriteriaKey];
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  criterion, 
  data, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { label } = CRITERIA_LABELS[criterion];

  // Handle special data fields
  const getExtraInfo = () => {
    if ('allowed' in data) {
      return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${data.allowed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {data.allowed ? 'Allowed' : 'Not Allowed'}
        </span>
      );
    }
    if ('years' in data && data.years !== null) {
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
          {data.years} {data.years === 1 ? 'year' : 'years'}
        </span>
      );
    }
    if ('hasStateTax' in data) {
      return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${data.hasStateTax ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
          {data.hasStateTax ? `Tax: ${(data as any).incomeRate || 'Yes'}` : 'No State Tax'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="text-gray-500">
          <CriterionIcon criterion={criterion} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{label}</span>
            {getExtraInfo()}
          </div>
          <div className="mt-1">
            <ScoreBar score={data.score} />
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 pt-0 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mt-3 mb-2">
                {data.summary}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {data.details}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StateDetailPanel: React.FC<StateDetailPanelProps> = ({ state, onClose }) => {
  if (!state) return null;

  const criteriaKeys = Object.keys(state.criteria) as CriteriaKey[];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getScoreGradient(state.overallScore)} p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${getTierColor(state.tier)} text-white`}>
                  {getTierLabel(state.tier)}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{state.state}</h2>
              <p className="text-white/80 text-sm mt-1">{state.stateCode}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Overall Score */}
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-white/80 text-xs uppercase tracking-wide">Overall Score</p>
              <p className="text-3xl font-bold text-white">{state.overallScore.toFixed(1)}</p>
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs uppercase tracking-wide mb-2">Key Highlights</p>
              <div className="flex flex-wrap gap-1">
                {state.highlights.slice(0, 2).map((highlight, i) => (
                  <span key={i} className="text-xs bg-white/20 text-white px-2 py-1 rounded-lg">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Highlights */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Key Highlights
            </h3>
            <ul className="space-y-2">
              {state.highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Criteria Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Detailed Criteria Breakdown
            </h3>
            <div className="space-y-3">
              {criteriaKeys.map((criterion, index) => (
                <CollapsibleSection
                  key={criterion}
                  criterion={criterion}
                  data={state.criteria[criterion]}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Sources */}
          {state.sourceUrls.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Data Sources
              </h3>
              <ul className="space-y-2">
                {state.sourceUrls.map((url, i) => (
                  <li key={i}>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {new URL(url).hostname}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500">
            <p>Last updated: {new Date(state.lastUpdated).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="border-t border-gray-200 p-4 bg-amber-50">
          <p className="text-xs text-amber-800 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              <strong>Legal Disclaimer:</strong> This information is for educational purposes only and does not constitute legal advice. 
              Trust and estate laws are complex and subject to change. Always consult with a qualified attorney licensed in the relevant jurisdiction.
            </span>
          </p>
        </div>
      </motion.div>

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-40"
      />
    </AnimatePresence>
  );
};

export default StateDetailPanel;

