import React, { useState } from 'react';
import {
  Brain,
  Search,
  RefreshCw,
  Sparkles,
  Bot,
  User as UserIcon,
  LogOut,
  Bell,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { Job } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface NavbarProps {
  jobs: Job[];
  selectedJobId: string;
  onSelectJob: (id: string) => void;
  onOpenAIChat: () => void;
  onReseedData: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateJob: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  onOpenAIChat,
  onReseedData,
  searchQuery,
  onSearchChange,
  onOpenCreateJob
}) => {
  const { user, logout } = useAuth();
  const [reseedLoading, setReseedLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleReseed = async () => {
    setReseedLoading(true);
    try {
      await api.reseedDemo();
      onReseedData();
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setReseedLoading(false);
    }
  };

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
        {/* Seed Demo Button */}
        <button
          id="btn-reseed-demo-data"
          onClick={handleReseed}
          disabled={reseedLoading}
          title="Reset to benchmark demo data"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-indigo-500 ${reseedLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset Demo Data</span>
        </button>

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

        {/* User Dropdown */}
        <div className="relative">
          <button
            id="btn-user-profile-menu"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 h-9 pl-2 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:block max-w-[100px] truncate">
              {user?.name || 'Recruiter'}
            </span>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <span className="mt-1 inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {user?.role || 'Lead Recruiter'}
                </span>
              </div>
              <button
                id="btn-logout"
                onClick={() => {
                  setShowUserDropdown(false);
                  logout();
                }}
                className="mt-1 flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
