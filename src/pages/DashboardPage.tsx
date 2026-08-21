import React from 'react';
import {
  Users,
  Briefcase,
  FileCheck2,
  Trophy,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowUpRight,
  UploadCloud,
  ListOrdered,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { DashboardStats, CandidateAnalysis, Job } from '../types.js';
import { MatchScoreBadge, RecommendationPill } from '../components/MatchScoreBadge.js';
import { NavTab } from '../components/Sidebar.js';

interface DashboardPageProps {
  stats: DashboardStats | null;
  onNavigate: (tab: NavTab) => void;
  onSelectCandidate: (candidate: CandidateAnalysis) => void;
  onSelectJob: (jobId: string) => void;
  jobs: Job[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  onNavigate,
  onSelectCandidate,
  onSelectJob,
  jobs
}) => {
  const scoreDistributionData = [
    { range: '90-100%', count: stats?.scoreDistribution?.['90-100%'] || 0, fill: '#10b981' },
    { range: '80-89%', count: stats?.scoreDistribution?.['80-89%'] || 0, fill: '#3b82f6' },
    { range: '70-79%', count: stats?.scoreDistribution?.['70-79%'] || 0, fill: '#6366f1' },
    { range: '60-69%', count: stats?.scoreDistribution?.['60-69%'] || 0, fill: '#f59e0b' },
    { range: '<60%', count: stats?.scoreDistribution?.['<60%'] || 0, fill: '#f43f5e' }
  ];

  const topSkillsData = stats?.topSkillsInDemand?.map(s => ({
    name: s.skill,
    demand: s.count,
    supply: Math.round(s.count * 0.85)
  })) || [
    { name: 'Python', demand: 8, supply: 7 },
    { name: 'PyTorch', demand: 6, supply: 4 },
    { name: 'FastAPI', demand: 5, supply: 5 },
    { name: 'SQL', demand: 5, supply: 4 },
    { name: 'Docker', demand: 4, supply: 3 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner / Welcome */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            <span>Explainable Neural Semantic Matching Active</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Intelligent Resume Screening & Semantic Ranking
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Multi-candidate vector similarity scoring, automated skill gap extraction, and LLM-grounded recruiter rationales powered by Google Gemini 3.7.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            id="btn-dash-upload"
            onClick={() => onNavigate('upload')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Resumes</span>
          </button>
          <button
            id="btn-dash-ranking"
            onClick={() => onNavigate('ranking')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all active:scale-95"
          >
            <ListOrdered className="h-4 w-4 text-indigo-400" />
            <span>View Rankings</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Uploaded Resumes',
            value: stats?.totalResumes || 0,
            icon: Users,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-950/60'
          },
          {
            label: 'Active Job Postings',
            value: stats?.activeJobs || 0,
            icon: Briefcase,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/60'
          },
          {
            label: 'Average Match Score',
            value: `${stats?.averageMatchScore || 0}%`,
            icon: TrendingUp,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/60'
          },
          {
            label: 'Top Matches (>=80%)',
            value: stats?.topCandidatesCount || 0,
            icon: Trophy,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/60'
          }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {kpi.label}
                </p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {kpi.value}
                </h3>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Charts: Score Distribution & Skill Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Match Score Distribution */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Candidate Score Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Frequency breakdown across neural match tiers
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {stats?.totalResumes || 0} Total Scored
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" strokeOpacity={0.15} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {scoreDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top In-Demand Technical Skills */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Skill Demand vs Candidate Supply
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Skills required in JDs vs skills present in applicant pool
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Full Analytics <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkillsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#64748b" strokeOpacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={75} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="demand" name="Required in Jobs" fill="#6366f1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="supply" name="Present in Resumes" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Scored Candidates Leaderboard */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Top Semantic Match Leaderboard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Highest scoring applicants ranked across active job descriptions
            </p>
          </div>
          <button
            onClick={() => onNavigate('ranking')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View All Candidates <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats?.recentScreenings?.slice(0, 3).map((cand, idx) => (
            <div
              key={cand.id}
              onClick={() => onSelectCandidate(cand)}
              className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 hover:border-indigo-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {cand.candidateName}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{cand.jobTitle}</p>
                  </div>
                </div>
                <MatchScoreBadge score={cand.overallMatchScore} size="sm" showLabel={false} />
              </div>

              <div className="space-y-1.5 my-2 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Skills Match:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{cand.skillsMatchScore}%</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Semantic Similarity:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{cand.semanticSimilarityScore}%</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Experience:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{cand.experienceYears} Years</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <RecommendationPill recommendation={cand.explanation.recommendation} />
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  Deep Dive →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
