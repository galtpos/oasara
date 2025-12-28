import React from 'react';
import { motion } from 'framer-motion';
import LazyYouTubeEmbed from './LazyYouTubeEmbed';

interface USHealthcareCrisisProps {
  variant?: 'full' | 'compact';
}

const USHealthcareCrisis: React.FC<USHealthcareCrisisProps> = ({ variant = 'compact' }) => {
  const videos = [
    {
      id: 'DGBrpdRPGeI',
      title: 'The US Healthcare Crisis Explained',
      description: 'Why Americans are paying more and getting less'
    },
    {
      id: 'JfyECL2UtMw',
      title: 'Insurance Company Tactics',
      description: 'How insurers deny care to maximize profits'
    },
    {
      id: 'RyqY445tJaI',
      title: 'Medical Debt in America',
      description: 'The leading cause of bankruptcy in the US'
    },
    {
      id: 'CRC9D5t8nIY',
      title: 'Breaking Free from the System',
      description: 'Why patients are seeking alternatives'
    }
  ];

  if (variant === 'compact') {
    return (
      <section className="py-12 px-6 bg-red-50/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-3xl text-ocean-700 mb-2">
              The US Healthcare Disaster
            </h2>
            <p className="text-ocean-600/70">
              Understanding why millions are seeking alternatives
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-red-100"
              >
                <div className="aspect-video">
                  <LazyYouTubeEmbed videoId={video.id} title={video.title} />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-ocean-700 text-sm">{video.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Full variant
  return (
    <section className="py-16 px-6 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold mb-4">
            Why We Need Change
          </div>
          <h2 className="font-display text-4xl text-ocean-700 mb-4">
            The US Healthcare Disaster
          </h2>
          <p className="text-ocean-600/70 text-lg max-w-2xl mx-auto">
            Americans pay the highest healthcare costs in the world while receiving mediocre outcomes.
            Insurance companies profit while patients suffer.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-red-200"
            >
              <div className="aspect-video">
                <LazyYouTubeEmbed videoId={video.id} title={video.title} />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-ocean-700 text-lg mb-1">{video.title}</h3>
                <p className="text-ocean-600/70 text-sm">{video.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-ocean-600/80 text-lg font-medium">
            There is another way. Medical tourism offers world-class care at a fraction of the cost.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default USHealthcareCrisis;
