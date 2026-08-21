import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Sparkles,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  Brain,
  HelpCircle,
  FileText,
  Save,
  Check,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { CandidateAnalysis, CandidateStatus } from '../types.js';
import { MatchScoreBadge, RecommendationPill } from './MatchScoreBadge.js';
import { api } from '../services/api.js';

interface CandidateDetailsModalProps {
  candidate: CandidateAnalysis | null;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: CandidateStatus, notes?: string) => void;
}

export const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
  candidate,
  onClose,
  onStatusChange
}) => {
  if (!candidate) return null;

  const [activeTab, setActiveTab] = useState<'ai_analysis' | 'experience' | 'projects' | 'education' | 'raw_text'>('ai_analysis');
  const [currentStatus, setCurrentStatus] = useState<CandidateStatus>(candidate.status);
  const [notes, setNotes] = useState<string>(candidate.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const radarData = [
    { subject: 'Skills Match', value: candidate.skillsMatchScore, fullMark: 100 },
    { subject: 'Experience', value: candidate.experienceMatchScore, fullMark: 100 },
    { subject: 'Semantic Sim.', value: candidate.semanticSimilarityScore, fullMark: 100 },
    { subject: 'Education', value: candidate.educationMatchScore, fullMark: 100 },
    { subject: 'Overall Match', value: candidate.overallMatchScore, fullMark: 100 }
  ];

  const barData = [
    { name: 'Overall', score: candidate.overallMatchScore, fill: '#6366f1' },
    { name: 'Skills', score: candidate.skillsMatchScore, fill: '#10b981' },
    { name: 'Experience', score: candidate.experienceMatchScore, fill: '#3b82f6' },
    { name: 'Semantic', score: candidate.semanticSimilarityScore, fill: '#8b5cf6' },
    { name: 'Education', score: candidate.educationMatchScore, fill: '#f59e0b' }
  ];

  const handleStatusUpdate = async (newStatus: CandidateStatus) => {
    setCurrentStatus(newStatus);
    try {
      await api.updateCandidateStatus(candidate.candidateId, newStatus, candidate.jobId, notes);
      onStatusChange(candidate.candidateId, newStatus, notes);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.updateCandidateNotes(candidate.candidateId, notes);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  const statusOptions: CandidateStatus[] = ['New', 'Screening', 'Shortlisted', 'Interview', 'Rejected'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xl shadow-md">
              {candidate.candidateName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {candidate.candidateName}
                </h2>
                <RecommendationPill recommendation={candidate.explanation.recommendation} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target Role: <strong className="text-slate-700 dark:text-slate-300">{candidate.jobTitle}</strong> · File: {candidate.resumeFileName}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                {candidate.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {candidate.email}
                  </span>
                )}
                {candidate.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {candidate.phone}
                  </span>
                )}
                {candidate.resumeData?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {candidate.resumeData.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {candidate.experienceYears} Years Experience (Req: {candidate.requiredExperienceYears}+ yrs)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MatchScoreBadge score={candidate.overallMatchScore} size="lg" />
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Pipeline Stage Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Candidate Stage:</span>
          </div>
          <div className="flex items-center gap-1">
            {statusOptions.map((status) => {
              const isSelected = currentStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? status === 'Shortlisted' || status === 'Interview'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : status === 'Rejected'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 gap-1 overflow-x-auto">
          {[
            { id: 'ai_analysis', label: 'Explainable AI Analysis', icon: Brain },
            { id: 'experience', label: 'Work Experience', icon: Briefcase },
            { id: 'projects', label: 'Technical Projects', icon: FolderGit2 },
            { id: 'education', label: 'Education & Certs', icon: GraduationCap },
            { id: 'raw_text', label: 'Extracted Text', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'ai_analysis' && (
            <div className="space-y-6">
              {/* Score Breakdown Visuals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Radar Chart */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    Multi-Dimensional Match Radar
                  </h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#64748b" strokeOpacity={0.25} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                        <Radar name="Candidate" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Score Breakdown Progress Bars */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                      Score Weight Distribution
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Skills Match (35% Weight)', val: candidate.skillsMatchScore, color: 'bg-emerald-500' },
                        { label: 'Neural Semantic Similarity (25%)', val: candidate.semanticSimilarityScore, color: 'bg-indigo-500' },
                        { label: 'Experience Alignment (25%)', val: candidate.experienceMatchScore, color: 'bg-blue-500' },
                        { label: 'Education Pedigree (15%)', val: candidate.educationMatchScore, color: 'bg-amber-500' }
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{item.val}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.color} transition-all duration-500`}
                              style={{ width: `${item.val}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 italic">
                    {candidate.explanation.scoreBreakdownJustification}
                  </div>
                </div>
              </div>

              {/* Explainable AI: Strengths vs Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Why This Candidate Matches */}
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-2 mb-3 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Why This Candidate Matches (Strengths)
                  </div>
                  <ul className="space-y-2">
                    {candidate.explanation.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Requirements & Gaps */}
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-4">
                  <div className="flex items-center gap-2 mb-3 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                    <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    Missing Requirements & Skill Gaps
                  </div>
                  <ul className="space-y-2">
                    {candidate.explanation.missingSkills.map((m, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                        <span className="text-rose-500 font-bold">✗</span>
                        <span>{m}</span>
                      </li>
                    ))}
                    {candidate.explanation.missingSkills.length === 0 && (
                      <li className="text-xs text-slate-500 italic">No critical missing skill gaps detected.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Skills Analysis Grid */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Skills Matrix Comparison
                </h4>
                
                <div>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Matched Required Skills ({candidate.matchingSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.matchingSkills.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        ✓ {sk}
                      </span>
                    ))}
                    {candidate.matchingSkills.length === 0 && (
                      <span className="text-xs text-slate-400">None matched</span>
                    )}
                  </div>
                </div>

                {candidate.missingSkills.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      Missing Required Skills ({candidate.missingSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.missingSkills.map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          ✗ {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {candidate.matchedPreferredSkills.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1.5 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Bonus Preferred Skills Identified ({candidate.matchedPreferredSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.matchedPreferredSkills.map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          ★ {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tailored Interview Questions from Gemini */}
              {candidate.explanation.suggestedQuestions && candidate.explanation.suggestedQuestions.length > 0 && (
                <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4">
                  <div className="flex items-center gap-2 mb-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    AI-Recommended Technical Interview Questions (Focus on Candidate Gaps)
                  </div>
                  <div className="space-y-2.5">
                    {candidate.explanation.suggestedQuestions.map((q, idx) => (
                      <div key={idx} className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-800 dark:text-slate-200">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">Q{idx + 1}:</span>
                        {q}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recruiter Private Notes */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Recruiter Screening Notes
                  </h4>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
                  >
                    {savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    {savedSuccess ? 'Saved!' : 'Save Notes'}
                  </button>
                </div>
                <textarea
                  id="candidate-recruiter-notes"
                  rows={3}
                  placeholder="Add interview feedback, salary expectation, or next steps..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Work Experience History ({candidate.resumeData?.workExperience?.length || 0} Positions)
              </h4>
              {candidate.resumeData?.workExperience?.map((exp, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-2">
                  <div className="flex justify-between items-start flex-wrap gap-1">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">{exp.role}</h5>
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{exp.company}</p>
                    </div>
                    {exp.duration && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exp.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{exp.description}</p>
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {exp.technologies.map((t, tIdx) => (
                        <span key={tIdx} className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {(!candidate.resumeData?.workExperience || candidate.resumeData.workExperience.length === 0) && (
                <p className="text-xs text-slate-500 italic">No structured work experience blocks found.</p>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Technical Projects ({candidate.resumeData?.projects?.length || 0})
              </h4>
              {candidate.resumeData?.projects?.map((proj, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-2">
                  <div className="flex justify-between items-start flex-wrap gap-1">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{proj.name}</h5>
                    {proj.link && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono underline">
                        {proj.link}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map((t, tIdx) => (
                        <span key={tIdx} className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Academic Degrees
                </h4>
                <div className="space-y-3">
                  {candidate.resumeData?.education?.map((edu, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">{edu.degree}</h5>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{edu.institution} {edu.field ? `· ${edu.field}` : ''}</p>
                        </div>
                        {edu.year && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {edu.year}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {candidate.resumeData?.certifications && candidate.resumeData.certifications.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                    Certifications & Credentials
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.resumeData.certifications.map((cert, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'raw_text' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Raw Extracted Resume Text
              </h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {candidate.resumeData?.rawText || 'No raw text stored.'}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Analyzed with Google Gemini 3.7 Flash & Neural Semantic Matching
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
