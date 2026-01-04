import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SiteHeader from '../components/Layout/SiteHeader';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

type StoryType = 'horror' | 'success' | 'comparison';
type SubmitMode = 'write' | 'assisted';

const STORY_TYPES = [
  { 
    value: 'horror' as StoryType, 
    label: 'Horror Story', 
    emoji: '💔',
    description: 'Share a nightmare experience with the US healthcare system',
    example: 'I was charged $50,000 for a routine procedure...'
  },
  { 
    value: 'success' as StoryType, 
    label: 'Success Story', 
    emoji: '🎉',
    description: 'Share how medical tourism or alternative healthcare helped you',
    example: 'I flew to Mexico and saved 70% on my dental work...'
  },
  { 
    value: 'comparison' as StoryType, 
    label: 'Before & After', 
    emoji: '⚖️',
    description: 'Compare what you paid in the US vs abroad',
    example: 'US quoted $80k, I paid $12k in Thailand including flights...'
  }
];

const ISSUE_OPTIONS = [
  { value: 'billing', label: 'Insane Billing', emoji: '💸' },
  { value: 'insurance_denial', label: 'Insurance Denial', emoji: '🚫' },
  { value: 'bankruptcy', label: 'Medical Bankruptcy', emoji: '💔' },
  { value: 'wait_time', label: 'Long Wait Time', emoji: '⏰' },
  { value: 'quality', label: 'Quality/Safety Issue', emoji: '🏥' },
  { value: 'medical_tourism', label: 'Medical Tourism Success', emoji: '✈️' }
];

const PROCEDURE_OPTIONS = [
  'Dental Work', 'Cosmetic Surgery', 'Orthopedic', 'Cardiac', 
  'Cancer Treatment', 'Fertility/IVF', 'Weight Loss Surgery',
  'Vision/LASIK', 'General Surgery', 'Other'
];

const VERIFICATION_LEVELS = [
  { value: 'anonymous', label: 'Anonymous', description: 'No verification, complete privacy' },
  { value: 'email_verified', label: 'Email Verified', description: 'Your email is verified but hidden' },
  { value: 'identity_verified', label: 'Identity Verified', description: 'Name verified but you choose display name' }
];

interface AIPromptResponse {
  follow_up: string;
  extracted_data: {
    title?: string;
    content_so_far?: string;
    cost_us?: number;
    cost_abroad?: number;
    procedure?: string;
    issues?: string[];
  };
  is_complete: boolean;
}

