import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UnifiedChatbot from '../components/Journey/UnifiedChatbot';
import SiteHeader from '../components/Layout/SiteHeader';
import { supabase } from '../lib/supabase';

interface PledgeStatus {
  medical_trust: boolean;
  cancel_insurance: boolean;
  try_medical_tourism: boolean;
}

const AIOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [pledgeStatus, setPledgeStatus] = useState<PledgeStatus>({
    medical_trust: false,
    cancel_insurance: false,
    try_medical_tourism: false,
  });

  // Load user info and pledges
  useEffect(() => {
    const loadUserInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);

        // Get pledges
        const { data: pledges } = await supabase
          .from('pledges')
          .select('pledge_type')
          .eq('email', session.user.email.toLowerCase());

        if (pledges) {
          const status: PledgeStatus = {
            medical_trust: false,
            cancel_insurance: false,
            try_medical_tourism: false,
          };
          pledges.forEach(p => {
            if (p.pledge_type in status) {
              status[p.pledge_type as keyof PledgeStatus] = true;
            }
          });
          setPledgeStatus(status);
        }
      }
    };

    loadUserInfo();
  }, []);

  const handleJourneyCreated = (journeyId: string) => {
    // Navigate to the journey dashboard
    navigate('/my-journey');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50">
      {/* Site Header for Navigation */}
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Hero Section */}
        <div className="pt-8 pb-6 text-center flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-display text-ocean-800 mb-3">
              Take Control of Your Healthcare
            </h1>
            <p className="text-base text-ocean-600 max-w-2xl mx-auto px-4">
              Protect your assets, exit the insurance trap, or find world-class care abroad.
              <br />
              <span className="text-ocean-500 text-sm">Just tell me what's on your mind.</span>
            </p>
          </motion.div>
        </div>

        {/* Three Pillars Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl w-full mx-auto px-4 pb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-xl p-4 border border-ocean-100 text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-semibold text-ocean-800">Medical Trust</h3>
              <p className="text-xs text-ocean-600 mt-1">Protect assets from medical debt</p>
              {pledgeStatus.medical_trust && <span className="text-xs text-green-600">✓ Pledged</span>}
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-ocean-100 text-center">
              <div className="text-2xl mb-2">💸</div>
              <h3 className="font-semibold text-ocean-800">Insurance Exit</h3>
              <p className="text-xs text-ocean-600 mt-1">Find better alternatives</p>
              {pledgeStatus.cancel_insurance && <span className="text-xs text-green-600">✓ Pledged</span>}
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-ocean-100 text-center">
              <div className="text-2xl mb-2">✈️</div>
              <h3 className="font-semibold text-ocean-800">Medical Tourism</h3>
              <p className="text-xs text-ocean-600 mt-1">Save 60-90% on care</p>
              {pledgeStatus.try_medical_tourism && <span className="text-xs text-green-600">✓ Pledged</span>}
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <div className="flex-shrink-0 py-4 border-t border-sage-200 bg-white/50 mt-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-ocean-600 px-4"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>JCI-Accredited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Private</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save 40-80%</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Unified Chatbot - Always visible on this page */}
      <UnifiedChatbot
        isNewUser={true}
        userEmail={userEmail}
        pledgeStatus={pledgeStatus}
        isOpen={chatOpen}
        setIsOpen={setChatOpen}
        onJourneyCreated={handleJourneyCreated}
      />
    </div>
  );
};

export default AIOnboarding;
