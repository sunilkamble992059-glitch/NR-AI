import React, { useState, useMemo } from 'react';
import {
  ListOrdered,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Scale,
  Brain,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Award,
  ArrowUpDown,
  Briefcase,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Job, CandidateAnalysis, CandidateStatus } from '../types.js';
import { MatchScoreBadge, RecommendationPill } from '../components/MatchScoreBadge.js';
import { api } from '../services/api.js';

interface RankingPageProps {
  jobs: Job[];
  selectedJobId: string;
  onSelectJob: (id: string) => void;
  candidates: CandidateAnalysis[];
  onSelectCandidate: (candidate: CandidateAnalysis) => void;
  onCompareCandidates: (candidates: CandidateAnalysis[]) => void;
  onRefreshAnalysis: (jobId: string) => Promise<void>;
  onStatusChange: (id: string, newStatus: CandidateStatus) => void;
}

export const RankingPage: React.FC<RankingPageProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  candidates,
  onSelectCandidate,
  onCompareCandidates,
  onRefreshAnalysis,
  onStatusChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedScoreTier, setSelectedScoreTier] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'overall' | 'skills' | 'experience' | 'semantic'>('overall');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const currentJob = useMemo(() => jobs.find(j => j.id === selectedJobId) || jobs[0], [jobs, selectedJobId]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    let result = candidates.filter(c => {
      // Match Job
      if (selectedJobId && c.jobId !== selectedJobId) return false;

      // Status
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;

      // Score Tier
      if (selectedScoreTier === 'STRONG' && c.overallMatchScore < 85) return false;
      if (selectedScoreTier === 'GOOD' && (c.overallMatchScore < 70 || c.overallMatchScore >= 85)) return false;
      if (selectedScoreTier === 'REVIEW' && (c.overallMatchScore < 50 || c.overallMatchScore >= 70)) return false;
      if (selectedScoreTier === 'LOW' && c.overallMatchScore >= 50) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = c.candidateName.toLowerCase().includes(q);
        const inEmail = c.email?.toLowerCase().includes(q) || false;
        const inSkills = c.matchingSkills.some(s => s.toLowerCase().includes(q));
        const inMissing = c.missingSkills.some(s => s.toLowerCase().includes(q));
        if (!inName && !inEmail && !inSkills && !inMissing) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'overall') return b.overallMatchScore - a.overallMatchScore;
      if (sortBy === 'skills') return b.skillsMatchScore - a.skillsMatchScore;
      if (sortBy === 'experience') return b.experienceMatchScore - a.experienceMatchScore;
      if (sortBy === 'semantic') return b.semanticSimilarityScore - a.semanticSimilarityScore;
      return 0;
    });

    return result;
  }, [candidates, selectedJobId, selectedStatus, selectedScoreTier, searchQuery, sortBy]);

  const handleRunAnalysis = async () => {
    if (!currentJob) return;
    setAnalyzing(true);
    try {
      await onRefreshAnalysis(currentJob.id);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      setSelectedCandidateIds(selectedCandidateIds.filter(i => i !== id));
    } else {
      if (selectedCandidateIds.length >= 3) {
        alert('You can select up to 3 candidates for side-by-side comparison.');
        return;
      }
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  const handleTriggerCompare = () => {
    const toCompare = candidates.filter(c => selectedCandidateIds.includes(c.id));
    if (toCompare.length >= 2) {
      onCompareCandidates(toCompare);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Rank', 'Candidate Name', 'Email', 'Job Title', 'Overall Match %', 'Skills Match %', 'Experience Match %', 'Semantic Match %', 'Experience (Yrs)', 'Recommendation', 'Status', 'Matching Skills', 'Missing Skills'];
    const rows = filteredCandidates.map((c, idx) => [
      idx + 1,
      `"${c.candidateName}"`,
      `"${c.email || ''}"`,
      `"${c.jobTitle}"`,
      c.overallMatchScore,
      c.skillsMatchScore,
      c.experienceMatchScore,
      c.semanticSimilarityScore,
      c.experienceYears,
      `"${c.explanation.recommendation}"`,
      `"${c.status}"`,
      `"${c.matchingSkills.join(', ')}"`,
      `"${c.missingSkills.join(', ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Candidate_Screening_Rankings_${currentJob?.title.replace(/\s+/g, '_') || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Job Scope Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Candidate Semantic Ranking
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {filteredCandidates.length} Ranked
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active Evaluation Profile: <strong className="text-slate-800 dark:text-slate-200">{currentJob?.title || 'All Postings'}</strong> ({currentJob?.experienceYears}+ yrs required)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Compare Button */}
          {selectedCandidateIds.length >= 2 && (
            <button
              id="btn-compare-selected-candidates"
              onClick={handleTriggerCompare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all animate-in zoom-in-95"
            >
              <Scale className="h-4 w-4" />
              <span>Compare Selected ({selectedCandidateIds.length})</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            id="btn-export-rankings-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Run Analysis Button */}
          <button
            id="btn-run-neural-analysis"
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Semantic Matching...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-indigo-200" />
                <span>Run Neural Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="ranking-table-search"
            type="text"
            placeholder="Filter by candidate name, core skill (e.g. PyTorch, Kubernetes), email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Job Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => onSelectJob(e.target.value)}
              aria-label="Filter candidate ranking by Job"
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="">All Jobs</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          {/* Score Tier Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Tier:</span>
            <select
              value={selectedScoreTier}
              onChange={(e) => setSelectedScoreTier(e.target.value)}
              aria-label="Filter candidates by Match Tier"
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Scores</option>
              <option value="STRONG">Strong Match (&gt;=85%)</option>
              <option value="GOOD">Good Match (70-84%)</option>
              <option value="REVIEW">Needs Review (50-69%)</option>
              <option value="LOW">Low Fit (&lt;50%)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter candidates by Stage"
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Stages</option>
              <option value="New">New</option>
              <option value="Screening">Screening</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort candidates by metric"
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-hidden font-medium"
            >
              <option value="overall">Overall Match Score</option>
              <option value="skills">Skills Match Score</option>
              <option value="experience">Experience Alignment</option>
              <option value="semantic">Semantic Similarity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Ranking Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedCandidateIds.length === filteredCandidates.length && filteredCandidates.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCandidateIds(filteredCandidates.slice(0, 3).map(c => c.id));
                      } else {
                        setSelectedCandidateIds([]);
                      }
                    }}
                    className="rounded-sm border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-3.5 px-2 w-12 text-center">Rank</th>
                <th className="py-3.5 px-4">Candidate Profile</th>
                <th className="py-3.5 px-4">Overall Score</th>
                <th className="py-3.5 px-4">Score Breakdown</th>
                <th className="py-3.5 px-4">Skills Matrix</th>
                <th className="py-3.5 px-4">Recommendation</th>
                <th className="py-3.5 px-4">Pipeline Stage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredCandidates.map((c, idx) => {
                const isSelected = selectedCandidateIds.includes(c.id);
                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-colors ${
                      isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/30' : ''
                    }`}
                  >
                    {/* Checkbox for compare */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(c.id)}
                        className="rounded-sm border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Rank */}
                    <td className="py-3.5 px-2 text-center font-black text-slate-900 dark:text-white">
                      #{idx + 1}
                    </td>

                    {/* Candidate Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                          {c.candidateName.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => onSelectCandidate(c)}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors text-xs"
                          >
                            {c.candidateName}
                          </button>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {c.email} · {c.experienceYears} yrs exp
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Match Score */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <MatchScoreBadge score={c.overallMatchScore} size="md" />
                    </td>

                    {/* Score Breakdown Pills */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-16 text-slate-400">Skills:</span>
                          <strong className="text-emerald-600 dark:text-emerald-400">{c.skillsMatchScore}%</strong>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-16 text-slate-400">Semantic:</span>
                          <strong className="text-indigo-600 dark:text-indigo-400">{c.semanticSimilarityScore}%</strong>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-16 text-slate-400">Experience:</span>
                          <strong className="text-blue-600 dark:text-blue-400">{c.experienceMatchScore}%</strong>
                        </div>
                      </div>
                    </td>

                    {/* Skills Matched / Missing */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1">
                          {c.matchingSkills.slice(0, 3).map((sk, skIdx) => (
                            <span key={skIdx} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              ✓ {sk}
                            </span>
                          ))}
                          {c.matchingSkills.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{c.matchingSkills.length - 3}</span>
                          )}
                        </div>

                        {c.missingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {c.missingSkills.slice(0, 2).map((sk, skIdx) => (
                              <span key={skIdx} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                ✗ {sk}
                              </span>
                            ))}
                            {c.missingSkills.length > 2 && (
                              <span className="text-[10px] text-rose-400">+{c.missingSkills.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Recommendation */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RecommendationPill recommendation={c.explanation.recommendation} />
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={c.status}
                        onChange={(e) => onStatusChange(c.candidateId, e.target.value as CandidateStatus)}
                        aria-label={`Change stage for ${c.candidateName}`}
                        className={`h-7 rounded-lg border text-xs font-semibold px-2 py-0.5 focus:outline-hidden ${
                          c.status === 'Shortlisted' || c.status === 'Interview'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : c.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Screening">Screening</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Action Deep Dive */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectCandidate(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-all"
                      >
                        <Brain className="h-3.5 w-3.5" />
                        <span>AI Rationale</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="font-semibold text-sm">No candidate matches found.</p>
                    <p className="text-xs mt-1">Try relaxing filters or click "Run Neural Analysis" to evaluate candidate resumes.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
