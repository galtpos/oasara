import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WalletEducationPlayer, { Tutorial } from '../Videos/WalletEducationPlayer';
import { supabase, getVideoProgress, updateVideoProgress, getFaucetStatus, WalletEducationProgress } from '../../lib/supabase';

// New wallet education tutorials with self-hosted audio
const walletTutorials: Tutorial[] = [
  {
    id: '01_why_patient',
    title: 'Why Private Payments Matter (Patient)',
    description: 'Understanding why traditional payments fail medical tourists and how Zano solves it.',
    duration: '2:00',
    audioSrc: '/tutorials/01_why_patient/audio/narration.mp3',
    level: 1
  },
  {
    id: '02_why_provider',
    title: 'Why Private Payments Matter (Provider)',
    description: 'How chargebacks, freezes, and fees hurt your practice - and the better way.',
    duration: '2:00',
    audioSrc: '/tutorials/02_why_provider/audio/narration.mp3',
    forProvider: true
  },
  {
    id: '03_download',
    title: 'Download Zano Wallet',
    description: 'Step-by-step guide to downloading the Zano wallet on any platform.',
    duration: '3:00',
    audioSrc: '/tutorials/03_download/audio/narration.mp3',
    level: 1
  },
  {
    id: '04_watch_me',
    title: 'Watch Me Set Up a Wallet',
    description: 'Watch the entire wallet setup process before you do it yourself.',
    duration: '3:00',
    audioSrc: '/tutorials/04_watch_me/audio/narration.mp3',
    level: 1
  },
  {
    id: '05_create_wallet',
    title: 'Create Your Wallet & Secure Recovery Words',
    description: 'The most important video - creating your wallet and protecting your funds.',
    duration: '5:00',
    audioSrc: '/tutorials/05_create_wallet/audio/narration.mp3',
    level: 1
  },
  {
    id: '06_get_send',
    title: 'Get & Send Your First Freedom Dollars',
    description: 'Receive funds, make your first transaction, and become financially sovereign.',
    duration: '4:00',
    audioSrc: '/tutorials/06_get_send/audio/narration.mp3',
    level: 2
  },
  {
    id: '07_accept_payments',
    title: 'Accept Payments (Provider)',
    description: 'How clinics can accept private payments from patients.',
    duration: '4:00',
    audioSrc: '/tutorials/07_accept_payments/audio/narration.mp3',
    forProvider: true
  }
];

// Patient path tutorials (levels 1-2)
const patientTutorials = walletTutorials.filter(t => !t.forProvider);

// Provider path tutorials
const providerTutorials = walletTutorials.filter(t => t.forProvider);

interface ZanoTutorialsProps {
  variant?: 'full' | 'compact';
}

const ZanoTutorials: React.FC<ZanoTutorialsProps> = ({ variant = 'full' }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<WalletEducationProgress[]>([]);
  const [faucetStatus, setFaucetStatus] = useState({ claimed: 0, remaining: 100, available: true });
  const [activeTab, setActiveTab] = useState<'patient' | 'provider'>('patient');

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        // Load progress
        getVideoProgress(session.user.id).then(setProgress).catch(console.error);
      }
    });

    // Load faucet status
    getFaucetStatus().then(setFaucetStatus).catch(console.error);
  }, []);

  const isCompleted = (tutorialId: string) => {
    return progress.some(p => p.video_id === tutorialId && p.completed);
  };

  const handleComplete = async (tutorialId: string) => {
    if (!userId) return;

    try {
      await updateVideoProgress(userId, tutorialId, 0, 0, true);
      // Refresh progress
      const newProgress = await getVideoProgress(userId);
      setProgress(newProgress);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleProgress = async (tutorialId: string, currentTime: number, duration: number) => {
    if (!userId) return;

    // Only update every 10 seconds to avoid too many requests
    if (Math.floor(currentTime) % 10 !== 0) return;

    try {
      const completed = currentTime >= duration * 0.9; // 90% watched = complete
      await updateVideoProgress(userId, tutorialId, currentTime, duration, completed);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const completedCount = progress.filter(p => p.completed).length;
  const totalCount = walletTutorials.length;

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-ocean-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          Wallet Education
          {completedCount > 0 && (
            <span className="text-sm text-sage-600 font-normal">
              ({completedCount}/{totalCount} complete)
            </span>
          )}
        </h3>
        <div className="space-y-3">
          {patientTutorials.slice(0, 3).map((tutorial) => (
            <a
              key={tutorial.id}
              href={`/why-zano#tutorials`}
              className="flex items-center gap-3 p-3 rounded-lg bg-sage-50 hover:bg-sage-100 border border-sage-200 transition-colors group"
            >
              <div className={`w-16 h-10 rounded flex items-center justify-center flex-shrink-0 ${isCompleted(tutorial.id) ? 'bg-green-500' : 'bg-ocean-600'}`}>
                {isCompleted(tutorial.id) ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ocean-700 group-hover:text-ocean-800 truncate">
                  {tutorial.title}
                </p>
              </div>
            </a>
          ))}
        </div>
        <a
          href="/why-zano#tutorials"
          className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
        >
          View all {totalCount} tutorials →
        </a>
      </div>
    );
  }

  const displayTutorials = activeTab === 'patient' ? patientTutorials : providerTutorials;

  return (
    <div id="tutorials" className="py-12 bg-gradient-to-br from-ocean-50 via-white to-sage-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl text-ocean-800 font-bold mb-3">
            Wallet Education
          </h2>
          <p className="text-sage-600 max-w-2xl mx-auto mb-4">
            Learn how to set up your wallet, secure your recovery words, and make private payments.
          </p>

          {/* Progress Bar */}
          {userId && (
            <div className="max-w-md mx-auto mb-4">
              <div className="flex justify-between text-sm text-sage-600 mb-1">
                <span>Progress</span>
                <span>{completedCount} of {totalCount} complete</span>
              </div>
              <div className="h-2 bg-sage-200 rounded-full">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Faucet Status */}
          {faucetStatus.available && (
            <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Complete Level 2 and claim $5 FUSD! ({faucetStatus.remaining} of 100 remaining)
            </div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('patient')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'patient'
                ? 'bg-ocean-600 text-white'
                : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
            }`}
          >
            Patient Path
          </button>
          <button
            onClick={() => setActiveTab('provider')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'provider'
                ? 'bg-ocean-600 text-white'
                : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
            }`}
          >
            Provider Path
          </button>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <WalletEducationPlayer
                tutorial={tutorial}
                isCompleted={isCompleted(tutorial.id)}
                onComplete={handleComplete}
                onProgress={handleProgress}
              />
            </motion.div>
          ))}
        </div>

        {/* Not Logged In Message */}
        {!userId && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 p-6 bg-sage-50 rounded-xl border border-sage-200"
          >
            <p className="text-sage-600 mb-4">
              Sign in to track your progress and earn credentials.
            </p>
            <a
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ocean-600 hover:bg-ocean-700 text-white font-semibold transition-colors"
            >
              Sign Up Free
            </a>
          </motion.div>
        )}

        {/* Legacy YouTube CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="https://www.youtube.com/@zanolist"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sage-600 hover:text-ocean-600 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            More tutorials on YouTube
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default ZanoTutorials;
