import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import FacilityCard from './FacilityCard';
import InlineComparison from './InlineComparison';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isComparison?: boolean;
  facilities?: Array<{
    id: string;
    name: string;
    city: string;
    country: string;
    jci_accredited: boolean;
    google_rating: number;
    review_count: number;
    popular_procedures?: Array<{
      name: string;
      price_range: string;
      wait_time?: string;
    }>;
    matched_procedure?: {
      name: string;
      price_range: string;
      wait_time?: string;
    } | null;
    accepts_zano?: boolean;
  }>;
}

interface ConversationalJourneyProps {
  journeyId?: string;
}

const ConversationalJourney: React.FC<ConversationalJourneyProps> = ({ journeyId: initialJourneyId }) => {
  // Track journeyId in local state so we can update it when journey is created
  const [currentJourneyId, setCurrentJourneyId] = useState<string | undefined>(initialJourneyId);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hey there! I\'m here to help you find the perfect care for your medical journey. Whether you\'re just exploring options or ready to take action, I\'m with you every step. What brings you here today?',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [shortlistLoading, setShortlistLoading] = useState<string | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [selectedForBatch, setSelectedForBatch] = useState<Set<string>>(new Set());
  const [batchAddLoading, setBatchAddLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  // Toggle facility selection for batch add
  const handleToggleBatchSelect = (facilityId: string) => {
    setSelectedForBatch(prev => {
      const next = new Set(prev);
      if (next.has(facilityId)) {
        next.delete(facilityId);
      } else {
        next.add(facilityId);
      }
      return next;
    });
  };

  // Handle batch add of selected facilities
  const handleBatchAdd = async (facilities: Array<{ id: string; name: string }>) => {
    if (!currentJourneyId) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I\'d love to save those for you! Let me first get a few details about your healthcare needs so I can create your personal journey. What type of procedure are you exploring?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const toAdd = facilities.filter(f => selectedForBatch.has(f.id) && !shortlistedIds.includes(f.id));
    if (toAdd.length === 0) return;

    setBatchAddLoading(true);
    try {
      const { error } = await supabase
        .from('journey_facilities')
        .insert(toAdd.map(f => ({
          journey_id: currentJourneyId,
          facility_id: f.id
        })));

      if (error) throw error;

      // Update local state
      setShortlistedIds(prev => [...prev, ...toAdd.map(f => f.id)]);
      setSelectedForBatch(new Set());

      // Add success message
      const names = toAdd.map(f => f.name).join(', ');
      const successMessage: Message = {
        role: 'assistant',
        content: `Excellent! I've added **${toAdd.length} ${toAdd.length === 1 ? 'facility' : 'facilities'}** to your shortlist: ${names}. You're making great progress on your research!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Error batch adding:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I ran into a hiccup saving those facilities. Can you try again in a moment?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setBatchAddLoading(false);
    }
  };

  // Load shortlisted facility IDs
  useEffect(() => {
    const loadShortlist = async () => {
      if (!currentJourneyId) return;

      try {
        const { data, error } = await supabase
          .from('journey_facilities')
          .select('facility_id')
          .eq('journey_id', currentJourneyId);

        if (error) throw error;
        setShortlistedIds(data?.map(d => d.facility_id) || []);
      } catch (error) {
        console.error('Error loading shortlist:', error);
      }
    };

    loadShortlist();
  }, [currentJourneyId]);

  // Handle adding facility to shortlist directly
  const handleAddToShortlist = async (facilityId: string, facilityName: string) => {
    if (!currentJourneyId) {
      // Show message to complete onboarding first
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I\'d love to save that for you! Let me first get a few details about your healthcare needs so I can create your personal journey. What type of procedure are you exploring?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setShortlistLoading(facilityId);
    try {
      const { error } = await supabase
        .from('journey_facilities')
        .insert({
          journey_id: currentJourneyId,
          facility_id: facilityId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          const alreadyMessage: Message = {
            role: 'assistant',
            content: `${facilityName} is already in your shortlist! You're on top of things.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, alreadyMessage]);
        } else {
          throw error;
        }
      } else {
        // Update local shortlist state
        setShortlistedIds(prev => [...prev, facilityId]);

        // Add success message
        const successMessage: Message = {
          role: 'assistant',
          content: `Great choice! I've added **${facilityName}** to your shortlist. You're building a solid set of options—you can compare them side-by-side on your dashboard whenever you're ready.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Error adding to shortlist:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I ran into a hiccup saving that facility. Can you try again in a moment?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setShortlistLoading(null);
    }
  };

  // Update currentJourneyId if prop changes
  useEffect(() => {
    if (initialJourneyId && initialJourneyId !== currentJourneyId) {
      setCurrentJourneyId(initialJourneyId);
    }
  }, [initialJourneyId]);

  // Get current user - use getSession (cached) not getUser (slow network call)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!currentJourneyId) return;

      try {
        const { data, error } = await supabase
          .from('conversation_history')
          .select('role, content, timestamp, metadata')
          .eq('journey_id', currentJourneyId)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const loadedMessages: Message[] = data.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            facilities: msg.metadata?.facilities || []
          }));
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    };

    loadHistory();
  }, [currentJourneyId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Web Speech API for voice input
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        // Silent handling - no alerts, just log to console for debugging
      };
    }
  }, []);

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      // Silent fail - no error message for unsupported browsers
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error: any) {
        console.error('Voice error:', error);
        // Silent fail - just log to console
      }
    }
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Get user's auth token for RLS
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Call journey-chat function
      const response = await fetch('/.netlify/functions/journey-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          userMessage,
          context: {
            journeyId: currentJourneyId || null,
            userId: user?.id || null
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        facilities: data.facilities || [],
        isComparison: data.isComparison || false
      };
      setMessages(prev => [...prev, aiMessage]);

      // If journey was created, update local state and URL
      if (data.journeyId && !currentJourneyId) {
        console.log('[Journey] New journey created:', data.journeyId);
        setCurrentJourneyId(data.journeyId);
        // Update URL without full navigation to preserve chat state
        window.history.replaceState(null, '', `/my-journey/chat?id=${data.journeyId}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render markdown-like formatting
  const renderMarkdown = (text: string) => {
    let html = text;

    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bullet lists: lines starting with - or *
    html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside my-2 space-y-1">$&</ul>');

    // Line breaks
    html = html.replace(/\n/g, '<br/>');

    return html;
  };

  return (
    <div className="flex flex-col h-screen bg-sage-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">Your Journey Companion</div>
              <div className="text-xs opacity-90">Here for you, every step</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/my-journey')}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
            title="Back to Dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  message.role === 'user'
                    ? 'bg-ocean-500 text-white'
                    : 'bg-white border-l-4 border-ocean-500 shadow-sm'
                }`}
              >
                <div
                  className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-ocean-900'}`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                />

                {/* Facility Cards or Comparison Table */}
                {message.facilities && message.facilities.length > 0 && (
                  message.isComparison ? (
                    <InlineComparison facilities={message.facilities} />
                  ) : (
                    <div className="mt-4 space-y-3">
                      {/* Select All / Batch Add Header */}
                      {message.facilities.filter(f => !shortlistedIds.includes(f.id)).length > 1 && (
                        <div className="flex items-center justify-between bg-sage-50 rounded-lg px-4 py-2">
                          <label className="flex items-center gap-2 text-sm text-ocean-700 cursor-pointer">
                            <button
                              onClick={() => {
                                const unshortlisted = message.facilities!.filter(f => !shortlistedIds.includes(f.id));
                                const allSelected = unshortlisted.every(f => selectedForBatch.has(f.id));
                                if (allSelected) {
                                  // Deselect all
                                  setSelectedForBatch(prev => {
                                    const next = new Set(prev);
                                    unshortlisted.forEach(f => next.delete(f.id));
                                    return next;
                                  });
                                } else {
                                  // Select all
                                  setSelectedForBatch(prev => {
                                    const next = new Set(prev);
                                    unshortlisted.forEach(f => next.add(f.id));
                                    return next;
                                  });
                                }
                              }}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                message.facilities!.filter(f => !shortlistedIds.includes(f.id)).every(f => selectedForBatch.has(f.id))
                                  ? 'bg-ocean-500 border-ocean-500 text-white'
                                  : 'border-sage-400 hover:border-ocean-400'
                              }`}
                            >
                              {message.facilities!.filter(f => !shortlistedIds.includes(f.id)).every(f => selectedForBatch.has(f.id)) && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            Select all ({message.facilities!.filter(f => !shortlistedIds.includes(f.id)).length} available)
                          </label>
                          {selectedForBatch.size > 0 && (
                            <button
                              onClick={() => handleBatchAdd(message.facilities!)}
                              disabled={batchAddLoading}
                              className="px-4 py-1.5 bg-ocean-500 hover:bg-ocean-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {batchAddLoading ? (
                                <>
                                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add {selectedForBatch.size} to Shortlist
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                      {message.facilities.map((facility) => (
                        <FacilityCard
                          key={facility.id}
                          facility={facility}
                          isInShortlist={shortlistedIds.includes(facility.id)}
                          isLoading={shortlistLoading === facility.id}
                          onAddToShortlist={() => handleAddToShortlist(facility.id, facility.name)}
                          showCheckbox={message.facilities!.filter(f => !shortlistedIds.includes(f.id)).length > 1}
                          isSelected={selectedForBatch.has(facility.id)}
                          onToggleSelect={() => handleToggleBatchSelect(facility.id)}
                        />
                      ))}
                    </div>
                  )
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border-l-4 border-ocean-500 shadow-sm rounded-2xl px-5 py-3">
                <div className="flex items-center gap-2 text-ocean-600">
                  <div className="w-2 h-2 bg-ocean-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-ocean-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-ocean-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-ocean-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or use voice input..."
                className="w-full px-4 py-3 pr-12 border-2 border-ocean-200 rounded-xl focus:border-ocean-500 focus:outline-none resize-none"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '120px' }}
                onInput={(e: any) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />

              {/* Voice button */}
              <button
                onClick={toggleVoiceInput}
                className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-ocean-100 text-ocean-600 hover:bg-ocean-200'
                }`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>

            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-white rounded-xl font-medium transition-colors disabled:bg-ocean-300 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Voice input status */}
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... speak now
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationalJourney;
