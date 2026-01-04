import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Use anon key - RLS policies handle public access
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Story {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary?: string;
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
  images: string[];
  video_url?: string;
  bill_images: string[];
  view_count: number;
  share_count: number;
  comment_count: number;
  reaction_counts: Record<string, number>;
  status: string;
  is_featured: boolean;
  created_at: string;
  published_at?: string;
}

// GET /stories - List stories with filtering
async function listStories(params: URLSearchParams) {
  const storyType = params.get('type');
  const procedure = params.get('procedure');
  const issue = params.get('issue');
  const featured = params.get('featured') === 'true';
  const limit = parseInt(params.get('limit') || '20');
  const offset = parseInt(params.get('offset') || '0');
  const sort = params.get('sort') || 'recent'; // recent, trending, top

  let query = supabase
    .from('stories')
    .select('*')
    .in('status', ['published', 'featured']);

  // Filters
  if (storyType) {
    query = query.eq('story_type', storyType);
  }
  if (procedure) {
    query = query.ilike('procedure', `%${procedure}%`);
  }
  if (issue) {
    query = query.contains('issues', [issue]);
  }
  if (featured) {
    query = query.eq('is_featured', true);
  }

  // Sorting
  switch (sort) {
    case 'trending':
      // Trending = recent + high engagement
      query = query.order('share_count', { ascending: false })
                   .order('published_at', { ascending: false });
      break;
    case 'top':
      query = query.order('view_count', { ascending: false });
      break;
    case 'recent':
    default:
      query = query.order('published_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      stories: data,
      total: count,
      limit,
      offset
    })
  };
}

// GET /stories/:slug - Get single story
async function getStory(slug: string, incrementView: boolean = true) {
  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .in('status', ['published', 'featured'])
    .single();

  if (error || !story) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Story not found' }) };
  }

  // Increment view count (fire and forget)
  if (incrementView) {
    supabase
      .from('stories')
      .update({ view_count: story.view_count + 1 })
      .eq('id', story.id)
      .then(() => {});
  }

  // Get related stories (same procedure or story type)
  const { data: related } = await supabase
    .from('stories')
    .select('id, slug, title, summary, story_type, procedure, reaction_counts, share_count')
    .in('status', ['published', 'featured'])
    .neq('id', story.id)
    .or(`procedure.eq.${story.procedure},story_type.eq.${story.story_type}`)
    .limit(3);

  return {
    statusCode: 200,
    body: JSON.stringify({
      story,
      related: related || []
    })
  };
}

// POST /stories - Create new story
async function createStory(body: any, userId: string) {
  const {
    title,
    content,
    story_type,
    issues = [],
    procedure,
    location_us_state,
    location_country,
    cost_us,
    cost_abroad,
    verification_level = 'anonymous',
    display_name,
    images = [],
    video_url,
    bill_images = [],
    status = 'pending' // draft or pending for review
  } = body;

  // Validate required fields
  if (!title || !content || !story_type) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: title, content, story_type' })
    };
  }

  // Calculate savings if both costs provided
  let savings_percent = null;
  if (cost_us && cost_abroad && cost_us > 0) {
    savings_percent = Math.round(((cost_us - cost_abroad) / cost_us) * 100);
  }

  // Generate summary (first 200 chars of content, stripped of markdown)
  const summary = content
    .replace(/[#*_`]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 200) + '...';

  const { data: story, error } = await supabase
    .from('stories')
    .insert({
      author_id: userId,
      title,
      content,
      summary,
      story_type,
      issues,
      procedure,
      location_us_state,
      location_country,
      cost_us,
      cost_abroad,
      savings_percent,
      verification_level,
      display_name,
      images,
      video_url,
      bill_images,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null
    })
    .select()
    .single();

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  // Check if this is user's first story -> award badge
  const { count } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  if (count === 1) {
    await supabase.from('author_badges').insert({
      user_id: userId,
      badge_type: 'first_story',
      story_id: story.id
    });
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ story })
  };
}

