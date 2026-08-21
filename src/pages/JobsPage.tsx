import React from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  ListOrdered,
  Sparkles,
  MapPin,
  Clock,
  Building,
  Users,
  ArrowRight
} from 'lucide-react';
import { Job } from '../types.js';

interface JobsPageProps {
  jobs: Job[];
  onOpenCreateJob: () => void;
  onSelectJobForScreening: (jobId: string) => void;
  onDeleteJob: (id: string) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({
  jobs,
  onOpenCreateJob,
  onSelectJobForScreening,
  onDeleteJob
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Job Descriptions & Screening Criteria
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {jobs.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create roles with automated Gemini skill extraction and weightings for neural candidate scoring
          </p>
        </div>

        <button
          id="btn-create-new-job"
          onClick={onOpenCreateJob}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Job Posting</span>
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {job.company} · {job.department}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteJob(job.id)}
                  title="Delete job posting"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Meta Tags */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {job.experienceYears}+ Years Exp. Required
                </span>
                <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-medium">
                  {job.type}
                </span>
              </div>

              {/* Description preview */}
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              {/* Required Skills */}
              <div className="mt-3 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Required Core Skills ({job.requiredSkills.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Bonus / Preferred Skills ({job.preferredSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.preferredSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500">
                <Users className="inline h-3.5 w-3.5 mr-1" />
                {job.candidateCount || 0} Candidates Evaluated
              </div>

              <button
                onClick={() => onSelectJobForScreening(job.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all"
              >
                <ListOrdered className="h-3.5 w-3.5" />
                <span>Screen Candidates</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
