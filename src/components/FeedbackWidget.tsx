import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import html2canvas from 'html2canvas'
import './feedback-widget.css'

// Central feedback Supabase (freedomforge project - shared across all sites)
const feedbackSupabase = createClient(
  'https://uefznzzkrzqxgxxwslox.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZnpuenprcnpxeGd4eHdzbG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDIzODQsImV4cCI6MjA3MTgxODM4NH0.YmwwuEhG7Siv8zyL9XFjthNuqJrST3C4hs3qESb-grM'
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
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [includeScreenshot, setIncludeScreenshot] = useState(true)
  const [formData, setFormData] = useState({
    category: 'bug',
    description: ''
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

  // Capture screenshot when modal opens
  const captureScreenshot = async () => {
    try {
      const widget = document.getElementById('feedback-widget-container')
      if (widget) widget.style.display = 'none'

      const canvas = await html2canvas(document.body, {
        logging: false,
        useCORS: true,
        scale: 0.5
      })

      if (widget) widget.style.display = 'block'

      const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
      setScreenshot(dataUrl)
    } catch (err) {
      console.error('Screenshot capture failed:', err)
      setScreenshot(null)
    }
  }

  const openModal = async () => {
    await captureScreenshot()
    setIsOpen(true)
    setSubmitted(false)
  }

  const closeModal = () => {
    setIsOpen(false)
    setFormData({ category: 'bug', description: '' })
    setScreenshot(null)
  }

  const uploadScreenshot = async (dataUrl: string): Promise<string | null> => {
    if (!dataUrl) return null

    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const filename = `${projectName}/${Date.now()}.jpg`

      const { error } = await feedbackSupabase.storage
        .from('feedback-screenshots')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        })

      if (error) {
        console.error('Screenshot upload failed:', error)
        return null
      }

      const { data: { publicUrl } } = feedbackSupabase.storage
        .from('feedback-screenshots')
        .getPublicUrl(filename)

      return publicUrl
    } catch (err) {
      console.error('Screenshot upload error:', err)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload screenshot if included
      let screenshotUrl: string | null = null
      if (includeScreenshot && screenshot) {
        screenshotUrl = await uploadScreenshot(screenshot)
      }

      // Submit feedback to central project
      const { error } = await feedbackSupabase
        .from('user_feedback')
        .insert({
          project: projectName,
          page_url: window.location.href,
          category: formData.category,
          description: formData.description,
          screenshot_url: screenshotUrl,
          user_agent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          created_at: new Date().toISOString()
        })

      if (error) throw error

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
            <strong>You're helping us improve!</strong> Use the feedback button
            anytime to report issues or share suggestions.
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
                <p>Your feedback helps us improve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="feedback-header">
                  <h3>Send Feedback</h3>
                  <button type="button" className="feedback-close" onClick={closeModal}>
                    &times;
                  </button>
                </div>

                {/* Category */}
                <div className="feedback-field">
                  <label>What type of feedback?</label>
                  <div className="feedback-categories">
                    {[
                      { value: 'bug', label: 'Bug', icon: '🐛' },
                      { value: 'confusing', label: 'Confusing', icon: '🤔' },
                      { value: 'suggestion', label: 'Suggestion', icon: '💡' },
                      { value: 'other', label: 'Other', icon: '💬' }
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
                </div>

                {/* Screenshot Preview */}
                {screenshot && (
                  <div className="feedback-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={includeScreenshot}
                        onChange={(e) => setIncludeScreenshot(e.target.checked)}
                      />
                      Include screenshot
                    </label>
                    {includeScreenshot && (
                      <img
                        src={screenshot}
                        alt="Screenshot preview"
                        className="screenshot-preview"
                      />
                    )}
                  </div>
                )}

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
