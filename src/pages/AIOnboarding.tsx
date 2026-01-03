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

interface SiteStats {
  facilities: number;
  pledges: number;
  journeys: number;
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
  const [stats, setStats] = useState<SiteStats>({
    facilities: 0,
    pledges: 0,
    journeys: 0,
  });

  // Load site stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get facility count
        const { count: facilityCount } = await supabase
          .from('facilities')
          .select('*', { count: 'exact', head: true });

        // Get pledge count
        const { count: pledgeCount } = await supabase
          .from('pledges')
          .select('*', { count: 'exact', head: true });

        // Get journey count
        const { count: journeyCount } = await supabase
          .from('journeys')
          .select('*', { count: 'exact', head: true });

        setStats({
          facilities: facilityCount || 518,
          pledges: pledgeCount || 0,
          journeys: journeyCount || 0,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Fallback values
        setStats({ facilities: 518, pledges: 0, journeys: 0 });
      }
    };

    loadStats();
  }, []);

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

      {/* Stats Counter Bar - Right under header */}
      <div className="flex-shrink-0 py-3 border-b border-sage-200 bg-gradient-to-r from-ocean-600 to-ocean-700">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap justify-center gap-6 md:gap-12 text-white px-4"
        >
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold">{stats.facilities.toLocaleString()}</div>
            <div className="text-xs text-ocean-100">JCI Facilities</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold">{stats.pledges.toLocaleString()}</div>
            <div className="text-xs text-ocean-100">Pledges Taken</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold">{stats.journeys.toLocaleString()}</div>
            <div className="text-xs text-ocean-100">Journeys Started</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold">40-80%</div>
            <div className="text-xs text-ocean-100">Savings vs US</div>
          </div>
        </motion.div>
      </div>

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
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ocean-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-ocean-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-ocean-800">Medical Trust</h3>
              <p className="text-xs text-ocean-600 mt-1">Protect assets from medical debt</p>
              {pledgeStatus.medical_trust && <span className="text-xs text-green-600 block mt-1">Pledged</span>}
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-ocean-100 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ocean-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-ocean-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-ocean-800">Insurance Exit</h3>
              <p className="text-xs text-ocean-600 mt-1">Find better alternatives</p>
              {pledgeStatus.cancel_insurance && <span className="text-xs text-green-600 block mt-1">Pledged</span>}
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-ocean-100 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ocean-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-ocean-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-ocean-800">Medical Tourism</h3>
              <p className="text-xs text-ocean-600 mt-1">Save 60-90% on care</p>
              {pledgeStatus.try_medical_tourism && <span className="text-xs text-green-600 block mt-1">Pledged</span>}
            </div>
          </div>
        </motion.div>

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
