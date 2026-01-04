import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SharePanelProps {
  story: {
    id: string;
    slug: string;
    title: string;
    summary?: string;
    story_type: 'horror' | 'success' | 'comparison';
    reaction_counts: Record<string, number>;
    share_count: number;
  };
  onShare?: (platform: string) => void;
}

interface ViralKitData {
  twitter_thread?: string[];
  instagram_carousel?: {
    slide_number: number;
    type: string;
    headline: string;
    body?: string;
    stats?: string[];
  }[];
  plain_text?: string;
  story_url: string;
}

// SVG Icons following brand guide
const Icons = {
  x: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  facebook: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  copy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  thread: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  carousel: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  text: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  share: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
};

const SharePanel: React.FC<SharePanelProps> = ({ story, onShare }) => {
  const [viralKit, setViralKit] = useState<ViralKitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'thread' | 'carousel' | 'text'>('quick');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded && !viralKit) {
      loadViralKit();
    }
  }, [expanded]);

  const loadViralKit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/generate-share-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: story.slug,
          card_types: ['twitter', 'instagram']
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setViralKit({
          twitter_thread: data.cards?.find((c: any) => c.card_type === 'twitter')?.twitter_thread,
          instagram_carousel: data.cards?.find((c: any) => c.card_type === 'instagram')?.instagram_carousel,
          plain_text: data.cards?.[0]?.plain_text,
          story_url: data.story_url
        });
      }
    } catch (err) {
      console.error('Failed to load viral kit:', err);
    } finally {
      setLoading(false);
    }
  };

  const logShare = async (platform: string, shareType: string) => {
    try {
      await fetch(`/.netlify/functions/stories-api/${story.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, share_type: shareType })
      });
      onShare?.(platform);
    } catch (err) {
      console.error('Failed to log share:', err);
    }
  };

  const handleQuickShare = (platform: string) => {
    const url = `https://oasara.com/stories/${story.slug}`;
    const text = `${story.title} - A ${story.story_type} story about healthcare`;
    
    logShare(platform, 'link');
    
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
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
    logShare('clipboard', key);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-sage-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-ocean-600 to-ocean-700 text-white"
      >
        <div className="flex items-center gap-3">
          {Icons.share}
          <div className="text-left">
            <div className="font-medium">Share This Story</div>
            <div className="text-sm text-ocean-100">{story.share_count} shares so far</div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {Icons.chevronDown}
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tabs */}
            <div className="border-b border-sage-200">
              <div className="flex">
                {[
                  { id: 'quick', label: 'Quick Share', icon: Icons.share },
                  { id: 'thread', label: 'X Thread', icon: Icons.thread },
                  { id: 'carousel', label: 'Instagram', icon: Icons.carousel },
                  { id: 'text', label: 'Copy Text', icon: Icons.text }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-ocean-700 border-b-2 border-ocean-500 bg-ocean-50'
                        : 'text-sage-600 hover:text-ocean-600 hover:bg-sage-50'
                    }`}
                  >
                    <span className={activeTab === tab.id ? 'text-ocean-600' : 'text-sage-400'}>
                      {tab.icon}
                    </span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-3 border-ocean-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Quick Share */}
                  {activeTab === 'quick' && (
                    <div className="space-y-4">
                      <p className="text-sm text-sage-600 mb-4">
                        Share this story directly to your social networks:
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => handleQuickShare('twitter')}
                          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-sage-50 hover:bg-sage-100 transition-colors group"
                        >
                          <div className="text-sage-600 group-hover:text-ocean-600 transition-colors">
                            {Icons.x}
                          </div>
                          <span className="text-sm font-medium text-sage-700">X / Twitter</span>
                        </button>
                        <button
                          onClick={() => handleQuickShare('facebook')}
                          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-sage-50 hover:bg-sage-100 transition-colors group"
                        >
                          <div className="text-sage-600 group-hover:text-[#1877F2] transition-colors">
                            {Icons.facebook}
                          </div>
                          <span className="text-sm font-medium text-sage-700">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleQuickShare('linkedin')}
                          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-sage-50 hover:bg-sage-100 transition-colors group"
                        >
                          <div className="text-sage-600 group-hover:text-[#0A66C2] transition-colors">
                            {Icons.linkedin}
                          </div>
                          <span className="text-sm font-medium text-sage-700">LinkedIn</span>
                        </button>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`https://oasara.com/stories/${story.slug}`, 'link')}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 transition-colors"
                      >
                        {copiedStates.link ? Icons.check : Icons.copy}
                        {copiedStates.link ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  )}

                  {/* Twitter Thread */}
                  {activeTab === 'thread' && (
                    <div className="space-y-4">
                      <p className="text-sm text-sage-600 mb-4">
                        Copy this pre-written thread to post on X:
                      </p>
                      {viralKit?.twitter_thread ? (
                        <div className="space-y-3">
                          {viralKit.twitter_thread.map((tweet, index) => (
                            <div
                              key={index}
                              className="relative p-4 bg-sage-50 rounded-lg border border-sage-200"
                            >
                              <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-ocean-600 text-white text-xs flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                              <p className="text-sm text-ocean-800 whitespace-pre-wrap pl-2">
                                {tweet}
                              </p>
                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-sage-200">
                                <span className="text-xs text-sage-500">
                                  {tweet.length}/280 characters
                                </span>
                                <button
                                  onClick={() => copyToClipboard(tweet, `tweet-${index}`)}
                                  className="text-xs text-ocean-600 hover:text-ocean-700 flex items-center gap-1"
                                >
                                  {copiedStates[`tweet-${index}`] ? Icons.check : Icons.copy}
                                  {copiedStates[`tweet-${index}`] ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => copyToClipboard(viralKit.twitter_thread!.join('\n\n---\n\n'), 'full-thread')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 transition-colors"
                          >
                            {copiedStates['full-thread'] ? Icons.check : Icons.copy}
                            {copiedStates['full-thread'] ? 'Copied Full Thread!' : 'Copy Entire Thread'}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-sage-500">
                          Thread not available. Try refreshing.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Instagram Carousel */}
                  {activeTab === 'carousel' && (
                    <div className="space-y-4">
                      <p className="text-sm text-sage-600 mb-4">
                        Use these slides as a guide for your Instagram carousel:
                      </p>
                      {viralKit?.instagram_carousel ? (
                        <div className="space-y-4">
                          <div className="flex gap-3 overflow-x-auto pb-4">
                            {viralKit.instagram_carousel.map((slide, index) => (
                              <div
                                key={index}
                                className="flex-shrink-0 w-48 h-48 rounded-lg bg-gradient-to-br from-ocean-600 to-ocean-800 p-4 text-white flex flex-col justify-between"
                              >
                                <div className="text-xs opacity-75">
                                  Slide {slide.slide_number}
                                </div>
                                <div>
                                  <div className="font-display text-lg leading-tight mb-2">
                                    {slide.headline}
                                  </div>
                                  {slide.body && (
                                    <p className="text-xs opacity-90 line-clamp-3">
                                      {slide.body}
                                    </p>
                                  )}
                                  {slide.stats && (
                                    <div className="space-y-1 mt-2">
                                      {slide.stats.map((stat, i) => (
                                        <div key={i} className="text-xs opacity-90">{stat}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-sage-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-ocean-700 mb-2">Carousel Caption:</h4>
                            <p className="text-sm text-sage-600 mb-3">
                              {story.title}
                              {'\n\n'}
                              Read the full story: oasara.com/stories/{story.slug}
                              {'\n\n'}
                              #HealthcareReform #MedicalTourism #HealthcareStories
                            </p>
                            <button
                              onClick={() => copyToClipboard(
                                `${story.title}\n\nRead the full story: oasara.com/stories/${story.slug}\n\n#HealthcareReform #MedicalTourism #HealthcareStories`,
                                'instagram-caption'
                              )}
                              className="text-sm text-ocean-600 hover:text-ocean-700 flex items-center gap-1"
                            >
                              {copiedStates['instagram-caption'] ? Icons.check : Icons.copy}
                              {copiedStates['instagram-caption'] ? 'Copied!' : 'Copy Caption'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-sage-500">
                          Carousel not available. Try refreshing.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Plain Text */}
                  {activeTab === 'text' && (
                    <div className="space-y-4">
                      <p className="text-sm text-sage-600 mb-4">
                        Copy this text to share via message, email, or anywhere:
                      </p>
                      {viralKit?.plain_text ? (
                        <div className="space-y-3">
                          <div className="p-4 bg-sage-50 rounded-lg border border-sage-200">
                            <p className="text-sm text-ocean-800 whitespace-pre-wrap">
                              {viralKit.plain_text}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(viralKit.plain_text!, 'plain-text')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 transition-colors"
                          >
                            {copiedStates['plain-text'] ? Icons.check : Icons.copy}
                            {copiedStates['plain-text'] ? 'Copied!' : 'Copy Text'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 bg-sage-50 rounded-lg border border-sage-200">
                            <p className="text-sm text-ocean-800">
                              {story.title}
                              {'\n\n'}
                              {story.summary}
                              {'\n\n'}
                              Read the full story: https://oasara.com/stories/{story.slug}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(
                              `${story.title}\n\n${story.summary}\n\nRead the full story: https://oasara.com/stories/${story.slug}`,
                              'plain-text'
                            )}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 transition-colors"
                          >
                            {copiedStates['plain-text'] ? Icons.check : Icons.copy}
                            {copiedStates['plain-text'] ? 'Copied!' : 'Copy Text'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SharePanel;

