import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface TrustService {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  url: string;
  pricing: {
    livingTrust: string;
    healthcareDirective: string;
    pricingModel: string;
  };
  features: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  rating: number;
}

const services: TrustService[] = [
  {
    id: 'legalzoom',
    name: 'LegalZoom',
    logo: 'LZ',
    tagline: 'Most recognized name in online legal services',
    url: 'https://www.legalzoom.com/personal/estate-planning/living-trust-overview.html',
    pricing: {
      livingTrust: '$399',
      healthcareDirective: '$39',
      pricingModel: 'Pay per document',
    },
    features: [
      'Living Trust with Pour-Over Will',
      'Financial Power of Attorney',
      'Healthcare Directive',
      'HIPAA Authorization',
      'Property Transfer Guide',
      'Attorney Review Available ($199 extra)',
    ],
    pros: [
      'Established since 2001 with strong reputation',
      'Pay only for what you need',
      'Includes testamentary trust option',
      'Extensive customer support',
    ],
    cons: [
      'Higher prices than competitors',
      'Attorney access costs extra',
      'Less detailed questionnaire',
    ],
    bestFor: 'One-time users who want a trusted brand',
    rating: 4.2,
  },
  {
    id: 'rocketlawyer',
    name: 'Rocket Lawyer',
    logo: 'RL',
    tagline: 'Unlimited legal documents with subscription',
    url: 'https://www.rocketlawyer.com/family-and-personal/estate-planning',
    pricing: {
      livingTrust: 'Included in $39.99/mo',
      healthcareDirective: 'Included',
      pricingModel: 'Subscription ($39.99/mo)',
    },
    features: [
      'Unlimited Legal Documents',
      'Living Trust & Will',
      'All Power of Attorney Forms',
      'Healthcare Directive',
      'Attorney Q&A Included',
      '40% Off Attorney Consultations',
      'Digital Signatures',
    ],
    pros: [
      'Best value for multiple documents',
      'Attorney access included',
      'BBB A+ Rating',
      'Pet guardian provisions',
      '$1 first week trial',
    ],
    cons: [
      'Ongoing subscription required',
      'No testamentary trust option',
      'Must cancel to stop charges',
    ],
    bestFor: 'Users needing multiple documents or ongoing legal needs',
    rating: 4.4,
  },
  {
    id: 'trustandwill',
    name: 'Trust & Will',
    logo: 'T&W',
    tagline: 'Modern estate planning made simple',
    url: 'https://trustandwill.com/learn/living-trust',
    pricing: {
      livingTrust: '$499 individual / $599 couples',
      healthcareDirective: 'Included',
      pricingModel: 'Flat-rate packages',
    },
    features: [
      'State-Specific Documents',
      'Intuitive Modern Interface',
      'Living Trust + Will',
      'Power of Attorney',
      'Healthcare Directive',
      'Guardian Nomination',
      'Free Unlimited Updates',
    ],
    pros: [
      'Clean, modern user experience',
      'Transparent flat-rate pricing',
      'Free document updates for life',
      'In-house legal team reviewed',
    ],
    cons: [
      'Higher price than some competitors',
      'No attorney consultation included',
      'Limited to estate planning only',
    ],
    bestFor: 'Tech-savvy users wanting a premium experience',
    rating: 4.6,
  },
  {
    id: 'nolo',
    name: 'Nolo WillMaker',
    logo: 'NOLO',
    tagline: 'Trusted legal publisher since 1971',
    url: 'https://www.willmaker.com/',
    pricing: {
      livingTrust: '$149 (software)',
      healthcareDirective: 'Included',
      pricingModel: 'One-time software purchase',
    },
    features: [
      'Desktop Software + Online Access',
      'Comprehensive Estate Planning',
      'Living Trust Creation',
      'All 50 States Supported',
      'Executor & Beneficiary Guides',
      'Pet Care Instructions',
      'Educational Resources',
    ],
    pros: [
      'Best value for complete package',
      'Extensive educational content',
      'No recurring fees',
      '50+ years of legal publishing',
    ],
    cons: [
      'Interface feels dated',
      'Software requires installation',
      'Less hand-holding than competitors',
    ],
    bestFor: 'DIY users who want comprehensive software',
    rating: 4.3,
  },
  {
    id: 'gentreo',
    name: 'Gentreo',
    logo: 'GEN',
    tagline: 'Family-focused estate planning',
    url: 'https://www.gentreo.com/trust',
    pricing: {
      livingTrust: '$150 first year, then $50/year',
      healthcareDirective: 'Included',
      pricingModel: 'Annual subscription',
    },
    features: [
      'Living Trust & Will',
      'Pet Trust Available',
      'Power of Attorney',
      'Healthcare Directive',
      'Digital Vault Storage',
      'Family Sharing',
      'Unlimited Updates',
    ],
    pros: [
      'Affordable annual subscription',
      'Great for families',
      'Digital vault included',
      'Pet trust option',
    ],
    cons: [
      'Must maintain subscription for access',
      'Less established brand',
      'Fewer attorney resources',
    ],
    bestFor: 'Families wanting ongoing estate management',
    rating: 4.1,
  },
  {
    id: 'totallegal',
    name: 'TotalLegal',
    logo: 'TL',
    tagline: 'Budget-friendly legal documents',
    url: 'https://www.totallegal.com/estate-planning',
    pricing: {
      livingTrust: '$19.95/document OR $9.95/mo',
      healthcareDirective: '$19.95 or included',
      pricingModel: 'Per document or subscription',
    },
    features: [
      'Individual Document Purchase',
      'Living Will',
      'Power of Attorney',
      'Healthcare Directive',
      'Attorney Access (Premium)',
      'Online Document Storage',
    ],
    pros: [
      'Lowest per-document price',
      'Flexible payment options',
      'Good for simple needs',
    ],
    cons: [
      'Limited trust options',
      'Basic interface',
      'Less comprehensive than others',
    ],
    bestFor: 'Budget-conscious users with simple needs',
    rating: 3.8,
  },
  {
    id: 'freewill',
    name: 'FreeWill',
    logo: 'FW',
    tagline: 'Free wills funded by nonprofits',
    url: 'https://www.freewill.com/',
    pricing: {
      livingTrust: 'Free (CA only)',
      healthcareDirective: 'Free',
      pricingModel: 'Free (nonprofit-funded)',
    },
    features: [
      'Free Last Will & Testament',
      'Free Power of Attorney',
      'Free Healthcare Directive',
      'Living Trust (California Only)',
      'Charitable Giving Integration',
      'Simple Interface',
    ],
    pros: [
      'Completely free to use',
      'Simple and straightforward',
      'No upsells or hidden fees',
      'Great for basic wills',
    ],
    cons: [
      'Living trusts only in California',
      'Encourages charitable giving',
      'Limited customization',
      'No attorney support',
    ],
    bestFor: 'Users wanting free basic documents',
    rating: 4.0,
  },
];

