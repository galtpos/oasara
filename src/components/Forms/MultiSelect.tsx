import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  allowCustom = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selected.includes(option)
  );

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleAddCustom = () => {
    if (searchQuery && !options.includes(searchQuery) && !selected.includes(searchQuery)) {
      onChange([...selected, searchQuery]);
      setSearchQuery('');
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm text-cream/80 mb-2">{label}</label>

      {/* Selected Items */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 bg-dark-base/50 border border-cream/20 rounded-lg">
        {selected.length === 0 ? (
          <span className="text-cream/40 text-sm self-center">{placeholder}</span>
        ) : (
          selected.map(item => (
            <motion.span
              key={item}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-3 py-1 bg-gradient-to-r from-ignition-amber/20 to-champagne-gold/20 text-champagne-gold text-sm rounded-lg border border-champagne-gold/30 flex items-center gap-2"
            >
              {item}
              <button
                onClick={() => handleToggle(item)}
                className="hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </motion.span>
          ))
        )}
      </div>

      {/* Dropdown Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-dark-base/50 border border-cream/20 rounded-lg text-cream text-left hover:border-champagne-gold transition-colors flex items-center justify-between"
      >
        <span className="text-sm">
          {selected.length > 0 ? `${selected.length} selected` : 'Select options'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 glass-morphism rounded-lg border border-champagne-gold/20 overflow-hidden shadow-xl"
          >
            {/* Search */}
            <div className="p-3 border-b border-cream/10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or add custom..."
                className="w-full px-3 py-2 bg-dark-base/50 border border-cream/20 rounded-lg text-cream placeholder-cream/40 text-sm focus:outline-none focus:border-champagne-gold transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
              {allowCustom && searchQuery && !options.includes(searchQuery) && (
                <button
                  onClick={handleAddCustom}
                  className="w-full mt-2 px-3 py-2 bg-ignition-amber/20 text-ignition-amber rounded-lg hover:bg-ignition-amber/30 transition-colors text-sm"
                >
                  + Add "{searchQuery}"
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-cream/40 text-sm">
                  {searchQuery ? 'No matches found' : 'All options selected'}
                </div>
              ) : (
                filteredOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      handleToggle(option);
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-cream/80 hover:text-cream hover:bg-cream/10 transition-colors flex items-center justify-between"
                  >
                    <span>{option}</span>
                    {selected.includes(option) && (
                      <svg className="w-4 h-4 text-champagne-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-cream/10 flex items-center justify-between text-xs text-cream/60">
              <span>{selected.length} selected</span>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSelect;
