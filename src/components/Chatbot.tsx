import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Loader2, MapPin, Calendar, DollarSign, Menu, Crown } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatbotProps {
  itineraries: Array<{
    id: string;
    title: string;
    destination: string;
    duration: number;
    budget: number;
    transportation: string[];
    interests: string[];
  }>;
}

const QUICK_REPLIES = [
  "What's the best time to visit?",
  "Recommend some local food",
  "What are the must-see attractions?",
  "How's the weather?",
  "Transportation tips",
  "Budget recommendations"
];

const MAX_RESPONSE_LENGTH = 500;

function formatMarkdown(text: string) {
  // Simple markdown to HTML: bold, italic, lists, line breaks
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/\n\s*\*/g, '<ul><li>')
    .replace(/\n\s*\- /g, '<ul><li>')
    .replace(/\n/g, '<br/>')
    .replace(/<ul><li>/g, '<ul><li>')
    .replace(/\.<br\/>/g, '.<br/><br/>');
  // Close lists
  formatted = formatted.replace(/(<li>.*?)(?=<br\/>|$)/g, '$1</li>');
  formatted = formatted.replace(/(<ul>(?:<li>.*?<\/li>)+)/g, '$1</ul>');
  return formatted;
}

export const Chatbot = ({ itineraries }: ChatbotProps) => {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const isPremium = user?.user_metadata?.subscription_tier === 'Premium';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMsgIds, setExpandedMsgIds] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        content: "Hi! I'm LakBot, your Philippine travel assistant. How can I help you plan your adventure today?",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.getResponse(
        userMessage.content,
        selectedTripId === 'general' ? null : selectedTripId,
        { itineraries }
      );
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        content: "I apologize, but I'm having trouble processing your request. Please try again.",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const getSelectedTrip = () => itineraries.find(trip => trip.id === selectedTripId);

  const handleToggleExpand = (id: string) => {
    setExpandedMsgIds(prev => prev.includes(id)
      ? prev.filter(mid => mid !== id)
      : [...prev, id]
    );
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#0032A0] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-2 right-1 z-50 w-[98vw] h-[90vh] sm:bottom-24 sm:right-6 sm:w-full sm:max-w-3xl sm:h-[750px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col border border-transparent"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5 bg-gradient-to-r from-[#0032A0] to-blue-600 rounded-t-3xl shadow-md">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-white drop-shadow" />
                <h3 className="font-bold text-lg text-white drop-shadow">LakBot</h3>
                {isPremium && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-sm rounded border border-white/20">
                    <Crown className="h-3 w-3 text-[#FED141]" />
                    <span className="text-xs font-medium text-white">Premium</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>

            {/* Trip Selector or Prompt */}
            {!isLoggedIn ? (
              <div className="px-4 py-3 sm:px-8 border-b border-[#0032A0]/10">
                <Button
                  onClick={() => navigate('/#pricing')}
                  className="w-full bg-[#FED141] hover:bg-[#FED141]/90 text-[#0032A0] font-medium flex items-center justify-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Sign up to save trips and get personalized advice
                </Button>
              </div>
            ) : isPremium ? (
              <div className="px-4 py-3 sm:px-8 border-b border-[#0032A0]/10">
                <Select
                  value={selectedTripId}
                  onValueChange={(value) => setSelectedTripId(value)}
                >
                  <SelectTrigger className="w-full border-[#0032A0]/20 focus:ring-2 focus:ring-[#0032A0] bg-white/60 rounded-xl text-sm sm:text-base">
                    <SelectValue placeholder="Select a trip (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Questions</SelectItem>
                    {itineraries.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="px-4 py-3 sm:px-8 border-b border-[#0032A0]/10">
                <Button
                  onClick={() => navigate('/#pricing')}
                  className="w-full bg-[#FED141] hover:bg-[#FED141]/90 text-[#0032A0] font-medium flex items-center justify-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Premium for trip selection and personalized advice
                </Button>
              </div>
            )}

            {/* Selected Trip Info - Only for Premium Users */}
            {isLoggedIn && isPremium && selectedTripId !== 'general' && getSelectedTrip() && (
              <div className="px-4 py-2 sm:px-8 border-b border-[#0032A0]/10 bg-[#0032A0]/5">
                <div className="flex items-center gap-2 text-sm text-[#0032A0]">
                  <MapPin className="w-4 h-4" />
                  <span>{getSelectedTrip()?.destination}</span>
                  <Calendar className="w-4 h-4 ml-2" />
                  <span>{getSelectedTrip()?.duration} days</span>
                  <DollarSign className="w-4 h-4 ml-2" />
                  <span>
                    ₱
                    {typeof getSelectedTrip()?.budget === 'number'
                      ? getSelectedTrip()!.budget.toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 px-2 py-2 sm:px-6 sm:py-4 space-y-4 bg-transparent">
              <div className="flex flex-col gap-2 text-sm sm:text-base">
                {messages.map((message) => {
                  const isLong = message.content.length > MAX_RESPONSE_LENGTH;
                  const expanded = expandedMsgIds.includes(message.id);
                  const displayContent = isLong && !expanded
                    ? message.content.slice(0, MAX_RESPONSE_LENGTH) + '...'
                    : message.content;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col max-w-[90%] sm:max-w-[80%]",
                        message.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 sm:px-5 sm:py-3 shadow-md",
                          message.sender === 'user'
                            ? "bg-[#0032A0] text-white"
                            : "bg-white/90 text-[#0032A0] border border-[#0032A0]/10"
                        )}
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(displayContent) }}
                        />
                        {isLong && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-xs text-[#BF0D3E] mt-2 px-0"
                            onClick={() => handleToggleExpand(message.id)}
                          >
                            {expanded ? 'Show less' : 'Show more'}
                          </Button>
                        )}
                      </div>
                      <span className="text-xs text-[#0032A0]/60 mt-1">
                        {formatTime(message.timestamp)}
                      </span>
                    </motion.div>
                  );
                })}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[#0032A0]/60"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>LakBot is typing...</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Replies & Input */}
            <div className="px-2 py-3 sm:px-8 sm:py-5 bg-white/80 rounded-b-3xl shadow-md">
              {showSuggestions && (
                <div className="flex flex-wrap gap-2 mb-3 max-w-full">
                  {QUICK_REPLIES.map((reply) => (
                    <Button
                      key={reply}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply)}
                      className="rounded-full border-[#0032A0] text-[#0032A0] hover:bg-[#0032A0]/10 text-xs px-2 py-1 max-w-xs truncate shadow"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <Button
                  type="button"
                  onClick={() => setShowSuggestions((prev) => !prev)}
                  className={cn(
                    'rounded-full bg-[#0032A0] hover:bg-[#0032A0]/90 text-white p-3 flex items-center justify-center shadow',
                    showSuggestions ? 'ring-2 ring-[#FED141]' : ''
                  )}
                  aria-label={showSuggestions ? 'Hide Smart Suggestions' : 'Show Smart Suggestions'}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your trip..."
                  className="flex-1 rounded-full border-none focus:ring-2 focus:ring-[#0032A0] px-3 py-2 sm:px-4 sm:py-3 bg-white/90 shadow text-sm sm:text-base"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-full bg-[#BF0D3E] hover:bg-[#BF0D3E]/90 text-white px-4 py-2 sm:px-5 sm:py-3 shadow"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 