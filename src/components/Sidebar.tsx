import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  ListOrdered,
  KanbanSquare,
  BarChart3,
  Bot,
  Settings,
  Sparkles
} from 'lucide-react';

export type NavTab = 'dashboard' | 'jobs' | 'upload' | 'ranking' | 'pipeline' | 'analytics' | 'assistant' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  candidateCount: number;
  jobCount: number;
  resumeCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  candidateCount,
  jobCount,
  resumeCount
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'ranking' as NavTab,
      label: 'Candidate Ranking',
      icon: ListOrdered,
      badge: candidateCount > 0 ? `${candidateCount}` : null
    },
    {
      id: 'pipeline' as NavTab,
      label: 'Screening Pipeline',
      icon: KanbanSquare,
      badge: null
    },
    {
      id: 'jobs' as NavTab,
      label: 'Job Descriptions',
      icon: Briefcase,
      badge: jobCount > 0 ? `${jobCount}` : null
    },
    {
      id: 'upload' as NavTab,
      label: 'Upload Resumes',
      icon: UploadCloud,
      badge: resumeCount > 0 ? `${resumeCount}` : null
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'assistant' as NavTab,
      label: 'AI Recruiter Assistant',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings & Model',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 text-slate-400 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Recruitment Platform
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Engine Status Card */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">Neural Semantic Core</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Powered by Google Gemini 3.7 Flash & TF-IDF Cosine Embedding similarity.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-emerald-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>System Live & Vector Ready</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 px-2 flex justify-between items-center">
        <span>PS5 Hackathon Edition</span>
        <span className="font-mono text-[10px]">v1.0.0</span>
      </div>
    </aside>
  );
};
