import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface AffiliateProgram {
  id: string;
  service_name: string;
  service_slug: string;
  description: string;
  price_display: string;
  price_type: string;
  category: string;
  rating: number;
  website_url: string;
  affiliate_link: string | null;
  features: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  best_for: string | null;
  is_active: boolean;
}

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

// Generate logo abbreviation from name
const getLogoAbbrev = (name: string): string => {
  const words = name.split(' ');
  if (words.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  return words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
};

// Convert database affiliate to TrustService format
const affiliateToService = (affiliate: AffiliateProgram): TrustService => ({
  id: affiliate.service_slug,
  name: affiliate.service_name,
  logo: getLogoAbbrev(affiliate.service_name),
  tagline: affiliate.description.substring(0, 60) + (affiliate.description.length > 60 ? '...' : ''),
  url: affiliate.affiliate_link || affiliate.website_url,
  pricing: {
    livingTrust: affiliate.price_display,
    healthcareDirective: 'Included',
    pricingModel: affiliate.price_type === 'one_time' ? 'One-time fee' :
                  affiliate.price_type === 'subscription' ? 'Subscription' :
                  affiliate.price_type,
  },
  features: affiliate.features || [],
  pros: affiliate.pros || [],
  cons: affiliate.cons || [],
  bestFor: affiliate.best_for || 'General estate planning needs',
  rating: affiliate.rating,
});

const OnlineTrustServicesComparison: React.FC = () => {
  const [selectedService, setSelectedService] = useState<TrustService | null>(null);
  const [services, setServices] = useState<TrustService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        const { data, error } = await supabase
          .from('affiliate_programs')
          .select('*')
          .eq('is_active', true)
          .order('rating', { ascending: false });

        if (error) {
          console.error('Error fetching affiliates:', error);
          return;
        }

        if (data) {
          const converted = data.map(affiliateToService);
          setServices(converted);
        }
      } catch (err) {
        console.error('Failed to fetch affiliates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliates();
  }, []);

  const sortedServices = [...services].sort((a, b) => b.rating - a.rating);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-gold-500' : 'text-sage-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-ocean-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <section className="bg-gradient-to-br from-sage-50 via-sage-100/50 to-ocean-50/30 py-16 border-t border-sage-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-ocean-600 text-sm font-medium mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Online Legal Services
          </span>
          <h2 className="text-3xl font-bold text-ocean-800 mb-4">
            Create Your Medical Trust Online
          </h2>
          <p className="text-lg text-ocean-600/80 max-w-3xl mx-auto">
            Compare the top online legal services for creating living trusts, healthcare directives,
            and powers of attorney - no lawyer required for basic estate planning.
          </p>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
          </div>
        ) : sortedServices.length === 0 ? (
          <div className="text-center py-16 text-ocean-600">
            <p>No legal services available at this time. Please check back later.</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sortedServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-sage-200 overflow-hidden hover:shadow-card-hover transition-shadow"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {service.logo}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{service.name}</h3>
                      <p className="text-sm text-ocean-100">{service.tagline}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="px-6 py-4 border-b border-sage-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ocean-600">Living Trust:</span>
                  <span className="font-bold text-gold-600">{service.pricing.livingTrust}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ocean-600">Healthcare Directive:</span>
                  <span className="font-medium text-ocean-800">{service.pricing.healthcareDirective}</span>
                </div>
                <div className="text-xs text-ocean-500 bg-sage-50 px-3 py-1.5 rounded-full inline-block">
                  {service.pricing.pricingModel}
                </div>
              </div>

              {/* Rating & Best For */}
              <div className="px-6 py-4 border-b border-sage-100">
                <div className="flex items-center justify-between mb-3">
                  {renderStars(service.rating)}
                </div>
                <p className="text-sm text-ocean-600">
                  <span className="font-medium text-ocean-800">Best for:</span> {service.bestFor}
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 flex gap-3">
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-gradient-to-r from-gold-500 to-gold-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-gold-600 hover:to-gold-700 transition-all shadow-sm hover:shadow-gold text-sm"
                >
                  Visit Site
                </a>
                <button
                  onClick={() => setSelectedService(service)}
                  className="px-4 py-2.5 border border-ocean-300 text-ocean-700 rounded-xl font-medium hover:bg-ocean-50 transition-colors text-sm"
                >
                  Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        {/* Lawyer vs Online Cost Comparison */}
        <div className="bg-gradient-to-br from-gold-50 via-amber-50 to-orange-50 rounded-2xl border border-gold-200 p-8 mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-ocean-800 mb-2">Why Online Services vs. Traditional Lawyers?</h3>
              <p className="text-ocean-600">See how much you can save while getting quality estate planning documents</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Traditional Lawyer */}
            <div className="bg-white/80 rounded-xl p-6 border border-sage-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-ocean-800">Traditional Attorney</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-sage-100">
                  <span className="text-ocean-600">Simple Living Trust</span>
                  <span className="font-bold text-ocean-800">$1,500 - $3,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-sage-100">
                  <span className="text-ocean-600">Complex Estate Plan</span>
                  <span className="font-bold text-ocean-800">$3,000 - $5,000+</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-sage-100">
                  <span className="text-ocean-600">High Net Worth</span>
                  <span className="font-bold text-ocean-800">$5,000 - $10,000+</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-ocean-600">Hourly Rate</span>
                  <span className="font-bold text-ocean-800">$250 - $600/hr</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-sage-200">
                <p className="text-sm text-ocean-500">
                  Best for: Complex estates, blended families, business owners, high-net-worth individuals
                </p>
              </div>
            </div>

            {/* Online Services */}
            <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gold-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                SAVE 70-90%
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold">Online Legal Services</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-ocean-100">Living Trust Package</span>
                  <span className="font-bold text-gold-300">$149 - $599</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-ocean-100">Healthcare Directive</span>
                  <span className="font-bold text-gold-300">Free - $50</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-ocean-100">Power of Attorney</span>
                  <span className="font-bold text-gold-300">Included</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-ocean-100">Updates & Changes</span>
                  <span className="font-bold text-gold-300">Free - $50/yr</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-ocean-100">
                  Best for: Standard estates, straightforward family situations, budget-conscious planning
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white/60 rounded-lg p-4 border border-gold-200">
            <p className="text-sm text-ocean-700 text-center">
              <strong className="text-ocean-800">Average savings:</strong> A family saving $2,000+ by using online services can invest that difference,
              potentially growing to $5,000+ over 10 years. Online services work well for 80% of families with straightforward estate planning needs.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-sage-200 overflow-hidden mb-12">
          <div className="px-6 py-4 bg-gradient-to-r from-sage-50 to-ocean-50/30 border-b border-sage-200">
            <h3 className="text-lg font-semibold text-ocean-800">Quick Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sage-50 border-b border-sage-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-ocean-700">Service</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-ocean-700">Trust Price</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-ocean-700">Pricing Model</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-ocean-700">Attorney Access</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-ocean-700">Rating</th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map((service, index) => (
                  <tr key={service.id} className={index % 2 === 0 ? 'bg-white' : 'bg-sage-50/50'}>
                    <td className="py-3 px-4">
                      <span className="font-medium text-ocean-800">{service.name}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-gold-600">
                      {service.pricing.livingTrust}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-ocean-600">
                      {service.pricing.pricingModel}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {service.id === 'rocketlawyer' ? (
                        <span className="text-green-600 font-medium">Included</span>
                      ) : service.id === 'legalzoom' ? (
                        <span className="text-gold-600">+$199</span>
                      ) : (
                        <span className="text-sage-400">Extra</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-gold-500">
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
        <div className="bg-gradient-to-br from-ocean-50 to-sage-100 rounded-2xl border border-ocean-200 p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-ocean-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-ocean-800 mb-2">Free Healthcare Directive Forms</h3>
              <p className="text-ocean-700 mb-4">
                Many states offer free advance directive forms. AARP provides free, state-specific forms:
              </p>
              <a
                href="https://www.aarp.org/caregiving/financial-legal/free-printable-advance-directives/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-ocean-700 hover:text-ocean-800 font-medium"
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
          <p className="text-xs text-ocean-500 max-w-2xl mx-auto">
            * Prices and features are subject to change. This comparison is for informational purposes only.
            Online services are best for straightforward estate planning. Consult an attorney for complex situations.
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
            className="fixed inset-0 bg-ocean-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 px-6 py-5 sticky top-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {selectedService.logo}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedService.name}</h3>
                      <p className="text-sm text-ocean-100">{selectedService.tagline}</p>
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
                  <h4 className="font-semibold text-ocean-800 mb-3">Pricing</h4>
                  <div className="bg-sage-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-ocean-600">Living Trust</span>
                      <span className="font-bold text-gold-600">{selectedService.pricing.livingTrust}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ocean-600">Healthcare Directive</span>
                      <span className="font-medium text-ocean-800">{selectedService.pricing.healthcareDirective}</span>
                    </div>
                    <div className="pt-2 border-t border-sage-200">
                      <span className="text-sm text-ocean-500">{selectedService.pricing.pricingModel}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-ocean-800 mb-3">Features Included</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {selectedService.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ocean-700">
                        <svg className="w-4 h-4 text-ocean-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
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
                        <li key={i} className="flex items-start gap-2 text-sm text-ocean-700">
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
                        <li key={i} className="flex items-start gap-2 text-sm text-ocean-700">
                          <span className="text-red-600">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4 border-t border-sage-200">
                  <a
                    href={selectedService.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-gradient-to-r from-gold-500 to-gold-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-gold-600 hover:to-gold-700 transition-all shadow-sm hover:shadow-gold"
                  >
                    Visit {selectedService.name}
                  </a>
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
