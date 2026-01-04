import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SiteHeader from '../components/Layout/SiteHeader';

interface Story {
  id: string;
  slug: string;
  title: string;
  summary: string;
  story_type: 'horror' | 'success' | 'comparison';
  procedure?: string;
  display_name?: string;
  verification_level: string;
  reaction_counts: {
    heart: number;
    me_too: number;
    outraged: number;
    inspiring: number;
    shared: number;
  };
  share_count: number;
  images: string[];
  published_at: string;
}

// SVG Icons following brand guide: line-style, 24px, ocean-600 or sage-500
const Icons = {
  heartbreak: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.5L10 12l4-2-4 6" />
    </svg>
  ),
  celebrate: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  scale: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
    </svg>
  ),
  dollar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  building: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  plane: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  heart: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  share: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  ),
  check: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  star: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  document: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  arrow: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
};

const STORY_TYPE_CONFIG = {
  horror: {
    label: 'Horror Story',
    icon: Icons.heartbreak,
    bgColor: 'bg-ocean-50',
    textColor: 'text-ocean-700',
    borderColor: 'border-ocean-200',
    iconColor: 'text-ocean-600'
  },
  success: {
    label: 'Success Story',
    icon: Icons.celebrate,
    bgColor: 'bg-sage-50',
    textColor: 'text-sage-700',
    borderColor: 'border-sage-200',
    iconColor: 'text-sage-600'
  },
  comparison: {
    label: 'Comparison',
    icon: Icons.scale,
    bgColor: 'bg-gold-50',
    textColor: 'text-gold-700',
    borderColor: 'border-gold-200',
    iconColor: 'text-gold-600'
  }
};

const ISSUE_OPTIONS = [
  { value: 'billing', label: 'Insane Billing', icon: Icons.dollar },
  { value: 'insurance_denial', label: 'Insurance Denial', icon: Icons.shield },
  { value: 'bankruptcy', label: 'Medical Bankruptcy', icon: Icons.heartbreak },
  { value: 'wait_time', label: 'Wait Time', icon: Icons.clock },
  { value: 'quality', label: 'Quality Issue', icon: Icons.building },
  { value: 'medical_tourism', label: 'Medical Tourism', icon: Icons.plane }
];