// Database affiliate link overrides (keyed by service ID)
interface AffiliateOverride {
  affiliate_link?: string;
  is_active: boolean;
}

const OnlineTrustServicesComparison: React.FC = () => {
  const [selectedService, setSelectedService] = useState<TrustService | null>(null);
  const [affiliateOverrides, setAffiliateOverrides] = useState<Record<string, AffiliateOverride>>({});

  // Fetch affiliate link overrides from database
  useEffect(() => {
    const fetchAffiliateData = async () => {
      try {
        const { data, error } = await supabase
          .from('affiliate_programs')
          .select('service_slug, affiliate_link, is_active')
          .eq('is_active', true);

        if (!error && data) {
          const overrides: Record<string, AffiliateOverride> = {};
          data.forEach(item => {
            overrides[item.service_slug] = {
              affiliate_link: item.affiliate_link,
              is_active: item.is_active
            };
          });
          setAffiliateOverrides(overrides);
        }
      } catch (err) {
        // Silently fail - use static links
        console.log('Using static affiliate links');
      }
    };

    fetchAffiliateData();
  }, []);

  // Track affiliate link clicks
  const trackClick = async (serviceId: string, url: string) => {
    try {
      // Try to increment click count in database
      await supabase.rpc('increment_affiliate_click', { program_slug: serviceId });
    } catch (err) {
      // Silently fail
    }
    // Open the link
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Get the URL for a service (use affiliate link if available)
  const getServiceUrl = (service: TrustService): string => {
    const override = affiliateOverrides[service.id];
    if (override?.affiliate_link) {
      return override.affiliate_link;
    }
    return service.url;
  };

  const sortedServices = [...services].sort((a, b) => b.rating - a.rating);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-gold-500' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <section className="bg-gradient-to-br from-slate-50 to-teal-50/30 py-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-teal-600 text-sm font-medium mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Online Legal Services
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your Medical Trust Online
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Compare the top online legal services for creating living trusts, healthcare directives,
            and powers of attorney - no lawyer required for basic estate planning.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sortedServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {service.logo}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{service.name}</h3>
                      <p className="text-sm text-teal-100">{service.tagline}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Living Trust:</span>
                  <span className="font-bold text-teal-700">{service.pricing.livingTrust}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Healthcare Directive:</span>
                  <span className="font-medium text-gray-900">{service.pricing.healthcareDirective}</span>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full inline-block">
                  {service.pricing.pricingModel}
                </div>
              </div>

              {/* Rating & Best For */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  {renderStars(service.rating)}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Best for:</span> {service.bestFor}
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 flex gap-3">
                <button
                  onClick={() => trackClick(service.id, getServiceUrl(service))}
                  className="flex-1 text-center bg-teal-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-teal-700 transition-colors text-sm"
                >
                  Visit Site
                </button>
                <button
                  onClick={() => setSelectedService(service)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-12">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Trust Price</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Pricing Model</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Attorney Access</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map((service, index) => (
                  <tr key={service.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-teal-700">
                      {service.pricing.livingTrust}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {service.pricing.pricingModel}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {service.id === 'rocketlawyer' ? (
                        <span className="text-green-600 font-medium">Included</span>
                      ) : service.id === 'legalzoom' ? (
                        <span className="text-amber-600">+$199</span>
                      ) : (
                        <span className="text-gray-400">Extra</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-gold-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {service.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Free Resources */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Free Healthcare Directive Forms</h3>
              <p className="text-emerald-700 mb-4">
                Many states offer free advance directive forms. AARP provides free, state-specific forms:
              </p>
              <a
                href="https://www.aarp.org/caregiving/financial-legal/free-printable-advance-directives/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium"
              >
                Get Free State Forms from AARP
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            * Prices and features are subject to change. This comparison is for informational purposes only.
            Online services are best for straightforward estate planning. Consult an attorney for complex situations.
            Some links may be affiliate links - we may earn a commission at no extra cost to you.
          </p>
        </div>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 sticky top-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {selectedService.logo}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedService.name}</h3>
                      <p className="text-sm text-teal-100">{selectedService.tagline}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-white/80 hover:text-white p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Pricing */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Living Trust</span>
                      <span className="font-bold text-teal-700">{selectedService.pricing.livingTrust}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Healthcare Directive</span>
                      <span className="font-medium">{selectedService.pricing.healthcareDirective}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-500">{selectedService.pricing.pricingModel}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Features Included</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {selectedService.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pros & Cons */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Pros</h4>
                    <ul className="space-y-1">
                      {selectedService.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-600">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Cons</h4>
                    <ul className="space-y-1">
                      {selectedService.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-red-600">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => trackClick(selectedService.id, getServiceUrl(selectedService))}
                    className="block w-full text-center bg-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Visit {selectedService.name} →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default OnlineTrustServicesComparison;
