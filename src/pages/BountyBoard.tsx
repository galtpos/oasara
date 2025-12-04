import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/Layout/SiteHeader';
import { supabase } from '../lib/supabase';

interface FeedbackItem {
  id: string;
  name: string | null;
  category: string;
  message: string;
  status: string;
  accepted: boolean | null;
  bounty_paid: boolean;
  admin_response: string | null;
  wallet_address: string | null;
  created_at: string;
}

interface LeaderboardEntry {
  name: string;
  count: number;
  totalEarned: number;
}

// Bounty amounts per category
const BOUNTY_AMOUNTS: Record<string, number> = {
  feature: 50,
  bug: 30,
  ux: 20,
};

const BountyBoard: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'pending'>('all');
  const [activeTab, setActiveTab] = useState<'submissions' | 'leaderboard'>('submissions');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('feature');
  const [message, setMessage] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  // Simplified categories: Features, Bugs, UX only
  const categories = [
    { id: 'feature', label: 'Feature Request', bounty: 50, icon: '💡', desc: 'New functionality ideas' },
    { id: 'bug', label: 'Bug Report', bounty: 30, icon: '🐛', desc: 'Something broken or wrong' },
    { id: 'ux', label: 'UX Improvement', bounty: 20, icon: '✨', desc: 'Make it easier to use' },
  ];

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('id, name, category, message, status, accepted, bounty_paid, admin_response, wallet_address, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please describe your suggestion');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('feedback')
        .insert([{
          email: email.toLowerCase().trim() || null,
          name: name.trim() || null,
          category,
          message: message.trim(),
          wallet_address: walletAddress.trim() || null,
        }]);

      if (insertError) throw insertError;

      setSubmitSuccess(true);
      setEmail('');
      setName('');
      setMessage('');
      setWalletAddress('');
      setCategory('feature');

      // Refresh list
      await fetchFeedback();

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 3000);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFeedback = feedbackList.filter(item => {
    if (filter === 'accepted') return item.accepted === true;
    if (filter === 'pending') return item.accepted === null;
    return true;
  });

  // Calculate bounty for an item based on category
  const getBountyAmount = (cat: string): number => {
    return BOUNTY_AMOUNTS[cat] || 20;
  };

  // Calculate stats with tiered bounties
  const acceptedItems = feedbackList.filter(f => f.accepted === true);
  const stats = {
    total: feedbackList.length,
    accepted: acceptedItems.length,
    pending: feedbackList.filter(f => f.accepted === null).length,
    totalBounty: acceptedItems.reduce((sum, item) => sum + getBountyAmount(item.category), 0),
    remainingBudget: 1000 - acceptedItems.reduce((sum, item) => sum + getBountyAmount(item.category), 0),
  };

  // Build leaderboard from accepted contributions
  const leaderboard: LeaderboardEntry[] = Object.values(
    acceptedItems.reduce((acc: Record<string, LeaderboardEntry>, item) => {
      const name = item.name || 'Anonymous';
      if (!acc[name]) {
        acc[name] = { name, count: 0, totalEarned: 0 };
      }
      acc[name].count += 1;
      acc[name].totalEarned += getBountyAmount(item.category);
      return acc;
    }, {})
  ).sort((a, b) => b.totalEarned - a.totalEarned);

  const getCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      feature: 'bg-purple-100 text-purple-700',
      bug: 'bg-red-100 text-red-700',
      ux: 'bg-blue-100 text-blue-700',
    };
    return colors[cat] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (item: FeedbackItem) => {
    if (item.accepted === true) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Accepted
        </span>
      );
    }
    if (item.accepted === false) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
          Reviewed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
        Pending Review
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-sage-50">
      <SiteHeader />

      {/* Hero */}
      <section className="py-12 px-6 bg-gradient-to-br from-ocean-600 to-ocean-700">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
            Bounty Board
          </h1>
          <p className="text-xl text-white/80 mb-4">
            Help build OASARA. Get paid for accepted contributions.
          </p>

          {/* Bounty Tiers */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-white">
                <span className="mr-2">{cat.icon}</span>
                <span className="font-semibold text-gold-400">${cat.bounty}</span>
                <span className="text-white/70 ml-1">{cat.label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-white/70">Submissions</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold text-gold-400">{stats.accepted}</div>
              <div className="text-xs text-white/70">Accepted</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold text-gold-400">${stats.totalBounty}</div>
              <div className="text-xs text-white/70">Paid Out</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">${stats.remainingBudget}</div>
              <div className="text-xs text-white/70">Remaining</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6 border-b border-sage-200">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`pb-3 px-2 font-medium transition-all border-b-2 ${
                activeTab === 'submissions'
                  ? 'text-ocean-600 border-ocean-600'
                  : 'text-ocean-400 border-transparent hover:text-ocean-500'
              }`}
            >
              Submissions
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`pb-3 px-2 font-medium transition-all border-b-2 ${
                activeTab === 'leaderboard'
                  ? 'text-ocean-600 border-ocean-600'
                  : 'text-ocean-400 border-transparent hover:text-ocean-500'
              }`}
            >
              Leaderboard
            </button>
          </div>

          {/* Actions Bar (only show for submissions tab) */}
          {activeTab === 'submissions' && (
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
              {/* Filters */}
              <div className="flex gap-2">
                {(['all', 'accepted', 'pending'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-ocean-600 text-white'
                        : 'bg-white text-ocean-600 border border-ocean-200 hover:bg-ocean-50'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'accepted' ? 'Accepted' : 'Pending'}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 text-white font-semibold hover:shadow-lg transition-all"
              >
                {showForm ? 'Cancel' : '+ Submit Idea'}
              </button>
            </div>
          )}

          {/* Submit Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              {submitSuccess ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Submitted!</h3>
                  <p className="text-green-700">Your idea is now visible to the community.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border-2 border-gold-300 shadow-xl">
                  <h3 className="font-display text-xl text-ocean-700 mb-4">Submit Your Idea</h3>

                  {/* Category with Bounty Amounts */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-ocean-700 mb-2">What type of feedback?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-4 rounded-xl text-center transition-all border-2 ${
                            category === cat.id
                              ? 'bg-ocean-50 border-ocean-500 ring-2 ring-ocean-200'
                              : 'bg-white border-sage-200 hover:border-ocean-300'
                          }`}
                        >
                          <span className="text-2xl mb-1 block">{cat.icon}</span>
                          <span className="block font-medium text-ocean-700 text-sm">{cat.label}</span>
                          <span className="block text-gold-600 font-bold">${cat.bounty} fUSD</span>
                          <span className="text-xs text-ocean-500/60">{cat.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      Your Suggestion *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 resize-none"
                      placeholder="Describe your feature request, bug report, or improvement idea..."
                    />
                  </div>

                  {/* Contact & Wallet */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-ocean-700 mb-2">Name (optional)</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 focus:outline-none focus:border-ocean-400"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ocean-700 mb-2">Email (optional)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 focus:outline-none focus:border-ocean-400"
                        placeholder="you@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ocean-700 mb-2">
                        Zano Wallet <span className="text-gold-600">(for bounty)</span>
                      </label>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 focus:outline-none focus:border-ocean-400"
                        placeholder="Your Zano address"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={submitting || !message.trim()}
                      className="flex-1 bg-gradient-to-r from-gold-400 to-gold-600 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : `Submit for $${categories.find(c => c.id === category)?.bounty || 20} fUSD Bounty`}
                    </button>
                  </div>

                  <p className="text-xs text-ocean-500/60 text-center mt-3">
                    If accepted, you'll receive fUSD (Freedom Dollar) to your Zano wallet.
                  </p>
                </form>
              )}
            </motion.div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <>
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-ocean-600/70">Loading submissions...</p>
                </div>
              ) : filteredFeedback.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-sage-200">
                  <p className="text-ocean-600/70">No submissions yet. Be the first to contribute!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFeedback.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-xl p-6 border-2 ${
                        item.accepted === true ? 'border-green-300' : 'border-sage-200'
                      } shadow-sm hover:shadow-md transition-shadow`}
                    >
                      {/* Header */}
                      <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryBadge(item.category)}`}>
                            {categories.find(c => c.id === item.category)?.label || item.category}
                          </span>
                          {getStatusBadge(item)}
                          {item.accepted && item.bounty_paid && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold-100 text-gold-700 text-xs font-medium">
                              ${getBountyAmount(item.category)} fUSD Paid
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-ocean-500/60">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Message */}
                      <p className="text-ocean-700 mb-3">{item.message}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ocean-500/70">
                          {item.name || 'Anonymous'}
                        </span>
                        {item.accepted === true && !item.bounty_paid && (
                          <span className="text-gold-600 font-medium">${getBountyAmount(item.category)} bounty pending...</span>
                        )}
                      </div>

                      {/* Admin Response */}
                      {item.admin_response && (
                        <div className="mt-4 pt-4 border-t border-sage-200">
                          <p className="text-sm text-ocean-600/80">
                            <span className="font-medium text-ocean-700">Response:</span> {item.admin_response}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-2xl border border-sage-200 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-gold-50 to-gold-100 border-b border-gold-200">
                <h2 className="font-display text-2xl text-ocean-700">Top Contributors</h2>
                <p className="text-ocean-600/70 text-sm mt-1">Users with accepted contributions</p>
              </div>

              {leaderboard.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-ocean-500/70">No accepted contributions yet. Be the first!</p>
                </div>
              ) : (
                <div className="divide-y divide-sage-100">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.name}
                      className={`flex items-center justify-between p-4 ${index < 3 ? 'bg-gold-50/50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-gold-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-sage-200 text-ocean-600'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>

                        {/* Name & Count */}
                        <div>
                          <div className="font-medium text-ocean-700">{entry.name}</div>
                          <div className="text-sm text-ocean-500/70">{entry.count} contribution{entry.count !== 1 ? 's' : ''}</div>
                        </div>
                      </div>

                      {/* Total Earned */}
                      <div className="text-right">
                        <div className="font-bold text-gold-600">${entry.totalEarned}</div>
                        <div className="text-xs text-ocean-500/60">fUSD earned</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Bounty Info */}
      <section className="py-12 px-6 bg-gradient-to-br from-gold-50 to-gold-100 border-t border-gold-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl text-ocean-700 mb-6 text-center">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-xl p-6 text-center border border-gold-200">
                <span className="text-4xl block mb-3">{cat.icon}</span>
                <h3 className="font-semibold text-ocean-700 mb-1">{cat.label}</h3>
                <p className="text-gold-600 font-bold text-xl mb-2">${cat.bounty} fUSD</p>
                <p className="text-sm text-ocean-500/70">{cat.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-gold-300">
              <span className="text-ocean-600">Paid out:</span>
              <span className="font-bold text-gold-600 ml-2">${stats.totalBounty} fUSD</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-green-300">
              <span className="text-ocean-600">Budget remaining:</span>
              <span className="font-bold text-green-600 ml-2">${stats.remainingBudget} fUSD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-sage-200 bg-sage-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-ocean-600/60 text-sm">
            OASARA Bounty Board - Building medical sovereignty together
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BountyBoard;
