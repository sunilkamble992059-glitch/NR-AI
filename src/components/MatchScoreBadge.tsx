import React from 'react';
import { Award, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({ score, size = 'md', showLabel = true }) => {
  const getTheme = (val: number) => {
    if (val >= 85) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
        ring: 'text-emerald-500',
        badge: 'bg-emerald-500 text-white',
        label: 'Strong Match'
      };
    }
    if (val >= 70) {
      return {
        bg: 'bg-blue-500/10 text-blue-600 border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
        ring: 'text-blue-500',
        badge: 'bg-blue-500 text-white',
        label: 'Good Match'
      };
    }
    if (val >= 50) {
      return {
        bg: 'bg-amber-500/10 text-amber-600 border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
        ring: 'text-amber-500',
        badge: 'bg-amber-500 text-white',
        label: 'Needs Review'
      };
    }
    return {
      bg: 'bg-rose-500/10 text-rose-600 border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
      ring: 'text-rose-500',
      badge: 'bg-rose-500 text-white',
      label: 'Low Match'
    };
  };

  const theme = getTheme(score);

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${theme.bg}`}>
        <span>{score}%</span>
        {showLabel && <span className="opacity-80">· {theme.label}</span>}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${theme.bg}`}>
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xl font-bold tracking-tight">{score}%</span>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider opacity-75">Neural Match</div>
          <div className="text-base font-semibold flex items-center gap-1.5">
            {score >= 85 && <Sparkles className="w-4 h-4 text-emerald-500" />}
            {theme.label}
          </div>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold border ${theme.bg}`}>
      <span className="font-bold">{score}%</span>
      {showLabel && <span className="text-xs font-medium opacity-90">({theme.label})</span>}
    </span>
  );
};

export const RecommendationPill: React.FC<{
  recommendation: 'STRONG_MATCH' | 'GOOD_MATCH' | 'NEEDS_REVIEW' | 'NOT_RECOMMENDED';
}> = ({ recommendation }) => {
  switch (recommendation) {
    case 'STRONG_MATCH':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Strong Candidate
        </span>
      );
    case 'GOOD_MATCH':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
          <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Good Match
        </span>
      );
    case 'NEEDS_REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Needs Review
        </span>
      );
    case 'NOT_RECOMMENDED':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          Low Fit
        </span>
      );
  }
};
