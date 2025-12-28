import React from 'react';
import { Link } from 'react-router-dom';

interface ProcedureComparison {
  procedure: string;
  usPrice: number;
  internationalPrice: number;
  location: string;
}

const COMMON_PROCEDURES: ProcedureComparison[] = [
  {
    procedure: 'Hip Replacement',
    usPrice: 52000,
    internationalPrice: 8000,
    location: 'Bangkok, Thailand',
  },
  {
    procedure: 'Knee Replacement',
    usPrice: 49500,
    internationalPrice: 7500,
    location: 'New Delhi, India',
  },
  {
    procedure: 'Heart Bypass Surgery',
    usPrice: 123000,
    internationalPrice: 15000,
    location: 'Singapore',
  },
  {
    procedure: 'Spinal Fusion',
    usPrice: 110000,
    internationalPrice: 9000,
    location: 'Istanbul, Turkey',
  },
  {
    procedure: 'Cataract Surgery',
    usPrice: 3500,
    internationalPrice: 800,
    location: 'Costa Rica',
  },
  {
    procedure: 'IVF Treatment',
    usPrice: 12400,
    internationalPrice: 2500,
    location: 'Prague, Czech Republic',
  },
  {
    procedure: 'Dental Implant (per tooth)',
    usPrice: 4250,
    internationalPrice: 900,
    location: 'Mexico City, Mexico',
  },
  {
    procedure: 'Gastric Bypass',
    usPrice: 23000,
    internationalPrice: 7000,
    location: 'Tijuana, Mexico',
  },
  {
    procedure: 'Angioplasty',
    usPrice: 57000,
    internationalPrice: 4500,
    location: 'Bangalore, India',
  },
  {
    procedure: 'Hip Resurfacing',
    usPrice: 28000,
    internationalPrice: 6500,
    location: 'Budapest, Hungary',
  },
];

export default function ComparisonTable() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateSavings = (usPrice: number, intlPrice: number) => {
    const savings = usPrice - intlPrice;
    const percentage = Math.round((savings / usPrice) * 100);
    return { amount: savings, percentage };
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Common Procedure Price Comparisons
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how much you could save by traveling abroad for medical care.
            These are average prices from JCI-accredited facilities.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Procedure
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  US Average
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  International
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  International Price
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-green-700 uppercase tracking-wider">
                  You Save
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {COMMON_PROCEDURES.map((proc, idx) => {
                const savings = calculateSavings(proc.usPrice, proc.internationalPrice);
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {proc.procedure}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                      {formatPrice(proc.usPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {proc.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gold-600 font-semibold">
                      {formatPrice(proc.internationalPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="text-green-600 font-bold">
                        {formatPrice(savings.amount)}
                      </div>
                      <div className="text-xs text-green-500">
                        ({savings.percentage}% savings)
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {COMMON_PROCEDURES.map((proc, idx) => {
            const savings = calculateSavings(proc.usPrice, proc.internationalPrice);
            return (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow">
                <div className="font-semibold text-gray-900 mb-3">
                  {proc.procedure}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">US Average:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(proc.usPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{proc.location}:</span>
                    <span className="font-semibold text-gold-600">
                      {formatPrice(proc.internationalPrice)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-600">You Save:</span>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatPrice(savings.amount)}
                        </div>
                        <div className="text-xs text-green-500">
                          ({savings.percentage}% savings)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/browse"
            className="inline-block bg-gold-500 hover:bg-gold-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Browse International Facilities
          </Link>
          <p className="mt-4 text-sm text-gray-600">
            All facilities are JCI-accredited and vetted for quality
          </p>
        </div>
      </div>
    </section>
  );
}
