import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface OnboardingChatbotProps {
  onJourneyCreated?: (journeyId: string) => void;
}

const OnboardingChatbot: React.FC<OnboardingChatbotProps> = ({ onJourneyCreated }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm here to help you explore your healthcare options. What brings you here today? Feel free to tell me in your own words - no forms to fill out, just a conversation.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [journeyCreated, setJourneyCreated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const response = await fetch('/.netlify/functions/onboarding-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          userMessage: userMessage.content
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Check if AI wants to create a journey
      if (data.createJourney) {
        await handleJourneyCreation(data.createJourney);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJourneyCreation = async (journeyData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Store in localStorage for guest users
        localStorage.setItem('oasara-pending-journey', JSON.stringify(journeyData));
        return;
      }

      const { data: journey, error } = await supabase
        .from('journeys')
        .insert({
          user_id: user.id,
          procedure_type: journeyData.procedure,
          budget_min: journeyData.budgetMin,
          budget_max: journeyData.budgetMax,
          timeline: journeyData.timeline,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setJourneyCreated(true);

      if (onJourneyCreated) {
        onJourneyCreated(journey.id);
      }

      // Auto-navigate to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/my-journey');
      }, 2000);

    } catch (error) {
      console.error('Error creating journey:', error);
    }
  };

  const quickActions = [
    { label: "I'm exploring options", query: "I'm just starting to explore my options and want to understand what's available" },
    { label: "I know what I need", query: "I know exactly what procedure I need and want to find the best facilities" },
    { label: "Price comparison", query: "I want to see how much I can save compared to US prices" },
    { label: "Safety first", query: "My main concern is finding the safest, most accredited facilities" }
  ];

  const handleQuickAction = async (query: string) => {
    setInput(query);
    // Trigger send after setting input
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-2xl border-2 border-ocean-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-semibold">Let's Find Your Perfect Care</div>
            <div className="text-sm opacity-90">Just tell me what you're looking for</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                message.role === 'user'
                  ? 'bg-ocean-600 text-white rounded-br-none'
                  : 'bg-sage-100 text-ocean-800 rounded-bl-none'
              }`}
            >
              <div className="text-base whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 opacity-70 ${message.role === 'user' ? 'text-right' : ''}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-sage-100 rounded-2xl rounded-bl-none px-5 py-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-ocean-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-ocean-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-ocean-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {journeyCreated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Perfect! Your journey is ready</h3>
            <p className="text-green-700">Taking you to your personalized dashboard...</p>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-6 py-4 border-t border-sage-200 bg-sage-50/50">
          <div className="text-sm font-medium text-ocean-700 mb-3">Quick start:</div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.query)}
                disabled={isLoading}
                className="text-sm px-4 py-3 bg-white border-2 border-sage-300 text-ocean-700 rounded-xl hover:bg-ocean-50 hover:border-ocean-400 transition-colors disabled:opacity-50 text-left"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-sage-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={isListening ? "Listening..." : "Tell me what you're looking for..."}
            className="flex-1 px-5 py-4 border-2 border-sage-200 rounded-xl focus:border-ocean-500 focus:outline-none text-base"
            disabled={isLoading || isListening}
          />
          {recognitionRef.current && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`px-4 py-4 rounded-xl transition-colors disabled:opacity-50 ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                  : 'bg-sage-100 text-ocean-700 hover:bg-sage-200'
              }`}
              title={isListening ? "Stop listening" : "Click to speak"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-4 bg-ocean-600 text-white rounded-xl hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingChatbot;
