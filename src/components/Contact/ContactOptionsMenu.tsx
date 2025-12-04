import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactOptionsMenuProps {
  phone: string;
  facilityName: string;
  email?: string;
}

const ContactOptionsMenu: React.FC<ContactOptionsMenuProps> = ({ phone, facilityName, email }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Format phone for display (keep original for links)
  const displayPhone = phone;

  // Clean phone number for links (remove spaces, dashes, etc.)
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');

  // WhatsApp link (works internationally)
  const whatsappLink = `https://wa.me/${cleanPhone.replace(/^\+/, '')}`;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = phone;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative flex-1" ref={menuRef}>
      {/* Main Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-white hover:bg-sage-50 text-sage-700 transition-colors text-sm font-semibold border-2 border-sage-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span className="font-mono text-xs">{displayPhone}</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border-2 border-sage-200 shadow-lg overflow-hidden z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 space-y-1">
              {/* Copy Number */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-sage-50 text-left transition-colors"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                <div>
                  <p className="text-sm font-medium text-sage-700">
                    {copied ? 'Copied!' : 'Copy Number'}
                  </p>
                  <p className="text-xs text-sage-500">Save to clipboard</p>
                </div>
              </button>

              {/* Call (Mobile) */}
              <a
                href={`tel:${cleanPhone}`}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-ocean-50 text-left transition-colors"
              >
                <svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-ocean-700">Call Now</p>
                  <p className="text-xs text-sage-500">Opens phone app</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-green-50 text-left transition-colors"
              >
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-700">WhatsApp</p>
                  <p className="text-xs text-sage-500">Chat internationally</p>
                </div>
              </a>

              {/* Email if available */}
              {email && (
                <a
                  href={`mailto:${email}?subject=Inquiry about ${facilityName}`}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gold-50 text-left transition-colors"
                >
                  <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gold-700">Email</p>
                    <p className="text-xs text-sage-500">Send inquiry</p>
                  </div>
                </a>
              )}
            </div>

            {/* Tip for desktop users */}
            <div className="px-3 py-2 bg-sage-50 border-t border-sage-100">
              <p className="text-xs text-sage-500 text-center">
                Tip: Copy number to dial from any device
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactOptionsMenu;
