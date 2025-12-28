import React from 'react';
import { Link } from 'react-router-dom';

interface ExampleQuery {
  question: string;
  icon: string;
}

const EXAMPLE_QUERIES: ExampleQuery[] = [
  {
    question: 'How much does knee surgery cost at my local hospital?',
    icon: '🦴',
  },
  {
    question: 'Compare cardiac care costs in my area vs Bangkok',
    icon: '❤️',
  },
  {
    question: 'Which facilities near me accept cryptocurrency?',
    icon: '₿',
  },
  {
    question: 'Show me hip replacement prices within 50 miles',
    icon: '📍',
  },
  {
    question: 'What JCI facilities in Mexico offer dental implants?',
    icon: '🦷',
  },
  {
    question: 'Find IVF clinics with success rates above 40%',
    icon: '🔬',
  },
];

export default function ChatbotCTA() {
  return (
    <section className="py-16 bg-gradient-to-br from-gold-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <span className="text-4xl">🤖</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Not Sure What to Ask?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI assistant can help you find specific pricing information, compare facilities,
            and discover medical tourism options tailored to your needs.
          </p>
        </div>

        {/* Example Queries Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {EXAMPLE_QUERIES.map((query, idx) => (
            <button
              key={idx}
              className="bg-white border-2 border-gray-200 hover:border-gold-500 rounded-lg p-4 text-left transition-all hover:shadow-md group"
              onClick={() => {
                // TODO: Pre-fill chatbot with this query when chatbot is implemented
                console.log('Query clicked:', query.question);
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl group-hover:scale-110 transition-transform">
                  {query.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 group-hover:text-gray-900">
                    "{query.question}"
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main CTA */}
        <div className="text-center">
          <button
            className="inline-flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl text-lg"
            onClick={() => {
              // TODO: Open chatbot modal when implemented
              console.log('Open chatbot');
            }}
          >
            <span className="text-2xl">💬</span>
            Ask Our AI Assistant
          </button>
          <p className="mt-4 text-sm text-gray-600">
            Get instant answers about pricing, facilities, and procedures
          </p>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-semibold text-gray-900 mb-1">Instant Answers</div>
            <div className="text-sm text-gray-600">
              Get pricing data in seconds, not hours
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-semibold text-gray-900 mb-1">Personalized</div>
            <div className="text-sm text-gray-600">
              Results tailored to your location and needs
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">🔒</div>
            <div className="font-semibold text-gray-900 mb-1">Private</div>
            <div className="text-sm text-gray-600">
              Your searches are anonymous and secure
            </div>
          </div>
        </div>

        {/* Alternative Actions */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 mb-4">Or explore on your own:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/browse"
              className="inline-block bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-2 rounded-lg border border-gray-300 transition-colors"
            >
              Browse All Facilities
            </Link>
            <Link
              to="/us-prices"
              className="inline-block bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-2 rounded-lg border border-gray-300 transition-colors"
            >
              View US Hospital Prices
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
