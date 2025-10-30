import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WhyLeaveTab: React.FC = () => {
  const [bankruptciesCount, setBankruptciesCount] = useState(0);

  // Live bankruptcy counter (1 per minute)
  useEffect(() => {
    const interval = setInterval(() => {
      setBankruptciesCount(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const chargemasterExamples = [
    { item: 'Tylenol (acetaminophen)', hospital: '$37', actual: '$0.10', markup: '37,000%' },
    { item: 'Surgical gloves (pair)', hospital: '$53', actual: '$0.75', markup: '7,067%' },
    { item: 'Alcohol swab', hospital: '$23', actual: '$0.02', markup: '115,000%' },
    { item: 'Saline IV bag', hospital: '$787', actual: '$1.07', markup: '73,551%' },
    { item: 'MRI scan', hospital: '$3,500', actual: '$300 (Japan)', markup: '1,067%' },
    { item: 'Blood test CBC', hospital: '$384', actual: '$29 (Quest)', markup: '1,224%' },
  ];

  const deviceMarkup = [
    { location: 'Belgium hospital', cost: '$350' },
    { location: 'Mexico hospital', cost: '$1,200' },
    { location: 'Thailand hospital', cost: '$1,800' },
    { location: 'US hospital', cost: '$13,000' },
  ];

  const insuranceVsCash = [
    { procedure: 'Appendectomy', insurance: '$45,000', cash: '$3,000' },
    { procedure: 'Childbirth', insurance: '$32,000', cash: '$4,500' },
    { procedure: 'Knee MRI', insurance: '$3,200', cash: '$400' },
  ];

  const qualityRankings = [
    { rank: 1, country: 'France', flag: '🇫🇷' },
    { rank: 2, country: 'Italy', flag: '🇮🇹' },
    { rank: 6, country: 'Singapore', flag: '🇸🇬' },
    { rank: 7, country: 'Spain', flag: '🇪🇸' },
    { rank: 10, country: 'Japan', flag: '🇯🇵' },
    { rank: 37, country: 'United States', flag: '🇺🇸' },
  ];

  const infectionRates = [
    { facility: 'Bumrungrad International, Thailand', rate: '0.5%' },
    { facility: 'Fortis Hospitals, India', rate: '0.7%' },
    { facility: 'Hospital Angeles, Mexico', rate: '0.9%' },
    { facility: 'Singapore General', rate: '0.6%' },
    { facility: 'US Hospital Average', rate: '1.9%', highlight: true },
    { facility: 'Some US hospitals', rate: '4.2%', highlight: true },
  ];

  return (
    <div className="space-y-12">
      {/* Section 1: The Price Scandal */}
      <section>
        <h2 className="text-3xl font-serif text-[#D4AF37] mb-6">The Price Scandal Exposed</h2>

        {/* The Chargemaster Secret */}
        <div className="bg-gradient-to-br from-[#0B697A]/20 to-transparent p-8 rounded-lg border border-[#D4AF37]/20 mb-8">
          <h3 className="text-2xl font-serif text-[#D97925] mb-4">The Chargemaster Secret</h3>
          <p className="text-[#FFF8F0]/80 mb-6 leading-relaxed">
            Every hospital in America operates with a hidden price list called the "chargemaster" - a document that was
            literally illegal to share with patients until 2021. Even now, 95% of hospitals refuse to post real prices,
            choosing to pay the $300 daily fine rather than reveal their markups.
          </p>

          <h4 className="text-xl text-[#D4AF37] mb-4">Real Chargemaster Examples (2024 data)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D4AF37]/30">
                  <th className="text-left py-3 px-4 text-[#D4AF37]">Item</th>
                  <th className="text-right py-3 px-4 text-[#D4AF37]">Hospital Charge</th>
                  <th className="text-right py-3 px-4 text-[#D4AF37]">Actual Cost</th>
                  <th className="text-right py-3 px-4 text-[#D4AF37]">Markup</th>
                </tr>
              </thead>
              <tbody>
                {chargemasterExamples.map((item, index) => (
                  <tr key={index} className="border-b border-[#D4AF37]/10 hover:bg-[#D97925]/10 transition-colors">
                    <td className="py-3 px-4 text-[#FFF8F0]">{item.item}</td>
                    <td className="py-3 px-4 text-right text-red-400 font-bold">{item.hospital}</td>
                    <td className="py-3 px-4 text-right text-green-400">{item.actual}</td>
                    <td className="py-3 px-4 text-right text-[#D97925] font-bold">{item.markup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-[#FFF8F0]/50 mt-4">
            Source: RAND Corporation Hospital Pricing Study 2019-2024, CMS Hospital Price Transparency Data
          </p>
        </div>

        {/* Device Markup Conspiracy */}
        <div className="bg-gradient-to-br from-[#C17754]/20 to-transparent p-8 rounded-lg border border-[#D4AF37]/20 mb-8">
          <h3 className="text-2xl font-serif text-[#D97925] mb-4">The Device Markup Conspiracy</h3>
          <p className="text-[#FFF8F0]/80 mb-6">
            The Medtronic hip implant manufactured in Ireland costs:
          </p>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {deviceMarkup.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg text-center ${
                  index === 3
                    ? 'bg-red-500/20 border-2 border-red-500'
                    : 'bg-[#0B697A]/20 border border-[#D4AF37]/20'
                }`}
              >
                <div className="text-[#D4AF37] font-bold mb-2">{item.location}</div>
                <div className={`text-2xl font-bold ${index === 3 ? 'text-red-400' : 'text-[#FFF8F0]'}`}>
                  {item.cost}
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-[#D97925] font-bold text-center text-lg">
            Same factory. Same serial number. Same device.
          </p>
        </div>

        {/* Insurance Makes It Worse */}
        <div className="bg-gradient-to-br from-[#D97925]/20 to-transparent p-8 rounded-lg border border-[#D4AF37]/20">
          <h3 className="text-2xl font-serif text-[#D97925] mb-4">Insurance Makes It Worse</h3>
          <p className="text-[#FFF8F0]/80 mb-6 leading-relaxed">
            The Affordable Care Act's 80/20 rule means insurance companies keep 20% of all healthcare spending as profit.
            Higher hospital prices = higher insurance profits. They're not negotiating prices down - they're partners in the markup.
          </p>

          <h4 className="text-xl text-[#D4AF37] mb-4">Real Insurance vs Cash Prices (2024)</h4>
          <div className="space-y-4">
            {insuranceVsCash.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#0A0A0A]/50 rounded-lg">
                <span className="text-[#FFF8F0] font-bold">{item.procedure}</span>
                <div className="flex gap-4">
                  <div className="text-right">
                    <div className="text-xs text-[#FFF8F0]/50">Insurance Billed</div>
                    <div className="text-red-400 font-bold">{item.insurance}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#FFF8F0]/50">Cash Price</div>
                    <div className="text-green-400 font-bold">{item.cash}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: The Bankruptcy Epidemic */}
      <section>
        <h2 className="text-3xl font-serif text-[#D4AF37] mb-6">The Bankruptcy Epidemic</h2>

        <div className="bg-gradient-to-r from-red-900/30 to-red-700/20 p-8 rounded-lg border-2 border-red-500/50 mb-8">
          <h3 className="text-2xl font-serif text-red-400 mb-4 text-center">Live Bankruptcy Counter</h3>
          <div className="text-center">
            <div className="text-6xl font-bold text-red-400 mb-2">{bankruptciesCount}</div>
            <div className="text-[#FFF8F0]/80">Families filed for medical bankruptcy since you opened this page</div>
            <div className="text-sm text-[#FFF8F0]/50 mt-4">
              530,000 families per year = 1,452 per day = 60 per hour = 1 every minute
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0B697A]/20 p-6 rounded-lg border border-[#D4AF37]/20">
            <h4 className="text-xl text-[#D4AF37] mb-4">The Numbers That Matter</h4>
            <ul className="space-y-3 text-[#FFF8F0]/80">
              <li className="flex items-start gap-2">
                <span className="text-[#D97925] mt-1">•</span>
                <span><strong className="text-[#D4AF37]">66.5%</strong> of all US bankruptcies are tied to medical issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D97925] mt-1">•</span>
                <span><strong className="text-[#D4AF37]">530,000</strong> families file annually due to medical bills</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D97925] mt-1">•</span>
                <span>Average medical debt at bankruptcy: <strong className="text-[#D4AF37]">$42,000</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D97925] mt-1">•</span>
                <span><strong className="text-red-400">78% HAD health insurance</strong> when treatment began</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D97925] mt-1">•</span>
                <span><strong className="text-[#D4AF37]">45,000</strong> Americans die annually from lack of health insurance (Harvard Medical School)</span>
              </li>
            </ul>
            <p className="text-xs text-[#FFF8F0]/50 mt-4">Source: American Journal of Medicine, 2024</p>
          </div>

          <div className="bg-[#C17754]/20 p-6 rounded-lg border border-[#D4AF37]/20">
            <h4 className="text-xl text-[#D4AF37] mb-4">Who Goes Bankrupt</h4>
            <ul className="space-y-3 text-[#FFF8F0]/80">
              <li className="flex items-center justify-between">
                <span>Had health insurance</span>
                <span className="text-[#D97925] font-bold">75%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Had college education</span>
                <span className="text-[#D97925] font-bold">62%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Were homeowners</span>
                <span className="text-[#D97925] font-bold">77%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Median age</span>
                <span className="text-[#D97925] font-bold">44.9 years</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Had retirement savings wiped out</span>
                <span className="text-red-400 font-bold">52%</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: Quality Myth Shattered */}
      <section>
        <h2 className="text-3xl font-serif text-[#D4AF37] mb-6">Quality Myth Shattered</h2>

        {/* WHO Rankings */}
        <div className="bg-gradient-to-br from-[#0B697A]/20 to-transparent p-8 rounded-lg border border-[#D4AF37]/20 mb-8">
          <h3 className="text-2xl font-serif text-[#D97925] mb-4">WHO Healthcare Rankings</h3>
          <p className="text-[#FFF8F0]/80 mb-6">World Health Organization Global Rankings:</p>

          <div className="grid md:grid-cols-3 gap-4">
            {qualityRankings.map((item) => (
              <div
                key={item.rank}
                className={`p-4 rounded-lg text-center ${
                  item.rank === 37
                    ? 'bg-red-500/20 border-2 border-red-500'
                    : 'bg-[#0B697A]/20 border border-[#D4AF37]/20'
                }`}
              >
                <div className="text-4xl mb-2">{item.flag}</div>
                <div className="text-[#D4AF37] font-bold">#{item.rank}</div>
                <div className={`${item.rank === 37 ? 'text-red-400' : 'text-[#FFF8F0]'}`}>{item.country}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Infection Rates */}
        <div className="bg-gradient-to-br from-[#C17754]/20 to-transparent p-8 rounded-lg border border-[#D4AF37]/20">
          <h3 className="text-2xl font-serif text-[#D97925] mb-4">Surgical Site Infection Rates</h3>
          <p className="text-[#FFF8F0]/80 mb-6">Lower is better:</p>

          <div className="space-y-3">
            {infectionRates.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  item.highlight
                    ? 'bg-red-500/20 border-l-4 border-red-500'
                    : 'bg-[#0B697A]/10 border-l-4 border-green-500'
                }`}
              >
                <span className={item.highlight ? 'text-red-400' : 'text-[#FFF8F0]'}>
                  {item.facility}
                </span>
                <span className={`font-bold text-lg ${item.highlight ? 'text-red-400' : 'text-green-400'}`}>
                  {item.rate}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#FFF8F0]/50 mt-4">
            Source: Joint Commission International Quality Reports 2024, WHO Global Health Observatory
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-[#D97925] to-[#D4AF37] p-8 rounded-lg text-center">
        <h3 className="text-2xl font-serif text-white mb-4">Ready to Escape the US Healthcare System?</h3>
        <p className="text-white/90 mb-6">
          Search our 518 verified JCI-accredited facilities across 39 countries
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-white text-[#D97925] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#FFF8F0] transition-colors"
        >
          Search Facilities Now
        </button>
      </div>
    </div>
  );
};

export default WhyLeaveTab;
