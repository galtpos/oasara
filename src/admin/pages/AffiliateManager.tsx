import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface AffiliateProgram {
  id: string;
  service_name: string;
  service_slug: string;
  website_url: string;
  logo_url?: string;
  description?: string;
  price_display?: string;
  price_type?: string;
  category: string;
  features: string[];
  pros: string[];
  cons: string[];
  rating?: number;
  has_affiliate_program: boolean;
  affiliate_network?: string;
  commission_rate?: string;
  cookie_duration?: string;
  affiliate_signup_url?: string;
  affiliate_id?: string;
  affiliate_link?: string;
  is_active: boolean;
  signup_status: 'not_started' | 'pending' | 'approved' | 'rejected';
  clicks: number;
  conversions: number;
  total_commission: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  not_started: 'bg-gray-100 text-gray-700 border-gray-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200'
};

const statusLabels = {
  not_started: 'Not Started',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
};

const AffiliateManager: React.FC = () => {
  const [affiliates, setAffiliates] = useState<AffiliateProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAffiliate, setEditingAffiliate] = useState<AffiliateProgram | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_programs')
        .select('*')
        .order('service_name');

      if (error) throw error;
      setAffiliates(data || []);
    } catch (err) {
      console.error('Error fetching affiliates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (affiliate: AffiliateProgram) => {
    setEditingAffiliate(affiliate);
    setShowEditor(true);
  };

  const handleSave = async (affiliate: AffiliateProgram) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('affiliate_programs')
        .update({
          affiliate_id: affiliate.affiliate_id,
          affiliate_link: affiliate.affiliate_link,
          signup_status: affiliate.signup_status,
          is_active: affiliate.is_active,
          notes: affiliate.notes,
          conversions: affiliate.conversions,
          total_commission: affiliate.total_commission
        })
        .eq('id', affiliate.id);

      if (error) throw error;

      await fetchAffiliates();
      setShowEditor(false);
      setEditingAffiliate(null);
    } catch (err) {
      console.error('Error saving affiliate:', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (affiliate: AffiliateProgram) => {
    try {
      const { error } = await supabase
        .from('affiliate_programs')
        .update({ is_active: !affiliate.is_active })
        .eq('id', affiliate.id);

      if (error) throw error;
      await fetchAffiliates();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  // Calculate totals
  const totalClicks = affiliates.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const totalConversions = affiliates.reduce((sum, a) => sum + (a.conversions || 0), 0);
  const totalCommission = affiliates.reduce((sum, a) => sum + (a.total_commission || 0), 0);
  const approvedCount = affiliates.filter(a => a.signup_status === 'approved').length;
  const withAffiliateProgram = affiliates.filter(a => a.has_affiliate_program).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-ocean-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ocean-800">Affiliate Programs</h1>
          <p className="text-ocean-600/70 mt-1">Manage your affiliate partnerships and track performance</p>
        </div>
        <button
          onClick={fetchAffiliates}
          className="px-4 py-2 bg-ocean-50 text-ocean-600 rounded-lg hover:bg-ocean-100 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-sage-200 p-4">
          <div className="text-sm text-ocean-600/70">Total Services</div>
          <div className="text-2xl font-bold text-ocean-800">{affiliates.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-sage-200 p-4">
          <div className="text-sm text-ocean-600/70">With Affiliate Programs</div>
          <div className="text-2xl font-bold text-ocean-800">{withAffiliateProgram}</div>
        </div>
        <div className="bg-white rounded-xl border border-sage-200 p-4">
          <div className="text-sm text-ocean-600/70">Signed Up</div>
          <div className="text-2xl font-bold text-emerald-600">{approvedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-sage-200 p-4">
          <div className="text-sm text-ocean-600/70">Total Clicks</div>
          <div className="text-2xl font-bold text-ocean-800">{totalClicks.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-sage-200 p-4">
          <div className="text-sm text-ocean-600/70">Total Commission</div>
          <div className="text-2xl font-bold text-gold-600">${totalCommission.toFixed(2)}</div>
        </div>
      </div>

      {/* Affiliate List */}
      <div className="bg-white rounded-xl border border-sage-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sage-50 border-b border-sage-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ocean-700 uppercase tracking-wide">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ocean-700 uppercase tracking-wide">Program</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ocean-700 uppercase tracking-wide">Commission</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ocean-700 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ocean-700 uppercase tracking-wide">Performance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ocean-700 uppercase tracking-wide">Active</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ocean-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-sage-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ocean-100 to-sage-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-ocean-600">
                          {affiliate.service_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-ocean-800">{affiliate.service_name}</div>
                        <div className="text-sm text-ocean-600/70">{affiliate.price_display}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {affiliate.has_affiliate_program ? (
                      <div>
                        <div className="text-sm font-medium text-ocean-800">{affiliate.affiliate_network || 'Direct'}</div>
                        <div className="text-xs text-ocean-600/70">{affiliate.cookie_duration || 'N/A'} cookie</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No program</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {affiliate.commission_rate ? (
                      <span className="text-sm font-semibold text-gold-600">{affiliate.commission_rate}</span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[affiliate.signup_status]}`}>
                      {statusLabels[affiliate.signup_status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-ocean-600/70">
                          <span className="font-semibold text-ocean-800">{affiliate.clicks}</span> clicks
                        </span>
                        <span className="text-ocean-600/70">
                          <span className="font-semibold text-ocean-800">{affiliate.conversions}</span> conv
                        </span>
                      </div>
                      {affiliate.total_commission > 0 && (
                        <div className="text-gold-600 font-semibold">${affiliate.total_commission.toFixed(2)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleActive(affiliate)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        affiliate.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          affiliate.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(affiliate)}
                        className="p-2 text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {affiliate.affiliate_signup_url && (
                        <a
                          href={affiliate.affiliate_signup_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                          title="Sign up for affiliate program"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      <a
                        href={affiliate.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-sage-600 hover:bg-sage-50 rounded-lg transition-colors"
                        title="Visit website"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-gradient-to-br from-gold-50 to-amber-50 rounded-xl border border-gold-200 p-6">
        <h3 className="font-semibold text-gold-800 mb-3">Affiliate Signup Checklist</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {affiliates.filter(a => a.has_affiliate_program && a.signup_status !== 'approved').map(affiliate => (
            <div key={affiliate.id} className="bg-white/80 rounded-lg p-3 border border-gold-200/50">
              <div className="font-medium text-ocean-800">{affiliate.service_name}</div>
              <div className="text-sm text-ocean-600/70 mb-2">{affiliate.commission_rate}</div>
              {affiliate.affiliate_signup_url && (
                <a
                  href={affiliate.affiliate_signup_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1"
                >
                  Sign up now
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditor && editingAffiliate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-sage-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-ocean-800">Edit {editingAffiliate.service_name}</h2>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="p-2 hover:bg-sage-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Service Info (Read-only) */}
                <div className="bg-sage-50 rounded-lg p-4">
                  <div className="text-sm text-ocean-600/70 mb-1">Service Details</div>
                  <div className="font-semibold text-ocean-800">{editingAffiliate.price_display}</div>
                  {editingAffiliate.affiliate_network && (
                    <div className="text-sm text-ocean-600 mt-1">
                      Network: {editingAffiliate.affiliate_network} | Commission: {editingAffiliate.commission_rate}
                    </div>
                  )}
                </div>

                {/* Signup Status */}
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-2">Signup Status</label>
                  <select
                    value={editingAffiliate.signup_status}
                    onChange={e => setEditingAffiliate({
                      ...editingAffiliate,
                      signup_status: e.target.value as AffiliateProgram['signup_status']
                    })}
                    className="w-full px-4 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Affiliate ID */}
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-2">Your Affiliate ID</label>
                  <input
                    type="text"
                    value={editingAffiliate.affiliate_id || ''}
                    onChange={e => setEditingAffiliate({
                      ...editingAffiliate,
                      affiliate_id: e.target.value
                    })}
                    placeholder="Enter your affiliate ID"
                    className="w-full px-4 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                {/* Affiliate Link */}
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-2">Your Affiliate Link</label>
                  <input
                    type="url"
                    value={editingAffiliate.affiliate_link || ''}
                    onChange={e => setEditingAffiliate({
                      ...editingAffiliate,
                      affiliate_link: e.target.value
                    })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                {/* Performance Tracking */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">Conversions</label>
                    <input
                      type="number"
                      value={editingAffiliate.conversions || 0}
                      onChange={e => setEditingAffiliate({
                        ...editingAffiliate,
                        conversions: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">Total Commission ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingAffiliate.total_commission || 0}
                      onChange={e => setEditingAffiliate({
                        ...editingAffiliate,
                        total_commission: parseFloat(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-2">Notes</label>
                  <textarea
                    value={editingAffiliate.notes || ''}
                    onChange={e => setEditingAffiliate({
                      ...editingAffiliate,
                      notes: e.target.value
                    })}
                    rows={3}
                    placeholder="Add any notes about this affiliate program..."
                    className="w-full px-4 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-ocean-800">Show on Website</div>
                    <div className="text-sm text-ocean-600/70">Display this service in comparisons</div>
                  </div>
                  <button
                    onClick={() => setEditingAffiliate({
                      ...editingAffiliate,
                      is_active: !editingAffiliate.is_active
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editingAffiliate.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editingAffiliate.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-sage-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingAffiliate)}
                  disabled={saving}
                  className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AffiliateManager;
