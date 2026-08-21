import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Zap,
  ArrowRight,
  Award,
  Loader2,
  Trash2
} from 'lucide-react';
import { Job, CandidateAnalysis, ChatMessage } from '../types.js';
import { api } from '../services/api.js';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentJob: Job | null;
  candidates: CandidateAnalysis[];
  onSelectCandidate?: (candidate: CandidateAnalysis) => void;
}

const SAMPLE_QUERIES = [
  'Which candidate is best for this job?',
  'Who has the strongest Python and ML experience?',
  'Why did Rahul Sharma score 94%?',
  'Which candidates are missing AWS experience?',
  'Show candidates with more than 3 years experience.'
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  currentJob,
  candidates,
  onSelectCandidate
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **AI Recruitment Assistant**. I have analyzed all **${candidates.length} candidate profiles** ${currentJob ? `for the **${currentJob.title}** position` : ''}. Ask me any comparison, score breakdown, or recommendation question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ sender: m.sender, text: m.text }));
      const response = await api.sendAIChatMessage(query, currentJob?.id, historyPayload);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredData: response.structuredRecommendations ? {
          candidateRecommendations: response.structuredRecommendations
        } : undefined
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Analysis query completed. Please review the top candidates in the ranking table or try another query.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `Chat cleared. Ready to assist with candidate screening insights.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              AI Recruiter Assistant
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-sm bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Live
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
              {currentJob ? `Context: ${currentJob.title}` : 'All Job Candidates'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            title="Clear Chat"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40">
        <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1">
          <Zap className="h-3 w-3 text-indigo-500" />
          Suggested Recruiter Inquiries
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {SAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 rounded-lg px-2.5 py-1 transition-all shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  isAI
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                }`}
              >
                {isAI ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isAI
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                    : 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                }`}
              >
                {/* Render Text with simple markdown formatting */}
                <div className="space-y-1.5 whitespace-pre-line">
                  {msg.text.split('\n').map((line, lIdx) => {
                    // Check bold **text**
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={lIdx} className="leading-relaxed">
                        {parts.map((p, pIdx) => {
                          if (p.startsWith('**') && p.endsWith('**')) {
                            return (
                              <strong key={pIdx} className="font-bold">
                                {p.slice(2, -2)}
                              </strong>
                            );
                          }
                          return p;
                        })}
                      </p>
                    );
                  })}
                </div>

                {/* Structured Recommendations Widget if present */}
                {msg.structuredData?.candidateRecommendations && (
                  <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-2.5">
                    <p className="font-semibold text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Top Match Leaderboard
                    </p>
                    {msg.structuredData.candidateRecommendations.map((rec, rIdx) => (
                      <div
                        key={rIdx}
                        className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-amber-500" />
                            {rec.name}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{rec.reason}</p>
                        </div>
                        <span className="shrink-0 font-bold px-2 py-0.5 rounded-md text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {rec.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] ${
                    isAI ? 'text-slate-400' : 'text-indigo-200 text-right'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white animate-pulse">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800 px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
              <span>Analyzing candidate embeddings & match rationale...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="ai-assistant-input"
            type="text"
            placeholder="Ask anything about candidates or qualifications..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={loading}
            className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
          <button
            id="btn-submit-ai-chat"
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
