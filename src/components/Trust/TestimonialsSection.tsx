import React from 'react';

interface Testimonial {
  id: string;
  type: 'text' | 'video';
  quote: string;
  patientName: string;
  procedure: string;
  location: string;
  savings: number;
  avatar?: string;
  videoUrl?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    type: 'text',
    quote: "I saved $37,000 on my hip replacement in Thailand. The care was exceptional, and I was walking in 3 days. Best decision I ever made.",
    patientName: "Sarah M.",
    procedure: "Hip Replacement",
    location: "Bangkok Hospital, Thailand",
    savings: 37000,
  },
  {
    id: '2',
    type: 'text',
    quote: "My dental work in Mexico cost $4,200 instead of $12,000 in the US. Same quality, better service, and I got a vacation too!",
    patientName: "James T.",
    procedure: "Full Dental Restoration",
    location: "Hospital Galenia, Mexico",
    savings: 7800,
  },
  {
    id: '3',
    type: 'text',
    quote: "After my heart surgery in Costa Rica, I recovered faster than my friends who had it done in the US. The doctors were world-class.",
    patientName: "Patricia L.",
    procedure: "Cardiac Bypass",
    location: "CIMA Hospital, Costa Rica",
    savings: 42000,
  },
  {
    id: '4',
    type: 'text',
    quote: "I was nervous at first, but the facility in Thailand exceeded every expectation. Modern, clean, and the staff spoke perfect English.",
    patientName: "Michael R.",
    procedure: "Knee Replacement",
    location: "Bumrungrad International, Thailand",
    savings: 34000,
  },
  {
    id: '5',
    type: 'text',
    quote: "My IVF treatment in Turkey cost 75% less than the US. Three months later, I'm pregnant! Forever grateful.",
    patientName: "Jennifer K.",
    procedure: "IVF Treatment",
    location: "Memorial Hospital, Turkey",
    savings: 11000,
  },
  {
    id: '6',
    type: 'text',
    quote: "The spinal fusion surgery I needed would have bankrupted me in the US. Mexico saved my finances and my back.",
    patientName: "Robert D.",
    procedure: "Spinal Fusion",
    location: "Hospital Angeles, Mexico",
    savings: 38000,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-ocean-600 uppercase tracking-wide text-sm font-semibold mb-3">
              Real Stories, Real Savings
            </p>
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Thousands Have Already Saved
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join over 10,000 patients who discovered world-class healthcare at prices that don't break the bank
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gradient-to-br from-sage-50 to-ocean-50 rounded-xl p-6 border-2 border-ocean-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Quote */}
                <div className="mb-4">
                  <svg className="w-8 h-8 text-gold-500 mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-gray-700 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Savings Badge */}
                <div className="mb-4">
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full">
                    <span className="text-green-700 font-semibold text-sm">
                      Saved ${testimonial.savings.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Author Info */}
                <div className="border-t border-ocean-200 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-ocean-500 flex items-center justify-center text-white font-display text-xl flex-shrink-0">
                      {testimonial.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.patientName}</div>
                      <div className="text-sm text-ocean-600 font-medium">{testimonial.procedure}</div>
                      <div className="text-xs text-gray-500 mt-1">{testimonial.location}</div>
                    </div>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="mt-4 flex items-center gap-2 text-xs text-ocean-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Verified Patient</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              These are real medical tourism patients. Stories collected from partner facilities and medical tourism communities.
            </p>
            <a
              href="/app"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-ocean-600 to-ocean-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Find Your Facility →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
