import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivityFeed, ActivityItem } from '../../hooks/useActivityFeed';
import { Link } from 'react-router-dom';

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  limit = 10,
  showHeader = true,
  compact = false,
  className = ''
}) => {
  const {
    activities,
    isLoading,
    error,
    hasMore,
    loadMore,
    getActivityDescription,
    getActivityIcon
  } = useActivityFeed({ limit });

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

  const getActivityColor = (type: ActivityItem['activity_type']) => {
    switch (type) {
      case 'comment':
        return 'from-ocean-400 to-ocean-600';
      case 'signup':
        return 'from-gold-400 to-gold-600';
      case 'facility_save':
        return 'from-sage-400 to-sage-600';
      case 'question':
        return 'from-ocean-300 to-ocean-500';
      case 'upvote':
        return 'from-gold-300 to-gold-500';
      default:
        return 'from-sage-400 to-sage-600';
    }
  };

  if (error) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-200 p-6 ${className}`}>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-200 shadow-card overflow-hidden ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="px-6 py-4 bg-gradient-to-r from-sage-50 to-ocean-50/30 border-b border-sage-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ocean-800">Community Pulse</h3>
                <p className="text-sm text-ocean-600/70">Recent activity from fellow seekers</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-ocean-500">Live</span>
            </div>
          </div>
        </div>
      )}

      <div className={compact ? 'p-4' : 'p-6'}>
        {/* Loading State */}
        {isLoading && activities.length === 0 && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-sage-200" />
                <div className="flex-1">
                  <div className="h-4 bg-sage-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-sage-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && activities.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-ocean-700 font-medium mb-1">No activity yet</h4>
            <p className="text-ocean-500 text-sm">Be the first to start the conversation!</p>
          </div>
        )}

        {/* Activity List */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start gap-3 ${compact ? 'py-2' : 'py-3'} ${
                  index !== activities.length - 1 ? 'border-b border-sage-100' : ''
                }`}
              >
                {/* Activity Icon */}
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getActivityColor(activity.activity_type)} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getActivityIcon(activity)} />
                  </svg>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-ocean-700 ${compact ? 'text-sm' : ''}`}>
                    <span className="font-medium text-ocean-800">
                      {activity.user_name}
                    </span>
                    {' '}
                    {getActivityDescription(activity)}
                  </p>

                  {/* Preview for comments */}
                  {activity.activity_type === 'comment' && activity.metadata.preview && (
                    <p className="text-ocean-500 text-sm mt-1 line-clamp-2 italic">
                      "{activity.metadata.preview}..."
                    </p>
                  )}

                  {/* Location for facility activities */}
                  {activity.metadata.facility_city && activity.metadata.facility_country && (
                    <p className="text-ocean-400 text-xs mt-1">
                      {activity.metadata.facility_city}, {activity.metadata.facility_country}
                    </p>
                  )}

                  <p className="text-ocean-400 text-xs mt-1">
                    {timeAgo(activity.created_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Load More */}
        {hasMore && activities.length > 0 && !isLoading && (
          <button
            onClick={loadMore}
            className="w-full mt-4 py-2 text-sm text-ocean-600 hover:text-ocean-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>Load more</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Loading More */}
        {isLoading && activities.length > 0 && (
          <div className="flex justify-center mt-4">
            <div className="w-6 h-6 border-2 border-ocean-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

// Compact Activity Widget for sidebar
export const ActivityWidget: React.FC<{ className?: string }> = ({ className }) => {
  const { activities, isLoading } = useActivityFeed({ limit: 5 });

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  if (isLoading) {
    return (
      <div className={`bg-white/60 backdrop-blur-sm rounded-xl border border-sage-200 p-4 ${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-sage-200 rounded w-1/2" />
          <div className="h-2 bg-sage-100 rounded w-3/4" />
          <div className="h-2 bg-sage-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/60 backdrop-blur-sm rounded-xl border border-sage-200 overflow-hidden ${className}`}>
      <div className="px-4 py-2 bg-gradient-to-r from-gold-50 to-ocean-50/30 border-b border-sage-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ocean-700">Live Activity</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {activities.slice(0, 5).map(activity => (
          <div key={activity.id} className="flex items-center justify-between text-sm">
            <p className="text-ocean-600 truncate flex-1">
              <span className="font-medium">{activity.user_name?.split(' ')[0]}</span>
              {' '}
              <span className="text-ocean-500">
                {activity.activity_type === 'signup' ? 'joined' :
                 activity.activity_type === 'comment' ? 'commented' :
                 activity.activity_type === 'facility_save' ? 'saved' :
                 activity.activity_type === 'upvote' ? 'upvoted' : 'acted'}
              </span>
            </p>
            <span className="text-ocean-400 text-xs ml-2">
              {timeAgo(activity.created_at)}
            </span>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-ocean-400 text-sm text-center py-2">No recent activity</p>
        )}
      </div>
      <Link
        to="/community"
        className="block px-4 py-2 text-center text-sm text-ocean-600 hover:bg-ocean-50 transition-colors border-t border-sage-100"
      >
        View all activity
      </Link>
    </div>
  );
};

export default ActivityFeed;
