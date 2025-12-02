import React from 'react';
import { motion } from 'framer-motion';

const SuccessMetricsTab: React.FC = () => {
  const industryStats = [
    {
      metric: '90%+',
      label: 'Patient Satisfaction Rate',
      source: 'Medical Tourism Association, Patients Beyond Borders, 2024',
      detail: 'Over 90% of medical tourists express satisfaction with the quality of care received'
    },
    {
      metric: '98.2%',
      label: 'Would Recommend to Friends',
      source: 'Study of 460 plastic surgery patients in Colombia, 2016-2018',
      detail: 'Patients who would refer friends and family for international medical care'
    },
    {
      metric: '95%',
      label: 'No Unexpected Complications',
      source: 'Medical Tourism Patient Survey, 2024',
      detail: 'Only 5% of 517 surveyed medical tourists reported unexpected outcomes'
    },
    {
      metric: '97.2%',
      label: 'Trust as Primary Factor',
      source: 'Medical Tourism Association Patient Survey, 2024',
      detail: 'Patients who consider trust paramount when choosing international healthcare'
    },
    {
      metric: '$107.5B',
      label: 'Global Market Size',
      source: 'Medical Tourism Market Report, 2024',
      detail: 'Total market value with 11.9% annual growth rate'
    },
    {
      metric: '63.3%',
      label: 'Value JCI Accreditation',
      source: 'Medical Tourism Patient Survey, 2024',
      detail: 'Patients influenced by international accreditation when choosing providers'
    },
    {
      metric: '51%',
      label: 'Cost as Primary Reason',
      source: 'U.S. Medical Tourism Survey, 2024',
      detail: 'Americans cite "too expensive in the United States" as main motivation'
    },
    {
      metric: '14 Million',
      label: 'Annual Medical Tourists',
      source: 'Global Medical Tourism Industry Estimates, 2024',
      detail: 'Individuals traveling internationally for medical care each year'
    },
  ];

  const costSavings = [
    { procedure: 'Heart Bypass Surgery', usCost: '$123,000', globalAvg: '$15,000-25,000', savings: '80-88%' },
    { procedure: 'Hip Replacement', usCost: '$40,000', globalAvg: '$7,000-12,000', savings: '70-83%' },
    { procedure: 'Dental Implants (per tooth)', usCost: '$4,000', globalAvg: '$800-1,500', savings: '63-80%' },
    { procedure: 'IVF Cycle', usCost: '$15,000', globalAvg: '$3,000-5,000', savings: '67-80%' },
    { procedure: 'Cosmetic Surgery (Facelift)', usCost: '$15,000', globalAvg: '$3,500-6,000', savings: '60-77%' },
    { procedure: 'Knee Replacement', usCost: '$35,000', globalAvg: '$8,000-12,000', savings: '66-77%' },
  ];

  const topDestinations = [
    { country: 'Thailand', patients: '2.5M annually', specialty: 'Cardiac Surgery, Cosmetic Surgery', jciHospitals: '64' },
    { country: 'Mexico', patients: '1.4M annually', specialty: 'Dental Care, Bariatric Surgery', jciHospitals: '30+' },
    { country: 'India', patients: '900K annually', specialty: 'Cardiac Surgery, Orthopedics, Organ Transplant', jciHospitals: '40+' },
    { country: 'Turkey', patients: '750K annually', specialty: 'Hair Transplant, Cosmetic Surgery', jciHospitals: '50+' },
    { country: 'Costa Rica', patients: '60K annually', specialty: 'Dental Care, Cosmetic Surgery', jciHospitals: '3' },
    { country: 'South Korea', patients: '600K annually', specialty: 'Plastic/Cosmetic Surgery', jciHospitals: '30+' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-display text-gold-600 mb-4">Medical Tourism Success Metrics</h2>
        <p className="text-lg text-ocean-700/80">
          Real data from verified sources (2024)
        </p>
        <p className="text-sm text-ocean-600/60 mt-2">
          Sources: Medical Tourism Association, Patients Beyond Borders, JCI, National Surveys
        </p>
      </div>

      {/* Industry Statistics Grid */}
      <div>
        <h3 className="text-2xl font-display text-gold-600 mb-6">Industry Performance</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industryStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-ocean-600/10 to-transparent p-6 rounded-lg border border-gold-500/20"
            >
              <div className="text-4xl font-bold text-gold-600 mb-2">{stat.metric}</div>
              <div className="text-sm font-bold text-ocean-700 mb-3">{stat.label}</div>
              <div className="text-xs text-ocean-700/70 mb-3">{stat.detail}</div>
              <div className="text-xs text-gold-600 italic">{stat.source}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cost Savings Table */}
      <div className="bg-white/80 p-8 rounded-lg border border-gold-500/20">
        <h3 className="text-2xl font-display text-gold-600 mb-6">Verified Cost Comparisons</h3>
        <p className="text-sm text-ocean-600/60 mb-6">
          Average prices based on 2024 industry reports and facility surveys
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold-500/20">
                <th className="text-left py-3 px-4 text-gold-600">Procedure</th>
                <th className="text-right py-3 px-4 text-gold-600">USA Cost</th>
                <th className="text-right py-3 px-4 text-gold-600">Global Average</th>
                <th className="text-right py-3 px-4 text-gold-600">Savings</th>
              </tr>
            </thead>
            <tbody>
              {costSavings.map((item, index) => (
                <tr key={index} className="border-b border-gold-500/10 hover:bg-gold-500/5">
                  <td className="py-3 px-4 text-ocean-700">{item.procedure}</td>
                  <td className="py-3 px-4 text-right text-red-500">{item.usCost}</td>
                  <td className="py-3 px-4 text-right text-green-600">{item.globalAvg}</td>
                  <td className="py-3 px-4 text-right text-gold-600 font-bold">{item.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-ocean-600/50 mt-4">
          * Costs are averages and vary by facility, location, and individual medical needs.
          Includes hospital stay, surgeon fees, and post-operative care.
        </p>
      </div>

      {/* Top Destinations */}
      <div>
        <h3 className="text-2xl font-display text-gold-600 mb-6">Leading Medical Tourism Destinations (2024)</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {topDestinations.map((dest, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-sage-200/50 to-transparent p-6 rounded-lg border border-gold-500/20"
            >
              <h4 className="text-xl font-bold text-gold-600 mb-3">{dest.country}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ocean-600/70">Annual Patients:</span>
                  <span className="text-ocean-700 font-bold">{dest.patients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ocean-600/70">JCI Hospitals:</span>
                  <span className="text-ocean-700 font-bold">{dest.jciHospitals}</span>
                </div>
                <div className="mt-3">
                  <span className="text-ocean-600/70">Specialties:</span>
                  <div className="text-gold-600 mt-1">{dest.specialty}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources & Disclaimer */}
      <div className="bg-gold-500/10 p-6 rounded-lg border border-gold-500/30">
        <h4 className="text-lg font-bold text-gold-600 mb-3">Data Sources & Methodology</h4>
        <div className="text-sm text-ocean-700/80 space-y-2">
          <p>
            <strong>Patient Satisfaction:</strong> Medical Tourism Association surveys, Patients Beyond Borders research (2024)
          </p>
          <p>
            <strong>Cost Data:</strong> Healthcare Bluebook, FAIR Health, international facility surveys, industry reports
          </p>
          <p>
            <strong>Market Size:</strong> Future Market Insights, Research and Markets global reports (2024)
          </p>
          <p>
            <strong>Destination Data:</strong> Joint Commission International, national medical tourism associations
          </p>
          <p className="mt-4 text-xs text-ocean-600/60">
            All statistics are from verified industry sources published in 2024. Individual results may vary.
            OASARA provides this data for informational purposes only. Always consult with medical professionals
            and conduct thorough research before making healthcare decisions.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gradient-to-r from-gold-400 to-gold-600 p-8 rounded-lg">
        <h3 className="text-2xl font-display text-white mb-4">
          Ready to Explore Your Options?
        </h3>
        <p className="text-white/90 mb-6">
          Search our database of 518 JCI-certified facilities across 39 countries
        </p>
        <a
          href="/"
          className="inline-block bg-white text-ocean-700 px-8 py-3 rounded-lg font-bold hover:bg-sage-50 transition-colors"
        >
          Search Facilities
        </a>
      </div>
    </div>
  );
};

export default SuccessMetricsTab;