const ShareStory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Step tracking
  const [step, setStep] = useState(1);
  const [submitMode, setSubmitMode] = useState<SubmitMode | null>(null);
  
  // Form data
  const [storyType, setStoryType] = useState<StoryType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [procedure, setProcedure] = useState('');
  const [locationUsState, setLocationUsState] = useState('');
  const [locationCountry, setLocationCountry] = useState('');
  const [costUs, setCostUs] = useState<string>('');
  const [costAbroad, setCostAbroad] = useState<string>('');
  const [verificationLevel, setVerificationLevel] = useState('anonymous');
  const [displayName, setDisplayName] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [billImages, setBillImages] = useState<File[]>([]);
  
  // AI-assisted mode state
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExtracted, setAiExtracted] = useState<any>({});
  
  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Handle AI-assisted conversation
  const sendToAI = async () => {
    if (!aiInput.trim() || aiLoading) return;
    
    const userMessage = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiLoading(true);
    
    try {
      const response = await fetch('/.netlify/functions/unified-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...aiMessages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          context: {
            mode: 'story_collection',
            story_type: storyType,
            extracted_so_far: aiExtracted
          },
          userMessage
        })
      });
      
      const data = await response.json();
      
      // Add assistant response
      setAiMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Update extracted data if any
      if (data.extracted) {
        setAiExtracted(prev => ({ ...prev, ...data.extracted }));
        
        // Auto-populate form fields
        if (data.extracted.title) setTitle(data.extracted.title);
        if (data.extracted.content) setContent(data.extracted.content);
        if (data.extracted.cost_us) setCostUs(data.extracted.cost_us.toString());
        if (data.extracted.cost_abroad) setCostAbroad(data.extracted.cost_abroad.toString());
        if (data.extracted.procedure) setProcedure(data.extracted.procedure);
        if (data.extracted.issues) setIssues(data.extracted.issues);
      }
      
    } catch (err: any) {
      console.error('AI error:', err);
      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble processing that. Could you try rephrasing?' 
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const startAIConversation = () => {
    const typeLabel = STORY_TYPES.find(t => t.value === storyType)?.label || 'story';
    setAiMessages([{
      role: 'assistant',
      content: `I'm here to help you share your ${typeLabel.toLowerCase()}. Just tell me what happened in your own words - I'll help shape it into a compelling story that others can relate to.\n\nStart by describing the situation: What happened? Where were you?`
    }]);
  };

  // Handle form submission
  const handleSubmit = async (asDraft = false) => {
    if (!storyType || !title || !content) {
      setError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Upload images if any
      const uploadedImages: string[] = [];
      const uploadedBillImages: string[] = [];
      
      for (const file of images) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('story-images')
          .upload(fileName, file);
        
        if (!uploadError && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('story-images')
            .getPublicUrl(fileName);
          uploadedImages.push(publicUrl);
        }
      }
      
      for (const file of billImages) {
        const fileName = `bills/${Date.now()}-${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('story-images')
          .upload(fileName, file);
        
        if (!uploadError && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('story-images')
            .getPublicUrl(fileName);
          uploadedBillImages.push(publicUrl);
        }
      }
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/.netlify/functions/stories-api', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          title,
          content,
          story_type: storyType,
          issues,
          procedure: procedure || null,
          location_us_state: locationUsState || null,
          location_country: locationCountry || null,
          cost_us: costUs ? parseFloat(costUs) : null,
          cost_abroad: costAbroad ? parseFloat(costAbroad) : null,
          verification_level: verificationLevel,
          display_name: displayName || null,
          images: uploadedImages,
          bill_images: uploadedBillImages,
          status: asDraft ? 'draft' : 'pending'
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to submit story');
      }
      
      const { story } = await response.json();
      
      // Redirect to success page or story
      navigate(`/stories/${story.slug}?submitted=true`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
      <SiteHeader />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl text-ocean-800 mb-4">
            Share Your Story
          </h1>
          <p className="text-lg text-ocean-600 max-w-xl mx-auto">
            Your experience could help thousands of others. Share anonymously or with your name.
          </p>
        </motion.div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s < step ? 'bg-green-500 text-white' :
                  s === step ? 'bg-ocean-600 text-white' :
                  'bg-sage-200 text-ocean-500'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-1 mx-1 rounded ${s < step ? 'bg-green-500' : 'bg-sage-200'}`} />
              )}
            </div>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          {/* Step 1: Choose Story Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-display text-ocean-700 text-center mb-8">
                What kind of story do you want to share?
              </h2>
              
              <div className="grid gap-4">
                {STORY_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setStoryType(type.value);
                      setStep(2);
                    }}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${
                      storyType === type.value
                        ? 'border-ocean-500 bg-ocean-50'
                        : 'border-sage-200 bg-white hover:border-ocean-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{type.emoji}</span>
                      <div className="flex-1">
                        <div className="font-display text-xl text-ocean-800 mb-1">
                          {type.label}
                        </div>
                        <p className="text-ocean-600 mb-2">{type.description}</p>
                        <p className="text-sm text-ocean-500 italic">"{type.example}"</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Step 2: Choose Submit Mode */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-display text-ocean-700 text-center mb-8">
                How would you like to share?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    setSubmitMode('write');
                    setStep(3);
                  }}
                  className="p-8 rounded-2xl border-2 border-sage-200 bg-white hover:border-ocean-300 hover:shadow-lg transition-all text-center"
                >
                  <div className="text-4xl mb-4">✍️</div>
                  <div className="font-display text-xl text-ocean-800 mb-2">Write It Myself</div>
                  <p className="text-ocean-600 text-sm">
                    I'll fill out the form and write my story directly
                  </p>
                </button>
                
                <button
                  onClick={() => {
                    setSubmitMode('assisted');
                    startAIConversation();
                    setStep(3);
                  }}
                  className="p-8 rounded-2xl border-2 border-ocean-200 bg-gradient-to-br from-ocean-50 to-white hover:border-ocean-400 hover:shadow-lg transition-all text-center"
                >
                  <div className="text-4xl mb-4">💬</div>
                  <div className="font-display text-xl text-ocean-800 mb-2">Help Me Tell It</div>
                  <p className="text-ocean-600 text-sm">
                    Chat with our AI assistant who will help shape your story
                  </p>
                </button>
              </div>
              
              <button
                onClick={() => setStep(1)}
                className="block mx-auto text-ocean-600 hover:text-ocean-700"
              >
                ← Back
              </button>
            </motion.div>
          )}
          
          {/* Step 3: Write Story (Manual or AI-assisted) */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {submitMode === 'assisted' ? (
                // AI-Assisted Mode
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-4 bg-ocean-600 text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      💬
                    </div>
                    <div>
                      <div className="font-medium">Story Assistant</div>
                      <div className="text-sm text-ocean-100">Tell me what happened</div>
                    </div>
                  </div>
                  
                  {/* Chat messages */}
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                    {aiMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-ocean-600 text-white rounded-br-none'
                              : 'bg-sage-100 text-ocean-800 rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-sage-100 rounded-2xl rounded-bl-none px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Input */}
                  <div className="p-4 border-t border-sage-200 flex gap-3">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendToAI()}
                      placeholder="Tell me what happened..."
                      className="flex-1 px-4 py-3 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                    <button
                      onClick={sendToAI}
                      disabled={aiLoading || !aiInput.trim()}
                      className="px-6 py-3 bg-ocean-600 text-white rounded-xl hover:bg-ocean-700 disabled:opacity-50 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                  
                  {/* Extracted preview */}
                  {(title || content) && (
                    <div className="p-4 bg-green-50 border-t border-green-200">
                      <div className="text-sm font-medium text-green-700 mb-2">
                        ✓ I've started building your story
                      </div>
                      {title && <div className="text-sm text-green-600">Title: {title}</div>}
                      <button
                        onClick={() => setStep(4)}
                        className="mt-3 text-sm text-ocean-600 hover:text-ocean-700 font-medium"
                      >
                        Review & Edit Story →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Manual Write Mode
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="A compelling title for your story..."
                      className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      Your Story <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Tell us what happened. Be as detailed as you'd like..."
                      rows={12}
                      className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                  
                  {/* Issues */}
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      What issues does this involve?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ISSUE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setIssues(prev => 
                              prev.includes(opt.value)
                                ? prev.filter(i => i !== opt.value)
                                : [...prev, opt.value]
                            );
                          }}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            issues.includes(opt.value)
                              ? 'bg-ocean-600 text-white'
                              : 'bg-sage-100 text-ocean-700 hover:bg-sage-200'
                          }`}
                        >
                          {opt.emoji} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Procedure */}
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      What procedure/treatment was involved?
                    </label>
                    <select
                      value={procedure}
                      onChange={(e) => setProcedure(e.target.value)}
                      className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    >
                      <option value="">Select a category...</option>
                      {PROCEDURE_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Cost comparison (for comparison stories) */}
                  {storyType === 'comparison' && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-sage-50 rounded-xl">
                      <div>
                        <label className="block text-sm font-medium text-ocean-700 mb-2">
                          US Price/Quote
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ocean-500">$</span>
                          <input
                            type="number"
                            value={costUs}
                            onChange={(e) => setCostUs(e.target.value)}
                            placeholder="80,000"
                            className="w-full pl-8 pr-4 py-3 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ocean-700 mb-2">
                          What You Paid Abroad
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ocean-500">$</span>
                          <input
                            type="number"
                            value={costAbroad}
                            onChange={(e) => setCostAbroad(e.target.value)}
                            placeholder="12,000"
                            className="w-full pl-8 pr-4 py-3 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="text-ocean-600 hover:text-ocean-700"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!title || !content}
                  className="px-6 py-3 bg-ocean-600 text-white rounded-xl hover:bg-ocean-700 disabled:opacity-50 transition-colors"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Step 4: Identity & Submit */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-display text-ocean-700 text-center mb-8">
                How would you like to be identified?
              </h2>
              
              {/* Verification options */}
              <div className="space-y-3">
                {VERIFICATION_LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setVerificationLevel(level.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      verificationLevel === level.value
                        ? 'border-ocean-500 bg-ocean-50'
                        : 'border-sage-200 bg-white hover:border-ocean-300'
                    }`}
                  >
                    <div className="font-medium text-ocean-800">{level.label}</div>
                    <div className="text-sm text-ocean-600">{level.description}</div>
                  </button>
                ))}
              </div>
              
              {/* Display name */}
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-2">
                  Display Name (optional)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we show your name? (e.g., 'Sarah M.' or 'A frustrated patient')"
                  className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
              
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-2">
                  Add Images (optional)
                </label>
                <div className="border-2 border-dashed border-sage-300 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files || []))}
                    className="hidden"
                    id="images"
                  />
                  <label htmlFor="images" className="cursor-pointer">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-ocean-600">Click to upload images</div>
                    <div className="text-sm text-ocean-500">Photos, screenshots, etc.</div>
                  </label>
                  {images.length > 0 && (
                    <div className="mt-4 text-sm text-green-600">
                      {images.length} image(s) selected
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bill images */}
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-2">
                  Upload Bills/Receipts (optional but powerful)
                </label>
                <div className="border-2 border-dashed border-red-200 rounded-xl p-6 text-center bg-red-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => setBillImages(Array.from(e.target.files || []))}
                    className="hidden"
                    id="bills"
                  />
                  <label htmlFor="bills" className="cursor-pointer">
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-ocean-600">Upload actual bills or receipts</div>
                    <div className="text-sm text-ocean-500">Nothing makes the point like real evidence</div>
                  </label>
                  {billImages.length > 0 && (
                    <div className="mt-4 text-sm text-green-600">
                      {billImages.length} bill(s) selected
                    </div>
                  )}
                </div>
              </div>
              
              {/* Preview */}
              <div className="bg-sage-50 rounded-xl p-6">
                <h3 className="font-medium text-ocean-700 mb-4">Story Preview</h3>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-xs text-ocean-500 mb-2">
                    {STORY_TYPES.find(t => t.value === storyType)?.emoji} {STORY_TYPES.find(t => t.value === storyType)?.label}
                  </div>
                  <h4 className="font-display text-lg text-ocean-800 mb-2">{title || 'Your title here'}</h4>
                  <p className="text-ocean-600 text-sm line-clamp-3">
                    {content || 'Your story content...'}
                  </p>
                  <div className="mt-3 text-xs text-ocean-500">
                    By {displayName || 'Anonymous'}
                  </div>
                </div>
              </div>
              
              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  {error}
                </div>
              )}
              
              {/* Submit buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={() => setStep(3)}
                  className="text-ocean-600 hover:text-ocean-700"
                >
                  ← Back to Edit
                </button>
                
                <div className="flex-1" />
                
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="px-6 py-3 bg-white border-2 border-ocean-200 text-ocean-700 rounded-xl hover:bg-ocean-50 disabled:opacity-50 transition-colors"
                >
                  Save as Draft
                </button>
                
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting || !title || !content}
                  className="px-8 py-3 bg-gradient-to-b from-gold-500 to-gold-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Story
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-center text-ocean-500 mt-4">
                By submitting, you agree that your story may be shared on our platform and social media. 
                You can request removal at any time.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShareStory;

