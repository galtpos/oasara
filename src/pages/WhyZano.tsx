import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/Layout/SiteHeader';
import ZanoTutorials from '../components/Zano/ZanoTutorials';

const WhyZano: React.FC = () => {
  const problems = [
    {
      title: 'Credit Card Chargebacks',
      description: 'Providers lose 2-3% of revenue to chargebacks. Medical tourists can dispute charges months later, leaving providers unpaid for services already rendered.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      title: 'Bank Account Freezes',
      description: 'Banks routinely freeze accounts of medical providers serving international patients, citing "suspicious activity" for completely legitimate transactions.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'PayPal Holds & Restrictions',
      description: 'PayPal holds funds for 21+ days, charges 4-5% fees, and has banned medical providers without warning or recourse.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Insurance Company Surveillance',
      description: 'Every credit card transaction is reported. Insurance companies track your medical spending and can deny coverage or raise premiums based on your choices.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: 'International Wire Fees',
      description: 'Wire transfers cost $25-50 per transaction plus 3-5% currency conversion. Your bank and the receiving bank both take cuts.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Government Reporting',
      description: 'Banks report international transfers over $10,000. Your medical decisions become part of your permanent financial record.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const solutions = [
    {
      title: 'True Privacy',
      description: 'Zano uses ring signatures and stealth addresses. Your medical payments are untraceable and unlinkable.',
      highlight: 'Your health decisions stay private',
    },
    {
      title: 'No Chargebacks',
      description: 'Smart escrow protects both parties. Funds release when services are confirmed, eliminating chargeback fraud.',
      highlight: 'Fair for patients AND providers',
    },
    {
      title: 'Instant Settlement',
      description: 'Payments confirm in minutes, not days. No holds, no freezes, no waiting for bank approval.',
      highlight: '< 2 minute confirmation',
    },
    {
      title: 'Minimal Fees',
      description: 'Transaction fees under $0.01. No percentage cuts, no currency conversion fees, no middlemen.',
      highlight: 'Save 3-5% on every payment',
    },
    {
      title: 'Censorship Resistant',
      description: 'No bank can freeze your funds or block your transaction. Your money, your choice, always.',
      highlight: 'Unstoppable payments',
    },
    {
      title: 'Freedom Dollar Stability',
      description: 'Freedom Dollar is pegged to purchasing power, not fiat currency. Your medical fund maintains value.',
      highlight: 'Inflation-proof savings',
    },
  ];

  return (
    <div className="min-h-screen bg-sage-50">
      <SiteHeader />

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-6xl text-ocean-700 mb-6">
              Why <span className="text-gold-600">Zano</span> & Freedom Dollar?
            </h1>
            <p className="text-xl text-ocean-600/70 leading-relaxed max-w-3xl mx-auto">
              Traditional payment systems are broken for medical tourism. They spy on you, charge excessive fees,
              and can freeze your funds without warning. There's a better way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl text-ocean-700 mb-4">The Problem with Traditional Payments</h2>
            <p className="text-ocean-600/70 text-lg">Why credit cards, PayPal, and bank wires fail medical tourists</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem, index) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-red-200 shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  {problem.icon}
                </div>
                <h3 className="font-semibold text-ocean-700 text-lg mb-2">{problem.title}</h3>
                <p className="text-ocean-600/70 text-sm leading-relaxed">{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl text-ocean-700 mb-4">The Zano Solution</h2>
            <p className="text-ocean-600/70 text-lg">Privacy-preserving payments designed for medical sovereignty</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gold-300 shadow-lg"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-gold-100 text-gold-700 text-xs font-semibold mb-4">
                  {solution.highlight}
                </div>
                <h3 className="font-semibold text-ocean-700 text-lg mb-2">{solution.title}</h3>
                <p className="text-ocean-600/70 text-sm leading-relaxed">{solution.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Zano Tutorials */}
      <ZanoTutorials variant="full" />

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl text-ocean-700 mb-4">How It Works</h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: '1', title: 'Get Zano or Freedom Dollar', description: 'Convert fiat to Zano or Freedom Dollar through any major exchange. Takes 10 minutes.' },
              { step: '2', title: 'Find Your Provider', description: 'Browse 518 JCI-certified facilities on OASARA. Filter by specialty, location, and Zano acceptance.' },
              { step: '3', title: 'Pay Securely', description: 'Send payment to escrow. Funds release when you confirm services received. No chargebacks, no disputes.' },
              { step: '4', title: 'Your Privacy Intact', description: 'No bank records. No insurance reports. No government notifications. Just you and your healthcare.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-ocean-700 text-lg mb-1">{item.title}</h3>
                  <p className="text-ocean-600/70">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-gold-400 to-gold-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl text-white mb-6">Ready to Reclaim Your Medical Sovereignty?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands who are taking control of their healthcare decisions.
              Privacy is not a luxury—it's your right.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-8 py-4 rounded-lg bg-white text-ocean-700 font-semibold hover:scale-105 transition-transform shadow-lg"
              >
                Browse Facilities
              </Link>
              <Link
                to="/action"
                className="px-8 py-4 rounded-lg bg-ocean-600 text-white font-semibold hover:scale-105 transition-transform shadow-lg"
              >
                Take the Pledge
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-sage-200 bg-sage-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-ocean-600 text-base italic max-w-3xl mx-auto leading-relaxed">
            "In the desert of captured healthcare, Oasara is your oasis — a sanctuary where medical sovereignty flows freely."
          </p>
          <p className="text-ocean-600/60 text-sm mt-6">
            Privacy-preserving medical marketplace. No tracking. No cookies. Your sovereignty.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WhyZano;
