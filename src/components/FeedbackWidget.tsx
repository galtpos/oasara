import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import './feedback-widget.css'
import { supabase } from '../lib/supabase'

// Central feedback Supabase (freedomforge project - shared across all sites)
// Keys loaded from environment variables
const feedbackSupabase = createClient(
  process.env.REACT_APP_FREEDOMFORGE_URL || '',
  process.env.REACT_APP_FREEDOMFORGE_ANON_KEY || ''
)

interface FeedbackWidgetProps {
  projectName: string
  primaryColor?: string
}

/**
 * Universal Feedback Widget for Beta Testing
 * Sends feedback to central freedomforge Supabase project
 */
export function FeedbackWidget({ projectName, primaryColor = '#3B82F6' }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    category: 'feature',
    description: '',
    walletAddress: ''
  })

  const modalRef = useRef<HTMLDivElement>(null)

  // Check for first-time visitor
  useEffect(() => {
    const hasSeenBanner = localStorage.getItem(`${projectName}_feedback_banner`)
    if (!hasSeenBanner) {
      setShowBanner(true)
    }
  }, [projectName])

  const dismissBanner = () => {
    localStorage.setItem(`${projectName}_feedback_banner`, 'true')
    setShowBanner(false)
  }

  const openModal = () => {
    setIsOpen(true)
    setSubmitted(false)
  }

  const closeModal = () => {
    setIsOpen(false)
    setFormData({ category: 'feature', description: '', walletAddress: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Submit feedback to central project
      const { error } = await feedbackSupabase
        .from('user_feedback')
        .insert({
          project: projectName,
          page_url: window.location.href,
          category: formData.category,
          description: formData.description,
          user_agent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // Also submit to local bounty board
      try {
        await supabase
          .from('feedback')
          .insert({
            category: formData.category,
            message: formData.description,
            wallet_address: formData.walletAddress || null,
          })
      } catch (localErr) {
        // If local feedback table doesn't exist, that's ok - central still works
        console.log('Local feedback insert skipped:', localErr)
      }

      setSubmitted(true)
      setTimeout(() => closeModal(), 2000)

    } catch (err) {
      console.error('Feedback submission failed:', err)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div id="feedback-widget-container">
      {/* Welcome Banner */}
      {showBanner && (
        <div className="feedback-banner" style={{ backgroundColor: primaryColor }}>
          <p>
            <strong>Earn up to $50 fUSD!</strong> Report bugs, suggest features, or improve UX.
            <a href="/bounty" style={{ color: '#FCD34D', textDecoration: 'underline', marginLeft: '4px' }}>View Bounty Board</a>
          </p>
          <button onClick={dismissBanner} className="banner-dismiss">
            Got it
          </button>
        </div>
      )}

      {/* Floating Button */}
      <button
        className="feedback-fab"
        style={{ backgroundColor: primaryColor }}
        onClick={openModal}
        aria-label="Send feedback"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <path d="M11 5h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="feedback-overlay" onClick={closeModal}>
          <div
            ref={modalRef}
            className="feedback-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="feedback-success">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="#22C55E">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <h3>Thank you!</h3>
                <p>Your feedback is now on the <a href="/bounty" style={{ color: primaryColor, textDecoration: 'underline' }}>Bounty Board</a>!</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Features: $50 | Bugs: $30 | UX: $20</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="feedback-header">
                  <h3>Send Feedback <span style={{ fontSize: '12px', color: '#D97706', fontWeight: 'normal' }}>+ Earn up to $50 fUSD</span></h3>
                  <button type="button" className="feedback-close" onClick={closeModal}>
                    &times;
                  </button>
                </div>

                {/* Category - Simplified 3 types */}
                <div className="feedback-field">
                  <label>What type of feedback?</label>
                  <div className="feedback-categories">
                    {[
                      { value: 'feature', label: 'Feature', icon: '💡', bounty: 50 },
                      { value: 'bug', label: 'Bug', icon: '🐛', bounty: 30 },
                      { value: 'ux', label: 'UX', icon: '✨', bounty: 20 }
                    ].map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        className={`category-btn ${formData.category === cat.value ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        style={formData.category === cat.value ? { borderColor: primaryColor, backgroundColor: `${primaryColor}15` } : {}}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                        <span style={{ fontSize: '10px', color: '#D97706' }}>${cat.bounty}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="feedback-field">
                  <label htmlFor="description">What happened?</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what you experienced..."
                    rows={4}
                    required
                    minLength={10}
                  />
                  <small style={{ color: formData.description.length < 10 ? '#999' : '#22C55E', fontSize: '12px' }}>
                    {formData.description.length}/10 characters minimum
                  </small>
                </div>

                {/* Wallet Address for Bounty */}
                <div className="feedback-field">
                  <label htmlFor="wallet" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Zano Wallet
                    <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 'bold' }}>for bounty</span>
                  </label>
                  <input
                    type="text"
                    id="wallet"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    placeholder="Optional - paste your Zano address"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      marginTop: '6px'
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '11px' }}>
                    Get paid if your feedback is accepted. <a href="/bounty" style={{ color: primaryColor }}>View Bounty Board</a>
                  </small>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="feedback-submit"
                  style={{ backgroundColor: primaryColor }}
                  disabled={isSubmitting || formData.description.length < 10}
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FeedbackWidget
