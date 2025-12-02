import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TreatmentGuidesTab: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('dental');

  const treatmentCategories = [
    {
      id: 'dental',
      title: 'Dental & Cosmetic',
      procedures: [
        {
          name: 'Full Mouth Restoration',
          savings: '80-85%',
          usaCost: '$60,000',
          globalCosts: [
            { country: 'Mexico', cost: '$8,000-12,000', city: 'Los Algodones' },
            { country: 'Costa Rica', cost: '$10,000-15,000', city: 'San José' },
            { country: 'Hungary', cost: '$9,000-13,000', city: 'Budapest' },
            { country: 'Thailand', cost: '$12,000-18,000', city: 'Bangkok' },
          ],
          description: 'Complete dental reconstruction including implants, crowns, and cosmetic work.',
          bestFor: 'Los Algodones, Mexico - "Molar City" with 350+ dentists for 5,400 residents. Same-day return possible from Arizona.'
        },
        {
          name: 'All-on-4 Implants',
          savings: '75-83%',
          usaCost: '$50,000',
          globalCosts: [
            { country: 'Mexico', cost: '$8,500', city: 'Tijuana' },
            { country: 'Costa Rica', cost: '$12,000', city: 'San José' },
            { country: 'Turkey', cost: '$9,000', city: 'Istanbul' },
          ],
        },
        {
          name: 'Single Dental Crown',
          savings: '87%',
          usaCost: '$2,000',
          globalCosts: [
            { country: 'Mexico', cost: '$250', city: 'Los Algodones' },
            { country: 'Costa Rica', cost: '$350', city: 'San José' },
            { country: 'Hungary', cost: '$300', city: 'Budapest' },
          ],
        },
      ]
    },
    {
      id: 'cosmetic',
      title: 'Cosmetic Surgery',
      procedures: [
        {
          name: 'Brazilian Butt Lift (BBL)',
          savings: '60-75%',
          usaCost: '$12,000-15,000',
          globalCosts: [
            { country: 'Brazil', cost: '$4,500', city: 'São Paulo', note: 'Where it was invented' },
            { country: 'Colombia', cost: '$4,000', city: 'Medellín' },
            { country: 'Mexico', cost: '$5,500', city: 'Tijuana' },
            { country: 'Dominican Republic', cost: '$3,500', city: 'Santo Domingo' },
          ],
        },
        {
          name: 'Hair Transplant (FUE)',
          savings: '80-90%',
          usaCost: '$15,000-25,000',
          globalCosts: [
            { country: 'Turkey', cost: '$2,500-4,000', city: 'Istanbul', note: 'World leader - 50x more procedures than US surgeons' },
            { country: 'India', cost: '$2,000', city: 'Mumbai' },
            { country: 'Thailand', cost: '$3,500', city: 'Bangkok' },
          ],
        },
        {
          name: 'Facelift',
          savings: '50-70%',
          usaCost: '$20,000',
          globalCosts: [
            { country: 'South Korea', cost: '$6,000', city: 'Seoul' },
            { country: 'Thailand', cost: '$8,000', city: 'Bangkok' },
            { country: 'Mexico', cost: '$7,500', city: 'Guadalajara' },
          ],
        },
      ]
    },
    {
      id: 'cardiac',
      title: 'Cardiac Surgery',
      procedures: [
        {
          name: 'Heart Bypass (CABG)',
          savings: '85-94%',
          usaCost: '$123,000',
          globalCosts: [
            { country: 'India', cost: '$7,900', city: 'Bangalore', note: 'Narayana Health - 30 surgeries/day, 98.5% success rate' },
            { country: 'Thailand', cost: '$15,000', city: 'Bangkok' },
            { country: 'Turkey', cost: '$11,000', city: 'Istanbul' },
            { country: 'Mexico', cost: '$27,000', city: 'Guadalajara' },
          ],
          description: 'Coronary artery bypass graft surgery to restore blood flow to the heart.',
          bestFor: 'Dr. Devi Shetty\'s Narayana Health in Bangalore performs 30 heart surgeries daily with higher success rates than Cleveland Clinic at 1/15th the cost.'
        },
        {
          name: 'Heart Valve Replacement',
          savings: '88-94%',
          usaCost: '$170,000',
          globalCosts: [
            { country: 'India', cost: '$9,500', city: 'Chennai' },
            { country: 'Thailand', cost: '$18,000', city: 'Bangkok' },
            { country: 'Singapore', cost: '$32,000', city: 'Singapore' },
          ],
        },
        {
          name: 'Angioplasty',
          savings: '84-94%',
          usaCost: '$57,000',
          globalCosts: [
            { country: 'India', cost: '$3,300', city: 'Delhi' },
            { country: 'Mexico', cost: '$9,500', city: 'Monterrey' },
            { country: 'Malaysia', cost: '$6,800', city: 'Kuala Lumpur' },
          ],
        },
      ]
    },
    {
      id: 'orthopedic',
      title: 'Orthopedic Surgery',
      procedures: [
        {
          name: 'Hip Replacement',
          savings: '70-83%',
          usaCost: '$40,364',
          globalCosts: [
            { country: 'India', cost: '$7,000', city: 'Delhi' },
            { country: 'Mexico', cost: '$13,000', city: 'Cancun' },
            { country: 'Thailand', cost: '$12,000', city: 'Bangkok' },
            { country: 'Malaysia', cost: '$8,500', city: 'Kuala Lumpur' },
          ],
          description: 'Complete hip replacement surgery with implant, hospital stay, and physiotherapy included.',
          bestFor: 'Professional athletes frequently travel abroad for faster scheduling, superior stem cell options (FDA-banned in US), and more aggressive rehabilitation protocols.'
        },
        {
          name: 'Knee Replacement',
          savings: '75-81%',
          usaCost: '$35,000',
          globalCosts: [
            { country: 'India', cost: '$6,600', city: 'Mumbai' },
            { country: 'Malaysia', cost: '$7,500', city: 'Penang' },
            { country: 'Colombia', cost: '$8,900', city: 'Bogotá' },
          ],
        },
        {
          name: 'Spinal Fusion',
          savings: '85-91%',
          usaCost: '$110,000',
          globalCosts: [
            { country: 'India', cost: '$10,000', city: 'Chennai' },
            { country: 'Thailand', cost: '$17,000', city: 'Bangkok' },
            { country: 'Turkey', cost: '$15,000', city: 'Istanbul' },
          ],
        },
      ]
    },
    {
      id: 'ivf',
      title: 'Fertility & IVF',
      procedures: [
        {
          name: 'IVF Cycle',
          savings: '70-90%',
          usaCost: '$15,000-30,000',
          globalCosts: [
            { country: 'Czech Republic', cost: '$3,000', city: 'Prague', note: '45% success rate under 35 vs USA 35%' },
            { country: 'Spain', cost: '$4,500-6,500', city: 'Barcelona' },
            { country: 'Greece', cost: '$3,500', city: 'Athens' },
            { country: 'Mexico', cost: '$4,900', city: 'Cancun' },
            { country: 'India', cost: '$2,500', city: 'Mumbai' },
          ],
          description: 'Complete IVF cycle including medications, monitoring, retrieval, and transfer.',
          bestFor: 'Czech Republic offers the highest success rates in Europe (45% under 35) with anonymous egg donation database and no waiting lists.'
        },
        {
          name: 'Gender Selection IVF',
          savings: '65-75%',
          usaCost: '$20,000+',
          globalCosts: [
            { country: 'Mexico', cost: '$7,000', city: 'Guadalajara', note: 'Legal' },
            { country: 'Cyprus', cost: '$8,000', city: 'Nicosia', note: 'Legal' },
          ],
        },
        {
          name: 'Egg Donation Cycle',
          savings: '80-90%',
          usaCost: '$30,000-50,000',
          globalCosts: [
            { country: 'Spain', cost: '$8,000', city: 'Madrid', note: '#1 globally - 50,000 procedures/year' },
            { country: 'Czech Republic', cost: '$4,500', city: 'Prague', note: 'Anonymous only' },
            { country: 'Greece', cost: '$5,000', city: 'Athens', note: 'Known or anonymous' },
          ],
        },
      ]
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-display text-gold-600 mb-4">Complete Procedure Intelligence</h2>
        <p className="text-ocean-700/80 max-w-3xl mx-auto">
          Comprehensive cost breakdowns, success rates, and destination recommendations for the most popular medical tourism procedures.
        </p>
      </div>

      {/* Category Cards */}
      <div className="space-y-4">
        {treatmentCategories.map((category) => (
          <motion.div
            key={category.id}
            className="bg-gradient-to-br from-ocean-600/10 to-transparent rounded-lg border border-gold-500/20 overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gold-500/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <h3 className="text-2xl font-display text-gold-600">{category.title}</h3>
                  <p className="text-sm text-ocean-600/60">{category.procedures.length} procedures</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedCategory === category.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-gold-600"
              >
                ▼
              </motion.div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedCategory === category.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-6">
                    {category.procedures.map((procedure: any, index) => (
                      <div
                        key={index}
                        className="bg-white/80 p-6 rounded-lg border border-gold-500/10"
                      >
                        {/* Procedure Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gold-600 mb-2">{procedure.name}</h4>
                            {procedure.description && (
                              <p className="text-ocean-700/70 text-sm mb-2">{procedure.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-ocean-600/50">Average Savings</div>
                            <div className="text-2xl font-bold text-green-600">{procedure.savings}</div>
                          </div>
                        </div>

                        {/* Cost Comparison */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between p-4 bg-red-500/10 border-l-4 border-red-500 rounded mb-3">
                            <span className="text-ocean-700">🇺🇸 United States</span>
                            <span className="text-red-500 font-bold text-lg">{procedure.usaCost}</span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3">
                            {procedure.globalCosts.map((location: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-green-500/10 border-l-4 border-green-500 rounded"
                              >
                                <div>
                                  <div className="text-ocean-700 font-bold">{location.country}</div>
                                  <div className="text-xs text-ocean-600/50">{location.city}</div>
                                  {location.note && (
                                    <div className="text-xs text-gold-600 mt-1">{location.note}</div>
                                  )}
                                </div>
                                <div className="text-green-600 font-bold">{location.cost}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Best For Section */}
                        {procedure.bestFor && (
                          <div className="bg-gold-500/10 p-4 rounded border-l-4 border-gold-500">
                            <div className="text-gold-600 font-bold mb-1">Best Destination</div>
                            <div className="text-ocean-700/80 text-sm">{procedure.bestFor}</div>
                          </div>
                        )}

                        {/* Search Button */}
                        <button
                          onClick={() => window.location.href = `/?specialty=${encodeURIComponent(procedure.name)}`}
                          className="mt-4 w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                        >
                          Search Facilities for {procedure.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Additional Info Section */}
      <div className="bg-gradient-to-r from-ocean-600/20 to-sage-200/50 p-8 rounded-lg border border-gold-500/20">
        <h3 className="text-2xl font-display text-gold-600 mb-4">Why Volume Creates Excellence</h3>
        <div className="grid md:grid-cols-2 gap-6 text-ocean-700/80">
          <div>
            <h4 className="text-gold-600 font-bold mb-2">The Expertise Equation</h4>
            <p className="text-sm mb-4">
              Turkish hair transplant surgeons perform 50x more procedures annually than their US counterparts.
              Higher volume leads to superior expertise through repetition - the same principle that makes
              specialized surgical centers outperform general hospitals.
            </p>
          </div>
          <div>
            <h4 className="text-gold-600 font-bold mb-2">The Cost Paradox</h4>
            <p className="text-sm mb-4">
              Dr. Devi Shetty's Narayana Health in Bangalore performs 30 heart surgeries daily with a 98.5% success rate -
              higher than Cleveland Clinic - at $7,900 vs $123,000. Volume drives down costs while simultaneously
              increasing quality through practice.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-gold-400 to-gold-600 p-8 rounded-lg text-center">
        <h3 className="text-2xl font-display text-white mb-4">Ready to Save 60-90% on Your Procedure?</h3>
        <p className="text-white/90 mb-6">
          Browse our 518 JCI-verified facilities across 39 countries
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-white text-gold-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-sage-50 transition-colors"
        >
          Search All Facilities
        </button>
      </div>
    </div>
  );
};

export default TreatmentGuidesTab;
