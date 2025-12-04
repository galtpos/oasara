import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface FeedbackItem {
  id: string;
  email: string | null;
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

const FeedbackManagement: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'unpaid'>('pending');
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFeedback = async (id: string, updates: Partial<FeedbackItem>) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          ...updates,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await fetchFeedback();
      setSelectedItem(null);
      setAdminResponse('');
    } catch (err) {
      console.error('Error updating feedback:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAccept = (item: FeedbackItem) => {
    updateFeedback(item.id, {
      accepted: true,
      status: 'accepted',
      admin_response: adminResponse || 'Accepted! $20 fUSD bounty incoming.',
    });
  };

  const handleReject = (item: FeedbackItem) => {
    updateFeedback(item.id, {
      accepted: false,
      status: 'rejected',
      admin_response: adminResponse || 'Thank you for your submission.',
    });
  };

  const handleMarkPaid = (item: FeedbackItem) => {
    updateFeedback(item.id, {
      bounty_paid: true,
    });
  };

  const filteredFeedback = feedbackList.filter(item => {
    if (filter === 'pending') return item.accepted === null;
    if (filter === 'accepted') return item.accepted === true;
    if (filter === 'unpaid') return item.accepted === true && !item.bounty_paid;
    return true;
  });

  const stats = {
    total: feedbackList.length,
    pending: feedbackList.filter(f => f.accepted === null).length,
    accepted: feedbackList.filter(f => f.accepted === true).length,
    unpaid: feedbackList.filter(f => f.accepted === true && !f.bounty_paid).length,
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      feature: 'Feature',
      bug: 'Bug',
      data: 'Data',
      facility: 'Facility',
      general: 'Other',
    };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-champagne-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-deep-teal mb-2">Bounty Management</h1>
        <p className="text-deep-teal/70">Review submissions and pay bounties ($20 fUSD each)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-warm-clay/20">
          <div className="text-2xl font-bold text-deep-teal">{stats.total}</div>
          <div className="text-sm text-deep-teal/60">Total</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          <div className="text-sm text-yellow-600">Pending Review</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-700">{stats.accepted}</div>
          <div className="text-sm text-green-600">Accepted</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{stats.unpaid}</div>
          <div className="text-sm text-orange-600">Unpaid Bounties</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'accepted', 'unpaid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-deep-teal text-white'
                : 'bg-white text-deep-teal border border-warm-clay/30 hover:bg-cream'
            }`}
          >
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'accepted' ? 'Accepted' : 'Unpaid'}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-warm-clay/20">
            <p className="text-deep-teal/60">No feedback in this category</p>
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl p-6 border-2 ${
                item.accepted === true ? 'border-green-300' :
                item.accepted === false ? 'border-gray-200' :
                'border-yellow-200'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-deep-teal/10 text-deep-teal">
                    {getCategoryLabel(item.category)}
                  </span>
                  {item.accepted === true && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                      Accepted
                    </span>
                  )}
                  {item.accepted === false && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      Rejected
                    </span>
                  )}
                  {item.accepted === null && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  )}
                  {item.accepted && !item.bounty_paid && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                      Unpaid
                    </span>
                  )}
                  {item.bounty_paid && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                      $20 Paid
                    </span>
                  )}
                </div>
                <span className="text-sm text-deep-teal/50">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Message */}
              <p className="text-deep-teal mb-4">{item.message}</p>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-deep-teal/70 mb-4">
                <span><strong>From:</strong> {item.name || 'Anonymous'}</span>
                {item.email && <span><strong>Email:</strong> {item.email}</span>}
                {item.wallet_address && (
                  <span><strong>Wallet:</strong> {item.wallet_address.substring(0, 20)}...</span>
                )}
              </div>

              {/* Admin Response */}
              {item.admin_response && (
                <div className="bg-sage-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-deep-teal/80">
                    <strong>Your Response:</strong> {item.admin_response}
                  </p>
                </div>
              )}

              {/* Actions */}
              {item.accepted === null && (
                <div className="border-t border-warm-clay/20 pt-4 mt-4">
                  {selectedItem?.id === item.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Add a response (optional)..."
                        className="w-full px-3 py-2 rounded-lg border border-warm-clay/30 text-sm resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(item)}
                          disabled={updating}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {updating ? 'Saving...' : 'Accept ($20 Bounty)'}
                        </button>
                        <button
                          onClick={() => handleReject(item)}
                          disabled={updating}
                          className="px-4 py-2 rounded-lg bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(null);
                            setAdminResponse('');
                          }}
                          className="px-4 py-2 rounded-lg bg-white border border-warm-clay/30 text-deep-teal text-sm font-medium hover:bg-cream"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-4 py-2 rounded-lg bg-deep-teal text-white text-sm font-medium hover:bg-deep-teal/90"
                    >
                      Review
                    </button>
                  )}
                </div>
              )}

              {/* Pay Bounty */}
              {item.accepted === true && !item.bounty_paid && (
                <div className="border-t border-warm-clay/20 pt-4 mt-4">
                  <button
                    onClick={() => handleMarkPaid(item)}
                    disabled={updating}
                    className="px-4 py-2 rounded-lg bg-champagne-gold text-white text-sm font-medium hover:bg-champagne-gold/90 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Mark Bounty Paid ($20 fUSD)'}
                  </button>
                  {item.wallet_address && (
                    <p className="text-xs text-deep-teal/60 mt-2">
                      Send to: {item.wallet_address}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;
