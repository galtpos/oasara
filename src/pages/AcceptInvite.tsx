import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndInvitation = async () => {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);

        if (!token) {
          throw new Error('Invalid invitation link');
        }

        // Fetch invitation details
        const { data: inviteData, error: inviteError } = await supabase
          .from('journey_collaborators')
          .select(`
            *,
            patient_journeys (
              id,
              procedure_type,
              budget_min,
              budget_max,
              timeline
            )
          `)
          .eq('invitation_token', token)
          .single();

        if (inviteError) throw inviteError;

        if (!inviteData) {
          throw new Error('Invitation not found');
        }

        // Check if invitation has expired
        if (new Date(inviteData.token_expires_at) < new Date()) {
          throw new Error('This invitation has expired');
        }

        // Check if invitation is still pending
        if (inviteData.status !== 'pending') {
          throw new Error(`This invitation has already been ${inviteData.status}`);
        }

        setInvitation(inviteData);

        // If user is authenticated and email matches, auto-accept
        if (user && user.email === inviteData.email) {
          await handleAccept(user.id);
        }

      } catch (err) {
        console.error('Invitation check error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndInvitation();
  }, [token]);

  const handleAccept = async (userId?: string) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;

      if (!effectiveUserId) {
        // Redirect to sign up with email pre-filled
        navigate(`/signup?email=${encodeURIComponent(invitation.email)}&return=/journey/accept-invite/${token}`);
        return;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('journey_collaborators')
        .update({
          user_id: effectiveUserId,
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('invitation_token', token);

      if (updateError) throw updateError;

      // Log acceptance
      await supabase.rpc('log_journey_access', {
        p_journey_id: invitation.journey_id,
        p_user_id: effectiveUserId,
        p_action: 'invite_accepted'
      });

      // Redirect to shared journey view
      navigate(`/journey/shared/${invitation.journey_id}`);

    } catch (err) {
      console.error('Accept invitation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      setLoading(true);

      // Update invitation status
      const { error: updateError } = await supabase
        .from('journey_collaborators')
        .update({
          status: 'declined'
        })
        .eq('invitation_token', token);

      if (updateError) throw updateError;

      // Show success message and redirect
      alert('Invitation declined');
      navigate('/');

    } catch (err) {
      console.error('Decline invitation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to decline invitation');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-sage-50 to-ocean-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
          <p className="text-ocean-700">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-sage-50 to-ocean-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display text-ocean-800 mb-2">Invitation Error</h2>
            <p className="text-ocean-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors font-medium"
            >
              Go to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!invitation) return null;

  const journey = invitation.patient_journeys;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-sage-50 to-ocean-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <h2 className="text-3xl font-display text-ocean-800 mb-2">Journey Invitation</h2>
          <p className="text-ocean-600">You've been invited to view a medical journey</p>
        </div>

        {/* Journey Details */}
        <div className="bg-sage-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-display text-ocean-800 mb-3">Journey Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-ocean-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-ocean-700"><strong>Procedure:</strong> {journey.procedure_type}</span>
            </div>
            {journey.budget_min && journey.budget_max && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-ocean-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-ocean-700"><strong>Budget:</strong> ${journey.budget_min.toLocaleString()} - ${journey.budget_max.toLocaleString()}</span>
              </div>
            )}
            {journey.timeline && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-ocean-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-ocean-700"><strong>Timeline:</strong> {journey.timeline.charAt(0).toUpperCase() + journey.timeline.slice(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-ocean-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-ocean-700"><strong>Access:</strong> View only</span>
            </div>
          </div>
        </div>

        {/* Authentication Notice */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Account Required</p>
              <p>You'll need to sign in or create an account to view this journey.</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleAccept()}
            className="flex-1 px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isAuthenticated ? 'Accept Invitation' : 'Sign In to Accept'}
          </button>
          <button
            onClick={handleDecline}
            className="px-6 py-3 bg-white border-2 border-sage-300 text-ocean-700 rounded-lg hover:bg-sage-50 transition-colors font-medium"
          >
            Decline
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 pt-6 border-t border-sage-200">
          <p className="text-xs text-ocean-600 text-center">
            By accepting, you'll be able to view this journey's facilities, notes, and research. You won't be able to make changes.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AcceptInvite;