// POST /stories/:id/react - Add reaction
async function addReaction(storyId: string, reactionType: string, userId?: string, sessionId?: string) {
  const validReactions = ['heart', 'me_too', 'outraged', 'inspiring', 'shared'];
  if (!validReactions.includes(reactionType)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid reaction type' }) };
  }

  const insertData: any = {
    story_id: storyId,
    reaction_type: reactionType
  };

  if (userId) {
    insertData.user_id = userId;
  } else if (sessionId) {
    insertData.session_id = sessionId;
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'Must provide userId or sessionId' }) };
  }

  const { error } = await supabase
    .from('story_reactions')
    .upsert(insertData, { onConflict: userId ? 'story_id,user_id,reaction_type' : 'story_id,session_id,reaction_type' });

  if (error) {
    // Likely duplicate - that's fine
    if (error.code === '23505') {
      return { statusCode: 200, body: JSON.stringify({ message: 'Already reacted' }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
}

// DELETE /stories/:id/react - Remove reaction
async function removeReaction(storyId: string, reactionType: string, userId?: string, sessionId?: string) {
  let query = supabase
    .from('story_reactions')
    .delete()
    .eq('story_id', storyId)
    .eq('reaction_type', reactionType);

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  }

  const { error } = await query;

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
}

// POST /stories/:id/share - Log a share
async function logShare(storyId: string, platform: string, shareType: string, userId?: string) {
  const { error } = await supabase
    .from('story_shares')
    .insert({
      story_id: storyId,
      user_id: userId || null,
      platform,
      share_type: shareType
    });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
}

// GET /stories/featured - Get featured stories for homepage
async function getFeaturedStories() {
  const { data: featured, error: featuredError } = await supabase
    .from('stories')
    .select('id, slug, title, summary, story_type, procedure, display_name, verification_level, reaction_counts, share_count, images, published_at')
    .eq('is_featured', true)
    .order('featured_at', { ascending: false })
    .limit(5);

  const { data: trending, error: trendingError } = await supabase
    .from('stories')
    .select('id, slug, title, summary, story_type, procedure, display_name, verification_level, reaction_counts, share_count, images, published_at')
    .in('status', ['published', 'featured'])
    .order('share_count', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(10);

  const { data: latest, error: latestError } = await supabase
    .from('stories')
    .select('id, slug, title, summary, story_type, procedure, display_name, verification_level, reaction_counts, share_count, images, published_at')
    .in('status', ['published', 'featured'])
    .order('published_at', { ascending: false })
    .limit(10);

  return {
    statusCode: 200,
    body: JSON.stringify({
      featured: featured || [],
      trending: trending || [],
      latest: latest || []
    })
  };
}

// GET /stories/search - Semantic search (basic keyword for now, vector later)
async function searchStories(query: string, limit: number = 10) {
  // Basic text search for now - will enhance with pgvector later
  const { data, error } = await supabase
    .from('stories')
    .select('id, slug, title, summary, story_type, procedure, display_name, reaction_counts, share_count')
    .in('status', ['published', 'featured'])
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,procedure.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ stories: data || [] })
  };
}

// Main handler
export const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path, queryStringParameters, body, headers } = event;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // Extract user from auth header if present
  let userId: string | undefined;
  const authHeader = headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    userId = user?.id;
  }

  // Parse path: /stories, /stories/:slug, /stories/:id/react, etc.
  const pathParts = path.replace('/.netlify/functions/stories-api', '').split('/').filter(Boolean);
  const params = new URLSearchParams(queryStringParameters || {});

  try {
    // GET /stories/featured
    if (httpMethod === 'GET' && pathParts[0] === 'featured') {
      const result = await getFeaturedStories();
      return { ...result, headers: corsHeaders };
    }

    // GET /stories/search?q=...
    if (httpMethod === 'GET' && pathParts[0] === 'search') {
      const query = params.get('q') || '';
      const limit = parseInt(params.get('limit') || '10');
      const result = await searchStories(query, limit);
      return { ...result, headers: corsHeaders };
    }

    // GET /stories - List
    if (httpMethod === 'GET' && pathParts.length === 0) {
      const result = await listStories(params);
      return { ...result, headers: corsHeaders };
    }

    // GET /stories/:slug
    if (httpMethod === 'GET' && pathParts.length === 1) {
      const slug = pathParts[0];
      const result = await getStory(slug);
      return { ...result, headers: corsHeaders };
    }

    // POST /stories - Create
    if (httpMethod === 'POST' && pathParts.length === 0) {
      if (!userId) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Authentication required' })
        };
      }
      const data = JSON.parse(body || '{}');
      const result = await createStory(data, userId);
      return { ...result, headers: corsHeaders };
    }

    // POST /stories/:id/react
    if (httpMethod === 'POST' && pathParts.length === 2 && pathParts[1] === 'react') {
      const storyId = pathParts[0];
      const data = JSON.parse(body || '{}');
      const result = await addReaction(storyId, data.reaction_type, userId, data.session_id);
      return { ...result, headers: corsHeaders };
    }

    // DELETE /stories/:id/react
    if (httpMethod === 'DELETE' && pathParts.length === 2 && pathParts[1] === 'react') {
      const storyId = pathParts[0];
      const data = JSON.parse(body || '{}');
      const result = await removeReaction(storyId, data.reaction_type, userId, data.session_id);
      return { ...result, headers: corsHeaders };
    }

    // POST /stories/:id/share
    if (httpMethod === 'POST' && pathParts.length === 2 && pathParts[1] === 'share') {
      const storyId = pathParts[0];
      const data = JSON.parse(body || '{}');
      const result = await logShare(storyId, data.platform, data.share_type, userId);
      return { ...result, headers: corsHeaders };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error: any) {
    console.error('Stories API error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

