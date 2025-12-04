import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComments, Comment } from '../../hooks/useComments';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface CommentsSectionProps {
  facilityId: string;
  facilityName: string;
}

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  onCancel?: () => void;
  isReply?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = "Share your experience with this facility...",
  buttonText = "Post Comment",
  onCancel,
  isReply = false
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length < 10) {
      setError('Comment must be at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={isReply ? 'ml-12' : ''}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-sage-50 border border-sage-200 text-ocean-800 placeholder-ocean-400 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all resize-none"
        rows={3}
        maxLength={2000}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-ocean-400">{content.length}/2000</span>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-ocean-600 hover:text-ocean-800 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || content.length < 10}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-white text-sm font-medium hover:from-gold-600 hover:to-gold-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Posting...' : buttonText}
          </button>
        </div>
      </div>
    </form>
  );
};

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<void>;
  onUpvote: (commentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  currentUserId?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onUpvote,
  onDelete,
  currentUserId
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleUpvote = async () => {
    try {
      setIsUpvoting(true);
      await onUpvote(comment.id);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleReply = async (content: string) => {
    await onReply(comment.id, content);
    setShowReplyForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-sage-100 pb-4 last:border-b-0"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {comment.user_name?.charAt(0).toUpperCase() || 'A'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-ocean-800">{comment.user_name || 'Anonymous'}</span>
            <span className="text-xs text-ocean-400">•</span>
            <span className="text-xs text-ocean-400">{timeAgo(comment.created_at)}</span>
            {comment.is_edited && (
              <span className="text-xs text-ocean-400">(edited)</span>
            )}
          </div>

          {/* Content */}
          <p className="text-ocean-700 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={`flex items-center gap-1 text-sm transition-colors ${
                comment.hasUpvoted
                  ? 'text-gold-600'
                  : 'text-ocean-400 hover:text-gold-500'
              }`}
            >
              <svg className="w-4 h-4" fill={comment.hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>{comment.upvotes}</span>
            </button>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-ocean-400 hover:text-ocean-600 transition-colors"
            >
              Reply
            </button>

            {currentUserId === comment.user_id && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <CommentForm
                  onSubmit={handleReply}
                  placeholder={`Reply to ${comment.user_name}...`}
                  buttonText="Reply"
                  onCancel={() => setShowReplyForm(false)}
                  isReply
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 ml-4 pl-4 border-l-2 border-sage-200 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onUpvote={onUpvote}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CommentsSection: React.FC<CommentsSectionProps> = ({ facilityId, facilityName }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    toggleUpvote
  } = useComments({ facilityId });

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setCurrentUserId(user?.id);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      setCurrentUserId(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAddComment = async (content: string) => {
    await addComment(content);
  };

  const handleReply = async (parentId: string, content: string) => {
    await addComment(content, parentId);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-200 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-sage-50 to-ocean-50/30 border-b border-sage-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ocean-800">Community Experiences</h3>
            <p className="text-sm text-ocean-600/70">Share your experience at {facilityName}</p>
          </div>
          <span className="text-sm text-ocean-500">{comments.length} comments</span>
        </div>
      </div>

      <div className="p-6">
        {/* Comment Form or Login Prompt */}
        {isAuthenticated ? (
          <div className="mb-6">
            <CommentForm onSubmit={handleAddComment} />
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gold-50 border border-gold-200 rounded-xl text-center">
            <p className="text-ocean-700 mb-2">Join the conversation!</p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/login"
                className="px-4 py-2 bg-ocean-600 text-white rounded-lg text-sm font-medium hover:bg-ocean-700 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg text-sm font-medium hover:from-gold-600 hover:to-gold-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-ocean-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-ocean-500">Loading comments...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        )}

        {/* Comments List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-ocean-700 font-medium mb-1">No comments yet</h4>
                <p className="text-ocean-500 text-sm">Be the first to share your experience!</p>
              </div>
            ) : (
              comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onUpvote={toggleUpvote}
                  onDelete={deleteComment}
                  currentUserId={currentUserId}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
