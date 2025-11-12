import React from 'react';
import { motion } from 'framer-motion';

interface ZanoFilterProps {
  showZanoOnly: boolean;
  onToggle: () => void;
}

const ZanoFilter: React.FC<ZanoFilterProps> = ({ showZanoOnly, onToggle }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`
        px-6 py-3 rounded-lg text-base transition-all font-semibold
        ${showZanoOnly
          ? 'bg-champagne-gold text-white border-2 border-champagne-gold'
          : 'bg-white text-deep-teal border-2 border-desert-sand hover:border-warm-clay'
        }
      `}
    >
      <span>Zano Ready Only</span>
    </motion.button>
  );
};

export default ZanoFilter;
