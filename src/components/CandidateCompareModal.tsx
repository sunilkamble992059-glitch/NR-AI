import React from 'react';
import { X, CheckCircle2, XCircle, Sparkles, Scale, Trophy, Mail } from 'lucide-react';
import { CandidateAnalysis } from '../types.js';
import { MatchScoreBadge, RecommendationPill } from './MatchScoreBadge.js';

interface CandidateCompareModalProps {
  candidates: CandidateAnalysis[];
  onClose: () => void;
  onOpenDetails: (candidate: CandidateAnalysis) => void;
}

export const CandidateCompareModal: React.FC<CandidateCompareModalProps> = ({
  candidates,
  onClose,
  onOpenDetails
}) => {
  if (!candidates || candidates.length === 0) return null;

  // Find the top scorer
  const sorted = [...candidates].sort((a, b) => b.overallMatchScore - a.overallMatchScore);
  const topCandidate = sorted[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Candidate Comparison Matrix
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {candidates.length} Profiles
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Side-by-side neural semantic and skill gap evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Comparison Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(candidates.length, 3)} gap-6`}>
            {candidates.map((cand) => {
              const isTop = cand.id === topCandidate.id;
              return (
                <div
                  key={cand.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between relative transition-all ${
                    isTop
                      ? 'border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md ring-1 ring-indigo-500/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  {isTop && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Trophy className="h-3 w-3" />
                      Top Match Leader
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="text-center pt-2">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xl mb-2">
                        {cand.candidateName.charAt(0)}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {cand.candidateName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cand.email}</p>
                      <div className="mt-2.5 flex justify-center">
                        <MatchScoreBadge score={cand.overallMatchScore} size="lg" />
                      </div>
                      <div className="mt-2 flex justify-center">
                        <RecommendationPill recommendation={cand.explanation.recommendation} />
                      </div>
                    </div>

                    {/* Score Metrics */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 p-3 space-y-2 border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Skills Match:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">{cand.skillsMatchScore}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Semantic Similarity:</span>
                        <strong className="text-indigo-600 dark:text-indigo-400">{cand.semanticSimilarityScore}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Experience Alignment:</span>
                        <strong className="text-blue-600 dark:text-blue-400">{cand.experienceMatchScore}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Experience:</span>
                        <strong className="text-slate-900 dark:text-white">{cand.experienceYears} Years</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Education Score:</span>
                        <strong className="text-amber-600 dark:text-amber-400">{cand.educationMatchScore}%</strong>
                      </div>
                    </div>

                    {/* Matching Skills */}
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Matched Core Skills ({cand.matchingSkills.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cand.matchingSkills.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />
                        Missing Core Skills ({cand.missingSkills.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cand.missingSkills.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            {s}
                          </span>
                        ))}
                        {cand.missingSkills.length === 0 && (
                          <span className="text-[11px] text-slate-400 italic">None</span>
                        )}
                      </div>
                    </div>

                    {/* Top Strengths Summary */}
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Key Strengths
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {cand.explanation.strengths.slice(0, 2).join(' ')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => onOpenDetails(cand)}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-xs"
                    >
                      View Full Analysis
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
