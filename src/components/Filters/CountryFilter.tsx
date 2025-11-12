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
        className="bg-white border-2 border-desert-sand hover:border-warm-clay px-6 py-3 rounded-lg flex items-center gap-2 text-base font-semibold text-deep-teal transition-all"
      >
        <span>
          Country {selectedCountries.length > 0 && `(${selectedCountries.length})`}
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
              <h3 className="font-serif text-deep-teal text-lg">Select Countries</h3>
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
                      w-full px-4 py-3 rounded-lg text-left text-base transition-all font-medium
                      ${isSelected
                        ? 'bg-champagne-gold text-white'
                        : 'bg-cream text-deep-teal hover:bg-desert-sand border border-desert-sand'
                      }
                    `}
                  >
                    {country}
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
