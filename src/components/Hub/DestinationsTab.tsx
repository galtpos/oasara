import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DestinationsTab: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('thailand');

  const countries = [
    {
      id: 'thailand',
      name: 'Thailand',
      flag: '🇹🇭',
      tagline: 'The Medical Tourism Capital',
      stats: {
        medicalTourists: '2.5 million annually',
        revenue: '$8.7 billion',
        jciHospitals: '64',
        savings: '60-70%'
      },
      whyDominates: [
        'Government mandate since 1997 Asian Financial Crisis',
        '"Medical hub of Asia" national strategy',
        '30-day visa on arrival for most countries',
        'English widely spoken in hospitals',
        '200+ US board-certified surgeons'
      ],
      topHospitals: [
        { name: 'Bumrungrad International', patients: '580,000/year', note: 'Airport-style service' },
        { name: 'Bangkok Hospital', patients: '49 hospital network', note: 'Specialized centers' },
        { name: 'Samitivej Hospitals', patients: 'Premium maternity', note: '24/7 interpreters' },
      ],
      bestFor: [
        'Cardiac surgery (98.5% success rate)',
        'Gender reassignment (world leader)',
        'Dental (60-70% savings)',
        'IVF (45% success rate)',
        'Executive health screening'
      ],
      recovery: {
        climate: 'Year-round warm (25-35°C)',
        beaches: 'Phuket, Koh Samui for beachfront recovery',
        hotels: '70% less than USA',
        culture: 'Thai massage and wellness tradition'
      },
      gettingThere: {
        flights: 'Direct from LAX, SFO, JFK',
        visa: 'Medical visa for extended stays',
        pickup: 'Hospital pickup service standard'
      },
      facilities: 48
    },
    {
      id: 'mexico',
      name: 'Mexico',
      flag: '🇲🇽',
      tagline: 'America\'s Medical Backyard',
      stats: {
        medicalTourists: '1.4 million Americans annually',
        borderCrossings: '40+ points',
        jciHospitals: '32',
        savings: '40-75%'
      },
      whyDominates: [
        'Same-day procedures possible from border',
        'Dental capital of the world (Los Algodones)',
        'Many US-trained specialists',
        'Same time zones as USA',
        '2-4 hour flights from most major cities'
      ],
      topHospitals: [
        { name: 'Galenia Hospital', city: 'Cancun', note: 'JCI certified, resort medicine' },
        { name: 'Hospital Angeles', city: 'Multiple cities', note: 'Network of excellence' },
        { name: 'CIMA', city: 'Monterrey', note: 'Advanced cardiac center' },
      ],
      bestFor: [
        'Dental (80% savings, walk across border)',
        'Bariatric surgery (#1 globally)',
        'Cosmetic surgery',
        'Prescription medications (70% savings)'
      ],
      recovery: {
        climate: 'Varies by region, beach options',
        beaches: 'Cancun, Puerto Vallarta recovery packages',
        timezone: 'Same as USA - easy coordination',
        proximity: '0-4 hours from US border'
      },
      gettingThere: {
        border: 'Walk across for dental',
        flights: '2-4 hours from most US cities',
        insurance: 'Many plans cover emergencies',
        currency: 'Dollar widely accepted'
      },
      facilities: 36
    },
    {
      id: 'india',
      name: 'India',
      flag: '🇮🇳',
      tagline: 'The Volume Leader',
      stats: {
        medicalTourists: '500,000+ annually',
        savings: '65-90%',
        jciHospitals: '38',
        heartSurgeries: '30 per day (Narayana)'
      },
      whyDominates: [
        'Volume creates expertise (10x US procedures)',
        'Medical education in English',
        'Generic medication production hub',
        'Ayurveda and holistic options available',
        'Lowest costs globally'
      ],
      topHospitals: [
        { name: 'Narayana Health', city: 'Bangalore', note: '30 heart surgeries/day, 98.5% success' },
        { name: 'Apollo Hospitals', city: 'Network', note: 'Pioneer of medical tourism' },
        { name: 'Fortis Memorial', city: 'Delhi', note: 'Multi-specialty excellence' },
      ],
      bestFor: [
        'Cardiac surgery ($7,900 vs $123,000)',
        'Orthopedic (joint replacement)',
        'Organ transplants (when legal)',
        'Cancer treatment',
        'Ayurvedic medicine'
      ],
      recovery: {
        climate: 'Varies, pollution in major cities',
        culture: 'Deep wellness traditions',
        food: 'Vegetarian predominant',
        healing: 'Combine with Ayurvedic retreats'
      },
      gettingThere: {
        flights: '16-20 hours from USA',
        visa: 'M visa for medical - quick processing',
        language: 'English universal in hospitals',
        cultural: 'Adjustment needed but rewarding'
      },
      facilities: 40
    },
    {
      id: 'turkey',
      name: 'Turkey',
      flag: '🇹🇷',
      tagline: 'Europe Meets Asia',
      stats: {
        medicalTourists: '700,000 annually',
        growth: '30% annually',
        jciHospitals: '46',
        investment: '$10 billion in medical tourism'
      },
      whyDominates: [
        'Hair transplant world capital',
        'Bridge between Europe and Middle East',
        'Halal medical tourism leader',
        'Turkish Airlines medical tourism desk',
        'Government subsidies for medical tourists'
      ],
      topHospitals: [
        { name: 'Acibadem', city: 'Istanbul', note: '21 hospitals' },
        { name: 'Memorial', city: 'Multiple cities', note: '11 hospitals' },
        { name: 'American Hospital', city: 'Istanbul', note: 'US standards' },
      ],
      bestFor: [
        'Hair transplantation (50,000+ annually)',
        'Eye surgery (LASIK at $1,000)',
        'Dental (70% savings)',
        'IVF (high success rates)',
        'Cosmetic surgery'
      ],
      recovery: {
        climate: 'Four seasons, mild winters',
        culture: 'Rich historical tourism',
        location: 'Strategic connecting point',
        hospitality: 'World-renowned Turkish hospitality'
      },
      gettingThere: {
        flights: 'Direct from major US cities',
        visa: 'E-visa online, quick',
        language: 'English in medical facilities',
        tourism: 'Combine with historical sites'
      },
      facilities: 36
    },
    {
      id: 'costarica',
      name: 'Costa Rica',
      flag: '🇨🇷',
      tagline: 'Closest Paradise',
      stats: {
        medicalTourists: '150,000 Americans annually',
        fromMiami: '3 hours',
        jciHospitals: '3',
        stability: 'Most stable Central American democracy'
      },
      whyDominates: [
        '"Switzerland of Central America"',
        'No army since 1948 (funds to healthcare)',
        'Highest life expectancy in Americas',
        'Eco-recovery options',
        'English widely spoken'
      ],
      topHospitals: [
        { name: 'CIMA San José', note: 'JCI certified' },
        { name: 'Clínica Bíblica', note: 'JCI certified' },
        { name: 'Hospital La Católica', note: 'Excellence in cardiology' },
      ],
      bestFor: [
        'Dental (reputation for excellence)',
        'Cosmetic surgery',
        'Orthopedic surgery',
        'Weight loss surgery',
        'Stem cell therapy'
      ],
      recovery: {
        climate: 'Year-round spring (20-27°C)',
        nature: 'Beaches and mountains',
        food: 'Organic food culture',
        activities: 'Zip-line to recovery',
        language: 'English widely spoken'
      },
      gettingThere: {
        flights: '3 hours from Miami, 5 from LAX',
        visa: '90 days on arrival',
        safety: 'Very safe for Americans',
        tourism: 'World-class eco-tourism'
      },
      facilities: 20
    },
  ];

  const selectedData = countries.find(c => c.id === selectedCountry) || countries[0];

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif text-[#D4AF37] mb-4">Complete Country Intelligence</h2>
        <p className="text-[#FFF8F0]/80 max-w-3xl mx-auto">
          Detailed profiles of the world's top medical tourism destinations, including costs, quality metrics, and what makes each unique.
        </p>
      </div>

      {/* Country Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {countries.map((country) => (
          <button
            key={country.id}
            onClick={() => setSelectedCountry(country.id)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-300
              ${selectedCountry === country.id
                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/50 bg-[#0B697A]/10'
              }
            `}
          >
            <div className={`text-sm font-bold ${selectedCountry === country.id ? 'text-[#D4AF37]' : 'text-[#FFF8F0]'}`}>
              {country.name}
            </div>
            <div className="text-xs text-[#FFF8F0]/50 mt-1">{country.facilities} facilities</div>
          </button>
        ))}
      </div>

      {/* Country Profile */}
      <motion.div
        key={selectedCountry}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D97925] to-[#D4AF37] p-8 rounded-lg text-white">
          <div className="mb-4">
            <h3 className="text-3xl font-serif">{selectedData.name}</h3>
            <p className="text-xl opacity-90">{selectedData.tagline}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {Object.entries(selectedData.stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm opacity-80 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why This Country Dominates */}
        <div className="bg-[#0B697A]/20 p-8 rounded-lg border border-[#D4AF37]/20">
          <h4 className="text-2xl font-serif text-[#D4AF37] mb-4">Why {selectedData.name} Dominates</h4>
          <ul className="space-y-3">
            {selectedData.whyDominates.map((reason, index) => (
              <li key={index} className="flex items-start gap-3 text-[#FFF8F0]/80">
                <span className="text-[#D97925] mt-1">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Hospitals */}
        <div className="bg-[#C17754]/20 p-8 rounded-lg border border-[#D4AF37]/20">
          <h4 className="text-2xl font-serif text-[#D4AF37] mb-4">Top Medical Facilities</h4>
          <div className="grid md:grid-cols-3 gap-4">
            {selectedData.topHospitals.map((hospital: any, index) => (
              <div key={index} className="bg-[#0A0A0A]/50 p-4 rounded-lg">
                <h5 className="text-[#D4AF37] font-bold mb-2">{hospital.name}</h5>
                {hospital.city && <p className="text-xs text-[#FFF8F0]/50 mb-1">{hospital.city}</p>}
                {hospital.patients && <p className="text-sm text-[#FFF8F0]/70 mb-2">{hospital.patients}</p>}
                <p className="text-sm text-[#D97925]">{hospital.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Best For */}
        <div className="bg-gradient-to-br from-[#D97925]/20 to-transparent p-8 rounded-lg border border-[#D4AF37]/20">
          <h4 className="text-2xl font-serif text-[#D4AF37] mb-4">Best Procedures</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {selectedData.bestFor.map((procedure, index) => (
              <div key={index} className="flex items-center gap-3 bg-[#0B697A]/20 p-3 rounded">
                <span className="text-[#D97925]">★</span>
                <span className="text-[#FFF8F0]/80">{procedure}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0B697A]/10 p-6 rounded-lg border border-[#D4AF37]/20">
            <h4 className="text-xl font-serif text-[#D4AF37] mb-4">Recovery Environment</h4>
            <dl className="space-y-2">
              {Object.entries(selectedData.recovery).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <dt className="text-[#D97925] font-bold capitalize inline">{key}:</dt>
                  <dd className="text-[#FFF8F0]/80 inline ml-2">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-[#0B697A]/10 p-6 rounded-lg border border-[#D4AF37]/20">
            <h4 className="text-xl font-serif text-[#D4AF37] mb-4">Getting There</h4>
            <dl className="space-y-2">
              {Object.entries(selectedData.gettingThere).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <dt className="text-[#D97925] font-bold capitalize inline">{key}:</dt>
                  <dd className="text-[#FFF8F0]/80 inline ml-2">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Search Facilities Button */}
        <button
          onClick={() => window.location.href = `/?country=${encodeURIComponent(selectedData.name)}`}
          className="w-full bg-gradient-to-r from-[#D97925] to-[#D4AF37] text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
        >
          Search {selectedData.facilities} Facilities in {selectedData.name}
        </button>
      </motion.div>

      {/* Emerging Destinations */}
      <div className="bg-gradient-to-br from-[#0B697A]/20 to-transparent p-8 rounded-lg border border-[#D4AF37]/20">
        <h3 className="text-2xl font-serif text-[#D4AF37] mb-6">Emerging Destinations</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { country: 'Colombia', specialty: 'Cosmetic surgery (71% savings)' },
            { country: 'Malaysia', specialty: 'Prince Court #1 in service' },
            { country: 'Singapore', specialty: 'Mayo Clinic of Asia' },
            { country: 'Poland', specialty: 'EU quality at 50% savings' },
          ].map((dest) => (
            <div key={dest.country} className="bg-[#0A0A0A]/50 p-4 rounded-lg text-center">
              <div className="text-[#D4AF37] font-bold mb-1">{dest.country}</div>
              <div className="text-xs text-[#FFF8F0]/70">{dest.specialty}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DestinationsTab;
