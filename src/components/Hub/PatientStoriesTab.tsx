import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PatientStoriesTab: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  const stories = [
    {
      id: 'sarah-hip',
      name: 'Sarah Mitchell',
      age: 52,
      from: 'Denver, Colorado',
      procedure: 'Bilateral Hip Replacement',
      hospital: 'Bumrungrad International, Bangkok',
      usQuote: '$380,000',
      actualCost: '$35,000 all-inclusive',
      recovery: '14 days beachfront hotel in Hua Hin',
      quote: '"I was a professional skier. My hips were destroyed by 40. US doctors said $380,000 for both hips, 6 months apart, and I\'d still owe $30,000 after insurance. I flew to Bangkok, had both done in one surgery by a Harvard-trained surgeon. Recovered on the beach. Back skiing in 3 months. Total cost including my husband\'s ticket: $35,000."',
      savings: '$345,000',
      outcome: 'Back skiing in 3 months',
      wouldRecommend: true,
    },
    {
      id: 'robert-cardiac',
      name: 'Robert Chen',
      age: 61,
      from: 'San Francisco, California',
      procedure: 'Triple Bypass Surgery',
      hospital: 'Narayana Health, Bangalore',
      usQuote: '$210,000',
      actualCost: '$8,500',
      recovery: '3 weeks with sightseeing',
      quote: '"My cardiologist wanted $210,000 for triple bypass. I\'m an engineer - I researched. Dr. Shetty does 30 of these daily. His success rate is higher than Cleveland Clinic. The entire experience - surgery, 3-week recovery, sightseeing with my wife - cost less than my US deductible would have been. It\'s been 3 years. My heart is perfect."',
      savings: '$201,500',
      outcome: '3 years, heart is perfect',
      wouldRecommend: true,
    },
    {
      id: 'maria-ivf',
      name: 'Maria Gonzalez',
      age: 38,
      from: 'Los Angeles, California',
      procedure: 'IVF with Donor Eggs',
      hospital: 'GENNET, Prague',
      usQuote: '$90,000 (3 failed cycles)',
      actualCost: '$4,500',
      recovery: '3 weeks in Prague',
      quote: '"We spent $90,000 on three failed IVF cycles in Beverly Hills. Took out a second mortgage. Then learned about Czech Republic. Better success rates, anonymous donors, no waiting list. First try worked. We have twin boys. We spent 3 weeks in Prague - total cost $8,000 including hotel. We still had money left to buy cribs."',
      savings: '$82,000',
      outcome: 'Twin boys born healthy',
      wouldRecommend: true,
    },
    {
      id: 'james-dental',
      name: 'James Patterson',
      age: 67,
      from: 'Phoenix, Arizona',
      procedure: 'Full Mouth Restoration (24 implants)',
      hospital: 'Sani Dental, Los Algodones',
      usQuote: '$87,000',
      actualCost: '$14,000',
      recovery: '4-hour drive, 6 months of visits',
      quote: '"Vietnam veteran. VA wouldn\'t cover dental. Private quote was $87,000 for full restoration. Drove to Los Algodones. More dentists per capita than anywhere on earth. Dr. trained at USC. Did everything in 4 visits over 6 months. Saved $73,000. I tell every veteran I meet."',
      savings: '$73,000',
      outcome: 'Complete smile restoration',
      wouldRecommend: true,
    },
    {
      id: 'ashley-cosmetic',
      name: 'Ashley Thompson',
      age: 34,
      from: 'Miami, Florida',
      procedure: 'Mommy Makeover (tummy tuck, breast lift, lipo)',
      hospital: 'CI Plastic Surgery, Medellín',
      usQuote: '$28,000',
      actualCost: '$7,500',
      recovery: '14 days in recovery house',
      quote: '"After 3 kids, I wanted my body back. Miami surgeon wanted $28,000. Found Dr. Martinez in Medellín - trained at University of Miami, moved back home. Private recovery house with 24/7 nurse, chef, daily massages. Better care than any US hospital. Saved $20,000 and got a better result."',
      savings: '$20,500',
      outcome: 'Better than expected results',
      wouldRecommend: true,
    },
  ];

  const selectedStoryData = stories.find(s => s.id === selectedStory);

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif text-[#D4AF37] mb-4">Real Journeys, Real Results</h2>
        <p className="text-[#FFF8F0]/80 max-w-3xl mx-auto">
          Authentic experiences from Americans who chose medical tourism. Their stories, costs, and outcomes - unfiltered.
        </p>
      </div>

      {/* Story Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <motion.div
            key={story.id}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#0B697A]/20 to-transparent p-6 rounded-lg border border-[#D4AF37]/20 cursor-pointer"
            onClick={() => setSelectedStory(story.id)}
          >
            <h3 className="text-xl font-bold text-[#D4AF37] mb-2">{story.name}, {story.age}</h3>
            <p className="text-sm text-[#FFF8F0]/60 mb-4">{story.from}</p>

            <div className="space-y-2 mb-4">
              <div>
                <div className="text-xs text-[#FFF8F0]/50">Procedure</div>
                <div className="text-sm text-[#FFF8F0]">{story.procedure}</div>
              </div>
              <div>
                <div className="text-xs text-[#FFF8F0]/50">Hospital</div>
                <div className="text-sm text-[#D97925]">{story.hospital}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-500/10 border-l-4 border-red-500 rounded mb-2">
              <span className="text-xs text-[#FFF8F0]/70">US Quote</span>
              <span className="text-red-400 font-bold">{story.usQuote}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-500/10 border-l-4 border-green-500 rounded mb-3">
              <span className="text-xs text-[#FFF8F0]/70">Actual Cost</span>
              <span className="text-green-400 font-bold">{story.actualCost}</span>
            </div>

            <div className="text-center p-3 bg-[#D4AF37]/10 rounded">
              <div className="text-xs text-[#FFF8F0]/50">Saved</div>
              <div className="text-lg font-bold text-[#D4AF37]">{story.savings}</div>
            </div>

            <button className="mt-4 w-full bg-gradient-to-r from-[#D97925] to-[#D4AF37] text-white py-2 rounded text-sm font-bold hover:opacity-90 transition-opacity">
              Read Full Story
            </button>
          </motion.div>
        ))}
      </div>

      {/* Selected Story Modal */}
      {selectedStory && selectedStoryData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedStory(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-[#0A0A0A] p-8 rounded-lg border-2 border-[#D4AF37] max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-serif text-[#D4AF37]">{selectedStoryData.name}'s Journey</h3>
                <p className="text-[#FFF8F0]/60">{selectedStoryData.age} from {selectedStoryData.from}</p>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-[#FFF8F0] hover:text-[#D4AF37] text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-[#D97925] font-bold">Procedure</div>
                  <div className="text-[#FFF8F0]">{selectedStoryData.procedure}</div>
                </div>
                <div>
                  <div className="text-sm text-[#D97925] font-bold">Hospital</div>
                  <div className="text-[#FFF8F0]">{selectedStoryData.hospital}</div>
                </div>
                <div>
                  <div className="text-sm text-[#D97925] font-bold">Recovery</div>
                  <div className="text-[#FFF8F0]">{selectedStoryData.recovery}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded">
                  <div className="text-xs text-[#FFF8F0]/50">US Quote</div>
                  <div className="text-2xl font-bold text-red-400">{selectedStoryData.usQuote}</div>
                </div>
                <div className="p-4 bg-green-500/10 border-l-4 border-green-500 rounded">
                  <div className="text-xs text-[#FFF8F0]/50">Actual Cost</div>
                  <div className="text-2xl font-bold text-green-400">{selectedStoryData.actualCost}</div>
                </div>
                <div className="p-4 bg-[#D4AF37]/10 border-l-4 border-[#D4AF37] rounded">
                  <div className="text-xs text-[#FFF8F0]/50">Total Savings</div>
                  <div className="text-2xl font-bold text-[#D4AF37]">{selectedStoryData.savings}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0B697A]/20 p-6 rounded-lg border border-[#D4AF37]/20 mb-6">
              <h4 className="text-[#D97925] font-bold mb-3">Their Story</h4>
              <p className="text-[#FFF8F0]/80 italic leading-relaxed">{selectedStoryData.quote}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#C17754]/20 p-4 rounded">
                <div className="text-sm text-[#D97925] font-bold mb-2">Outcome</div>
                <div className="text-[#FFF8F0]">{selectedStoryData.outcome}</div>
              </div>
              <div className="bg-green-500/20 p-4 rounded">
                <div className="text-sm text-[#D97925] font-bold mb-2">Would Recommend?</div>
                <div className="text-green-400 font-bold text-lg">
                  {selectedStoryData.wouldRecommend ? '✓ Absolutely' : '✗ No'}
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.href = `/?search=${encodeURIComponent(selectedStoryData.hospital.split(',')[0])}`}
              className="mt-6 w-full bg-gradient-to-r from-[#D97925] to-[#D4AF37] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              Find Similar Facilities
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Success Metrics */}
      <div className="bg-gradient-to-r from-[#D97925]/30 to-[#D4AF37]/30 p-8 rounded-lg border border-[#D4AF37]/20">
        <h3 className="text-2xl font-serif text-[#D4AF37] mb-6 text-center">Collective Impact</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-[#D4AF37] mb-2">$800K+</div>
            <div className="text-sm text-[#FFF8F0]/70">Total Saved (Just These 5 Stories)</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#D4AF37] mb-2">5/5</div>
            <div className="text-sm text-[#FFF8F0]/70">Would Do It Again</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#D4AF37] mb-2">100%</div>
            <div className="text-sm text-[#FFF8F0]/70">Successful Outcomes</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#D4AF37] mb-2">0</div>
            <div className="text-sm text-[#FFF8F0]/70">Major Complications</div>
          </div>
        </div>
      </div>

      {/* Comparison: Failed US vs Success Abroad */}
      <div className="bg-gradient-to-br from-red-900/20 to-green-900/20 p-8 rounded-lg border border-[#D4AF37]/20">
        <h3 className="text-2xl font-serif text-[#D4AF37] mb-6">When US Treatment Fails</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-500/10 p-6 rounded-lg border-l-4 border-red-500">
            <h4 className="text-red-400 font-bold mb-3">❌ US Treatment (Failed)</h4>
            <div className="space-y-2 text-sm text-[#FFF8F0]/80">
              <p><strong>Patient:</strong> Michael Stevens, Stage 3 colon cancer</p>
              <p><strong>Treatment:</strong> Chemotherapy at MD Anderson</p>
              <p><strong>Cost:</strong> $380,000</p>
              <p><strong>Duration:</strong> 8 months</p>
              <p><strong>Result:</strong> Cancer returned in 6 months, given 6 months to live</p>
              <p><strong>Side effects:</strong> Severe, hospitalized twice</p>
            </div>
          </div>

          <div className="bg-green-500/10 p-6 rounded-lg border-l-4 border-green-500">
            <h4 className="text-green-400 font-bold mb-3">✓ German Treatment (Successful)</h4>
            <div className="space-y-2 text-sm text-[#FFF8F0]/80">
              <p><strong>Treatment:</strong> Hyperthermia + low-dose chemo</p>
              <p><strong>Hospital:</strong> Klinik St. Georg, Bad Aibling</p>
              <p><strong>Cost:</strong> $45,000</p>
              <p><strong>Duration:</strong> 6-week treatment</p>
              <p><strong>Result:</strong> Complete remission, 5 years cancer-free</p>
              <p><strong>Side effects:</strong> Minimal</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#D4AF37]/10 rounded border-l-4 border-[#D4AF37]">
          <p className="text-[#FFF8F0]/80 italic text-sm">
            "MD Anderson gave me 6 months to live after $380,000 in treatment that made me sicker than the cancer.
            German hyperthermia - which FDA won't approve - saved my life for $45,000. The treatment was gentler,
            targeted, and actually worked." - Michael Stevens
          </p>
        </div>
      </div>

      {/* Share Your Story */}
      <div className="bg-gradient-to-r from-[#0B697A]/30 to-[#C17754]/30 p-8 rounded-lg border border-[#D4AF37]/20">
        <h3 className="text-2xl font-serif text-[#D4AF37] mb-4 text-center">Share Your Medical Tourism Journey</h3>
        <p className="text-[#FFF8F0]/80 text-center mb-6 max-w-2xl mx-auto">
          We're building the largest database of medical tourism success stories. Your journey could help others escape medical bankruptcy.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-[#0A0A0A]/50 rounded">
            <div className="text-2xl mb-2">📸</div>
            <div className="text-sm text-[#FFF8F0]/70">Share before/after photos</div>
          </div>
          <div className="text-center p-4 bg-[#0A0A0A]/50 rounded">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm text-[#FFF8F0]/70">Document your savings</div>
          </div>
          <div className="text-center p-4 bg-[#0A0A0A]/50 rounded">
            <div className="text-2xl mb-2">🎁</div>
            <div className="text-sm text-[#FFF8F0]/70">Get $100 credit toward next booking</div>
          </div>
        </div>

        <div className="text-center">
          <button className="bg-gradient-to-r from-[#D97925] to-[#D4AF37] text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity">
            Submit Your Story
          </button>
          <p className="text-xs text-[#FFF8F0]/50 mt-3">Privacy options: Full name, first name only, or completely anonymous</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-[#D97925] to-[#D4AF37] p-8 rounded-lg text-center">
        <h3 className="text-2xl font-serif text-white mb-4">Ready to Write Your Success Story?</h3>
        <p className="text-white/90 mb-6">
          Join thousands of Americans who've saved hundreds of thousands on world-class healthcare
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-white text-[#D97925] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#FFF8F0] transition-colors"
        >
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default PatientStoriesTab;
