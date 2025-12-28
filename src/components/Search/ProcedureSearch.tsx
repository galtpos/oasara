import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';

interface ProcedureSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const ProcedureSearch: React.FC<ProcedureSearchProps> = ({
  onSearch,
  placeholder = "Search procedures, facilities, or destinations..."
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search to prevent excessive re-renders (300ms delay)
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      onSearch(value);
    },
    300
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full"
    >
      <div className={`
        bg-white rounded-2xl p-5 transition-all duration-300
        ${isFocused ? 'border-2 border-ocean-400 shadow-lg' : 'border-2 border-sage-200'}
      `}>
        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <svg
            className="w-6 h-6 text-ocean-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {/* Accessible label for screen readers */}
          <label htmlFor="procedure-search" className="sr-only">
            Search procedures, facilities, or destinations
          </label>
          {/* Input with auto-search as you type */}
          <input
            id="procedure-search"
            type="search"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            aria-describedby={isFocused && !query ? "search-suggestions" : undefined}
            className="flex-1 bg-transparent text-ocean-700 placeholder-ocean-400/60 focus:outline-none text-lg font-normal"
          />

          {/* Clear Button - Text only */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="px-3 py-1 text-sm text-ocean-400 hover:text-ocean-600 transition-colors font-medium"
              >
                Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Search Hint */}
        <AnimatePresence>
          {isFocused && !query && (
            <motion.div
              id="search-suggestions"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-sage-200"
            >
              <p className="text-sm text-ocean-500 mb-3 font-medium">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Hip Replacement',
                  'Heart Surgery',
                  'Dental Implants',
                  'IVF',
                  'Bangkok',
                  'India'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      onSearch(suggestion); // Immediate for suggestion clicks
                    }}
                    className="px-4 py-2 rounded-lg bg-gold-100 text-gold-700 text-sm hover:bg-gold-200 transition-colors border border-gold-200 font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProcedureSearch;
