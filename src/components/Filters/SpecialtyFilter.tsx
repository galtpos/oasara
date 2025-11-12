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
        className="bg-white border-2 border-desert-sand hover:border-warm-clay px-6 py-3 rounded-lg flex items-center gap-2 text-base font-semibold text-deep-teal transition-all"
      >
        <span>
          Specialty {selectedSpecialties.length > 0 && `(${selectedSpecialties.length})`}
        </span>
        <span className={`text-warm-clay transition-transform inline-block ${isOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 z-50 w-72 bg-white rounded-xl p-5 shadow-xl border-2 border-desert-sand"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-deep-teal text-lg">Select Specialties</h3>
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
                      w-full px-4 py-3 rounded-lg text-left text-base transition-all font-medium
                      ${isSelected
                        ? 'bg-champagne-gold text-white'
                        : 'bg-cream text-deep-teal hover:bg-desert-sand border border-desert-sand'
                      }
                    `}
                  >
                    {specialty}
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
