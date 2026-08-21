import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Loader2, Briefcase } from 'lucide-react';
import { Job } from '../types.js';
import { api } from '../services/api.js';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: Job) => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA (Hybrid)');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote'>('Full-time');
  const [experienceYears, setExperienceYears] = useState<number>(2);
  const [description, setDescription] = useState('');
  const [educationRequirement, setEducationRequirement] = useState('Bachelor in Computer Science or related STEM field');
  
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Python', 'SQL']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['Docker', 'AWS']);
  const [newReqSkill, setNewReqSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');

  const [enhancing, setEnhancing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddReqSkill = () => {
    if (newReqSkill.trim() && !requiredSkills.includes(newReqSkill.trim())) {
      setRequiredSkills([...requiredSkills, newReqSkill.trim()]);
      setNewReqSkill('');
    }
  };

  const handleRemoveReqSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleAddPrefSkill = () => {
    if (newPrefSkill.trim() && !preferredSkills.includes(newPrefSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
      setNewPrefSkill('');
    }
  };

  const handleRemovePrefSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter(s => s !== skill));
  };

  const handleAIEnhance = async () => {
    if (!description.trim() && !title.trim()) {
      setError('Please provide at least a Job Title or brief description to enhance.');
      return;
    }
    setEnhancing(true);
    setError('');
    try {
      const enhanced = await api.enhanceJobDescription(title, description);
      if (enhanced.requiredSkills && enhanced.requiredSkills.length > 0) {
        setRequiredSkills(enhanced.requiredSkills);
      }
      if (enhanced.preferredSkills && enhanced.preferredSkills.length > 0) {
        setPreferredSkills(enhanced.preferredSkills);
      }
      if (enhanced.suggestedExperience) {
        setExperienceYears(enhanced.suggestedExperience);
      }
    } catch (err: any) {
      console.error('Enhance error:', err);
      setError('AI JD enhancement encountered an issue. You can still enter skills manually.');
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Job title and description are required.');
      return;
    }
    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.createJob({
        title,
        company: company || 'NeuralTech Global',
        department,
        location,
        type,
        experienceYears,
        description,
        requiredSkills,
        preferredSkills,
        educationRequirement
      });
      onJobCreated(res.job);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Job Description
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define criteria, skill weightings, and experience for neural resume screening
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Job Title *
              </label>
              <input
                id="create-job-title"
                type="text"
                required
                placeholder="e.g. Senior Machine Learning Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                id="create-job-company"
                type="text"
                required
                placeholder="e.g. NeuralSphere AI"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                id="create-job-dept"
                type="text"
                placeholder="Engineering / Data Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Workplace Type
              </label>
              <select
                id="create-job-type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Min. Experience (Years)
              </label>
              <input
                id="create-job-exp"
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseFloat(e.target.value) || 0)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Job Description Textarea + AI Enhancer */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Job Description & Scope *
              </label>
              <button
                type="button"
                id="btn-ai-enhance-jd"
                onClick={handleAIEnhance}
                disabled={enhancing || (!description.trim() && !title.trim())}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-all disabled:opacity-50"
              >
                {enhancing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-indigo-500" />}
                <span>Auto-Extract Skills with Gemini</span>
              </button>
            </div>
            <textarea
              id="create-job-description"
              required
              rows={4}
              placeholder="Paste or write the complete job description responsibilities and requirements here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Required Skills Tag Editor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Required Core Skills ({requiredSkills.length})
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 min-h-[44px]">
              {requiredSkills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                >
                  {sk}
                  <button type="button" onClick={() => handleRemoveReqSkill(sk)} className="hover:text-rose-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  id="input-add-req-skill"
                  type="text"
                  placeholder="Add skill..."
                  value={newReqSkill}
                  onChange={(e) => setNewReqSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddReqSkill();
                    }
                  }}
                  className="h-7 text-xs bg-transparent border-none focus:outline-hidden px-1.5 text-slate-900 dark:text-white w-24"
                />
                <button
                  type="button"
                  onClick={handleAddReqSkill}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Preferred Skills Tag Editor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Preferred / Bonus Skills ({preferredSkills.length})
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 min-h-[44px]">
              {preferredSkills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  {sk}
                  <button type="button" onClick={() => handleRemovePrefSkill(sk)} className="hover:text-rose-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  id="input-add-pref-skill"
                  type="text"
                  placeholder="Add bonus..."
                  value={newPrefSkill}
                  onChange={(e) => setNewPrefSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPrefSkill();
                    }
                  }}
                  className="h-7 text-xs bg-transparent border-none focus:outline-hidden px-1.5 text-slate-900 dark:text-white w-24"
                />
                <button
                  type="button"
                  onClick={handleAddPrefSkill}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Education Requirement
            </label>
            <input
              id="create-job-education"
              type="text"
              value={educationRequirement}
              onChange={(e) => setEducationRequirement(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              id="btn-submit-create-job"
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
              <span>Save & Publish Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
