import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ActivityItem {
  id: string;
  user_id: string | null;
  activity_type: 'comment' | 'signup' | 'facility_save' | 'question' | 'upvote';
  target_type: 'facility' | 'trust_law' | 'comment' | 'user' | null;
  target_id: string | null;
  metadata: {
    comment_id?: string;
    preview?: string;
    facility_name?: string;
    facility_city?: string;
    facility_country?: string;
  };
  is_public: boolean;
  created_at: string;
  user_name?: string;
}

interface UseActivityFeedOptions {
  limit?: number;
  activityTypes?: string[];
}

export function useActivityFeed({ limit = 20, activityTypes }: UseActivityFeedOptions = {}) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchActivities = useCallback(async (offset = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('activity_feed')
        .select(`
          *,
          user_profiles:user_id (name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filter by activity types if specified
      if (activityTypes && activityTypes.length > 0) {
        query = query.in('activity_type', activityTypes);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedActivities: ActivityItem[] = (data || []).map((item: any) => ({
        ...item,
        user_name: item.user_profiles?.name || 'A fellow seeker',
        metadata: item.metadata || {}
      }));

      if (offset === 0) {
        setActivities(formattedActivities);
      } else {
        setActivities(prev => [...prev, ...formattedActivities]);
      }

      setHasMore(formattedActivities.length === limit);
    } catch (err) {
      console.error('Error fetching activity feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  }, [limit, activityTypes]);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchActivities(activities.length);
    }
  }, [activities.length, fetchActivities, hasMore, isLoading]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('activity_feed_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: 'is_public=eq.true'
        },
        async (payload) => {
          // Fetch the new activity with user info
          const { data } = await supabase
            .from('activity_feed')
            .select(`
              *,
              user_profiles:user_id (name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const newActivity: ActivityItem = {
              ...data,
              user_name: data.user_profiles?.name || 'A fellow seeker',
              metadata: data.metadata || {}
            };
            setActivities(prev => [newActivity, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get activity description
  const getActivityDescription = (activity: ActivityItem): string => {
    switch (activity.activity_type) {
      case 'comment':
        return `commented on ${activity.metadata.facility_name || 'a facility'}`;
      case 'signup':
        return 'joined the Oasis';
      case 'facility_save':
        return `saved ${activity.metadata.facility_name || 'a facility'}`;
      case 'question':
        return 'asked the Oasis Guide a question';
      case 'upvote':
        return 'upvoted a community comment';
      default:
        return 'took an action';
    }
  };

  // Get activity icon
  const getActivityIcon = (activity: ActivityItem): string => {
    switch (activity.activity_type) {
      case 'comment':
        return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
      case 'signup':
        return 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z';
      case 'facility_save':
        return 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z';
      case 'question':
        return 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'upvote':
        return 'M5 15l7-7 7 7';
      default:
        return 'M13 10V3L4 14h7v7l9-11h-7z';
    }
  };

  return {
    activities,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchActivities(0),
    getActivityDescription,
    getActivityIcon
  };
}
