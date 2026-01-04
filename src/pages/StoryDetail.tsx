import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SiteHeader from '../components/Layout/SiteHeader';
import SharePanel from '../components/Stories/SharePanel';
import { useAuthState } from '../hooks/useAuth';

interface Story {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary: string;
  story_type: 'horror' | 'success' | 'comparison';
  issues: string[];
  procedure?: string;
  location_us_state?: string;
  location_country?: string;
  cost_us?: number;
  cost_abroad?: number;
  savings_percent?: number;
  verification_level: string;
  display_name?: string;
  show_location?: boolean;
  author_location?: string;
  images: string[];
  video_url?: string;
  bill_images: string[];
  view_count: number;
  share_count: number;
  comment_count: number;
  reaction_counts: {
    heart: number;
    me_too: number;
    outraged: number;
    inspiring: number;
    shared: number;
  };
  share_card_url?: string;
  published_at: string;
}

interface RelatedStory {
  id: string;
  slug: string;
  title: string;
  summary: string;
  story_type: string;
  reaction_counts: Record<string, number>;
  share_count: number;
}

// SVG Icons following brand guide
const Icons = {
  heart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  fire: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  ),
  sparkle: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  megaphone: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  ),
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
  document: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  arrow: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  check: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  sad: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
    </svg>
  )
};

