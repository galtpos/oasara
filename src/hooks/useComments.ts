import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  facility_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  upvotes: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
  hasUpvoted?: boolean;
  replies?: Comment[];
}

interface UseCommentsOptions {
  facilityId: string;
}

export function useComments({ facilityId }: UseCommentsOptions) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments for a facility
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('facility_comments')
        .select(`
          *,
          user_profiles:user_id (
            name,
            avatar_url
          )
        `)
        .eq('facility_id', facilityId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data and organize into threads
      const transformedComments: Comment[] = (data || []).map((c: any) => ({
        id: c.id,
        facility_id: c.facility_id,
        user_id: c.user_id,
        content: c.content,
        parent_id: c.parent_id,
        upvotes: c.upvotes,
        is_edited: c.is_edited,
        created_at: c.created_at,
        updated_at: c.updated_at,
        user_name: c.user_profiles?.name || 'Anonymous',
        user_avatar: c.user_profiles?.avatar_url
      }));

      // Organize into threads (parent comments with replies)
      const rootComments = transformedComments.filter(c => !c.parent_id);
      const replies = transformedComments.filter(c => c.parent_id);

      rootComments.forEach(comment => {
        comment.replies = replies.filter(r => r.parent_id === comment.id);
      });

      setComments(rootComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [facilityId]);

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add a comment - use getSession (cached) not getUser (slow)
  const addComment = useCallback(async (content: string, parentId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('You must be logged in to comment');
      }

      const user = session.user;

      const { data, error: insertError } = await supabase
        .from('facility_comments')
        .insert({
          facility_id: facilityId,
          user_id: user.id,
          content,
          parent_id: parentId || null
        })
        .select(`
          *,
          user_profiles:user_id (
            name,
            avatar_url
          )
        `)
        .single();

      if (insertError) throw insertError;

      // Refresh comments to get proper threading
      await fetchComments();

      return data;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }, [facilityId, fetchComments]);

  // Update a comment
  const updateComment = useCallback(async (commentId: string, content: string) => {
    try {
      const { error: updateError } = await supabase
        .from('facility_comments')
        .update({ content })
        .eq('id', commentId);

      if (updateError) throw updateError;

      await fetchComments();
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  }, [fetchComments]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('facility_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;

      await fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }, [fetchComments]);

  // Toggle upvote - use getSession (cached) not getUser (slow)
  const toggleUpvote = useCallback(async (commentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('You must be logged in to upvote');
      }

      const user = session.user;

      // Check if already upvoted
      const { data: existing } = await supabase
        .from('comment_upvotes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Remove upvote
        await supabase
          .from('comment_upvotes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Add upvote
        await supabase
          .from('comment_upvotes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
      }

      await fetchComments();
    } catch (err) {
      console.error('Error toggling upvote:', err);
      throw err;
    }
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    updateComment,
    deleteComment,
    toggleUpvote,
    refetch: fetchComments
  };
}