const StoryCard: React.FC<{ story: Story; featured?: boolean }> = ({ story, featured = false }) => {
  const config = STORY_TYPE_CONFIG[story.story_type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-lg shadow-lg overflow-hidden border border-sage-200 hover:shadow-xl transition-all ${featured ? 'md:col-span-2' : ''}`}
    >
      <Link to={`/stories/${story.slug}`} className="block">
        {/* Story Type Badge */}
        <div className={`px-4 py-3 ${config.bgColor} ${config.borderColor} border-b flex items-center gap-2`}>
          <span className={config.iconColor}>{config.icon}</span>
          <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
          {story.procedure && (
            <span className="text-xs text-ocean-500 ml-auto font-medium">{story.procedure}</span>
          )}
        </div>
        
        {/* Image (if present) */}
        {story.images?.[0] && (
          <div className="h-48 overflow-hidden">
            <img 
              src={story.images[0]} 
              alt={story.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-5">
          <h3 className={`font-display ${featured ? 'text-2xl' : 'text-lg'} text-ocean-800 mb-2 line-clamp-2`}>
            {story.title}
          </h3>
          
          <p className="text-sage-600 text-sm line-clamp-3 mb-4">
            {story.summary}
          </p>
          
          {/* Author */}
          <div className="flex items-center gap-2 text-xs text-sage-500 mb-4">
            <span className="font-medium">{story.display_name || 'Anonymous'}</span>
            {story.verification_level !== 'anonymous' && (
              <span className="flex items-center gap-1 text-ocean-600">
                <span className="text-ocean-500">{Icons.check}</span>
                Verified
              </span>
            )}
            <span className="ml-auto text-sage-400">
              {new Date(story.published_at).toLocaleDateString()}
            </span>
          </div>
          
          {/* Reactions */}
          <div className="flex items-center gap-4 text-sm text-sage-600">
            <span className="flex items-center gap-1.5 text-ocean-600">
              {Icons.heart}
              <span>{story.reaction_counts.heart}</span>
            </span>
            <span className="flex items-center gap-1.5 text-ocean-600">
              {Icons.users}
              <span>{story.reaction_counts.me_too}</span>
            </span>
            <span className="flex items-center gap-1.5 ml-auto text-sage-500">
              {Icons.share}
              <span>{story.share_count} shares</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Stories: React.FC = () => {
  const [stories, setStories] = useState<{
    featured: Story[];
    trending: Story[];
    latest: Story[];
  }>({ featured: [], trending: [], latest: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'horror' | 'success' | 'comparison'>('all');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await fetch('/.netlify/functions/stories-api/featured');
      const data = await response.json();
      
      if (data.error || !response.ok) {
        console.error('API error:', data.error || 'Unknown error');
        return;
      }
      
      setStories({
        featured: Array.isArray(data.featured) ? data.featured : [],
        trending: Array.isArray(data.trending) ? data.trending : [],
        latest: Array.isArray(data.latest) ? data.latest : []
      });
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = [...stories.featured, ...stories.trending, ...stories.latest]
    .filter((story, index, arr) => arr.findIndex(s => s.id === story.id) === index)
    .filter(story => activeTab === 'all' || story.story_type === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-800 via-ocean-700 to-ocean-900" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl text-white mb-6"
          >
            Real Stories. Real People. Real Change.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-ocean-100 mb-8 max-w-2xl mx-auto"
          >
            The healthcare system they don't want you to see. Join thousands sharing their experiences 
            and discovering a better way.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/share-story"
              className="px-8 py-4 bg-gradient-to-b from-gold-500 to-gold-600 text-white font-semibold rounded-md shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Share Your Story
            </Link>
            <a
              href="#stories"
              className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-md border border-white/20 hover:bg-white/20 transition-all"
            >
              Read Stories
            </a>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex justify-center gap-8 md:gap-16 text-white"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-300">{stories.latest.length + stories.trending.length || '—'}</div>
              <div className="text-sm text-ocean-200">Stories Shared</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-300">
                {stories.latest.reduce((acc, s) => acc + s.reaction_counts.me_too, 0) || '—'}
              </div>
              <div className="text-sm text-ocean-200">Me Too Reactions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-300">
                {stories.latest.reduce((acc, s) => acc + s.share_count, 0) || '—'}
              </div>
              <div className="text-sm text-ocean-200">Times Shared</div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Filter Bar */}
      <section id="stories" className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-sage-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Story Type Tabs */}
            <div className="flex bg-sage-100 rounded-md p-1">
              {[
                { value: 'all', label: 'All Stories', icon: null },
                { value: 'horror', label: 'Horror', icon: Icons.heartbreak },
                { value: 'success', label: 'Success', icon: Icons.celebrate },
                { value: 'comparison', label: 'Compare', icon: Icons.scale }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition-all ${
                    activeTab === tab.value
                      ? 'bg-white text-ocean-700 shadow-sm'
                      : 'text-sage-600 hover:text-ocean-700'
                  }`}
                >
                  {tab.icon && <span className={activeTab === tab.value ? 'text-ocean-600' : 'text-sage-500'}>{tab.icon}</span>}
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Issue Filter */}
            <select
              value={selectedIssue || ''}
              onChange={(e) => setSelectedIssue(e.target.value || null)}
              className="px-4 py-2 bg-white border border-sage-300 rounded text-sm text-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            >
              <option value="">All Issues</option>
              {ISSUE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            
            {/* Share CTA */}
            <Link
              to="/share-story"
              className="ml-auto px-4 py-2 bg-ocean-600 text-white rounded text-sm font-medium hover:bg-ocean-700 transition-colors flex items-center gap-2"
            >
              {Icons.plus}
              Share Your Story
            </Link>
          </div>
        </div>
      </section>
      
      {/* Stories Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredStories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-100 flex items-center justify-center text-ocean-500">
                {Icons.document}
              </div>
              <h3 className="text-2xl font-display text-ocean-700 mb-4">
                No Stories Yet
              </h3>
              <p className="text-sage-600 mb-8 max-w-md mx-auto">
                Be the first to share your healthcare experience and help others in their journey.
              </p>
              <Link
                to="/share-story"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-b from-gold-500 to-gold-600 text-white font-semibold rounded-md shadow-lg hover:shadow-xl transition-all"
              >
                Share Your Story
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Featured Story */}
              {stories.featured.length > 0 && activeTab === 'all' && (
                <div className="mb-8">
                  <h2 className="text-lg font-display text-ocean-700 mb-4 flex items-center gap-2">
                    <span className="text-gold-500">{Icons.star}</span>
                    Featured Story
                  </h2>
                  <StoryCard story={stories.featured[0]} featured />
                </div>
              )}
              
              {/* Stories Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Load More */}
              <div className="text-center mt-12">
                <button className="px-8 py-3 bg-white border-2 border-ocean-200 text-ocean-700 rounded-md font-medium hover:border-ocean-400 hover:bg-ocean-50 transition-all">
                  Load More Stories
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-ocean-700 to-ocean-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-white mb-6">
            Your Story Could Change Someone's Life
          </h2>
          <p className="text-xl text-ocean-100 mb-8 max-w-2xl mx-auto">
            Every story shared helps another person realize they're not alone — and that there's a better way.
          </p>
          <Link
            to="/share-story"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-b from-gold-500 to-gold-600 text-white font-semibold rounded-md shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Share Your Story
            {Icons.arrow}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Stories;
