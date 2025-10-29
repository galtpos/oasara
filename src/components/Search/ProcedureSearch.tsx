import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
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
        glass-morphism rounded-xl p-4 transition-all duration-300
        ${isFocused ? 'border-ignition-amber/50' : 'border-ignition-amber/10'}
      `}>
        <div className="flex items-center gap-3">
          {/* Search Icon */}
          <svg
            className={`w-5 h-5 transition-colors duration-300 ${
              isFocused || query ? 'text-ignition-amber' : 'text-cream/50'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-cream placeholder-cream/50 focus:outline-none text-sm"
          />

          {/* Clear Button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-cream/10 transition-colors"
              >
                <svg className="w-4 h-4 text-cream/70" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Search Hint */}
        <AnimatePresence>
          {isFocused && !query && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-cream/10"
            >
              <p className="text-xs text-cream/60 mb-2">Try searching for:</p>
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
                      onSearch(suggestion);
                    }}
                    className="px-2 py-1 rounded-lg bg-ignition-amber/10 text-ignition-amber text-xs hover:bg-ignition-amber/20 transition-colors"
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