const REACTION_CONFIG = {
  heart: { icon: Icons.heart, label: 'Heart', color: 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100' },
  me_too: { icon: Icons.users, label: 'Me Too', color: 'bg-gold-50 text-gold-700 hover:bg-gold-100' },
  outraged: { icon: Icons.fire, label: 'Outraged', color: 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100' },
  inspiring: { icon: Icons.sparkle, label: 'Inspiring', color: 'bg-sage-100 text-sage-700 hover:bg-sage-200' },
  shared: { icon: Icons.megaphone, label: 'Shared', color: 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100' }
};

const STORY_TYPE_CONFIG = {
  horror: { label: 'Horror Story', icon: Icons.heartbreak, color: 'text-ocean-700 bg-ocean-50' },
  success: { label: 'Success Story', icon: Icons.celebrate, color: 'text-sage-700 bg-sage-50' },
  comparison: { label: 'US vs Abroad', icon: Icons.scale, color: 'text-gold-700 bg-gold-50' }
};

const StoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthState();
  const [story, setStory] = useState<Story | null>(null);
  const [related, setRelated] = useState<RelatedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (slug) {
      loadStory(slug);
    }
  }, [slug]);

  const loadStory = async (storySlug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/.netlify/functions/stories-api/${storySlug}`);
      
      if (!response.ok) {
        throw new Error('Story not found');
      }
      
      const data = await response.json();
      setStory(data.story);
      setRelated(data.related || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!story) return;
    
    const hasReacted = userReactions.has(reactionType);
    const sessionId = localStorage.getItem('oasara-session') || crypto.randomUUID();
    localStorage.setItem('oasara-session', sessionId);

    try {
      if (hasReacted) {
        // Remove reaction
        await fetch(`/.netlify/functions/stories-api/${story.id}/react`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reaction_type: reactionType,
            session_id: user ? undefined : sessionId
          })
        });
        setUserReactions(prev => {
          const next = new Set(prev);
          next.delete(reactionType);
          return next;
        });
        // Optimistic update
        setStory(prev => prev ? {
          ...prev,
          reaction_counts: {
            ...prev.reaction_counts,
            [reactionType]: Math.max(0, prev.reaction_counts[reactionType as keyof typeof prev.reaction_counts] - 1)
          }
        } : null);
      } else {
        // Add reaction
        await fetch(`/.netlify/functions/stories-api/${story.id}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reaction_type: reactionType,
            session_id: user ? undefined : sessionId
          })
        });
        setUserReactions(prev => new Set([...prev, reactionType]));
        // Optimistic update
        setStory(prev => prev ? {
          ...prev,
          reaction_counts: {
            ...prev.reaction_counts,
            [reactionType]: prev.reaction_counts[reactionType as keyof typeof prev.reaction_counts] + 1
          }
        } : null);
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
        <SiteHeader />
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-100 flex items-center justify-center text-ocean-500">
            {Icons.sad}
          </div>
          <h1 className="text-2xl font-display text-ocean-700 mb-4">Story Not Found</h1>
          <p className="text-sage-600 mb-8">This story may have been removed or doesn't exist.</p>
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 transition-colors"
          >
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  const typeConfig = STORY_TYPE_CONFIG[story.story_type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
      <SiteHeader />
      
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link to="/stories" className="text-ocean-600 hover:text-ocean-700 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Stories
          </Link>
        </nav>
        
        {/* Story Type Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md ${typeConfig.color} text-sm font-medium mb-6`}
        >
          <span>{typeConfig.icon}</span>
          <span>{typeConfig.label}</span>
          {story.procedure && (
            <span className="ml-2 text-ocean-500">• {story.procedure}</span>
          )}
        </motion.div>
        
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-3xl md:text-4xl text-ocean-800 mb-6"
        >
          {story.title}
        </motion.h1>
        
        {/* Author & Meta */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 text-sm text-ocean-600 mb-8 pb-8 border-b border-sage-200"
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-700 font-medium">
              {(story.display_name || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-ocean-700 flex items-center gap-1">
                {story.display_name || 'Anonymous'}
                {story.verification_level !== 'anonymous' && (
                  <span className="ml-1 text-ocean-600 inline-flex items-center gap-0.5 text-xs">
                    {Icons.check} Verified
                  </span>
                )}
              </div>
              {story.show_location && story.author_location && (
                <div className="text-xs text-ocean-500">{story.author_location}</div>
              )}
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-4 text-ocean-500">
            <span>{new Date(story.published_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            <span>•</span>
            <span>{story.view_count.toLocaleString()} views</span>
          </div>
        </motion.div>
        
        {/* Cost Comparison (for comparison stories) */}
        {story.story_type === 'comparison' && story.cost_us && story.cost_abroad && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-r from-red-50 via-white to-green-50 rounded-2xl p-6 mb-8 border border-sage-200"
          >
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-sm text-red-600 font-medium mb-1">US Price</div>
                <div className="text-3xl font-bold text-red-700">
                  ${story.cost_us.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-ocean-100 flex items-center justify-center">
                  <span className="text-2xl">→</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-green-600 font-medium mb-1">
                  {story.location_country || 'Abroad'}
                </div>
                <div className="text-3xl font-bold text-green-700">
                  ${story.cost_abroad.toLocaleString()}
                </div>
              </div>
            </div>
            {story.savings_percent && (
              <div className="text-center mt-4 pt-4 border-t border-sage-200">
                <span className="text-lg font-medium text-ocean-700">
                  Saved <span className="text-green-600 font-bold">{story.savings_percent}%</span>
                </span>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Images */}
        {story.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className={`grid ${story.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
              {story.images.map((img, i) => (
                <img 
                  key={i}
                  src={img}
                  alt={`Story image ${i + 1}`}
                  className="w-full rounded-xl shadow-lg"
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Bill Images (special treatment) */}
        {story.bill_images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mb-8 p-4 bg-ocean-50 rounded-lg border border-ocean-200"
          >
            <div className="text-sm font-medium text-ocean-700 mb-3 flex items-center gap-2">
              {Icons.document} Actual Bills/Receipts
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {story.bill_images.map((img, i) => (
                <img 
                  key={i}
                  src={img}
                  alt={`Bill ${i + 1}`}
                  className="w-full rounded-lg shadow cursor-pointer hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="prose prose-lg prose-ocean max-w-none mb-12"
        >
          {story.content.split('\n').map((paragraph, i) => (
            paragraph.trim() && <p key={i}>{paragraph}</p>
          ))}
        </motion.div>
        
        {/* Tags */}
        {story.issues.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {story.issues.map(issue => (
              <Link
                key={issue}
                to={`/stories?issue=${issue}`}
                className="px-3 py-1 bg-sage-100 text-ocean-700 rounded-full text-sm hover:bg-sage-200 transition-colors"
              >
                #{issue.replace('_', ' ')}
              </Link>
            ))}
          </div>
        )}
        
        {/* Reactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="text-sm text-sage-600 mb-4">How does this story make you feel?</div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(REACTION_CONFIG).map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${config.color} ${
                  userReactions.has(type) ? 'ring-2 ring-ocean-500 ring-offset-2' : ''
                }`}
              >
                {config.icon}
                <span className="font-medium">{story.reaction_counts[type as keyof typeof story.reaction_counts]}</span>
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Share Panel */}
        <SharePanel 
          story={{
            id: story.id,
            slug: story.slug,
            title: story.title,
            summary: story.summary,
            story_type: story.story_type,
            reaction_counts: story.reaction_counts,
            share_count: story.share_count
          }}
          onShare={() => {
            // Optimistically update share count
            setStory(prev => prev ? { ...prev, share_count: prev.share_count + 1 } : null);
          }}
        />
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <h3 className="text-xl font-display text-ocean-700 mb-4">
            Have your own story?
          </h3>
          <p className="text-sage-600 mb-6">
            Your experience could help someone else. Share it anonymously or with your name.
          </p>
          <Link
            to="/share-story"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-b from-gold-500 to-gold-600 text-white font-semibold rounded-md shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Share Your Story
            {Icons.arrow}
          </Link>
        </motion.div>
        
        {/* Related Stories */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 pt-12 border-t border-sage-200"
          >
            <h3 className="text-xl font-display text-ocean-700 mb-6">Related Stories</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map(rs => (
                <Link
                  key={rs.id}
                  to={`/stories/${rs.slug}`}
                  className="block bg-white rounded-xl shadow p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="text-xs text-ocean-500 mb-2 capitalize">{rs.story_type} Story</div>
                  <h4 className="font-display text-ocean-800 mb-2 line-clamp-2">{rs.title}</h4>
                  <p className="text-sm text-ocean-600 line-clamp-2">{rs.summary}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </article>
    </div>
  );
};

export default StoryDetail;

