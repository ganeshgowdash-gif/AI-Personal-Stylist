'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  RefreshCw, 
  Shirt, 
  HelpCircle,
  User,
  Bot
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { InlineItemCard } from '@/components/chat/InlineItemCard';
import { ItemDetailModal } from '@/components/modals/ItemDetailModal';
import { WardrobeItem } from '@/types/database';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  referencedItems?: WardrobeItem[];
  timestamp: string;
}

const PRESET_QUERIES = [
  'What should I wear to college tomorrow?',
  'Does my blue shirt match my beige chinos?',
  'Suggest a formal office outfit.',
  'What should I buy next to improve my wardrobe?',
  'Give me styling combinations using my white sneakers.',
  'Suggest a sharp outfit for a weekend date.',
];

export default function ChatPage() {
  const { wardrobe } = useWardrobe();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I am your **AI Personal Stylist Concierge**. I have direct access to your verified **${wardrobe.length} wardrobe pieces**.\n\nAsk me anything about color matching, event dress codes, what to wear tomorrow, or which shoes complement a specific shirt. I will link your exact clothing items right into my advice!`,
      referencedItems: wardrobe.slice(0, 3),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const historyToSend = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyToSend,
          wardrobe,
        }),
      });

      if (!res.ok) {
        throw new Error('Stylist chat error');
      }

      const data = await res.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        referencedItems: data.referencedItems,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but I had trouble analyzing your question. Please ensure your query mentions specific clothing pieces or an occasion.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] rounded-3xl glass-card border border-white/[0.08] overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] bg-luxury-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white to-luxury-400 text-black flex items-center justify-center font-bold shadow-md">
            <Bot className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-wide">
                AI Fashion Concierge
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-luxury-400">
              Directly querying {wardrobe.length} items from your database vault
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome-msg',
                role: 'assistant',
                content: `Chat session refreshed. How can I help coordinate your ${wardrobe.length} pieces today?`,
                referencedItems: wardrobe.slice(0, 2),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="text-xs text-luxury-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          Clear Chat
        </button>
      </div>

      {/* Preset Prompt Pills */}
      <div className="px-6 py-2.5 bg-luxury-950/40 border-b border-white/[0.04] flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-luxury-500 uppercase shrink-0">
          Suggestions:
        </span>
        {PRESET_QUERIES.map((preset) => (
          <button
            key={preset}
            onClick={() => handleSendMessage(preset)}
            className="px-3 py-1 rounded-full text-[11px] whitespace-nowrap bg-white/[0.03] hover:bg-white/[0.08] text-luxury-300 hover:text-white border border-white/[0.06] transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white border border-white/10'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 space-y-3 ${
                  isUser
                    ? 'bg-white text-black rounded-tr-none'
                    : 'bg-luxury-900/80 border border-white/[0.08] text-white rounded-tl-none shadow-lg'
                }`}
              >
                <div className={`text-xs leading-relaxed whitespace-pre-line ${isUser ? 'text-black' : 'text-luxury-200'}`}>
                  {msg.content}
                </div>

                {/* Inline Referenced Wardrobe Item Cards */}
                {msg.referencedItems && msg.referencedItems.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.08] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-luxury-400 block">
                      Referenced Wardrobe Pieces:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.referencedItems.map((item) => (
                        <InlineItemCard
                          key={item.id}
                          item={item}
                          onClick={(it) => setSelectedItem(it)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[9px] font-mono text-right ${
                    isUser ? 'text-black/50' : 'text-luxury-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 text-white border border-white/10 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-luxury-900/80 border border-white/[0.08] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-luxury-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-luxury-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-luxury-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-white/[0.06] bg-luxury-900/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask your stylist (e.g. Does my blue shirt match my beige chinos?)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-luxury-500 focus:outline-none focus:border-white/30"
            disabled={isTyping}
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 rounded-xl bg-white text-black hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 shadow-md shadow-white/5"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Modal for item inspection */}
      <ItemDetailModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}
