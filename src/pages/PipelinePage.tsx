import React from 'react';
import {
  KanbanSquare,
  Plus,
  MoreHorizontal,
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users
} from 'lucide-react';
import { CandidateAnalysis, CandidateStatus, Job } from '../types.js';
import { MatchScoreBadge, RecommendationPill } from '../components/MatchScoreBadge.js';

interface PipelinePageProps {
  jobs: Job[];
  selectedJobId: string;
  onSelectJob: (id: string) => void;
  candidates: CandidateAnalysis[];
  onSelectCandidate: (candidate: CandidateAnalysis) => void;
  onStatusChange: (id: string, newStatus: CandidateStatus) => void;
}

const COLUMNS: { id: CandidateStatus; label: string; color: string; badgeBg: string }[] = [
  { id: 'New', label: 'New Applicants', color: 'border-slate-300 dark:border-slate-700', badgeBg: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  { id: 'Screening', label: 'Screening / Review', color: 'border-indigo-400 dark:border-indigo-700', badgeBg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' },
  { id: 'Shortlisted', label: 'Shortlisted for Next Stage', color: 'border-emerald-400 dark:border-emerald-700', badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
  { id: 'Interview', label: 'Technical Interview', color: 'border-blue-400 dark:border-blue-700', badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' },
  { id: 'Rejected', label: 'Not Proceeding', color: 'border-rose-400 dark:border-rose-700', badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' }
];

export const PipelinePage: React.FC<PipelinePageProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  candidates,
  onSelectCandidate,
  onStatusChange
}) => {
  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const filteredCandidates = selectedJobId
    ? candidates.filter(c => c.jobId === selectedJobId)
    : candidates;

  const getNextStatus = (current: CandidateStatus): CandidateStatus | null => {
    if (current === 'New') return 'Screening';
    if (current === 'Screening') return 'Shortlisted';
    if (current === 'Shortlisted') return 'Interview';
    return null;
  };

  const getPrevStatus = (current: CandidateStatus): CandidateStatus | null => {
    if (current === 'Interview') return 'Shortlisted';
    if (current === 'Shortlisted') return 'Screening';
    if (current === 'Screening') return 'New';
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Controls */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Recruitment Screening Pipeline
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Kanban Board
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drag or transition candidate applications through screening milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Position:</span>
          <select
            value={selectedJobId}
            onChange={(e) => onSelectJob(e.target.value)}
            aria-label="Filter pipeline by Position"
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="">All Positions ({candidates.length} candidates)</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Horizontal Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colCandidates = filteredCandidates.filter(c => c.status === col.id);
          return (
            <div
              key={col.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {col.label}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                  {colCandidates.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colCandidates.map((cand) => {
                  const next = getNextStatus(cand.status);
                  const prev = getPrevStatus(cand.status);
                  return (
                    <div
                      key={cand.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all space-y-2.5"
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4
                            onClick={() => onSelectCandidate(cand)}
                            className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                          >
                            {cand.candidateName}
                          </h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{cand.jobTitle}</p>
                        </div>
                        <MatchScoreBadge score={cand.overallMatchScore} size="sm" showLabel={false} />
                      </div>

                      {/* Skills Preview */}
                      <div className="flex flex-wrap gap-1">
                        {cand.matchingSkills.slice(0, 2).map((sk, idx) => (
                          <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            ✓ {sk}
                          </span>
                        ))}
                        {cand.missingSkills.slice(0, 1).map((sk, idx) => (
                          <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            ✗ {sk}
                          </span>
                        ))}
                      </div>

                      {/* Recruiter Notes / Rationale snippet */}
                      {cand.notes ? (
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-1.5 rounded-md line-clamp-2">
                          "{cand.notes}"
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 line-clamp-2">
                          {cand.explanation.strengths[0]}
                        </p>
                      )}

                      {/* Action Stage Buttons */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                        <button
                          onClick={() => onSelectCandidate(cand)}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                        >
                          <Brain className="h-3 w-3" />
                          Details
                        </button>

                        <div className="flex items-center gap-1">
                          {prev && (
                            <button
                              onClick={() => onStatusChange(cand.candidateId, prev)}
                              title={`Move back to ${prev}`}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          {next && (
                            <button
                              onClick={() => onStatusChange(cand.candidateId, next)}
                              title={`Advance to ${next}`}
                              className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
                            >
                              <span>Next</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                          {cand.status !== 'Rejected' && (
                            <button
                              onClick={() => onStatusChange(cand.candidateId, 'Rejected')}
                              title="Reject candidate"
                              className="p-1 text-rose-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colCandidates.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
