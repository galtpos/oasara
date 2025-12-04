import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilityId: string;
  facilityName: string;
  facilityEmail?: string;
  procedures?: string[];
}

const ContactFacilityModal: React.FC<ContactFacilityModalProps> = ({
  isOpen,
  onClose,
  facilityId,
  facilityName,
  facilityEmail,
  procedures = []
}) => {
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    procedure: '',
    preferredContact: 'email' as 'email' | 'phone' | 'whatsapp',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-facility-inquiry`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            facilityId,
            facilityName,
            facilityEmail,
            senderName: formData.senderName,
            senderEmail: formData.senderEmail,
            senderPhone: formData.senderPhone || undefined,
            procedure: formData.procedure || undefined,
            message: formData.message,
            preferredContact: formData.preferredContact
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send inquiry');
      }

      setStatus('success');
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          senderName: '',
          senderEmail: '',
          senderPhone: '',
          procedure: '',
          preferredContact: 'email',
          message: ''
        });
        setStatus('idle');
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error sending inquiry:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send inquiry');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-ocean-600 to-ocean-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Contact Facility</h2>
                  <p className="text-ocean-100 text-sm mt-1">{facilityName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-ocean-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Success State */}
            {status === 'success' ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-ocean-800 mb-2">Inquiry Sent!</h3>
                <p className="text-sage-600">
                  Your message has been sent to {facilityName}. Check your email for a confirmation.
                </p>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Error Message */}
                {status === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{errorMessage || 'An error occurred. Please try again.'}</p>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="senderName" className="block text-sm font-medium text-ocean-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="senderName"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-lg border border-sage-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="senderEmail" className="block text-sm font-medium text-ocean-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="senderEmail"
                    name="senderEmail"
                    value={formData.senderEmail}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-sage-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 outline-none transition-all"
                  />
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label htmlFor="senderPhone" className="block text-sm font-medium text-ocean-700 mb-1">
                    Phone Number <span className="text-sage-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="senderPhone"
                    name="senderPhone"
                    value={formData.senderPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2.5 rounded-lg border border-sage-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 outline-none transition-all"
                  />
                </div>

                {/* Procedure Interest */}
                {procedures.length > 0 && (
                  <div>
                    <label htmlFor="procedure" className="block text-sm font-medium text-ocean-700 mb-1">
                      Procedure of Interest
                    </label>
                    <select
                      id="procedure"
                      name="procedure"
                      value={formData.procedure}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-sage-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 outline-none transition-all bg-white"
                    >
                      <option value="">Select a procedure (optional)</option>
                      {procedures.map(proc => (
                        <option key={proc} value={proc}>{proc}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="flex gap-4">
                    {[
                      { value: 'email', label: 'Email', icon: '✉️' },
                      { value: 'phone', label: 'Phone', icon: '📞' },
                      { value: 'whatsapp', label: 'WhatsApp', icon: '💬' }
                    ].map(option => (
                      <label
                        key={option.value}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.preferredContact === option.value
                            ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                            : 'border-sage-200 hover:border-sage-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="preferredContact"
                          value={option.value}
                          checked={formData.preferredContact === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span>{option.icon}</span>
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-ocean-700 mb-1">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell the facility about your needs, questions, or preferred dates for treatment..."
                    className="w-full px-4 py-2.5 rounded-lg border border-sage-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 outline-none transition-all resize-none"
                  />
                </div>

                {/* Privacy Note */}
                <div className="bg-sage-50 rounded-lg p-3 border border-sage-100">
                  <p className="text-xs text-sage-600">
                    <span className="font-medium">Privacy:</span> Your information will only be shared with {facilityName} to respond to your inquiry. We never sell your data.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 4px 0 #8B6914, 0 6px 16px rgba(139, 105, 20, 0.3)' }}
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Send Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContactFacilityModal;
