import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SiteHeader from '../components/Layout/SiteHeader';
import { useAuth } from '../hooks/useAuth';

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

const REACTION_CONFIG = {
  heart: { emoji: '❤️', label: 'Heart', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  me_too: { emoji: '🤝', label: 'Me Too', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  outraged: { emoji: '😤', label: 'Outraged', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  inspiring: { emoji: '✨', label: 'Inspiring', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  shared: { emoji: '📢', label: 'Shared', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' }
};

const STORY_TYPE_CONFIG = {
  horror: { label: 'Horror Story', emoji: '💔', color: 'text-red-600 bg-red-50' },
  success: { label: 'Success Story', emoji: '🎉', color: 'text-green-600 bg-green-50' },
  comparison: { label: 'US vs Abroad', emoji: '⚖️', color: 'text-blue-600 bg-blue-50' }
};

const StoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [related, setRelated] = useState<RelatedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

  const handleShare = async (platform: string) => {
    if (!story) return;
    
    const url = window.location.href;
    const text = `${story.title} - A ${story.story_type} story about healthcare in America`;
    
    // Log the share
    fetch(`/.netlify/functions/stories-api/${story.id}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, share_type: 'link' })
    });
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        break;
    }
    
    setShowShareMenu(false);
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
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">😔</span>
          </div>
          <h1 className="text-2xl font-display text-ocean-700 mb-4">Story Not Found</h1>
          <p className="text-ocean-600 mb-8">This story may have been removed or doesn't exist.</p>
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
          >
            ← Back to Stories
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
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${typeConfig.color} text-sm font-medium mb-6`}
        >
          <span>{typeConfig.emoji}</span>
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
              <div className="font-medium text-ocean-700">
                {story.display_name || 'Anonymous'}
                {story.verification_level !== 'anonymous' && (
                  <span className="ml-2 text-green-600 text-xs">✓ Verified</span>
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
            className="mb-8 p-4 bg-red-50 rounded-xl border border-red-200"
          >
            <div className="text-sm font-medium text-red-700 mb-3 flex items-center gap-2">
              <span>📄</span> Actual Bills/Receipts
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
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="text-sm text-ocean-600 mb-4">How does this story make you feel?</div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(REACTION_CONFIG).map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${config.color} ${
                  userReactions.has(type) ? 'ring-2 ring-ocean-500 ring-offset-2' : ''
                }`}
              >
                <span className="text-lg">{config.emoji}</span>
                <span className="font-medium">{story.reaction_counts[type as keyof typeof story.reaction_counts]}</span>
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Share */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-ocean-600 to-ocean-800 rounded-2xl p-6 text-center"
        >
          <h3 className="text-xl font-display text-white mb-3">
            Help spread the word
          </h3>
          <p className="text-ocean-100 mb-6">
            Share this story to help others understand what's really happening with healthcare.
          </p>
          <div className="flex flex-wrap gap-3 justify-center relative">
            <button
              onClick={() => handleShare('twitter')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>𝕏</span> Twitter
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>📘</span> Facebook
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>💼</span> LinkedIn
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>{copiedLink ? '✓' : '🔗'}</span> {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </motion.div>
        
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
          <p className="text-ocean-600 mb-6">
            Your experience could help someone else. Share it anonymously or with your name.
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

