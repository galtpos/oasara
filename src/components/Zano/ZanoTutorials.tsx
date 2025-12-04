import React from 'react';
import { motion } from 'framer-motion';

const tutorials = [
  {
    id: 'Qk1n53be1iU',
    title: 'How to Buy & Sell fUSD on Mobile',
    description: 'Quick guide to buying and selling Freedom Dollar (fUSD) using your mobile device'
  },
  {
    id: 'Pi6Svi2oCvk',
    title: 'Getting Started with Zano',
    description: 'Learn the basics of setting up and using Zano cryptocurrency'
  },
  {
    id: 'MraINHRba84',
    title: 'Freedom Dollar (fUSD) Explained',
    description: 'Understanding the private, censorship-resistant stablecoin on Zano'
  }
];

interface ZanoTutorialsProps {
  variant?: 'full' | 'compact';
}

const ZanoTutorials: React.FC<ZanoTutorialsProps> = ({ variant = 'full' }) => {
  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-ocean-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          Learn Zano & fUSD
        </h3>
        <div className="space-y-3">
          {tutorials.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-sage-50 hover:bg-sage-100 border border-sage-200 transition-colors group"
            >
              <div className="w-16 h-10 bg-ocean-600 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ocean-700 group-hover:text-ocean-800 truncate">
                  {video.title}
                </p>
              </div>
              <svg className="w-4 h-4 text-sage-400 group-hover:text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gradient-to-br from-ocean-50 via-white to-sage-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl text-ocean-800 font-bold mb-3">
            Get Started with Zano & Freedom Dollar
          </h2>
          <p className="text-sage-600 max-w-2xl mx-auto">
            Learn how to set up your wallet, buy fUSD, and make private payments with these step-by-step video tutorials.
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {tutorials.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-sage-200 shadow-card overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Video Embed */}
              <div className="aspect-video bg-ocean-900">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-ocean-800 mb-1">{video.title}</h3>
                <p className="text-sm text-sage-600">{video.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="https://www.youtube.com/@zanolist"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ocean-600 hover:bg-ocean-700 text-white font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            More Tutorials on YouTube
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default ZanoTutorials;
