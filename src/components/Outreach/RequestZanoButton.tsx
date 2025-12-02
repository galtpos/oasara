import React, { useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { Facility, requestZanoPayment } from '../../lib/supabase';

interface RequestZanoButtonProps {
  facility: Facility;
  variant?: 'small' | 'large';
}

const RequestZanoButton: React.FC<RequestZanoButtonProps> = ({
  facility,
  variant = 'small'
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleRequest = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event

    if (!userEmail && showEmailInput) {
      return; // Wait for email input
    }

    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    setStatus('loading');

    try {
      // Track request in Supabase
      await requestZanoPayment(facility.id, userEmail);

      // Send email to facility using EmailJS
      const templateParams = {
        facility_name: facility.name,
        facility_email: facility.contact_email,
        user_email: userEmail,
        facility_city: facility.city,
        facility_country: facility.country,
        message: `A potential patient is interested in ${facility.name} and is requesting the option to pay with Zano cryptocurrency.

Why Medical Facilities Are Accepting Zano:
• Zero transaction fees (save 2-4% vs credit cards)
• Complete payment privacy for patients
• Instant settlement - no waiting for bank transfers
• No chargebacks or payment disputes
• Attract privacy-conscious international patients

OASARA is connecting patients worldwide with facilities that offer Zano payment options. Learn why hundreds of medical tourists are choosing this payment method:

https://oasara.com/why-zano

Questions? Contact us at hello@oasara.com

---
Patient interested in your facility: ${userEmail}
Request submitted via OASARA Medical Tourism Marketplace`
      };

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID!,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY!
      );

      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setShowEmailInput(false);
        setUserEmail('');
      }, 3000);
    } catch (error) {
      console.error('Error requesting Zano payment:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (showEmailInput && status === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="Your email (optional)"
          className="px-3 py-1.5 rounded-lg bg-sage-50 border border-gold-300 text-ocean-700 text-sm focus:outline-none focus:border-gold-500"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={handleRequest}
          disabled={!userEmail}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 text-white text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowEmailInput(false);
            setUserEmail('');
          }}
          className="px-3 py-1.5 rounded-lg bg-sage-100 border border-sage-200 text-ocean-600 text-sm"
        >
          Cancel
        </button>
      </motion.div>
    );
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2 text-sm text-green-400"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
        <span>Request Sent!</span>
      </motion.div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2 text-sm text-red-400"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
        </svg>
        <span>Error occurred</span>
      </motion.div>
    );
  }

  if (variant === 'large') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRequest}
        disabled={status === 'loading'}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>Requesting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
            <span>Request Zano Payment</span>
          </>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleRequest}
      disabled={status === 'loading'}
      className="px-3 py-1.5 rounded-lg bg-gold-100 border border-gold-300 text-gold-700 text-xs font-medium hover:bg-gold-200 disabled:opacity-50 transition-all"
    >
      {status === 'loading' ? 'Requesting...' : 'Request Zano'}
    </motion.button>
  );
};

export default RequestZanoButton;
