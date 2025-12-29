import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOasaraChat, ChatMessage, ChatSource } from '../../hooks/useOasaraChat';

/**
 * Simple markdown renderer for chat messages
 * Handles: **bold**, [links](url), numbered lists, bullet points
 */
const renderMarkdown = (text: string): React.ReactNode => {
  // Split by newlines to handle lists
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    // Process inline formatting
    const processInline = (str: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let remaining = str;
      let keyIndex = 0;

      while (remaining.length > 0) {
        // Find the earliest match of either bold or link
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

        // Determine which comes first
        const boldIndex = boldMatch?.index ?? Infinity;
        const linkIndex = linkMatch?.index ?? Infinity;

        // If no matches, push remaining and break
        if (boldIndex === Infinity && linkIndex === Infinity) {
          parts.push(remaining);
          break;
        }

        // Process link first if it comes before bold
        if (linkIndex < boldIndex && linkMatch) {
          // Add text before the link
          if (linkMatch.index! > 0) {
            parts.push(remaining.slice(0, linkMatch.index));
          }
          // Add the link
          parts.push(
            <a
              key={`l-${keyIndex++}`}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-600 hover:text-gold-700 underline underline-offset-2 font-medium"
            >
              {linkMatch[1]}
            </a>
          );
          remaining = remaining.slice(linkMatch.index! + linkMatch[0].length);
          continue;
        }

        // Process bold
        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) {
            parts.push(remaining.slice(0, boldMatch.index));
          }
          // Check if bold content contains a link
          const innerLinkMatch = boldMatch[1].match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (innerLinkMatch) {
            parts.push(
              <strong key={`b-${keyIndex++}`} className="font-semibold">
                <a
                  href={innerLinkMatch[2]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 hover:text-gold-700 underline underline-offset-2"
                >
                  {innerLinkMatch[1]}
                </a>
              </strong>
            );
          } else {
            parts.push(<strong key={`b-${keyIndex++}`} className="font-semibold">{boldMatch[1]}</strong>);
          }
          remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
          continue;
        }

        // Fallback - push remaining text
        parts.push(remaining);
        break;
      }

      return parts;
    };

    // Check for numbered list (1. 2. 3. etc)
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={lineIndex} className="flex gap-2 ml-1 my-1">
          <span className="text-ocean-500 font-medium">{numberedMatch[1]}.</span>
          <span>{processInline(numberedMatch[2])}</span>
        </div>
      );
      return;
    }

    // Check for bullet points (- or *)
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <div key={lineIndex} className="flex gap-2 ml-1 my-1">
          <span className="text-ocean-400">•</span>
          <span>{processInline(bulletMatch[1])}</span>
        </div>
      );
      return;
    }

    // Regular line
    if (line.trim()) {
      elements.push(
        <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
          {processInline(line)}
        </p>
      );
    } else if (lineIndex > 0 && lineIndex < lines.length - 1) {
      // Empty line (paragraph break)
      elements.push(<div key={lineIndex} className="h-2" />);
    }
  });

  return elements;
};

interface OasisGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedQuestions = [
  "Where can I get affordable dental implants?",
  "Which states have the best trust laws?",
  "How do I plan a medical tourism trip?",
  "What is JCI accreditation?",
  "Compare online trust services"
];

const SourceCard: React.FC<{ source: ChatSource }> = ({ source }) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'facility': return 'Medical Facility';
      case 'trust_law': return 'Trust Law';
      case 'legal_service': return 'Legal Service';
      case 'guide': return 'Guide';
      default: return 'Source';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'facility': return 'bg-ocean-100 text-ocean-700';
      case 'trust_law': return 'bg-gold-100 text-gold-700';
      case 'legal_service': return 'bg-sage-100 text-sage-700';
      case 'guide': return 'bg-ocean-50 text-ocean-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white/60 rounded-lg p-3 border border-sage-200 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(source.type)}`}>
          {getTypeLabel(source.type)}
        </span>
        {source.name && (
          <span className="font-medium text-ocean-800 truncate">{source.name}</span>
        )}
      </div>
      <p className="text-ocean-600/80 line-clamp-2 text-xs leading-relaxed">
        {source.text.substring(0, 150)}...
      </p>
    </div>
  );
};

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-ocean-600">Oasis Guide</span>
          </div>
        )}

        {/* Message */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-r from-ocean-600 to-ocean-700 text-white'
              : 'bg-white/80 border border-sage-200 text-ocean-800'
          }`}
        >
          <div className="text-sm leading-relaxed">
            {isUser ? message.content : renderMarkdown(message.content)}
          </div>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-ocean-500 font-medium">Sources:</p>
            {message.sources.map((source, i) => (
              <SourceCard key={i} source={source} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-xs mt-1 ${isUser ? 'text-right text-ocean-400' : 'text-ocean-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

const OasisGuide: React.FC<OasisGuideProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, isLoading, sendMessage, clearMessages } = useOasaraChat();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleSuggestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ocean-900/40 backdrop-blur-sm z-[9997] lg:hidden"
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gradient-to-br from-sage-50 via-white to-ocean-50/30 shadow-2xl z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-semibold">Oasis Guide</h2>
                  <p className="text-ocean-100 text-xs">Ask about facilities, trusts, or medical tourism</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Clear chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-ocean-700 font-semibold mb-2">Welcome to the Oasis</h3>
                  <p className="text-ocean-600/70 text-sm mb-6 max-w-xs mx-auto">
                    I can help you find medical facilities, understand trust laws, and plan your healthcare journey.
                  </p>

                  {/* Suggested Questions */}
                  <div className="space-y-2">
                    <p className="text-xs text-ocean-500 font-medium">Try asking:</p>
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(q)}
                        className="block w-full text-left px-4 py-2.5 rounded-xl bg-white/80 border border-sage-200 text-sm text-ocean-700 hover:bg-gold-50 hover:border-gold-300 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-ocean-500"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-sage-200 bg-white/80">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about facilities, trusts, or travel..."
                  className="flex-1 px-4 py-3 rounded-xl bg-sage-50 border border-sage-200 text-ocean-800 placeholder-ocean-400 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medium hover:from-gold-600 hover:to-gold-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-gold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-ocean-400 mt-2 text-center">
                Powered by OASARA • 518 facilities • 50 state laws
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OasisGuide;
