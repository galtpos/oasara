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

const STORY_TYPE_CONFIG = {
  horror: {
    label: 'Horror Story',
    emoji: '💔',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
  success: {
    label: 'Success Story',
    emoji: '🎉',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  comparison: {
    label: 'Comparison',
    emoji: '⚖️',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  }
};

const ISSUE_OPTIONS = [
  { value: 'billing', label: 'Insane Billing', emoji: '💸' },
  { value: 'insurance_denial', label: 'Insurance Denial', emoji: '🚫' },
  { value: 'bankruptcy', label: 'Medical Bankruptcy', emoji: '💔' },
  { value: 'wait_time', label: 'Wait Time', emoji: '⏰' },
  { value: 'quality', label: 'Quality Issue', emoji: '🏥' },
  { value: 'medical_tourism', label: 'Medical Tourism', emoji: '✈️' }
];

const StoryCard: React.FC<{ story: Story; featured?: boolean }> = ({ story, featured = false }) => {
  const config = STORY_TYPE_CONFIG[story.story_type];
  const totalReactions = Object.values(story.reaction_counts).reduce((a, b) => a + b, 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-sage-200 hover:shadow-xl transition-all ${featured ? 'md:col-span-2' : ''}`}
    >
      <Link to={`/stories/${story.slug}`} className="block">
        {/* Story Type Badge */}
        <div className={`px-4 py-2 ${config.bgColor} ${config.borderColor} border-b flex items-center gap-2`}>
          <span>{config.emoji}</span>
          <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
          {story.procedure && (
            <span className="text-xs text-ocean-500 ml-auto">{story.procedure}</span>
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
          
          <p className="text-ocean-600 text-sm line-clamp-3 mb-4">
            {story.summary}
          </p>
          
          {/* Author */}
          <div className="flex items-center gap-2 text-xs text-ocean-500 mb-4">
            <span>{story.display_name || 'Anonymous'}</span>
            {story.verification_level !== 'anonymous' && (
              <span className="text-green-600">✓ Verified</span>
            )}
            <span className="ml-auto">
              {new Date(story.published_at).toLocaleDateString()}
            </span>
          </div>
          
          {/* Reactions */}
          <div className="flex items-center gap-4 text-sm text-ocean-600">
            <span className="flex items-center gap-1">
              <span>❤️</span>
              <span>{story.reaction_counts.heart}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>🤝</span>
              <span>{story.reaction_counts.me_too}</span>
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <span>📢</span>
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
      
      // Handle error responses or malformed data
      if (data.error || !response.ok) {
        console.error('API error:', data.error || 'Unknown error');
        // Keep empty arrays
        return;
      }
      
      // Ensure we have arrays even if properties are missing
      setStories({
        featured: Array.isArray(data.featured) ? data.featured : [],
        trending: Array.isArray(data.trending) ? data.trending : [],
        latest: Array.isArray(data.latest) ? data.latest : []
      });
    } catch (error) {
      console.error('Error loading stories:', error);
      // Keep empty arrays on error
    } finally {
      setLoading(false);
    }
  };

  // Filter stories based on active tab and issue
  const filteredStories = [...stories.featured, ...stories.trending, ...stories.latest]
    .filter((story, index, arr) => arr.findIndex(s => s.id === story.id) === index) // dedupe
    .filter(story => activeTab === 'all' || story.story_type === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-800 via-ocean-700 to-ocean-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
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
              className="px-8 py-4 bg-gradient-to-b from-gold-500 to-gold-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Share Your Story
            </Link>
            <a
              href="#stories"
              className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
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
              <div className="text-3xl font-bold">{stories.latest.length + stories.trending.length}</div>
              <div className="text-sm text-ocean-200">Stories Shared</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {stories.latest.reduce((acc, s) => acc + s.reaction_counts.me_too, 0)}
              </div>
              <div className="text-sm text-ocean-200">"Me Too" Reactions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {stories.latest.reduce((acc, s) => acc + s.share_count, 0)}
              </div>
              <div className="text-sm text-ocean-200">Times Shared</div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Filter Bar */}
      <section id="stories" className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-sage-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Story Type Tabs */}
            <div className="flex bg-sage-100 rounded-lg p-1">
              {[
                { value: 'all', label: 'All Stories' },
                { value: 'horror', label: '💔 Horror' },
                { value: 'success', label: '🎉 Success' },
                { value: 'comparison', label: '⚖️ Compare' }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.value
                      ? 'bg-white text-ocean-700 shadow'
                      : 'text-ocean-600 hover:text-ocean-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Issue Filter */}
            <select
              value={selectedIssue || ''}
              onChange={(e) => setSelectedIssue(e.target.value || null)}
              className="px-4 py-2 bg-white border border-sage-300 rounded-lg text-sm text-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500"
            >
              <option value="">All Issues</option>
              {ISSUE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.emoji} {opt.label}
                </option>
              ))}
            </select>
            
            {/* Share CTA */}
            <Link
              to="/share-story"
              className="ml-auto px-4 py-2 bg-ocean-600 text-white rounded-lg text-sm font-medium hover:bg-ocean-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-100 flex items-center justify-center">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-display text-ocean-700 mb-4">
                No stories yet
              </h3>
              <p className="text-ocean-600 mb-8 max-w-md mx-auto">
                Be the first to share your healthcare experience and help others in their journey.
              </p>
              <Link
                to="/share-story"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-b from-gold-500 to-gold-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Share Your Story
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Featured Story (first one, large) */}
              {stories.featured.length > 0 && activeTab === 'all' && (
                <div className="mb-8">
                  <h2 className="text-lg font-display text-ocean-700 mb-4 flex items-center gap-2">
                    <span>⭐</span> Featured Story
                  </h2>
                  <StoryCard story={stories.featured[0]} featured />
                </div>
              )}
              
              {/* Stories Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredStories.map((story, index) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Load More */}
              <div className="text-center mt-12">
                <button className="px-8 py-3 bg-white border-2 border-ocean-200 text-ocean-700 rounded-xl font-medium hover:border-ocean-400 hover:bg-ocean-50 transition-all">
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
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-b from-gold-500 to-gold-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Share Your Story
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Stories;

