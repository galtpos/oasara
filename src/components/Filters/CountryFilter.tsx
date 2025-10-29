import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountryFilterProps {
  countries: string[];
  selectedCountries: string[];
  onCountryToggle: (country: string) => void;
  onClearAll: () => void;
}

const CountryFilter: React.FC<CountryFilterProps> = ({
  countries,
  selectedCountries,
  onCountryToggle,
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
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-cream">
          Country {selectedCountries.length > 0 && `(${selectedCountries.length})`}
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
              <h3 className="font-serif text-champagne-gold">Select Countries</h3>
              {selectedCountries.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-ignition-amber hover:text-champagne-gold transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Country List */}
            <div className="max-h-80 overflow-y-auto space-y-2">
              {countries.map((country) => {
                const isSelected = selectedCountries.includes(country);
                return (
                  <button
                    key={country}
                    onClick={() => onCountryToggle(country)}
                    className={`
                      w-full px-3 py-2 rounded-lg text-left text-sm transition-all
                      ${isSelected
                        ? 'bg-ignition-amber/20 border border-ignition-amber/50 text-cream'
                        : 'bg-dark-base/50 border border-cream/10 text-cream/70 hover:bg-dark-base/70'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{country}</span>
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

export default CountryFilter;
