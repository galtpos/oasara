import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  facilities?: Array<{
    id: string;
    name: string;
    city: string;
    country: string;
    jci_accredited: boolean;
    google_rating: number;
    review_count: number;
    popular_procedures?: Array<{ name: string; price_range: string; wait_time: string }>;
  }>;
}

interface JourneyChatbotProps {
  journey: {
    id: string;
    procedure_type: string;
    budget_min: number | null;
    budget_max: number | null;
    timeline: string | null;
  };
  shortlistedFacilities: Array<{
    facilities: {
      id: string;
      name: string;
      city: string;
      country: string;
    };
  }>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const JourneyChatbot: React.FC<JourneyChatbotProps> = ({ journey, shortlistedFacilities, isOpen, setIsOpen }) => {
  // Load persisted messages from localStorage
  const loadMessages = (): Message[] => {
    try {
      const stored = localStorage.getItem(`oasara-chat-${journey.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }

    // Default greeting if no history
    return [{
      role: 'assistant',
      content: `Hey there! I'm here to help you navigate your ${journey.procedure_type} journey. I know making healthcare decisions can feel overwhelming, and you might have a lot of questions or concerns. That's completely normal—and you're not alone in this. What would you like to talk about first?`,
      timestamp: new Date()
    }];
  };

  const [messages, setMessages] = useState<Message[]>(loadMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [shortlistLoading, setShortlistLoading] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Track shortlisted facility IDs
  const shortlistedIds = shortlistedFacilities.map(sf => sf.facilities.id);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`oasara-chat-${journey.id}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [messages, journey.id]);

  // Simple markdown-to-HTML renderer (handles bold, bullet lists, line breaks)
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-open chatbot on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('oasara-chatbot-visited');
    if (!hasVisited) {
      setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('oasara-chatbot-visited', 'true');
      }, 1500); // Open after 1.5 seconds
    }
  }, []);

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleAddToShortlist = async (facilityId: string) => {
    setShortlistLoading(facilityId);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please sign up to save facilities to your shortlist');
        return;
      }

      const { error } = await supabase
        .from('journey_facilities')
        .insert({
          journey_id: journey.id,
          facility_id: facilityId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          alert('This facility is already in your shortlist');
        } else {
          throw error;
        }
      } else {
        // Add success message to chat (don't reload - keeps chat history)
        const successMessage: Message = {
          role: 'assistant',
          content: `Great choice! I've added this to your shortlist. You're building a solid set of options—you can compare them side-by-side on your dashboard whenever you're ready.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);

        // Force re-render to update "Saved" status
        // Parent will fetch updated shortlist on next page load
      }
    } catch (error) {
      console.error('Error adding to shortlist:', error);
      alert('Failed to add facility to shortlist. Please try again.');
    } finally {
      setShortlistLoading(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context for the AI
      const context = {
        procedure: journey.procedure_type,
        budget: journey.budget_min && journey.budget_max
          ? `$${journey.budget_min.toLocaleString()} - $${journey.budget_max.toLocaleString()}`
          : 'Not specified',
        timeline: journey.timeline || 'Not specified',
        shortlist: shortlistedFacilities.map(sf => ({
          name: sf.facilities.name,
          location: `${sf.facilities.city}, ${sf.facilities.country}`
        }))
      };

      const response = await fetch('/.netlify/functions/journey-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          userMessage: userMessage.content,
          context
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        facilities: data.facilities // Include facility recommendations
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm really sorry—I'm having a technical hiccup right now. Can you give me a moment and try asking again? I'm here and want to help.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "How safe are these facilities?", query: "I want to make sure I'm safe. Which facilities have the best safety records and accreditation for my procedure?" },
    { label: "What's the real cost?", query: "I'm worried about hidden costs. What's typically included in the procedure price and what surprises should I watch for?" },
    { label: "What's recovery like?", query: "I'm nervous about recovery. How long does it take for this procedure and when can I travel home?" },
    { label: "Help me decide", query: shortlistedFacilities.length > 0 ? "I'm looking at a few options but not sure how to choose. Can you help me compare the facilities on my shortlist?" : "I'm feeling a bit overwhelmed. Can you recommend some facilities to get me started?" }
  ];

  const handleQuickAction = async (query: string) => {
    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const context = {
        procedure: journey.procedure_type,
        budget: journey.budget_min && journey.budget_max
          ? `$${journey.budget_min.toLocaleString()} - $${journey.budget_max.toLocaleString()}`
          : 'Not specified',
        timeline: journey.timeline || 'Not specified',
        shortlist: shortlistedFacilities.map(sf => ({
          name: sf.facilities.name,
          location: `${sf.facilities.city}, ${sf.facilities.country}`
        }))
      };

      const response = await fetch('/.netlify/functions/journey-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          userMessage: query,
          context
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        facilities: data.facilities // Include facility recommendations
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm really sorry—I'm having a technical hiccup right now. Can you give me a moment and try asking again? I'm here and want to help.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-ocean-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white p-4 flex items-center justify-between">
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
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-ocean-600 text-white rounded-br-none'
                        : 'bg-sage-100 text-ocean-800 rounded-bl-none'
                    }`}
                  >
                    <div
                      className="text-sm prose prose-sm max-w-none prose-strong:font-semibold"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                    />

                    {/* Facility Recommendations */}
                    {message.facilities && message.facilities.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.facilities.map((facility) => (
                          <div
                            key={facility.id}
                            className="bg-white border border-ocean-200 rounded-lg p-3 hover:border-ocean-400 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-ocean-800 text-sm truncate">
                                  {facility.name}
                                </div>
                                <div className="text-xs text-ocean-600 mt-0.5">
                                  {facility.city}, {facility.country}
                                  {facility.jci_accredited && (
                                    <span className="ml-2 inline-flex items-center gap-0.5 text-green-700">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      JCI
                                    </span>
                                  )}
                                </div>
                                {facility.google_rating > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs font-medium text-ocean-700">
                                      {facility.google_rating.toFixed(1)}
                                    </span>
                                    <svg className="w-3 h-3 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-xs text-ocean-500">
                                      ({facility.review_count})
                                    </span>
                                  </div>
                                )}
                                {facility.popular_procedures && facility.popular_procedures.length > 0 && (
                                  <div className="text-xs text-ocean-600 mt-1">
                                    <span className="font-medium">{facility.popular_procedures[0].name}:</span>{' '}
                                    {facility.popular_procedures[0].price_range}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <a
                                  href={`/facility/${facility.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 px-2 py-1 bg-ocean-600 text-white text-xs rounded hover:bg-ocean-700 transition-colors text-center"
                                >
                                  View
                                </a>
                                {shortlistedIds.includes(facility.id) ? (
                                  <div className="flex-shrink-0 px-2 py-1 bg-green-100 text-green-700 text-xs rounded border border-green-300 text-center">
                                    ✓ Saved
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAddToShortlist(facility.id)}
                                    disabled={shortlistLoading === facility.id}
                                    className="flex-shrink-0 px-2 py-1 bg-sage-100 text-ocean-700 text-xs rounded hover:bg-sage-200 transition-colors disabled:opacity-50 border border-sage-300"
                                  >
                                    {shortlistLoading === facility.id ? '...' : '+ List'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`text-xs mt-1 opacity-70 ${message.role === 'user' ? 'text-right' : ''}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-sage-100 rounded-2xl rounded-bl-none px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-ocean-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-ocean-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-ocean-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-sage-200 bg-sage-50/50">
                <div className="text-xs font-medium text-ocean-700 mb-2">Quick start:</div>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.query)}
                      disabled={isLoading}
                      className="text-xs px-3 py-1.5 bg-white border border-sage-300 text-ocean-700 rounded-full hover:bg-ocean-50 hover:border-ocean-400 transition-colors disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-sage-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  placeholder={isListening ? "Listening..." : "Ask me anything—no question is too small..."}
                  className="flex-1 px-4 py-3 border-2 border-sage-200 rounded-xl focus:border-ocean-500 focus:outline-none text-sm"
                  disabled={isLoading || isListening}
                />
                {recognitionRef.current && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoading}
                    className={`px-3 py-3 rounded-xl transition-colors disabled:opacity-50 ${
                      isListening
                        ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                        : 'bg-sage-100 text-ocean-700 hover:bg-sage-200'
                    }`}
                    title={isListening ? "Stop listening" : "Click to speak (Chrome/Edge only)"}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 bg-ocean-600 text-white rounded-xl hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        data-chatbot-toggle
        data-is-open={isOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-ocean-500/50 transition-all"
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>

      {/* Unread indicator (when closed) */}
      {!isOpen && messages.length > 1 && (
        <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold">
          {messages.filter(m => m.role === 'assistant').length - 1}
        </div>
      )}
    </div>
  );
};

export default JourneyChatbot;
