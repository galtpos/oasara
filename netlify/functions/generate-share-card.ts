import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Use anon key - RLS policies handle public access
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This function generates data for share cards
// In a production environment, you'd use a canvas library (like node-canvas) 
// or an image generation service (like Cloudinary, Bannerbear, or Satori)
// For now, we return structured data that the frontend can use to render cards

interface ShareCardData {
  story: {
    title: string;
    summary: string;
    story_type: 'horror' | 'success' | 'comparison';
    display_name?: string;
    procedure?: string;
    cost_us?: number;
    cost_abroad?: number;
    savings_percent?: number;
    reaction_counts: Record<string, number>;
  };
  card_type: 'og' | 'twitter' | 'instagram' | 'tiktok';
  template_data: {
    headline: string;
    subheadline: string;
    cta: string;
    stats: string[];
    color_scheme: 'horror' | 'success' | 'comparison';
    background: string;
  };
  dimensions: {
    width: number;
    height: number;
  };
  twitter_thread?: string[];
  instagram_carousel?: InstagramSlide[];
  plain_text?: string;
}

interface InstagramSlide {
  slide_number: number;
  type: 'hook' | 'content' | 'stats' | 'cta';
  headline: string;
  body?: string;
  stats?: string[];
  background: string;
}

const STORY_TYPE_COLORS = {
  horror: {
    primary: '#DC2626', // red
    secondary: '#FEE2E2',
    background: 'linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)'
  },
  success: {
    primary: '#059669', // green
    secondary: '#D1FAE5',
    background: 'linear-gradient(135deg, #059669 0%, #064E3B 100%)'
  },
  comparison: {
    primary: '#2563EB', // blue
    secondary: '#DBEAFE',
    background: 'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)'
  }
};

const CARD_DIMENSIONS = {
  og: { width: 1200, height: 630 },      // OpenGraph standard
  twitter: { width: 1200, height: 675 }, // Twitter card
  instagram: { width: 1080, height: 1080 }, // Square for feed
  tiktok: { width: 1080, height: 1920 }  // Vertical for TikTok/Reels
};

function generateTwitterThread(story: any): string[] {
  const threads: string[] = [];
  
  // Tweet 1: Hook
  if (story.story_type === 'comparison' && story.cost_us && story.cost_abroad) {
    threads.push(`THREAD: How I saved ${story.savings_percent}% on ${story.procedure || 'healthcare'}

US quote: $${story.cost_us.toLocaleString()}
What I actually paid: $${story.cost_abroad.toLocaleString()}

Here's exactly what happened 🧵`);
  } else if (story.story_type === 'horror') {
    threads.push(`THREAD: ${story.title}

This is what's wrong with American healthcare.

What happened to me should never happen to anyone. 🧵`);
  } else {
    threads.push(`THREAD: ${story.title}

I found a way out of the broken healthcare system.

Here's my story. 🧵`);
  }
  
  // Tweet 2-4: Story content (split by paragraphs, max 280 chars each)
  const contentParts = story.content?.split('\n').filter((p: string) => p.trim()) || [];
  let currentTweet = '';
  
  for (const part of contentParts) {
    if ((currentTweet + '\n\n' + part).length < 270) {
      currentTweet += (currentTweet ? '\n\n' : '') + part;
    } else {
      if (currentTweet) threads.push(currentTweet);
      currentTweet = part.length < 270 ? part : part.substring(0, 267) + '...';
    }
  }
  if (currentTweet) threads.push(currentTweet);
  
  // Final tweet: CTA
  threads.push(`If this resonated with you, share your own story at oasara.com/share-story

Together, we're building a healthcare revolution.

${story.reaction_counts?.me_too > 0 ? `${story.reaction_counts.me_too} others have said "me too"` : ''}

#HealthcareReform #MedicalTourism`);
  
  return threads;
}

function generateInstagramCarousel(story: any): InstagramSlide[] {
  const slides: InstagramSlide[] = [];
  const colorScheme = STORY_TYPE_COLORS[story.story_type as keyof typeof STORY_TYPE_COLORS];
  
  // Slide 1: Hook
  let hookHeadline = '';
  if (story.story_type === 'comparison' && story.cost_us && story.cost_abroad) {
    hookHeadline = `I Saved\n${story.savings_percent}%`;
  } else if (story.story_type === 'horror') {
    hookHeadline = 'This Should\nNever Happen';
  } else {
    hookHeadline = 'I Found a\nBetter Way';
  }
  
  slides.push({
    slide_number: 1,
    type: 'hook',
    headline: hookHeadline,
    body: story.procedure || 'Healthcare',
    background: colorScheme.background
  });
  
  // Slides 2-4: Story content (broken into chunks)
  const content = story.content || story.summary || '';
  const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim()).slice(0, 6);
  
  // Group sentences into 2-3 per slide
  const chunks: string[][] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(sentences.slice(i, i + 2));
  }
  
  chunks.slice(0, 3).forEach((chunk, index) => {
    slides.push({
      slide_number: index + 2,
      type: 'content',
      headline: `Part ${index + 1}`,
      body: chunk.join('. ').trim() + (chunk.join('').trim().endsWith('.') ? '' : '.'),
      background: colorScheme.background
    });
  });
  
  // Stats slide
  let stats: string[] = [];
  if (story.story_type === 'comparison' && story.cost_us && story.cost_abroad) {
    stats = [
      `US Cost: $${story.cost_us.toLocaleString()}`,
      `Abroad: $${story.cost_abroad.toLocaleString()}`,
      `Saved: $${(story.cost_us - story.cost_abroad).toLocaleString()}`
    ];
  } else {
    stats = [
      `${story.reaction_counts?.me_too || 0} "Me Too" reactions`,
      `${story.share_count || 0} times shared`,
      `${story.reaction_counts?.heart || 0} hearts`
    ];
  }
  
  slides.push({
    slide_number: slides.length + 1,
    type: 'stats',
    headline: story.story_type === 'comparison' ? 'The Numbers' : 'Community Impact',
    stats,
    background: colorScheme.background
  });
  
  // CTA slide
  slides.push({
    slide_number: slides.length + 1,
    type: 'cta',
    headline: 'Share Your Story',
    body: 'Join the healthcare revolution\n\noasara.com/share-story',
    background: colorScheme.background
  });
  
  return slides;
}

