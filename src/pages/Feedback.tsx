import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Feedback: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'general', label: 'General Feedback' },
    { id: 'bug', label: 'Bug Report' },
    { id: 'feature', label: 'Feature Request' },
    { id: 'data', label: 'Data Correction' },
    { id: 'facility', label: 'Facility Information' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter your feedback');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Insert feedback
      const { error: insertError } = await supabase
        .from('feedback')
        .insert([{
          email: email.toLowerCase().trim() || null,
          name: name.trim() || null,
          category,
          message: message.trim(),
        }]);

      if (insertError) throw insertError;

      // Send Telegram notification
      const telegramToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.REACT_APP_TELEGRAM_CHAT_ID;

      if (telegramToken && telegramChatId) {
        const categoryLabel = categories.find(c => c.id === category)?.label || category;
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: `💬 *New OASARA Feedback!*\n\n*Category:* ${categoryLabel}\n*From:* ${name || 'Anonymous'} (${email || 'No email'})\n\n*Message:*\n${message.substring(0, 500)}${message.length > 500 ? '...' : ''}\n\n*Time:* ${new Date().toLocaleString()}`,
            parse_mode: 'Markdown',
          }),
        });
      }

      setSuccess(true);
      setEmail('');
      setName('');
      setMessage('');
      setCategory('general');
    } catch (err: any) {
      console.error('Feedback error:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <Link to="/action" className="text-ocean-600 hover:text-gold-600 transition-colors font-medium">
                Take Action
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl text-ocean-700 mb-4">Share Your Feedback</h1>
            <p className="text-ocean-600/70">
              Help us build the medical sovereignty platform you deserve.
              Your feedback shapes OASARA's future.
            </p>
          </motion.div>

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
              <h2 className="font-display text-3xl text-ocean-700 mb-4">Thank You!</h2>
              <p className="text-ocean-600/70 mb-6">
                Your feedback has been received. We read every submission.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-3 rounded-lg bg-gold-100 text-ocean-700 font-semibold hover:bg-gold-200 transition-colors"
                >
                  Submit More Feedback
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 rounded-lg bg-ocean-600 text-white font-semibold hover:bg-ocean-700 transition-colors"
                >
                  Browse Facilities
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 border border-sage-200 shadow-xl"
            >
              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-ocean-700 mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        category === cat.id
                          ? 'bg-gold-500 text-white'
                          : 'bg-sage-100 text-ocean-600 hover:bg-sage-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-ocean-700 mb-2">
                  Your Feedback *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all resize-none"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                    Email (optional, for follow-up)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-full bg-gradient-to-r from-gold-400 to-gold-600 py-4 rounded-lg font-semibold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>

              <p className="text-xs text-ocean-500/60 text-center mt-4">
                Earn Freedom Dollar for valuable feedback (coming soon)
              </p>
            </motion.form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-sage-200 bg-sage-100 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-ocean-600/60 text-sm">
            Privacy-preserving medical marketplace. No tracking. No cookies. Your sovereignty.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Feedback;
