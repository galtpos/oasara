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
          ? 'bg-gold-500 text-white border-2 border-gold-500'
          : 'bg-white text-ocean-600 border-2 border-sage-200 hover:border-ocean-400'
        }
      `}
    >
      <span>Zano Ready Only</span>
    </motion.button>
  );
};

export default ZanoFilter;
