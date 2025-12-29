import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

interface Review {
  id: string;
  facility_id: string;
  rating: number;
  procedure: string;
  treatment_date: string;
  review_date: string;
  title: string;
  review: string;
  verified: boolean;
  helpful_count: number;
  response_from_facility?: string;
  patient_name?: string;
  patient_photo?: string;
}

interface ReviewsSectionProps {
  facilityId: string;
}

export default function ReviewsSection({ facilityId }: ReviewsSectionProps) {
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

  // Fetch reviews for this facility
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('verified', true)
        .order('review_date', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  // Calculate average rating and rating breakdown
  const averageRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews?.filter((r) => r.rating === stars).length || 0;
    const percentage = reviews?.length ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  const handleHelpful = async (reviewId: string) => {
    if (helpfulClicked.has(reviewId)) return;

    try {
      const { error } = await supabase.rpc('increment_helpful_count', {
        review_id: reviewId,
      });

      if (!error) {
        setHelpfulClicked((prev) => new Set([...prev, reviewId]));
      }
    } catch (err) {
      console.error('Error marking review as helpful:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-sage-50 rounded-xl p-8 text-center border-2 border-sage-200">
        <svg className="w-16 h-16 text-sage-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h3 className="text-xl font-display font-bold text-gray-700 mb-2">
          No Reviews Yet
        </h3>
        <p className="text-gray-500">
          Be the first to share your experience at this facility
        </p>
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">
          Patient Reviews
        </h2>

        {/* Average Rating Summary */}
        <div className="bg-gradient-to-br from-sage-50 to-ocean-50 rounded-xl p-6 border-2 border-ocean-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-4 justify-center md:justify-start mb-2">
                <div className="text-6xl font-display font-bold text-ocean-700">
                  {averageRating.toFixed(1)}
                </div>
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(averageRating)
                            ? 'text-gold-500'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {reviews.length} verified review{reviews.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Rating Breakdown */}
            <div>
              {ratingBreakdown.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-3 mb-2">
                  <div className="text-sm text-gray-600 w-16">
                    {stars} star{stars !== 1 ? 's' : ''}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gold-500 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-6 border-2 border-sage-200 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-ocean-500 flex items-center justify-center text-white font-display text-xl flex-shrink-0">
                  {review.patient_name?.charAt(0) || 'P'}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-gray-900">
                      {review.patient_name || 'Anonymous'}
                    </div>
                    {review.verified && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded-full text-xs text-green-700 font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-gold-500'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      {review.procedure} • {new Date(review.treatment_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {review.title}
              </h3>

              {/* Review Body */}
              <p className="text-gray-700 leading-relaxed mb-4">
                {review.review}
              </p>

              {/* Review Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-sage-200">
                <div className="text-sm text-gray-500">
                  {new Date(review.review_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <button
                  onClick={() => handleHelpful(review.id)}
                  disabled={helpfulClicked.has(review.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                    helpfulClicked.has(review.id)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {helpfulClicked.has(review.id) ? 'Helpful!' : 'Helpful'} ({review.helpful_count})
                </button>
              </div>

              {/* Facility Response */}
              {review.response_from_facility && (
                <div className="mt-4 p-4 bg-ocean-50 rounded-lg border-l-4 border-ocean-500">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78-.03 1.617.58 2.178.609.56 1.435.721 2.17.4l.734-.32a1 1 0 00.526-.89v-2.897l-3.192-1.277zM3.34 7.447a1 1 0 01.894-1.789l1.81.904a1 1 0 01-.894 1.789l-1.81-.904zM1.38 9.86a1 1 0 011.396-.585l1.81.904a1 1 0 01-.894 1.789l-1.81-.904a1 1 0 01-.585-1.396z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="text-sm font-semibold text-ocean-700 mb-1">
                        Response from Facility
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {review.response_from_facility}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
