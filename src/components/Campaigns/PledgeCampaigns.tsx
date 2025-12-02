import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PledgeType, 
  PledgeCounts, 
  getLocalPledgeCounts, 
  incrementLocalPledge, 
  hasPledged 
} from '../../lib/supabase';

interface PledgeConfig {
  type: PledgeType;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const pledgeConfigs: PledgeConfig[] = [
  {
    type: 'medical_trust',
    title: 'Set Up a Medical Trust',
    shortTitle: 'Medical Trust',
    description: 'I pledge to explore setting up a medical trust to protect my healthcare assets and gain financial sovereignty.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    type: 'exit_insurance',
    title: 'Exit Health Insurance',
    shortTitle: 'Exit Insurance',
    description: 'I pledge to explore alternatives to traditional health insurance and take control of my healthcare spending.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    type: 'medical_tourism',
    title: 'Use Medical Tourism',
    shortTitle: 'Medical Tourism',
    description: 'I pledge to consider medical tourism for my next procedure and explore world-class care at fair prices.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600'
  }
];

interface PledgeModalProps {
  config: PledgeConfig;
  count: number;
  onClose: () => void;
  onPledge: () => void;
  hasPledged: boolean;
}

const PledgeModal: React.FC<PledgeModalProps> = ({ config, count, onClose, onPledge, hasPledged: alreadyPledged }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                {config.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{config.title}</h3>
                <p className="text-white/80 text-sm">{count.toLocaleString()} have pledged</p>
              </div>
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
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed mb-6">
            {config.description}
          </p>

          {alreadyPledged ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-800 font-semibold">You've Already Pledged!</p>
              <p className="text-emerald-600 text-sm mt-1">Thank you for joining the movement.</p>
            </div>
          ) : (
            <>
              <button
                onClick={onPledge}
                className={`w-full bg-gradient-to-r ${config.gradient} text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                I Pledge to {config.title}
              </button>
              <p className="text-center text-gray-400 text-xs mt-4">
                No email required. Your pledge is anonymous.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface PledgeCampaignsProps {
  variant?: 'compact' | 'full';
}

const PledgeCampaigns: React.FC<PledgeCampaignsProps> = ({ variant = 'compact' }) => {
  const [counts, setCounts] = useState<PledgeCounts>({
    medical_trust: 247,
    exit_insurance: 189,
    medical_tourism: 412
  });
  const [pledgedStates, setPledgedStates] = useState<Record<PledgeType, boolean>>({
    medical_trust: false,
    exit_insurance: false,
    medical_tourism: false
  });
  const [activeModal, setActiveModal] = useState<PledgeType | null>(null);
  const [justPledged, setJustPledged] = useState<PledgeType | null>(null);

  useEffect(() => {
    // Load counts and pledge states from local storage
    const localCounts = getLocalPledgeCounts();
    setCounts(localCounts);

    // Check what user has pledged
    const states: Record<PledgeType, boolean> = {
      medical_trust: hasPledged('medical_trust'),
      exit_insurance: hasPledged('exit_insurance'),
      medical_tourism: hasPledged('medical_tourism')
    };
    setPledgedStates(states);
  }, []);

  const handlePledge = (type: PledgeType) => {
    if (pledgedStates[type]) return;

    incrementLocalPledge(type);
    
    // Update local state
    setCounts(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    setPledgedStates(prev => ({
      ...prev,
      [type]: true
    }));
    
    setJustPledged(type);
    setTimeout(() => {
      setJustPledged(null);
      setActiveModal(null);
    }, 1500);
  };

  const activeConfig = activeModal ? pledgeConfigs.find(p => p.type === activeModal) : null;

  if (variant === 'compact') {
    return (
      <>
        <div className="flex items-center gap-2">
          {pledgeConfigs.map((config) => (
            <button
              key={config.type}
              onClick={() => setActiveModal(config.type)}
              className={`
                group relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                ${pledgedStates[config.type]
                  ? 'bg-white/20 ring-2 ring-gold-400/50'
                  : 'bg-white/10 hover:bg-white/20'
                }
              `}
            >
              <div className={`
                text-white/90
                ${justPledged === config.type ? 'animate-bounce' : ''}
              `}>
                {config.icon}
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-lg leading-none">
                  {counts[config.type].toLocaleString()}
                </div>
                <div className="text-white/60 text-[10px] leading-tight whitespace-nowrap">
                  {config.shortTitle}
                </div>
              </div>
              {pledgedStates[config.type] && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-400 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-ocean-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {activeModal && activeConfig && (
            <PledgeModal
              config={activeConfig}
              count={counts[activeModal]}
              onClose={() => setActiveModal(null)}
              onPledge={() => handlePledge(activeModal)}
              hasPledged={pledgedStates[activeModal]}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Full variant (for dedicated page)
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {pledgeConfigs.map((config) => (
        <motion.button
          key={config.type}
          onClick={() => setActiveModal(config.type)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative bg-white rounded-2xl shadow-lg border-2 p-6 text-left transition-all
            ${pledgedStates[config.type]
              ? 'border-emerald-300 bg-emerald-50/50'
              : 'border-gray-100 hover:border-gray-200 hover:shadow-xl'
            }
          `}
        >
          {pledgedStates[config.type] && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${config.gradient} flex items-center justify-center text-white mb-4`}>
            {config.icon}
          </div>
          
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {counts[config.type].toLocaleString()}
          </h3>
          <p className="text-gray-500 text-sm mb-2">{config.shortTitle} Pledges</p>
          <p className="text-gray-600 text-sm line-clamp-2">{config.description}</p>
          
          {!pledgedStates[config.type] && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className={`text-sm font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                Click to Pledge →
              </span>
            </div>
          )}
        </motion.button>
      ))}

      <AnimatePresence>
        {activeModal && activeConfig && (
          <PledgeModal
            config={activeConfig}
            count={counts[activeModal]}
            onClose={() => setActiveModal(null)}
            onPledge={() => handlePledge(activeModal)}
            hasPledged={pledgedStates[activeModal]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PledgeCampaigns;

