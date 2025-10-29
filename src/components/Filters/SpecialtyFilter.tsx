import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpecialtyFilterProps {
  specialties: string[];
  selectedSpecialties: string[];
  onSpecialtyToggle: (specialty: string) => void;
  onClearAll: () => void;
}

const SpecialtyFilter: React.FC<SpecialtyFilterProps> = ({
  specialties,
  selectedSpecialties,
  onSpecialtyToggle,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-morphism-hover px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
      >
        <svg className="w-4 h-4 text-ignition-amber" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path
            fillRule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-cream">
          Specialty {selectedSpecialties.length > 0 && `(${selectedSpecialties.length})`}
        </span>
        <svg
          className={`w-4 h-4 text-cream transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 z-50 w-72 glass-morphism rounded-xl p-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-champagne-gold">Select Specialties</h3>
              {selectedSpecialties.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-ignition-amber hover:text-champagne-gold transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Specialty List */}
            <div className="max-h-80 overflow-y-auto space-y-2">
              {specialties.map((specialty) => {
                const isSelected = selectedSpecialties.includes(specialty);
                return (
                  <button
                    key={specialty}
                    onClick={() => onSpecialtyToggle(specialty)}
                    className={`
                      w-full px-3 py-2 rounded-lg text-left text-sm transition-all
                      ${isSelected
                        ? 'bg-ignition-amber/20 border border-ignition-amber/50 text-cream'
                        : 'bg-dark-base/50 border border-cream/10 text-cream/70 hover:bg-dark-base/70'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{specialty}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-ignition-amber" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SpecialtyFilter;
