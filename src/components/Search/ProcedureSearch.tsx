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
        bg-white rounded-2xl p-5 transition-all duration-300
        ${isFocused ? 'border-2 border-warm-clay shadow-lg' : 'border-2 border-desert-sand'}
      `}>
        <div className="flex items-center gap-4">
          {/* Input - No icon, just clean text */}
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-deep-teal placeholder-warm-clay/60 focus:outline-none text-lg font-normal"
          />

          {/* Clear Button - Text only */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="px-3 py-1 text-sm text-warm-clay hover:text-deep-teal transition-colors font-medium"
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-warm-clay/15"
            >
              <p className="text-sm text-warm-clay mb-3 font-medium">Try searching for:</p>
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
                    className="px-4 py-2 rounded-lg bg-champagne-gold/10 text-champagne-gold text-sm hover:bg-champagne-gold/20 transition-colors border border-champagne-gold/20 font-medium"
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
