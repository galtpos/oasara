import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OasisGuide from './OasisGuide';

const ChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setHasInteracted(true);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[9998]"
          >
            {/* Pulse ring animation */}
            {!hasInteracted && (
              <div className="absolute inset-0 rounded-full bg-gold-400 animate-ping opacity-75" />
            )}

            <button
              onClick={handleOpen}
              className="relative w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-lg hover:shadow-gold hover:scale-110 transition-all flex items-center justify-center group"
              aria-label="Open Oasis Guide"
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>

              {/* Tooltip */}
              <div className="absolute right-full mr-3 px-3 py-2 bg-ocean-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Ask the Oasis Guide
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-ocean-800" />
              </div>
            </button>

            {/* Badge - new indicator */}
            {!hasInteracted && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                !
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <OasisGuide isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatButton;
