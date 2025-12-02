import React from 'react';

const PlanningToolsTab: React.FC = () => {

  const checklists = {
    documents: [
      { item: 'Passport (valid 6+ months beyond travel)', required: true },
      { item: 'Medical records (last 2 years)', required: true },
      { item: 'Current medication list', required: true },
      { item: 'Allergies documentation', required: true },
      { item: 'Insurance cards (even if not covered)', required: true },
      { item: 'Emergency contact list', required: true },
      { item: 'Power of attorney (medical decisions)', required: false },
      { item: 'Surgical clearance from primary doctor', required: false },
      { item: 'Recent imaging (X-rays, MRI, CT scans)', required: false },
      { item: 'Blood work (within 30 days)', required: false },
    ],
    insurance: [
      { name: 'Medjet Assist', cost: '$399/year', coverage: 'Medical evacuation to home hospital', benefit: 'Unlimited' },
      { name: 'Seven Corners', cost: '$50-200/trip', coverage: 'Complications from planned procedures', benefit: '$100,000' },
      { name: 'Global Protective Solutions', cost: '$200-500', coverage: 'Surgery-specific complications', benefit: '$250,000' },
      { name: 'Allianz Travel', cost: '5-10% of trip cost', coverage: 'Emergency medical, evacuation', benefit: '$50k-$1M' },
    ],
    recovery: [
      { procedure: 'Dental (single implant)', days: '3-5', flyingReady: 'Immediate', returnToWork: 'Immediate' },
      { procedure: 'Cosmetic (facelift)', days: '10-14', flyingReady: '10-14 days', returnToWork: '2-3 weeks' },
      { procedure: 'Hip replacement', days: '10-14', flyingReady: '10-14 days', returnToWork: '6-8 weeks' },
      { procedure: 'Cardiac bypass', days: '14-21', flyingReady: '14-21 days', returnToWork: '8-12 weeks' },
    ],
  };

  const questions = {
    clinical: [
      'How many of this procedure have you performed annually?',
      'What is your success rate?',
      'What is your infection rate?',
      'Who is my specific surgeon?',
      'Where did they train?',
      'Can I speak to previous patients?',
    ],
    logistical: [
      'What\'s included in the quoted price?',
      'Do you provide airport pickup?',
      'Is a companion\'s accommodation included?',
      'How long is recovery before flying?',
      'What if complications occur?',
      'Is follow-up care included?',
    ],
    financial: [
      'What payment methods are accepted?',
      'When is payment due?',
      'Is there a deposit required?',
      'What is your refund policy if cancelled?',
      'What\'s not included in the quote?',
      'Do you accept my insurance?',
    ],
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-display text-gold-600 mb-4">Your Complete Medical Tourism Toolkit</h2>
        <p className="text-ocean-700/80 max-w-3xl mx-auto">
          Essential checklists, insurance guides, quality verification tools, and planning resources for your medical journey abroad.
        </p>
      </div>

      {/* Pre-Departure Checklist */}
      <div className="bg-gradient-to-br from-ocean-600/10 to-transparent p-8 rounded-lg border border-gold-500/20">
        <h3 className="text-2xl font-display text-gold-600 mb-6">Pre-Departure Checklist</h3>

        <div className="space-y-4">
          {checklists.documents.map((item, index) => (
            <label key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded hover:bg-white/80 cursor-pointer transition-colors">
              <input type="checkbox" className="mt-1 w-5 h-5 rounded border-gold-500/50 text-gold-600 focus:ring-gold-500" />
              <div className="flex-1">
                <span className="text-ocean-700">{item.item}</span>
                {item.required && <span className="ml-2 text-xs text-red-500">Required</span>}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Medical Visa vs Tourist Visa */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-sage-200/50 p-6 rounded-lg border border-gold-500/20">
          <h4 className="text-xl font-display text-gold-600 mb-4">Medical Visa Benefits</h4>
          <ul className="space-y-2 text-sm text-ocean-700/80">
            <li className="flex items-start gap-2">
              <span className="text-gold-600">✓</span>
              <span>Extended stay allowed (up to 6 months)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-600">✓</span>
              <span>Companion visa available</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-600">✓</span>
              <span>Legal protection as medical patient</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-600">✓</span>
              <span>Multiple entry options</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-600">✓</span>
              <span>Can extend if complications</span>
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-gold-500/20">
            <h5 className="text-gold-600 font-bold mb-2 text-sm">Countries Requiring Medical Visa:</h5>
            <ul className="text-sm text-ocean-700/70 space-y-1">
              <li>• India (M visa - quick processing)</li>
              <li>• Thailand (MT visa for stays over 90 days)</li>
              <li>• Turkey (with invitation letter)</li>
            </ul>
          </div>
        </div>

        <div className="bg-gold-500/10 p-6 rounded-lg border border-gold-500/20">
          <h4 className="text-xl font-display text-gold-600 mb-4">Tourist Visa Sufficient</h4>
          <ul className="space-y-3 text-sm text-ocean-700/80">
            <li className="flex items-center justify-between p-3 bg-white/50 rounded">
              <span>🇲🇽 Mexico</span>
              <span className="text-gold-600">180 days on arrival</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-white/50 rounded">
              <span>🇨🇷 Costa Rica</span>
              <span className="text-gold-600">90 days on arrival</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-white/50 rounded">
              <span>🇨🇴 Colombia</span>
              <span className="text-gold-600">90 days on arrival</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-white/50 rounded">
              <span>🇲🇾 Malaysia</span>
              <span className="text-gold-600">90 days visa-free</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Insurance Options */}
      <div className="bg-gradient-to-br from-ocean-600/10 to-transparent p-8 rounded-lg border border-gold-500/20">
        <h3 className="text-2xl font-display text-gold-600 mb-6">Medical Tourism Insurance</h3>

        <div className="space-y-4">
          {checklists.insurance.map((provider, index) => (
            <div key={index} className="bg-white/80 p-6 rounded-lg border border-sage-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-gold-600 font-bold text-lg">{provider.name}</h4>
                  <p className="text-ocean-700/70 text-sm mt-1">{provider.coverage}</p>
                </div>
                <div className="text-right">
                  <div className="text-gold-600 font-bold">{provider.cost}</div>
                  <div className="text-xs text-ocean-600/50">Cost</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ocean-600/60">Maximum benefit:</span>
                <span className="text-green-600 font-bold">{provider.benefit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gold-500/10 border-l-4 border-gold-500 rounded">
          <h5 className="text-gold-600 font-bold mb-2">Getting US Insurance Reimbursement</h5>
          <ul className="text-sm text-ocean-700/80 space-y-1">
            <li>• Self-funded employer plans: 8% of Fortune 500 offer medical tourism</li>
            <li>• Walmart, Lowe's, PepsiCo cover specific procedures</li>
            <li>• HSA/FSA eligible - save all receipts</li>
            <li>• Tax deductible if over 7.5% of AGI</li>
          </ul>
        </div>
      </div>

      {/* Recovery Timeline Calculator */}
      <div className="bg-gradient-to-br from-sage-200/50 to-transparent p-8 rounded-lg border border-gold-500/20">
        <h3 className="text-2xl font-display text-gold-600 mb-6">Recovery Timeline by Procedure</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-500/30">
                <th className="text-left py-3 px-4 text-gold-600">Procedure</th>
                <th className="text-center py-3 px-4 text-gold-600">Stay Duration</th>
                <th className="text-center py-3 px-4 text-gold-600">Flying Ready</th>
                <th className="text-center py-3 px-4 text-gold-600">Return to Work</th>
              </tr>
            </thead>
            <tbody>
              {checklists.recovery.map((item, index) => (
                <tr key={index} className="border-b border-gold-500/10 hover:bg-gold-500/10 transition-colors">
                  <td className="py-3 px-4 text-ocean-700">{item.procedure}</td>
                  <td className="py-3 px-4 text-center text-gold-600">{item.days}</td>
                  <td className="py-3 px-4 text-center text-gold-600">{item.flyingReady}</td>
                  <td className="py-3 px-4 text-center text-ocean-600/70">{item.returnToWork}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Questions to Ask Facilities */}
      <div className="bg-gradient-to-br from-ocean-600/10 to-transparent p-8 rounded-lg border border-gold-500/20">
        <h3 className="text-2xl font-display text-gold-600 mb-6">Essential Questions to Ask Facilities</h3>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-gold-600 font-bold mb-3 flex items-center gap-2">
              <span>🏥</span> Clinical Questions
            </h4>
            <ul className="space-y-2 text-sm text-ocean-700/80">
              {questions.clinical.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gold-600 font-bold mb-3 flex items-center gap-2">
              <span>📋</span> Logistical Questions
            </h4>
            <ul className="space-y-2 text-sm text-ocean-700/80">
              {questions.logistical.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gold-600 font-bold mb-3 flex items-center gap-2">
              <span>💰</span> Financial Questions
            </h4>
            <ul className="space-y-2 text-sm text-ocean-700/80">
              {questions.financial.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quality Verification */}
      <div className="bg-gradient-to-r from-gold-500/20 to-gold-400/20 p-8 rounded-lg border border-gold-500/20">
        <h3 className="text-2xl font-display text-gold-600 mb-4">JCI Accreditation Verification</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-gold-600 font-bold mb-3">What is JCI?</h4>
            <p className="text-ocean-700/80 text-sm mb-4">
              Joint Commission International - same organization that accredits Johns Hopkins, Mayo Clinic, and Cleveland Clinic.
            </p>
            <h4 className="text-gold-600 font-bold mb-2">How to Verify:</h4>
            <ol className="text-sm text-ocean-700/80 space-y-2">
              <li>1. Visit jointcommissioninternational.org</li>
              <li>2. Click "JCI-Accredited Organizations"</li>
              <li>3. Search by country or facility name</li>
              <li>4. Check expiration date (renewed every 3 years)</li>
            </ol>
          </div>

          <div className="bg-white/80 p-6 rounded border border-sage-200">
            <h4 className="text-gold-600 font-bold mb-3">Current JCI-Accredited Hospitals:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ocean-600/70">Global:</span>
                <span className="text-gold-600 font-bold">1,082</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ocean-600/70">Thailand:</span>
                <span className="text-gold-600 font-bold">64</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ocean-600/70">UAE:</span>
                <span className="text-gold-600 font-bold">57</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ocean-600/70">Turkey:</span>
                <span className="text-gold-600 font-bold">46</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ocean-600/70">India:</span>
                <span className="text-gold-600 font-bold">38</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ocean-600/70">Mexico:</span>
                <span className="text-gold-600 font-bold">32</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-gold-400 to-gold-600 p-8 rounded-lg text-center">
        <h3 className="text-2xl font-display text-white mb-4">Ready to Plan Your Medical Journey?</h3>
        <p className="text-white/90 mb-6">
          Start by browsing our verified facilities and requesting consultations
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-white text-gold-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-sage-50 transition-colors"
        >
          Search Facilities
        </button>
      </div>
    </div>
  );
};

export default PlanningToolsTab;
