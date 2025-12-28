import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import type { HospitalDetail as HospitalDetailType } from '../types/hospital';
import {
  CAPTURE_TIER_CONFIG,
  HOSPITAL_TYPE_LABELS,
  OWNERSHIP_TYPE_LABELS,
  US_STATES,
} from '../types/hospital';
import { getHospitalDetail, submitHospitalReport } from '../lib/hospitalApi';
import { getHospitalPrices, formatPrice } from '../lib/priceApi';
import type { HospitalPrice } from '../types/hospital';

export default function USHospitalDetail() {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<HospitalDetailType | null>(null);
  const [prices, setPrices] = useState<HospitalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    async function loadHospital() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const [hospitalData, priceData] = await Promise.all([
          getHospitalDetail(id),
          getHospitalPrices(id),
        ]);

        if (hospitalData) {
          setHospital(hospitalData);
          setPrices(priceData);
        } else {
          setError('Hospital not found');
        }
      } catch (err) {
        setError('Failed to load hospital details');
        console.error('Error loading hospital:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHospital();
  }, [id]);

  const handleReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hospital) return;

    setReportSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitHospitalReport({
      hospital_id: hospital.id,
      report_type: formData.get('report_type') as any,
      description: formData.get('description') as string,
      estimated_bill: formData.get('estimated_bill') ? Number(formData.get('estimated_bill')) : undefined,
      actual_bill: formData.get('actual_bill') ? Number(formData.get('actual_bill')) : undefined,
    });

    setReportSubmitting(false);

    if (result.success) {
      setReportSuccess(true);
      setShowReportForm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-ocean-700 font-display text-lg">Loading hospital details...</span>
        </div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl border-2 border-sage-200 shadow-lg">
          <div className="text-6xl mb-4">🏥</div>
          <h1 className="text-2xl font-display font-bold text-ocean-800 mb-4">{error || 'Hospital not found'}</h1>
          <Link to="/us-hospitals" className="text-ocean-600 hover:text-ocean-700 font-medium">
            ← Back to Hospital Map
          </Link>
        </div>
      </div>
    );
  }

  const tierConfig = hospital.scores?.capture_tier
    ? CAPTURE_TIER_CONFIG[hospital.scores.capture_tier]
    : null;

  const hospitalType = hospital.hospital_type
    ? HOSPITAL_TYPE_LABELS[hospital.hospital_type] || hospital.hospital_type
    : 'Hospital';

  const ownershipType = hospital.ownership_type
    ? OWNERSHIP_TYPE_LABELS[hospital.ownership_type] || hospital.ownership_type
    : null;

  const stateName = US_STATES[hospital.state] || hospital.state;

  // Calculate average price for international comparison
  const avgPrice = prices.length > 0
    ? prices.reduce((sum, p) => sum + (p.discounted_cash_price || 0), 0) / prices.length
    : null;

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Back Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Link
          to="/us-hospitals"
          className="inline-flex items-center gap-2 text-sage-600 hover:text-ocean-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Hospital Map
        </Link>
      </div>

      {/* Hospital Header */}
      <section className="relative py-8 px-4 bg-gradient-to-b from-ocean-700 to-ocean-600">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Type badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-ocean-500/50 text-ocean-100 text-sm rounded-full border border-ocean-400/30">
                {hospitalType}
              </span>
              {ownershipType && (
                <span className="px-3 py-1 bg-sage-800/30 text-sage-200 text-sm rounded-full">
                  {ownershipType}
                </span>
              )}
              {hospital.emergency_services && (
                <span className="px-3 py-1 bg-red-500/30 text-red-200 text-sm rounded-full">
                  Emergency Services
                </span>
              )}
              {!hospital.compliance?.mrf_published && (
                <span className="px-3 py-1 bg-gold-500/30 text-gold-200 text-sm rounded-full font-medium">
                  Price File NOT Published
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              {hospital.name}
            </h1>

            {/* Location */}
            <p className="text-sage-200 text-lg mb-4">
              {hospital.address && `${hospital.address}, `}
              {hospital.city}, {stateName} {hospital.zip}
            </p>

            {/* Quick info */}
            <div className="flex flex-wrap gap-6 text-sm">
              {hospital.phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sage-200">{hospital.phone}</span>
                </div>
              )}
              {hospital.bed_count && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-sage-200">{hospital.bed_count.toLocaleString()} beds</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sage-400">CMS CCN:</span>
                <span className="text-sage-200 font-mono">{hospital.cms_ccn}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Oasara Escape Route - Prominent CTA */}
      <section className="max-w-6xl mx-auto px-4 -mt-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl p-6 shadow-xl border-2 border-gold-400"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🌍</div>
              <div>
                <h3 className="text-xl font-display font-bold text-ocean-900 mb-1">
                  Consider International Options
                </h3>
                <p className="text-ocean-800 text-sm">
                  JCI-accredited facilities abroad offer the same procedures for <strong>60-80% less</strong>—with transparent pricing before you book.
                  {avgPrice && avgPrice > 1000 && (
                    <span className="block mt-1 font-medium">
                      Potential savings: <span className="text-green-800">{formatPrice(avgPrice * 0.7)}</span> or more per procedure.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Link
              to="/hub"
              className="px-6 py-3 bg-ocean-700 hover:bg-ocean-800 text-white font-bold rounded-lg transition-colors whitespace-nowrap text-center"
            >
              Find International Facilities
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Capture Score Card */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border-2 border-sage-200 rounded-xl p-6 shadow-lg sticky top-20"
            >
              <h2 className="text-lg font-display font-semibold text-ocean-800 mb-4">Transparency Score</h2>

              {tierConfig ? (
                <>
                  {/* Score Circle */}
                  <div className="flex justify-center mb-6">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center border-4"
                      style={{
                        borderColor: tierConfig.color,
                        backgroundColor: `${tierConfig.color}15`,
                      }}
                    >
                      <div className="text-center">
                        <div
                          className="text-4xl font-bold"
                          style={{ color: tierConfig.color }}
                        >
                          {hospital.scores?.total_capture_score ?? 'N/A'}
                        </div>
                        <div className="text-xs text-sage-500">of 100</div>
                      </div>
                    </div>
                  </div>

                  {/* Tier Badge */}
                  <div
                    className="text-center py-3 rounded-lg mb-4"
                    style={{ backgroundColor: `${tierConfig.color}15` }}
                  >
                    <span
                      className="font-bold text-lg"
                      style={{ color: tierConfig.color }}
                    >
                      {tierConfig.label}
                    </span>
                    <p className="text-xs text-sage-600 mt-1">
                      {tierConfig.description}
                    </p>
                  </div>

                  {/* Component Scores */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-sage-600">Price Opacity</span>
                      <span className="text-ocean-800 font-medium">
                        {hospital.scores?.price_opacity_score ?? '-'}/100
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-sage-600">Terms Capture</span>
                      <span className="text-ocean-800 font-medium">
                        {hospital.scores?.terms_capture_score ?? '-'}/100
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-sage-600">Compliance Failure</span>
                      <span className="text-ocean-800 font-medium">
                        {hospital.scores?.compliance_failure_score ?? '-'}/100
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4 opacity-50">?</div>
                  <p className="text-sage-500">Not yet scored</p>
                  <p className="text-xs text-sage-400 mt-2">
                    Score pending compliance verification
                  </p>
                </div>
              )}

              {/* Warning about non-compliance */}
              {!hospital.compliance?.mrf_published && (
                <div className="mt-6 p-4 bg-gold-50 border border-gold-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-xs text-gold-800">
                      <strong>This hospital does NOT publish pricing.</strong> They prefer to pay federal fines rather than show you what they charge.
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Compliance Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-sage-200 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-display font-semibold text-ocean-800 mb-4">Price Transparency Compliance</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${hospital.compliance?.mrf_published ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sage-700 text-sm">Machine-Readable File</span>
                    {hospital.compliance?.mrf_published ? (
                      <span className="text-green-600 text-sm font-semibold">Published</span>
                    ) : (
                      <span className="text-red-600 text-sm font-semibold">Not Published</span>
                    )}
                  </div>
                  {hospital.compliance?.mrf_url && (
                    <a
                      href={hospital.compliance.mrf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ocean-600 hover:text-ocean-700"
                    >
                      View File →
                    </a>
                  )}
                </div>

                <div className={`p-4 rounded-lg ${hospital.compliance?.consumer_tool_available ? 'bg-green-50 border border-green-200' : 'bg-sage-50 border border-sage-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sage-700 text-sm">Consumer Price Tool</span>
                    {hospital.compliance?.consumer_tool_available ? (
                      <span className="text-green-600 text-sm font-semibold">Available</span>
                    ) : (
                      <span className="text-sage-500 text-sm font-semibold">Not Available</span>
                    )}
                  </div>
                  {hospital.compliance?.consumer_tool_url && (
                    <a
                      href={hospital.compliance.consumer_tool_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ocean-600 hover:text-ocean-700"
                    >
                      Open Tool →
                    </a>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-sage-50 border border-sage-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sage-700 text-sm">CMS Warnings</span>
                    <span className={hospital.compliance?.cms_warning_letter ? 'text-red-600 font-medium' : 'text-sage-500'}>
                      {hospital.compliance?.cms_warning_letter ? 'Yes' : 'None on record'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-sage-50 border border-sage-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sage-700 text-sm">Penalties</span>
                    <span className="text-ocean-800 font-medium">
                      {hospital.compliance?.cms_penalty_count ?? 0} incidents
                    </span>
                  </div>
                  {(hospital.compliance?.cms_penalty_total ?? 0) > 0 && (
                    <div className="text-xs text-red-600 font-medium">
                      Total: ${hospital.compliance?.cms_penalty_total?.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {hospital.compliance?.last_verified && (
                <p className="text-xs text-sage-500 mt-4">
                  Last verified: {new Date(hospital.compliance.last_verified).toLocaleDateString()}
                </p>
              )}
            </motion.div>

            {/* Published Prices Section */}
            {prices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white border-2 border-sage-200 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-display font-semibold text-ocean-800">Published Procedure Prices</h2>
                  <Link
                    to="/us-prices"
                    className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
                  >
                    Compare all prices →
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-sage-200">
                        <th className="text-left py-2 text-sage-600 font-medium">Procedure</th>
                        <th className="text-right py-2 text-sage-600 font-medium">Cash Price</th>
                        <th className="text-right py-2 text-sage-600 font-medium">List Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.slice(0, 10).map((price, idx) => (
                        <tr key={price.id || idx} className="border-b border-sage-100">
                          <td className="py-3 text-ocean-800">{price.common_name || price.description}</td>
                          <td className="py-3 text-right font-bold text-ocean-700">{formatPrice(price.discounted_cash_price)}</td>
                          <td className="py-3 text-right text-sage-500">
                            {price.gross_charge ? (
                              <span className="line-through">{formatPrice(price.gross_charge)}</span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {prices.length > 10 && (
                  <div className="mt-4 text-center">
                    <Link
                      to="/us-prices"
                      className="text-ocean-600 hover:text-ocean-700 text-sm font-medium"
                    >
                      View all {prices.length} procedures →
                    </Link>
                  </div>
                )}

                {/* International savings hint */}
                {avgPrice && avgPrice > 1000 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-green-800 font-medium">
                          International facilities could save you {formatPrice(avgPrice * 0.6)} to {formatPrice(avgPrice * 0.8)} per procedure.
                        </p>
                        <Link to="/hub" className="text-green-700 text-sm hover:underline">
                          Explore international options →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Terms Section */}
            {hospital.terms && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border-2 border-sage-200 rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-display font-semibold text-ocean-800 mb-4">Conditions of Admission Analysis</h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${hospital.terms.arbitration_required ? 'bg-red-50 border border-red-200' : 'bg-sage-50 border border-sage-200'}`}>
                    <span className="text-sm text-sage-700">Binding Arbitration</span>
                    <div className={`font-semibold ${hospital.terms.arbitration_required ? 'text-red-600' : 'text-sage-500'}`}>
                      {hospital.terms.arbitration_required ? 'Required' : 'Not Required'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${hospital.terms.class_action_waiver ? 'bg-red-50 border border-red-200' : 'bg-sage-50 border border-sage-200'}`}>
                    <span className="text-sm text-sage-700">Class Action Waiver</span>
                    <div className={`font-semibold ${hospital.terms.class_action_waiver ? 'text-red-600' : 'text-sage-500'}`}>
                      {hospital.terms.class_action_waiver ? 'Yes' : 'No'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${hospital.terms.lien_rights_claimed ? 'bg-gold-50 border border-gold-200' : 'bg-sage-50 border border-sage-200'}`}>
                    <span className="text-sm text-sage-700">Lien Rights</span>
                    <div className={`font-semibold ${hospital.terms.lien_rights_claimed ? 'text-gold-700' : 'text-sage-500'}`}>
                      {hospital.terms.lien_rights_claimed ? 'Claimed' : 'Not Claimed'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${hospital.terms.balance_billing_allowed ? 'bg-gold-50 border border-gold-200' : 'bg-sage-50 border border-sage-200'}`}>
                    <span className="text-sm text-sage-700">Balance Billing</span>
                    <div className={`font-semibold ${hospital.terms.balance_billing_allowed ? 'text-gold-700' : 'text-sage-500'}`}>
                      {hospital.terms.balance_billing_allowed ? 'Allowed' : 'Not Allowed'}
                    </div>
                  </div>
                </div>

                {hospital.terms.worst_clause && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-xs text-red-600 font-semibold mb-2">WORST CLAUSE IN THEIR TERMS</div>
                    <p className="text-sage-800 text-sm italic">
                      "{hospital.terms.worst_clause}"
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Report Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border-2 border-sage-200 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold text-ocean-800">Community Reports</h2>
                <button
                  onClick={() => setShowReportForm(!showReportForm)}
                  className="px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white text-sm rounded-lg transition-colors"
                >
                  Submit Report
                </button>
              </div>

              {reportSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  Thank you! Your report has been submitted for review.
                </div>
              )}

              {showReportForm && (
                <form onSubmit={handleReportSubmit} className="mb-6 p-4 bg-sage-50 border border-sage-200 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-sage-700 mb-1">Report Type</label>
                      <select
                        name="report_type"
                        className="w-full bg-white border border-sage-300 rounded-lg px-3 py-2 text-ocean-800 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                        required
                      >
                        <option value="billing_issue">Billing Issue</option>
                        <option value="transparency_violation">Transparency Violation</option>
                        <option value="terms_complaint">Terms Complaint</option>
                        <option value="positive">Positive Experience</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-sage-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        rows={4}
                        className="w-full bg-white border border-sage-300 rounded-lg px-3 py-2 text-ocean-800 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                        placeholder="Describe your experience..."
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-sage-700 mb-1">Estimated Bill ($)</label>
                        <input
                          type="number"
                          name="estimated_bill"
                          className="w-full bg-white border border-sage-300 rounded-lg px-3 py-2 text-ocean-800 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-sage-700 mb-1">Actual Bill ($)</label>
                        <input
                          type="number"
                          name="actual_bill"
                          className="w-full bg-white border border-sage-300 rounded-lg px-3 py-2 text-ocean-800 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={reportSubmitting}
                      className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-ocean-900 font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Reports */}
              {hospital.reports && hospital.reports.length > 0 ? (
                <div className="space-y-4">
                  {hospital.reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 bg-sage-50 rounded-lg border border-sage-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          report.report_type === 'positive'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {report.report_type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-sage-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sage-700 text-sm">{report.description}</p>
                      {(report.estimated_bill || report.actual_bill) && (
                        <div className="mt-2 text-xs text-sage-500">
                          {report.estimated_bill && `Estimated: $${report.estimated_bill.toLocaleString()}`}
                          {report.estimated_bill && report.actual_bill && ' | '}
                          {report.actual_bill && `Actual: $${report.actual_bill.toLocaleString()}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sage-500">
                  <p>No community reports yet.</p>
                  <p className="text-sm">Be the first to share your experience.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
