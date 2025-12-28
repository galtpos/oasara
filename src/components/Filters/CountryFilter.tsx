import React, { useState } from 'react';

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
        className="bg-white border-2 border-sage-200 hover:border-ocean-400 px-6 py-3 rounded-lg flex items-center gap-2 text-base font-semibold text-ocean-600 transition-all"
      >
        <span>
          Country {selectedCountries.length > 0 && `(${selectedCountries.length})`}
        </span>
        <span className={`text-ocean-400 transition-transform inline-block ${isOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

        {isOpen && (
          <div
            className="absolute top-full mt-2 left-0 z-50 w-72 bg-white rounded-lg p-5 shadow-xl border-2 border-sage-200 transition-all duration-200 ease-in-out"
            style={{
              animation: 'fadeSlideDown 0.2s ease-in-out'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-ocean-600 text-lg">Select Countries</h3>
              {selectedCountries.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-gold-600 hover:text-gold-700 transition-colors"
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
                        ? 'bg-gold-500 text-white'
                        : 'bg-sage-50 text-ocean-600 hover:bg-sage-100 border border-sage-200'
                      }
                    `}
                  >
                    {country}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      {/* Backdrop - lower z-index to not block facility cards */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default CountryFilter;
