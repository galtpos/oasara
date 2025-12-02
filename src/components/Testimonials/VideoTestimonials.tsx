import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoTestimonial {
  id: string;
  title: string;
  description: string;
  speaker: string;
  location?: string;
  category: 'success' | 'challenge';
  duration: string;
  thumbnail: string;
  videoUrl: string; // YouTube embed URL or direct video URL
  videoType: 'youtube' | 'vimeo' | 'direct';
}

// Video testimonial data
// To add a real video:
// 1. Upload to YouTube and get the video ID (the part after v= in the URL)
// 2. Set videoUrl to: https://www.youtube.com/embed/VIDEO_ID
// 3. Set hasVideo to true
// 4. Update thumbnail with a screenshot from the video

const testimonials: VideoTestimonial[] = [
  // Medical Tourism Success Stories
  {
    id: '1',
    title: 'Saved $47,000 on Heart Surgery in Thailand',
    description: 'After being quoted $65,000 in the US, I found world-class cardiac care at Bumrungrad Hospital in Bangkok for a fraction of the price. The experience exceeded every expectation.',
    speaker: 'Robert M.',
    location: 'Texas',
    category: 'success',
    duration: '3:24',
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=640&q=80',
    videoUrl: '', // Add YouTube embed URL when available
    videoType: 'youtube'
  },
  {
    id: '2',
    title: 'My Dental Implants Journey to Mexico',
    description: 'Full mouth restoration that would have cost $80,000 at home was done beautifully for $15,000 in Tijuana. Same technology, same quality, life-changing savings.',
    speaker: 'Linda K.',
    location: 'California',
    category: 'success',
    duration: '4:12',
    thumbnail: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=640&q=80',
    videoUrl: '', // Add YouTube embed URL when available
    videoType: 'youtube'
  },
  {
    id: '3',
    title: 'Knee Replacement in India Changed My Life',
    description: 'JCI-accredited Apollo Hospital, English-speaking surgeons, and a recovery vacation in Kerala - all for less than my US insurance deductible.',
    speaker: 'James T.',
    location: 'Florida',
    category: 'success',
    duration: '5:45',
    thumbnail: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=640&q=80',
    videoUrl: '', // Add YouTube embed URL when available
    videoType: 'youtube'
  },
  {
    id: '4',
    title: 'IVF Success Story in Czech Republic',
    description: 'After three failed and expensive rounds in the US, we finally conceived at a renowned Prague clinic at 1/4 the cost. Our miracle baby is now 2 years old.',
    speaker: 'Sarah & Mike',
    location: 'New York',
    category: 'success',
    duration: '6:30',
    thumbnail: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=640&q=80',
    videoUrl: '', // Add YouTube embed URL when available
    videoType: 'youtube'
  },
  // Healthcare System Challenges
  {
    id: '5',
    title: 'Medical Bankruptcy Destroyed Our Savings',
    description: 'Even with what we thought was good insurance, a cancer diagnosis left us with $120,000 in bills. We lost our home and our retirement savings.',
    speaker: 'Patricia H.',
    location: 'Ohio',
    category: 'challenge',
    duration: '4:58',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=640&q=80',
    videoUrl: '', // Add YouTube embed URL when available
    videoType: 'youtube'
  },
  {
    id: '6',
    title: 'Surprise Bills: The $50,000 Ambulance Ride',
    description: 'An out-of-network ambulance and emergency room visit for my son\'s broken arm ended up costing more than my car. Nobody told us the ambulance wasn\'t covered.',
    speaker: 'Michael D.',
    location: 'Georgia',
    category: 'challenge',
    duration: '3:15',
    thumbnail: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=640&q=80',
    videoUrl: '', // Add YouTube embed URL when available
    videoType: 'youtube'
  },
  {
    id: '7',
    title: 'Insurance Denied My Life-Saving Treatment',
    description: 'After months of appeals for a treatment my doctor said I needed, I was still denied coverage. I had to crowdfund on GoFundMe just to survive.',
    speaker: 'Jennifer L.',
    location: 'Arizona',
    category: 'challenge',
    duration: '5:22',
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=640&q=80',
    videoUrl: '', // Add YouTube embed URL when available
    videoType: 'youtube'
  },
  {
    id: '8',
    title: 'Paying Off Medical Debt for 15 Years',
    description: 'A routine appendectomy when I was 25 has followed me into my 40s. The interest alone has doubled what I originally owed. The system is fundamentally broken.',
    speaker: 'David R.',
    location: 'Michigan',
    category: 'challenge',
    duration: '4:03',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=640&q=80',
    videoUrl: '', // Add YouTube embed URL when available
    videoType: 'youtube'
  }
];

