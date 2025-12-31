import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
    price_usd?: number;
  }>;
}

interface ConversationalJourneyProps {
  journeyId?: string;
}

const ConversationalJourney: React.FC<ConversationalJourneyProps> = ({ journeyId }) => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hey there! I\'m here to help you find the perfect care for your medical journey. Whether you\'re just exploring options or ready to take action, I\'m with you every step. What brings you here today?',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!journeyId) return;

      try {
        const { data, error } = await supabase
          .from('conversation_history')
          .select('role, content, timestamp, metadata')
          .eq('journey_id', journeyId)
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
  }, [journeyId]);

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
            journeyId: journeyId || null,
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
        facilities: data.facilities || []
      };
      setMessages(prev => [...prev, aiMessage]);

      // If journey was created, navigate to it
      if (data.journeyId && !journeyId) {
        setTimeout(() => {
          navigate(`/my-journey?id=${data.journeyId}`);
        }, 2000);
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
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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

                {/* Facility Cards */}
                {message.facilities && message.facilities.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {message.facilities.map((facility) => (
                      <div
                        key={facility.id}
                        className="bg-sage-50 rounded-xl p-4 border border-ocean-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-ocean-800">{facility.name}</h4>
                            <p className="text-sm text-ocean-600">
                              📍 {facility.city}, {facility.country}
                            </p>
                          </div>
                          {facility.jci_accredited && (
                            <span className="px-2 py-1 bg-gold-100 text-gold-700 text-xs font-semibold rounded">
                              ✓ JCI
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-ocean-700 mb-3">
                          <span>⭐ {facility.google_rating}/5</span>
                          <span>({facility.review_count} reviews)</span>
                          {facility.price_usd && (
                            <span className="font-semibold text-gold-600">
                              ${facility.price_usd.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="flex-1 bg-ocean-500 hover:bg-ocean-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            onClick={() => setInput(`Add ${facility.name} to my shortlist`)}
                          >
                            Add to Shortlist
                          </button>
                          <button
                            className="flex-1 bg-white hover:bg-sage-50 text-ocean-600 border border-ocean-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            onClick={() => navigate(`/facilities/${facility.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