function generatePlainText(story: any): string {
  let text = '';
  
  if (story.story_type === 'comparison' && story.cost_us && story.cost_abroad) {
    text = `I saved ${story.savings_percent}% on ${story.procedure || 'healthcare'}!

US quote: $${story.cost_us.toLocaleString()}
What I paid: $${story.cost_abroad.toLocaleString()}
Savings: $${(story.cost_us - story.cost_abroad).toLocaleString()}

`;
  }
  
  text += `${story.title}

${story.summary || story.content?.substring(0, 300)}${story.content?.length > 300 ? '...' : ''}

Read the full story: https://oasara.com/stories/${story.slug}

If something like this happened to you, share your story: https://oasara.com/share-story`;

  return text;
}

export const handler: Handler = async (event: HandlerEvent) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { story_id, slug, card_types = ['og', 'twitter'] } = JSON.parse(event.body || '{}');

    // Fetch story
    let query = supabase.from('stories').select('*');
    if (story_id) {
      query = query.eq('id', story_id);
    } else if (slug) {
      query = query.eq('slug', slug);
    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'story_id or slug required' })
      };
    }

    const { data: story, error } = await query.single();

    if (error || !story) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Story not found' })
      };
    }

    const colorScheme = STORY_TYPE_COLORS[story.story_type as keyof typeof STORY_TYPE_COLORS];
    const cards: ShareCardData[] = [];

    for (const cardType of card_types) {
      const dimensions = CARD_DIMENSIONS[cardType as keyof typeof CARD_DIMENSIONS] || CARD_DIMENSIONS.og;
      
      // Generate headline based on story type
      let headline = story.title;
      let subheadline = '';
      let stats: string[] = [];

      if (story.story_type === 'comparison' && story.cost_us && story.cost_abroad) {
        headline = `Saved ${story.savings_percent}%`;
        subheadline = `${story.procedure || 'Healthcare'}: US $${story.cost_us.toLocaleString()} → $${story.cost_abroad.toLocaleString()}`;
        stats = [
          `💰 Saved $${(story.cost_us - story.cost_abroad).toLocaleString()}`,
          `✈️ ${story.location_country || 'Medical Tourism'}`,
          `🤝 ${story.reaction_counts?.me_too || 0} people relate`
        ];
      } else if (story.story_type === 'horror') {
        subheadline = story.summary || story.content?.substring(0, 100) + '...';
        stats = [
          `💔 ${story.reaction_counts?.me_too || 0} "Me Too"`,
          `😤 ${story.reaction_counts?.outraged || 0} Outraged`,
          `📢 ${story.share_count || 0} Shares`
        ];
      } else {
        subheadline = story.summary || story.content?.substring(0, 100) + '...';
        stats = [
          `✨ ${story.reaction_counts?.inspiring || 0} Found Inspiring`,
          `❤️ ${story.reaction_counts?.heart || 0} Hearts`,
          `📢 ${story.share_count || 0} Shares`
        ];
      }

      const cardData: ShareCardData = {
        story: {
          title: story.title,
          summary: story.summary,
          story_type: story.story_type,
          display_name: story.display_name,
          procedure: story.procedure,
          cost_us: story.cost_us,
          cost_abroad: story.cost_abroad,
          savings_percent: story.savings_percent,
          reaction_counts: story.reaction_counts
        },
        card_type: cardType as any,
        template_data: {
          headline,
          subheadline,
          cta: 'Read full story at oasara.com/stories',
          stats,
          color_scheme: story.story_type,
          background: colorScheme.background
        },
        dimensions
      };

      // Generate format-specific content
      if (cardType === 'twitter') {
        cardData.twitter_thread = generateTwitterThread(story);
      }
      
      if (cardType === 'instagram') {
        cardData.instagram_carousel = generateInstagramCarousel(story);
      }
      
      // Always include plain text for copy/paste
      cardData.plain_text = generatePlainText(story);

      cards.push(cardData);
    }

    // TODO: In production, you'd generate actual image files here using:
    // - Satori (React to SVG) + Resvg (SVG to PNG)
    // - node-canvas
    // - Cloudinary text overlays
    // - Bannerbear API
    // And upload them to Supabase Storage, then update the story.share_card_url

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        cards,
        story_url: `https://oasara.com/stories/${story.slug}`,
        // In production, these would be actual image URLs
        image_urls: {
          og: `/api/og-image/${story.slug}`,
          twitter: `/api/og-image/${story.slug}?format=twitter`
        }
      })
    };

  } catch (error: any) {
    console.error('Share card generation error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

