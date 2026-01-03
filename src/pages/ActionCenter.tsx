import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/Layout/SiteHeader';
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
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [pledgeCounts, setPledgeCounts] = useState<PledgeCounts>({
    medical_trust: 0,
    cancel_insurance: 0,
    try_medical_tourism: 0,
  });

  const pledgeTagMap: Record<string, string> = {
    medical_trust: 'PledgeTrust',
    cancel_insurance: 'PledgeExit',
    try_medical_tourism: 'PledgeTourism',
  };

  const pledges = [
    {
      id: 'medical_trust',
      title: 'Form a Medical Trust',
      shortDesc: 'Protect your assets from medical debt',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      details: {
        why: 'Medical debt is the #1 cause of bankruptcy in America. A trust shields your home, savings, and investments from creditors.',
        cost: '$500 - $2,000 to establish',
        bestStates: 'Nevada, South Dakota, Delaware',
        link: '/medical-trusts',
        linkText: 'See state-by-state guide →'
      }
    },
    {
      id: 'cancel_insurance',
      title: 'Cancel Your Insurance',
      shortDesc: 'Stop paying $24K/year for denied claims',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      details: {
        why: 'Average family pays $24,000/year in premiums + $3,000 deductible. 18% of claims denied. Your data shared with employers, government, data brokers.',
        how: [
          { timing: 'Open Enrollment (Nov 1 - Jan 15)', action: "Don't renew. Let it lapse." },
          { timing: 'Special Enrollment', action: 'Job change, move, or marriage = 60-day window' },
          { timing: 'COBRA', action: '60 days to decide. $600-2000/mo bridge option.' },
        ],
        alternatives: [
          { name: 'Direct Primary Care', cost: '$50-150/mo', benefit: 'Unlimited doctor visits' },
          { name: 'Health Sharing', cost: '$200-500/mo', benefit: 'Community-based, no network' },
          { name: 'Medical Tourism', cost: '60-90% savings', benefit: 'World-class care abroad' },
        ]
      }
    },
    {
      id: 'try_medical_tourism',
      title: 'Use Medical Tourism',
      shortDesc: 'Save 60-90% on procedures',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      details: {
        why: '518 JCI-accredited facilities worldwide. Same surgeons (many US-trained). Same technology. 60-90% less.',
        savings: [
          { procedure: 'Hip Replacement', us: '$40,000', abroad: '$12,000', location: 'Costa Rica' },
          { procedure: 'Knee Replacement', us: '$35,000', abroad: '$9,000', location: 'Mexico' },
          { procedure: 'Dental Implants', us: '$4,000', abroad: '$900', location: 'Colombia' },
        ],
        link: '/',
        linkText: 'Browse 518 facilities →'
      }
    },
  ];

  useEffect(() => {
    fetchPledgeCounts();
  }, []);

  const fetchPledgeCounts = async () => {
    try {
      const { data, error } = await supabase.from('pledges').select('pledge_type');
      if (error) throw error;
      const counts: PledgeCounts = { medical_trust: 0, cancel_insurance: 0, try_medical_tourism: 0 };
      data?.forEach((pledge: { pledge_type: string }) => {
        if (pledge.pledge_type in counts) counts[pledge.pledge_type as keyof PledgeCounts]++;
      });
      setPledgeCounts(counts);
    } catch (err) {
      console.error('Error fetching pledge counts:', err);
    }
  };

  const togglePledge = (pledgeId: string) => {
    setSelectedPledges(prev => prev.includes(pledgeId) ? prev.filter(id => id !== pledgeId) : [...prev, pledgeId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPledges.length === 0) { setError('Select at least one pledge'); return; }
    setLoading(true);
    setError('');

    try {
      const pledgeInserts = selectedPledges.map(pledgeType => ({
        email: email.toLowerCase().trim(),
        name: name.trim() || null,
        pledge_type: pledgeType,
      }));
      const { error: insertError } = await supabase.from('pledges').insert(pledgeInserts);
      if (insertError) throw insertError;

      const mailchimpTags = selectedPledges.map(id => pledgeTagMap[id]).filter(Boolean);
      mailchimpTags.push('Pledge');
      try {
        await supabase.functions.invoke('mailchimp-subscribe-oasara', {
          body: { email: email.toLowerCase().trim(), name: name.trim() || undefined, tags: mailchimpTags },
        });
      } catch {}

      setSuccess(true);
      setEmail('');
      setName('');
      setSelectedPledges([]);
      fetchPledgeCounts();
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPledges = pledgeCounts.medical_trust + pledgeCounts.cancel_insurance + pledgeCounts.try_medical_tourism;

  return (
    <div className="min-h-screen bg-slate-900">
      <SiteHeader />

      {/* HERO - Revolution Statement */}
      <section className="relative py-16 px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/20 via-transparent to-transparent" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            
            {/* Crisis Stats */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                530,000 Americans file bankruptcy from medical bills every year
              </div>
            </div>

            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight">
              THE HEALTHCARE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">REVOLUTION</span>
            </h1>
            
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
              66.5% of bankruptcies are medical. Even with insurance.<br />
              <span className="text-white font-semibold">The system is designed to extract your wealth. Exit it.</span>
            </p>

            {/* Share CTA */}
            <div className="flex justify-center gap-3 mb-8">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Join the Healthcare Revolution. Take the pledge:")}&url=${encodeURIComponent("https://oasara.com/action")}&hashtags=HealthcareSovereignty`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share on X
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("https://oasara.com/action");
                  alert("Link copied to clipboard!");
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Share
              </button>
            </div>

            {/* Live Counter */}
            <div className="flex justify-center gap-6 md:gap-12 mb-12">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gold-400">{totalPledges}</div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">Have Pledged</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gold-400">{pledgeCounts.cancel_insurance}</div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">Exiting Insurance</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gold-400">{pledgeCounts.try_medical_tourism}</div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">Going Abroad</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* THE PLEDGE - Anthem */}
      <section className="py-12 px-6 bg-gradient-to-r from-ocean-900 via-ocean-800 to-ocean-900 border-y border-gold-500/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h2 className="text-gold-400 text-sm font-bold uppercase tracking-widest mb-6">The Pledge</h2>
            <div className="space-y-2 text-xl md:text-2xl text-white font-display leading-relaxed">
              <p>I PLEDGE MY BODY IS MY OWN</p>
              <p>MY RECORDS ARE MY PROPERTY</p>
              <p className="text-gold-400">I PLEDGE TO FORM A MEDICAL TRUST</p>
              <p className="text-gold-400">TO CANCEL MY INSURANCE</p>
              <p className="text-gold-400">TO PAY DOCTORS DIRECTLY</p>
            </div>
            <p className="mt-6 text-slate-300 italic">
              "My body, my choice, my records, my rules."
            </p>
          </motion.div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="py-16 px-6 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-display text-white mb-4">
            Three Actions. Total Freedom.
          </h2>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Each pillar reinforces the others. Together, they free you from the medical-industrial complex.
          </p>

          <div className="space-y-4">
            {pledges.map((pledge, index) => (
              <motion.div
                key={pledge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
              >
                {/* Pledge Header - Always Visible */}
                <div 
                  className={`p-6 cursor-pointer transition-all ${
                    selectedPledges.includes(pledge.id) ? 'bg-gold-500/10 border-l-4 border-gold-500' : 'hover:bg-slate-700/50'
                  }`}
                  onClick={() => togglePledge(pledge.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedPledges.includes(pledge.id)
                        ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {pledge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-white text-xl">{pledge.title}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gold-500/20 text-gold-400 font-medium">
                          {pledgeCounts[pledge.id as keyof PledgeCounts]} pledged
                        </span>
                      </div>
                      <p className="text-slate-400">{pledge.shortDesc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedPillar(expandedPillar === pledge.id ? null : pledge.id); }}
                        className="text-slate-400 hover:text-white text-sm underline"
                      >
                        {expandedPillar === pledge.id ? 'Hide details' : 'Learn more'}
                      </button>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                        selectedPledges.includes(pledge.id) ? 'border-gold-500 bg-gold-500' : 'border-slate-500'
                      }`}>
                        {selectedPledges.includes(pledge.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedPillar === pledge.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-slate-700 bg-slate-800/50 p-6"
                  >
                    {pledge.id === 'medical_trust' && pledge.details && (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-gold-400 font-semibold mb-2">Why It Matters</h4>
                          <p className="text-slate-300 text-sm">{pledge.details.why}</p>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-slate-400 text-sm">Setup Cost:</span>
                            <span className="text-white ml-2 font-semibold">{pledge.details.cost}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-sm">Best States:</span>
                            <span className="text-white ml-2 font-semibold">{pledge.details.bestStates}</span>
                          </div>
                          <Link to={pledge.details.link || '#'} className="inline-block text-gold-400 hover:text-gold-300 font-medium text-sm">
                            {pledge.details.linkText}
                          </Link>
                        </div>
                      </div>
                    )}

                    {pledge.id === 'cancel_insurance' && pledge.details && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-gold-400 font-semibold mb-2">The Math</h4>
                          <p className="text-slate-300 text-sm">{pledge.details.why}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-gold-400 font-semibold mb-3">How to Cancel</h4>
                          <div className="grid md:grid-cols-3 gap-3">
                            {pledge.details.how?.map((step, i) => (
                              <div key={i} className="bg-slate-700/50 rounded-lg p-4">
                                <div className="text-white font-medium text-sm mb-1">{step.timing}</div>
                                <div className="text-slate-400 text-sm">{step.action}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-gold-400 font-semibold mb-3">What Instead?</h4>
                          <div className="grid md:grid-cols-3 gap-3">
                            {pledge.details.alternatives?.map((alt, i) => (
                              <div key={i} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                                <div className="text-emerald-400 font-medium text-sm">{alt.name}</div>
                                <div className="text-white font-bold">{alt.cost}</div>
                                <div className="text-slate-400 text-xs">{alt.benefit}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {pledge.id === 'try_medical_tourism' && pledge.details && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-gold-400 font-semibold mb-2">Why It Works</h4>
                          <p className="text-slate-300 text-sm">{pledge.details.why}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-gold-400 font-semibold mb-3">Real Savings</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-slate-400">
                                  <th className="pb-2">Procedure</th>
                                  <th className="pb-2">US Price</th>
                                  <th className="pb-2">Abroad</th>
                                  <th className="pb-2">Location</th>
                                </tr>
                              </thead>
                              <tbody className="text-white">
                                {pledge.details.savings?.map((row, i) => (
                                  <tr key={i} className="border-t border-slate-700">
                                    <td className="py-2">{row.procedure}</td>
                                    <td className="py-2 text-red-400 line-through">{row.us}</td>
                                    <td className="py-2 text-emerald-400 font-bold">{row.abroad}</td>
                                    <td className="py-2 text-slate-400">{row.location}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <Link to={pledge.details.link || '#'} className="inline-block mt-4 text-gold-400 hover:text-gold-300 font-medium text-sm">
                            {pledge.details.linkText}
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLEDGE FORM */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-xl mx-auto">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-2xl p-12 border border-gold-500/50 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-3xl text-white mb-4">You're In.</h2>
              <p className="text-slate-300 mb-6">
                Welcome to the revolution. Check your email for next steps.
              </p>
              
              {/* Social Sharing */}
              <div className="mb-8">
                <p className="text-slate-400 text-sm mb-4">Spread the word:</p>
                <div className="flex justify-center gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just pledged to take control of my healthcare. Join the revolution:")}&url=${encodeURIComponent("https://oasara.com/action")}&hashtags=HealthcareSovereignty,MedicalFreedom`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2]/20 border border-[#1DA1F2]/40 text-[#1DA1F2] hover:bg-[#1DA1F2]/30 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    <span className="font-medium">Share</span>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://oasara.com/action")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#1877F2] hover:bg-[#1877F2]/30 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    <span className="font-medium">Share</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("https://oasara.com/action");
                      alert("Link copied!");
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span className="font-medium">Copy Link</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSuccess(false)}
                className="px-8 py-3 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors"
              >
                Pledge Again
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-2xl font-display text-white mb-2 text-center">Take The Pledge</h3>
              <p className="text-slate-400 text-center mb-6">Select your commitments above, then join.</p>
              
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-all"
                  placeholder="Your name (optional)"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm mb-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || selectedPledges.length === 0}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 py-4 rounded-lg font-bold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-gold-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Joining...' : selectedPledges.length === 0 ? 'Select Pledges Above' : `JOIN THE REVOLUTION (${selectedPledges.length} pledge${selectedPledges.length !== 1 ? 's' : ''})`}
              </button>

              <p className="text-center text-slate-500 text-xs mt-4">
                Your data stays sovereign. We never share your information.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-lg italic mb-4">
            "The healthcare system won't fix itself. But we can exit it. Together."
          </p>
          <p className="text-slate-500 text-sm">
            oasara.com — Healthcare without borders. Sovereignty without compromise.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ActionCenter;
