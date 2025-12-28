import React from 'react';
import { motion } from 'framer-motion';
import LazyYouTubeEmbed from './LazyYouTubeEmbed';

interface MedicalTourismVideosProps {
  variant?: 'full' | 'compact';
}

const MedicalTourismVideos: React.FC<MedicalTourismVideosProps> = ({ variant = 'compact' }) => {
  const videos = [
    {
      id: 'TeX_rBzgWDs',
      title: 'Why Medical Tourism?',
      description: 'The growing movement of patients seeking quality care abroad',
      isShort: false
    },
    {
      id: '51igZA1_YSY',
      title: 'Medical Tourism Explained',
      description: 'Everything you need to know about getting care abroad',
      isShort: false
    },
    {
      id: 'NynZG7nObCo',
      title: 'Medical Tourism Quick Facts',
      description: 'Key insights in 60 seconds',
      isShort: true
    },
    {
      id: 'L1sbjaiIo3A',
      title: 'Savings Spotlight',
      description: 'How much can you really save?',
      isShort: true
    }
  ];

  // Separate regular videos and shorts
  const regularVideos = videos.filter(v => !v.isShort);
  const shorts = videos.filter(v => v.isShort);

  if (variant === 'compact') {
    return (
      <section className="py-12 px-6 bg-sage-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-3xl text-ocean-700 mb-2">
              Why Medical Tourism?
            </h2>
            <p className="text-ocean-600/70">
              Learn about the global healthcare revolution
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
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className={video.isShort ? "aspect-[9/16] max-h-[280px]" : "aspect-video"}>
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

  // Full variant with separate sections for videos and shorts
  return (
    <section className="py-16 px-6 bg-gradient-to-br from-sage-100 to-sage-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl text-ocean-700 mb-4">
            Why Medical Tourism?
          </h2>
          <p className="text-ocean-600/70 text-lg max-w-2xl mx-auto">
            Join millions who are discovering world-class healthcare at a fraction of US costs
          </p>
        </motion.div>

        {/* Regular Videos */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {regularVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-sage-200"
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

        {/* Shorts */}
        <div className="flex justify-center gap-6">
          {shorts.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-sage-200 w-[200px]"
            >
              <div className="aspect-[9/16]">
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
};

export default MedicalTourismVideos;