interface VideoModalProps {
  video: VideoTestimonial;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const hasVideo = video.videoUrl && video.videoUrl.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video embed or Coming Soon */}
        <div className="aspect-video">
          {hasVideo ? (
            video.videoType === 'youtube' ? (
              <iframe
                src={`${video.videoUrl}?autoplay=1&rel=0`}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : video.videoType === 'vimeo' ? (
              <iframe
                src={`${video.videoUrl}?autoplay=1`}
                title={video.title}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={video.videoUrl}
                className="w-full h-full"
                controls
                autoPlay
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 relative">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative z-10 text-center p-8">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Video Coming Soon</h4>
                <p className="text-gray-300 max-w-md">
                  We're collecting real stories from people like you. Want to share your experience?
                </p>
                <a 
                  href="/feedback" 
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-white rounded-xl font-semibold transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Submit Your Story
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Video info */}
        <div className="p-6 bg-gradient-to-t from-black to-gray-900">
          <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
          <p className="text-gray-300 mb-3">{video.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {video.speaker}
            </span>
            {video.location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {video.location}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface VideoCardProps {
  video: VideoTestimonial;
  onClick: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all text-left"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-ocean-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 text-white text-xs font-medium">
          {video.duration}
        </div>

        {/* Category badge */}
        <div className={`
          absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold
          ${video.category === 'success' 
            ? 'bg-emerald-500 text-white' 
            : 'bg-amber-500 text-white'
          }
        `}>
          {video.category === 'success' ? 'Success Story' : 'System Challenge'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-ocean-600 transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {video.description}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white font-bold text-xs">
            {video.speaker.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-700">{video.speaker}</p>
            {video.location && <p className="text-xs">{video.location}</p>}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

type FilterType = 'all' | 'success' | 'challenge';

const VideoTestimonials: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);

  const filteredVideos = activeFilter === 'all' 
    ? testimonials 
    : testimonials.filter(v => v.category === activeFilter);

  const successCount = testimonials.filter(v => v.category === 'success').length;
  const challengeCount = testimonials.filter(v => v.category === 'challenge').length;

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-ocean-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-ocean-600 text-sm font-semibold mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            REAL STORIES
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hear From People Like You
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real experiences from patients who've discovered better healthcare options abroad, 
            and those who've faced the harsh realities of our broken system.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveFilter('all')}
            className={`
              px-6 py-3 rounded-full font-semibold transition-all duration-200
              ${activeFilter === 'all'
                ? 'bg-ocean-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }
            `}
          >
            All Stories ({testimonials.length})
          </button>
          <button
            onClick={() => setActiveFilter('success')}
            className={`
              px-6 py-3 rounded-full font-semibold transition-all duration-200 flex items-center gap-2
              ${activeFilter === 'success'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Medical Tourism Success ({successCount})
          </button>
          <button
            onClick={() => setActiveFilter('challenge')}
            className={`
              px-6 py-3 rounded-full font-semibold transition-all duration-200 flex items-center gap-2
              ${activeFilter === 'challenge'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Healthcare System Challenges ({challengeCount})
          </button>
        </div>

        {/* Video grid */}
        <motion.div 
          layout
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <VideoCard
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Call to action */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-2xl text-white">
            <div className="text-left">
              <p className="font-bold text-lg">Have a story to share?</p>
              <p className="text-ocean-100 text-sm">Help others by sharing your medical tourism experience.</p>
            </div>
            <a
              href="/feedback"
              className="px-6 py-3 bg-white text-ocean-600 rounded-xl font-semibold hover:bg-ocean-50 transition-colors whitespace-nowrap"
            >
              Submit Your Story
            </a>
          </div>
        </div>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default VideoTestimonials;

