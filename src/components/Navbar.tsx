import React, { useState } from 'react';
import {
  Brain,
  Search,
  Sparkles,
  Bot,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { Job } from '../types.js';

interface NavbarProps {
  jobs: Job[];
  selectedJobId: string;
  onSelectJob: (id: string) => void;
  onOpenAIChat: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateJob: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  onOpenAIChat,
  searchQuery,
  onSearchChange,
  onOpenCreateJob
}) => {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Brand logo & Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              NeuralResume AI
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Gemini 3.7
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
            Explainable Semantic Resume Screening & Ranking
          </p>
        </div>
      </div>

      {/* Middle: Active Job Selector & Global Search */}
      <div className="hidden lg:flex items-center gap-3 max-w-xl w-full mx-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="global-candidate-search"
            type="text"
            placeholder="Search candidate name, skill (e.g., PyTorch, SQL), email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 min-w-[220px]">
          <Briefcase className="h-4 w-4 text-slate-400" />
          <select
            id="navbar-job-selector"
            value={selectedJobId}
            onChange={(e) => {
              if (e.target.value === '__create__') {
                onOpenCreateJob();
              } else {
                onSelectJob(e.target.value);
              }
            }}
            aria-label="Filter candidates by Job Posting"
            className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="">All Jobs ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.candidateCount || 0} candidates)
              </option>
            ))}
            <option value="__create__">+ Create New Job...</option>
          </select>
        </div>
      </div>

      {/* Right: Actions, AI Assistant, Seed Demo, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Recruiter Assistant Trigger */}
        <button
          id="btn-open-ai-chat"
          onClick={onOpenAIChat}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-all active:scale-95"
        >
          <Bot className="h-4 w-4" />
          <span>Ask AI Recruiter</span>
        </button>

        {/* Notification Toast */}
        {showNotification && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Demo dataset loaded with realistic candidates & benchmarks!
          </div>
        )}
      </div>
    </header>
  );
};
