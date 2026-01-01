import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuthState } from '../../hooks/useAuth';

interface ContactFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Support both prop styles for flexibility:
  facility?: {        // Journey context (full object)
    id: string;
    name: string;
    city: string;
    country: string;
  };
  facilityId?: string;    // Standalone context (individual props)
  facilityName?: string;
  journeyId?: string;     // Optional - null for standalone inquiries
  procedureType?: string; // Optional - shown if provided
}

const ContactFacilityModal: React.FC<ContactFacilityModalProps> = ({
  isOpen,
  onClose,
  facility,
  facilityId,
  facilityName,
  journeyId,
  procedureType
}) => {
  // Derive facility info from either prop style
  const id = facility?.id || facilityId || '';
  const name = facility?.name || facilityName || '';
  const city = facility?.city || '';
  const country = facility?.country || '';

  // Get authenticated user's info for pre-fill
  const { user, profile } = useAuthState();

  // Generate default message with Zano pitch
  const generateDefaultMessage = (procedure?: string) => {
    const procedureText = procedure
      ? `I am interested in learning more about ${procedure} at your facility.`
      : 'I am interested in learning more about your medical services.';

    return `Hello,

${procedureText}

I would appreciate information about:
• Pricing and package options
• Estimated timeline for treatment
• Required medical history or documentation
• Accommodation recommendations nearby

I discovered your facility through OASARA, a privacy-preserving medical tourism marketplace. For secure, private transactions, I encourage you to explore accepting Zano or Freedom Dollar (fUSD) – a stable cryptocurrency that protects both patients and providers from chargebacks, bank freezes, and surveillance. Learn more: https://oasara.com/why-zano

Thank you for your time. I look forward to your response.`;
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when modal opens or user data becomes available
  useEffect(() => {
    if (isOpen) {
      const userName = profile?.name
        || user?.user_metadata?.name
        || user?.user_metadata?.full_name
        || user?.email?.split('@')[0]
        || '';
      setFormData({
        name: userName,
        email: user?.email || '',
        phone: '',
        message: generateDefaultMessage(procedureType)
      });
    }
  }, [isOpen, user, profile, procedureType]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // First, save the contact request to the database
      const { data: contactRequest, error: dbError } = await supabase
        .from('contact_requests')
        .insert({
          journey_id: journeyId || null,  // Allow null for standalone inquiries
          facility_id: id,
          user_name: formData.name,
          user_email: formData.email,
          user_phone: formData.phone || null,
          message: formData.message || null,
          procedure_type: procedureType || 'General Inquiry',
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        console.error('Insert data:', { journey_id: journeyId || null, facility_id: id, user_name: formData.name, user_email: formData.email });
        throw new Error(`Database error: ${dbError.message || dbError.code || 'Unknown'}`);
      }

      // Then, send the email via Netlify function
      const response = await fetch('/.netlify/functions/contact-facility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactRequestId: contactRequest.id,
          facility: {
            id,
            name,
            city,
            country
          },
          user: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          },
          procedureType: procedureType || 'General Inquiry',
          message: formData.message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      setSubmitSuccess(true);

      // Reset form and close modal after 2 seconds
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', message: '' });
        setSubmitSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', email: '', phone: '', message: '' });
      setSubmitError('');
      setSubmitSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold">Request Quote</h2>
                <p className="text-ocean-100 text-sm mt-1">
                  {name}{city && country ? ` - ${city}, ${country}` : ''}
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-ocean-800 mb-2">Request Sent!</h3>
                <p className="text-ocean-600">
                  {name} will receive your request and contact you soon.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Procedure Type (Read-only) - only show if provided */}
                {procedureType && (
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-1">
                      Procedure
                    </label>
                    <div className="px-4 py-3 bg-sage-50 rounded-lg text-ocean-800 font-medium">
                      {procedureType}
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-ocean-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-2.5 border-2 border-sage-300 rounded-lg focus:border-ocean-600 focus:ring-2 focus:ring-ocean-600/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ocean-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 border-2 border-sage-300 rounded-lg focus:border-ocean-600 focus:ring-2 focus:ring-ocean-600/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-ocean-700 mb-1">
                    Phone Number <span className="text-sage-500 text-xs">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2.5 border-2 border-sage-300 rounded-lg focus:border-ocean-600 focus:ring-2 focus:ring-ocean-600/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-ocean-700 mb-1">
                    Message <span className="text-sage-500 text-xs">(feel free to edit)</span>
                  </label>
                  <textarea
                    id="message"
                    rows={8}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell the facility about your specific needs..."
                    className="w-full px-4 py-2.5 border-2 border-sage-300 rounded-lg focus:border-ocean-600 focus:ring-2 focus:ring-ocean-600/20 focus:outline-none transition-all resize-y text-sm"
                  />
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 border-2 border-sage-300 text-ocean-700 rounded-lg hover:bg-sage-50 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Request'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContactFacilityModal;
