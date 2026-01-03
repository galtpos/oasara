import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { getPricingForCountry, formatPriceRange } from '../../data/procedurePricing';

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
    matched_procedure?: { name: string; price_range?: string; wait_time?: string } | null;
    procedure_price?: string | null;
    doctor_count?: number;
    featured_doctor?: {
      name: string;
      specialty?: string;
      years_experience?: number;
    } | null;
  }>;
}

interface Journey {
  id: string;
  procedure_type: string;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
}

interface ShortlistedFacility {
  facilities: {
    id: string;
    name: string;
    city: string;
    country: string;
  };
}

interface PledgeStatus {
  medical_trust: boolean;
  cancel_insurance: boolean;
  try_medical_tourism: boolean;
}

interface UnifiedChatbotProps {
  // For returning users with a journey
  journey?: Journey | null;
  shortlistedFacilities?: ShortlistedFacility[];
  // For new users
  isNewUser?: boolean;
  userEmail?: string | null;
  pledgeStatus?: PledgeStatus;
  // Display controls
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  // Callbacks
  onShortlistUpdate?: () => void;
  onJourneyCreated?: (journeyId: string) => void;
}

const UnifiedChatbot: React.FC<UnifiedChatbotProps> = ({
  journey,
  shortlistedFacilities = [],
  isNewUser = false,
  userEmail,
  pledgeStatus,
  isOpen,
  setIsOpen,
  onShortlistUpdate,
  onJourneyCreated
}) => {
  // Generate storage key
  const storageKey = journey?.id ? `oasara-chat-${journey.id}` : 'oasara-chat-new';

  // Load persisted messages
  const loadMessages = (): Message[] => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }

    // Default greeting based on user state
    const greeting = isNewUser || !journey
      ? "Hey! I'm here to help you take control of your healthcare. Whether you're looking to protect your savings, cut insurance costs, or explore care options abroad — just tell me what's on your mind."
      : `Hey there! I'm here to help you navigate your ${journey.procedure_type} journey. What would you like to talk about?`;

    return [{
      role: 'assistant',
      content: greeting,
      timestamp: new Date()
    }];
  };

  const [messages, setMessages] = useState<Message[]>(loadMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shortlistLoading, setShortlistLoading] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevJourneyIdRef = useRef<string | undefined>(journey?.id);

  // Reload messages when journey changes
  useEffect(() => {
    if (prevJourneyIdRef.current !== journey?.id) {
      prevJourneyIdRef.current = journey?.id;
      setMessages(loadMessages());
    }
  }, [journey?.id]);

  // Track shortlisted facility IDs
  const shortlistedIds = shortlistedFacilities.map(sf => sf.facilities.id);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to persist chat:', error);
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();

      // Build context
      const context = {
        journeyId: journey?.id || null,
        userId: session?.user?.id || null,
        userEmail: userEmail || session?.user?.email || null,
        procedure: journey?.procedure_type || null,
        shortlist: shortlistedFacilities.map(sf => ({
          id: sf.facilities.id,
          name: sf.facilities.name,
          location: `${sf.facilities.city}, ${sf.facilities.country}`
        })),
        isNewUser: isNewUser && !journey,
        pledgeStatus: pledgeStatus
      };

      // Call unified chat endpoint
      const response = await fetch('/.netlify/functions/unified-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        },
        body: JSON.stringify({
          messages: messages.filter(m => m.role !== 'assistant' || !m.facilities).map(m => ({
            role: m.role,
            content: m.content
          })),
          userMessage,
          context
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Handle journey creation
      if (data.journeyId && !journey?.id && onJourneyCreated) {
        onJourneyCreated(data.journeyId);
      }

      // Handle shortlist changes
      if (data.shortlistChanged && onShortlistUpdate) {
        onShortlistUpdate();
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        facilities: data.facilities
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToShortlist = async (facilityId: string, facilityName: string) => {
    if (!journey?.id) {
      // Show login prompt for new users
      return;
    }

    setShortlistLoading(facilityId);

    try {
      const { error } = await supabase
        .from('journey_facilities')
        .insert({
          journey_id: journey.id,
          facility_id: facilityId
        });

      if (error && error.code !== '23505') {
        throw error;
      }

      onShortlistUpdate?.();

      // Add confirmation message
      const confirmMessage: Message = {
        role: 'assistant',
        content: `✅ Added **${facilityName}** to your shortlist!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);

    } catch (error) {
      console.error('Failed to add to shortlist:', error);
    } finally {
      setShortlistLoading(null);
    }
  };

  const renderFacilityCard = (facility: NonNullable<Message['facilities']>[0]) => {
    const isShortlisted = shortlistedIds.includes(facility.id);
    const isLoadingThis = shortlistLoading === facility.id;

    return (
      <motion.div
        key={facility.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-ocean-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-semibold text-ocean-900">{facility.name}</h4>
            <p className="text-sm text-ocean-600">{facility.city}, {facility.country}</p>
            
            {/* JCI Badge */}
            {facility.jci_accredited && (
              <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1">
                ✓ JCI Accredited
              </span>
            )}

            {/* Rating */}
            {facility.google_rating && (
              <div className="flex items-center gap-1 mt-1 text-sm">
                <span className="text-yellow-500">★</span>
                <span>{facility.google_rating}</span>
                <span className="text-ocean-400">({facility.review_count} reviews)</span>
              </div>
            )}

            {/* Procedure Pricing */}
            {(() => {
              if (facility.matched_procedure?.price_range) {
                return (
                  <div className="text-xs text-ocean-600 mt-1">
                    <span className="font-medium">{facility.matched_procedure.name}:</span>{' '}
                    {facility.matched_procedure.price_range}
                  </div>
                );
              }

              if (journey?.procedure_type) {
                const refPricing = getPricingForCountry(journey.procedure_type, facility.country);
                if (refPricing) {
                  return (
                    <div className="text-xs text-ocean-600 mt-1">
                      <span className="font-medium">Est.:</span>{' '}
                      {formatPriceRange(refPricing.low, refPricing.high)}{' '}
                      <span className="text-green-600">(saves {refPricing.savings})</span>
                    </div>
                  );
                }
              }

              return (
                <div className="text-xs text-ocean-500 mt-1 italic">
                  Contact for pricing
                </div>
              );
            })()}

            {/* Featured Doctor */}
            {facility.featured_doctor && (
              <div className="flex items-center gap-1 mt-1 text-xs text-ocean-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{facility.featured_doctor.name}</span>
                {facility.featured_doctor.specialty && ` • ${facility.featured_doctor.specialty}`}
              </div>
            )}
          </div>

          {/* Add/Added Button */}
          <button
            onClick={() => !isShortlisted && handleAddToShortlist(facility.id, facility.name)}
            disabled={isShortlisted || isLoadingThis || !journey?.id}
            className={`ml-3 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isShortlisted
                ? 'bg-green-100 text-green-700 cursor-default'
                : isLoadingThis
                ? 'bg-ocean-100 text-ocean-400 cursor-wait'
                : !journey?.id
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-ocean-100 text-ocean-700 hover:bg-ocean-200 cursor-pointer'
            }`}
          >
            {isShortlisted ? '✓ Listed' : isLoadingThis ? '...' : '+ List'}
          </button>
        </div>
      </motion.div>
    );
  };

  // Quick action suggestions
  const quickActions = journey ? [
    { label: 'Compare my shortlist', action: 'Compare my shortlisted facilities' },
    { label: 'Search more facilities', action: `Find more ${journey.procedure_type} facilities` },
    { label: 'Check my pledges', action: 'What pledges have I taken?' },
  ] : [
    { label: 'I need a medical procedure', action: 'I need help with a medical procedure' },
    { label: 'Tell me about medical trusts', action: 'What is a medical trust?' },
    { label: 'Insurance alternatives', action: 'What are my alternatives to traditional insurance?' },
  ];

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-ocean-600 text-white rounded-full shadow-lg flex items-center justify-center z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Healthcare Guide</h3>
          <p className="text-xs text-ocean-200">
            {journey ? `${journey.procedure_type} Journey` : 'Your Sovereignty Companion'}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-ocean-600 text-white rounded-br-sm'
                    : 'bg-ocean-50 text-ocean-900 rounded-bl-sm'
                }`}
              >
                <div 
                  className="text-sm whitespace-pre-wrap prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-ocean-600 underline">$1</a>')
                      .replace(/\n/g, '<br/>')
                  }}
                />

                {/* Facility Cards */}
                {message.facilities && message.facilities.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.facilities.map(facility => renderFacilityCard(facility))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-ocean-50 rounded-2xl px-4 py-2 rounded-bl-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={() => setInput(qa.action)}
              className="text-xs bg-ocean-50 text-ocean-700 px-3 py-1.5 rounded-full hover:bg-ocean-100 transition-colors"
            >
              {qa.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-ocean-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-ocean-600 text-white rounded-full hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default UnifiedChatbot;

