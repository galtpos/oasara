import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface PledgeCounts {
  medical_trust: number;
  cancel_insurance: number;
  try_medical_tourism: number;
}

const ActionCenter: React.FC = () => {
  const [selectedPledges, setSelectedPledges] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [pledgeCounts, setPledgeCounts] = useState<PledgeCounts>({
    medical_trust: 0,
    cancel_insurance: 0,
    try_medical_tourism: 0,
  });

  // Mapping from pledge IDs to Mailchimp tags
  const pledgeTagMap: Record<string, string> = {
    medical_trust: 'PledgeTrust',
    cancel_insurance: 'PledgeExit',
    try_medical_tourism: 'PledgeTourism',
  };

  const pledges = [
    {
      id: 'medical_trust',
      title: 'Create a Medical Trust',
      description: 'I pledge to establish a medical trust to protect my healthcare assets and maintain control over my medical decisions.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'cancel_insurance',
      title: 'Cancel Insurance by Next Open Enrollment',
      description: 'I pledge to explore alternatives to traditional health insurance and consider canceling by the next open enrollment period.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    {
      id: 'try_medical_tourism',
      title: 'Try Medical Tourism This Year',
      description: 'I pledge to explore medical tourism options and consider getting at least one procedure abroad in the coming year.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Fetch pledge counts on mount
  useEffect(() => {
    fetchPledgeCounts();
  }, []);

  const fetchPledgeCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('pledges')
        .select('pledge_type');

      if (error) throw error;

      const counts: PledgeCounts = {
        medical_trust: 0,
        cancel_insurance: 0,
        try_medical_tourism: 0,
      };

      data?.forEach((pledge: { pledge_type: string }) => {
        if (pledge.pledge_type in counts) {
          counts[pledge.pledge_type as keyof PledgeCounts]++;
        }
      });

      setPledgeCounts(counts);
    } catch (err) {
      console.error('Error fetching pledge counts:', err);
    }
  };

  const togglePledge = (pledgeId: string) => {
    setSelectedPledges(prev =>
      prev.includes(pledgeId)
        ? prev.filter(id => id !== pledgeId)
        : [...prev, pledgeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPledges.length === 0) {
      setError('Please select at least one pledge');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Insert pledges to database
      const pledgeInserts = selectedPledges.map(pledgeType => ({
        email: email.toLowerCase().trim(),
        name: name.trim() || null,
        pledge_type: pledgeType,
      }));

      const { error: insertError } = await supabase
        .from('pledges')
        .insert(pledgeInserts);

      if (insertError) throw insertError;

      // Build Mailchimp tags based on selected pledges
      const mailchimpTags = selectedPledges.map(id => pledgeTagMap[id]).filter(Boolean);
      mailchimpTags.push('Pledge'); // Add general Pledge tag

      // Subscribe to Mailchimp with pledge-specific tags
      try {
        const mailchimpResponse = await supabase.functions.invoke('mailchimp-subscribe-oasara', {
          body: {
            email: email.toLowerCase().trim(),
            name: name.trim() || undefined,
            tags: mailchimpTags,
          },
        });

        if (mailchimpResponse.error) {
          console.warn('Mailchimp subscription warning:', mailchimpResponse.error);
          // Don't fail the whole submission if Mailchimp fails
        } else {
          console.log('✅ Successfully subscribed to Mailchimp with tags:', mailchimpTags);
        }
      } catch (mailchimpErr) {
        console.warn('Mailchimp subscription error (non-fatal):', mailchimpErr);
        // Continue - database save was successful
      }

      // Send Telegram notification
      const telegramToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.REACT_APP_TELEGRAM_CHAT_ID;

      if (telegramToken && telegramChatId) {
        const pledgeNames = selectedPledges.map(id =>
          pledges.find(p => p.id === id)?.title
        ).join(', ');

        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: `🎯 *New OASARA Pledge!*\n\n*Name:* ${name || 'Anonymous'}\n*Email:* ${email}\n*Pledges:* ${pledgeNames}\n*Tags:* ${mailchimpTags.join(', ')}\n\n*Time:* ${new Date().toLocaleString()}`,
            parse_mode: 'Markdown',
          }),
        });
      }

      setSuccess(true);
      setEmail('');
      setName('');
      setSelectedPledges([]);
      fetchPledgeCounts(); // Refresh counts
    } catch (err: any) {
      console.error('Pledge error:', err);
      setError(err.message || 'Failed to submit pledge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPledges = pledgeCounts.medical_trust + pledgeCounts.cancel_insurance + pledgeCounts.try_medical_tourism;

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Header */}
      <header className="border-b border-sage-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <h1 className="font-display text-4xl text-gold-600 tracking-wide">OASARA</h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-ocean-600 hover:text-gold-600 transition-colors font-medium">
                Facilities
              </Link>
              <Link to="/why-zano" className="text-ocean-600 hover:text-gold-600 transition-colors font-medium">
                Why Zano?
              </Link>
              <Link
                to="/early-access"
                className="bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-2 rounded-lg font-semibold text-white hover:scale-105 transition-transform shadow-lg"
              >
                Join Early Access
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-6xl text-ocean-700 mb-6">
              Take <span className="text-gold-600">Action</span>
            </h1>
            <p className="text-xl text-ocean-600/70 leading-relaxed max-w-3xl mx-auto mb-8">
              Join the movement for medical sovereignty. Make a pledge and hold yourself accountable.
              Every action counts.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-600">{totalPledges}</div>
                <div className="text-sm text-ocean-600/60">Total Pledges</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-600">{pledgeCounts.medical_trust}</div>
                <div className="text-sm text-ocean-600/60">Medical Trusts</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-600">{pledgeCounts.try_medical_tourism}</div>
                <div className="text-sm text-ocean-600/60">Medical Tourists</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pledge Cards */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 border border-gold-300 shadow-xl text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-3xl text-ocean-700 mb-4">Pledge Recorded!</h2>
              <p className="text-ocean-600/70 mb-6">
                Thank you for taking action. Your commitment to medical sovereignty matters.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-8 py-3 rounded-lg bg-gold-100 text-ocean-700 font-semibold hover:bg-gold-200 transition-colors"
              >
                Make Another Pledge
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-8">
                {pledges.map((pledge, index) => (
                  <motion.div
                    key={pledge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => togglePledge(pledge.id)}
                    className={`cursor-pointer bg-white rounded-xl p-6 border-2 transition-all ${
                      selectedPledges.includes(pledge.id)
                        ? 'border-gold-500 shadow-lg scale-[1.02]'
                        : 'border-sage-200 hover:border-sage-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedPledges.includes(pledge.id)
                          ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-white'
                          : 'bg-sage-100 text-ocean-600'
                      }`}>
                        {pledge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-ocean-700 text-lg">{pledge.title}</h3>
                          <span className="text-sm text-gold-600 font-medium">
                            {pledgeCounts[pledge.id as keyof PledgeCounts]} pledged
                          </span>
                        </div>
                        <p className="text-ocean-600/70 text-sm">{pledge.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedPledges.includes(pledge.id)
                          ? 'border-gold-500 bg-gold-500'
                          : 'border-sage-300'
                      }`}>
                        {selectedPledges.includes(pledge.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 border border-sage-200 shadow-lg mb-6"
              >
                <h3 className="font-semibold text-ocean-700 mb-4">Your Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </motion.div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || selectedPledges.length === 0}
                className="w-full bg-gradient-to-r from-gold-400 to-gold-600 py-4 rounded-lg font-semibold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Submitting...' : `Make ${selectedPledges.length} Pledge${selectedPledges.length !== 1 ? 's' : ''}`}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-16 px-6 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl text-ocean-700 mb-4">Have Feedback?</h2>
          <p className="text-ocean-600/70 mb-6">
            We're building this for you. Tell us what features you need, what's broken, or how we can improve.
          </p>
          <Link
            to="/feedback"
            className="inline-block px-8 py-3 rounded-lg border-2 border-gold-500 text-ocean-700 font-semibold hover:bg-gold-100 transition-colors"
          >
            Share Your Feedback
          </Link>
          <p className="text-sm text-ocean-500/60 mt-4">
            Earn Freedom Dollar for valuable feedback (coming soon)
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-sage-200 bg-sage-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-ocean-600 text-base italic max-w-3xl mx-auto leading-relaxed">
            "In the desert of captured healthcare, Oasara is your oasis — a sanctuary where medical sovereignty flows freely."
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ActionCenter;
