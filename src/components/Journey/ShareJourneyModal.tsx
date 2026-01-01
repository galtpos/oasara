import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface ShareJourneyModalProps {
  journeyId: string;
  procedureType: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Collaborator {
  id: string;
  email: string;
  role: 'owner' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  invited_at: string;
  accepted_at: string | null;
  invitation_token: string;
}

const ShareJourneyModal: React.FC<ShareJourneyModalProps> = ({
  journeyId,
  procedureType,
  isOpen,
  onClose
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer'>('viewer'); // Only viewer for now
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  // Fetch existing collaborators
  const { data: collaborators, refetch: refetchCollaborators } = useQuery({
    queryKey: ['journey-collaborators', journeyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_collaborators')
        .select('*')
        .eq('journey_id', journeyId)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      return data as Collaborator[];
    },
    enabled: isOpen
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setInviteLink(null);
    setIsSubmitting(true);

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Normalize email for comparison
      const normalizedEmail = email.toLowerCase().trim();

      // Check if already has active invitation
      const existingActive = collaborators?.find(c => c.email.toLowerCase() === normalizedEmail && c.status === 'pending');
      if (existingActive) {
        // Show the existing link instead of erroring
        const existingLink = `${window.location.origin}/journey/accept-invite/${existingActive.invitation_token}`;
        setInviteLink(existingLink);
        setSuccessMessage(`This email already has a pending invitation. Share this link:`);
        setIsSubmitting(false);
        return;
      }

      const existingAccepted = collaborators?.find(c => c.email.toLowerCase() === normalizedEmail && c.status === 'accepted');
      if (existingAccepted) {
        throw new Error('This person already has access to your journey');
      }

      // Get current user - use getSession (cached) not getUser (slow)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('You must be logged in to share');
      const user = session.user;

      // Check if there's an existing revoked/declined record to update
      const existingRevoked = collaborators?.find(c => c.email.toLowerCase() === normalizedEmail && (c.status === 'revoked' || c.status === 'declined'));

      let invitation;

      if (existingRevoked) {
        // Update existing record - reset it to pending with new token
        const { data, error: updateError } = await supabase
          .from('journey_collaborators')
          .update({
            status: 'pending',
            invitation_token: crypto.randomUUID(),
            token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            invited_at: new Date().toISOString(),
            accepted_at: null,
            user_id: null
          })
          .eq('id', existingRevoked.id)
          .select()
          .single();

        if (updateError) throw updateError;
        invitation = data;
      } else {
        // Create new invitation
        const { data, error: inviteError } = await supabase
          .from('journey_collaborators')
          .insert({
            journey_id: journeyId,
            email: normalizedEmail,
            role: role,
            invited_by: user.id
          })
          .select()
          .single();

        if (inviteError) throw inviteError;
        invitation = data;
      }

      // Generate the invite link
      const inviteLink = `${window.location.origin}/journey/accept-invite/${invitation.invitation_token}`;

      // Try to send email, but don't fail if it doesn't work
      let emailSent = false;
      try {
        const response = await fetch('/.netlify/functions/send-journey-invitation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            inviterEmail: user.email,
            procedureType,
            invitationToken: invitation.invitation_token,
            role: role
          })
        });
        emailSent = response.ok;
      } catch (emailErr) {
        console.log('Email sending failed, but invitation was created:', emailErr);
      }

      // Log the invitation
      await supabase.rpc('log_journey_access', {
        p_journey_id: journeyId,
        p_user_id: user.id,
        p_action: 'invite_sent',
        p_details: { invited_email: email, role: role }
      });

      // Show success with the link - user can copy it
      if (emailSent) {
        setSuccessMessage(`Invitation sent to ${email}! They can also use this link:`);
      } else {
        setSuccessMessage(`Invitation created for ${email}! Share this link with them:`);
      }
      setInviteLink(inviteLink);
      setEmail('');
      refetchCollaborators();

    } catch (err: any) {
      console.error('Invitation error:', err);
      // Show detailed error for debugging
      const errorMessage = err?.message || err?.error_description || JSON.stringify(err) || 'Failed to send invitation';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (collaboratorId: string, collaboratorEmail: string) => {
    if (!window.confirm(`Revoke access for ${collaboratorEmail}?`)) return;

    try {
      const { error } = await supabase
        .from('journey_collaborators')
        .update({ status: 'revoked' })
        .eq('id', collaboratorId);

      if (error) throw error;

      // Log the revocation - use getSession (cached)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.rpc('log_journey_access', {
          p_journey_id: journeyId,
          p_user_id: session.user.id,
          p_action: 'access_revoked',
          p_details: { revoked_email: collaboratorEmail }
        });
      }

      refetchCollaborators();
    } catch (err) {
      console.error('Revoke error:', err);
      setError('Failed to revoke access');
    }
  };

  const handleCopyLink = async (token: string) => {
    const inviteLink = `${window.location.origin}/journey/accept-invite/${token}`;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-sage-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display text-ocean-800">Share Journey</h2>
              <p className="text-sm text-ocean-600 mt-1">Invite family members to view your journey</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-sage-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Invite Form */}
            <div className="bg-ocean-50 rounded-xl p-6">
              <h3 className="text-lg font-display text-ocean-800 mb-4">Invite Someone</h3>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ocean-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="family@example.com"
                    required
                    className="w-full px-4 py-2 border-2 border-ocean-200 rounded-lg focus:outline-none focus:border-ocean-600 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-ocean-700 mb-2">
                    Access Level
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'viewer')}
                    className="w-full px-4 py-2 border-2 border-ocean-200 rounded-lg focus:outline-none focus:border-ocean-600 transition-colors"
                  >
                    <option value="viewer">Viewer (Read-Only)</option>
                  </select>
                  <p className="text-xs text-ocean-600 mt-1">
                    Viewers can see your journey but cannot make changes
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                    {inviteLink && (
                      <div className="mt-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={inviteLink}
                            className="flex-1 px-3 py-2 text-xs bg-white border border-green-300 rounded-lg text-ocean-700 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(inviteLink);
                              setCopiedToken('link');
                              setTimeout(() => setCopiedToken(null), 2000);
                            }}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                          >
                            {copiedToken === 'link' ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:bg-ocean-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Invitation
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Existing Collaborators */}
            {collaborators && collaborators.length > 0 && (
              <div>
                <h3 className="text-lg font-display text-ocean-800 mb-4">
                  Shared With ({collaborators.filter(c => c.status !== 'declined').length})
                </h3>

                <div className="space-y-3">
                  {collaborators
                    .filter(c => c.status !== 'declined')
                    .map((collab) => (
                      <div
                        key={collab.id}
                        className="bg-white border-2 border-sage-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-ocean-800">{collab.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(collab.status)}
                                <span className="text-xs text-ocean-600">
                                  {collab.role === 'owner' ? 'Owner' : 'Viewer'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {collab.status === 'pending' && (
                            <button
                              onClick={() => handleCopyLink(collab.invitation_token)}
                              className="px-3 py-1.5 text-sm text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors flex items-center gap-1"
                              title="Copy invitation link"
                            >
                              {copiedToken === collab.invitation_token ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Copy Link
                                </>
                              )}
                            </button>
                          )}

                          {collab.status !== 'revoked' && (
                            <button
                              onClick={() => handleRevoke(collab.id, collab.email)}
                              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 flex gap-3">
              <svg className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-ocean-700">
                <p className="font-medium mb-1">About Sharing</p>
                <ul className="space-y-1 text-ocean-600">
                  <li>Viewers can see your journey, shortlist, and notes</li>
                  <li>Only you can make changes or add facilities</li>
                  <li>Invitation links expire in 7 days</li>
                  <li>You can revoke access at any time</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareJourneyModal;
