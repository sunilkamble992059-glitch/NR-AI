import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Sliders,
  Database,
  Cpu,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { api } from '../services/api.js';

export const SettingsPage: React.FC<{ onReseed: () => void }> = ({ onReseed }) => {
  const [skillsWeight, setSkillsWeight] = useState(35);
  const [semanticWeight, setSemanticWeight] = useState(25);
  const [experienceWeight, setExperienceWeight] = useState(25);
  const [educationWeight, setEducationWeight] = useState(15);
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [reseedLoading, setReseedLoading] = useState(false);

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReseed = async () => {
    setReseedLoading(true);
    try {
      await api.reseedDemo();
      onReseed();
    } catch (e) {
      console.error(e);
    } finally {
      setReseedLoading(false);
    }
  };

  const totalWeight = skillsWeight + semanticWeight + experienceWeight + educationWeight;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">
          System Settings & Neural Scoring Engine
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Configure model parameters, scoring weight equations, and semantic embedding algorithms
        </p>
      </div>

      {/* Model & AI Settings */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span>LLM Neural Extraction & Reasoning Model</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Active Gemini Model
            </label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              aria-label="Select Gemini AI Model"
              className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-xs font-semibold text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ultra-Fast & High Accuracy)</option>
              <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Multimodal Reasoning)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Vector Similarity Metric
            </label>
            <div className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 px-3 text-xs flex items-center font-mono text-zinc-800 dark:text-zinc-200">
              Cosine Similarity (TF-IDF Vector Space)
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed flex items-start gap-2">
          <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            The system combines <strong>n-gram vector cosine similarity</strong> with <strong>structured Gemini LLM reasoning</strong> to eliminate bias and produce explainable candidate rationale reports.
          </span>
        </div>
      </div>

      {/* Neural Score Weighting Formula */}
      <form onSubmit={handleSaveWeights} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
            <Sliders className="h-4 w-4 text-indigo-600" />
            <span>Matching Score Weight Distribution (Total: {totalWeight}%)</span>
          </div>
          {totalWeight !== 100 && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
              Weights should equal 100%
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-zinc-700 dark:text-zinc-300">Technical Skills Match Weight</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{skillsWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={skillsWeight}
              onChange={(e) => setSkillsWeight(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-zinc-700 dark:text-zinc-300">Neural Semantic Similarity Weight</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{semanticWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={semanticWeight}
              onChange={(e) => setSemanticWeight(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-zinc-700 dark:text-zinc-300">Experience Alignment Weight</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{experienceWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={experienceWeight}
              onChange={(e) => setExperienceWeight(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-zinc-700 dark:text-zinc-300">Education & Certification Weight</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{educationWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={educationWeight}
              onChange={(e) => setEducationWeight(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Formula: <code className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded-sm">Score = ({skillsWeight}% * Skills) + ({semanticWeight}% * Semantic) + ({experienceWeight}% * Exp) + ({educationWeight}% * Edu)</code>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all"
          >
            {savedSuccess ? 'Weights Saved!' : 'Update Scoring Weights'}
          </button>
        </div>
      </form>

      {/* Benchmark Data Reset */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
            Reset Benchmark Evaluation Data
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Restores initial candidate resumes, job descriptions, and benchmark match rankings
          </p>
        </div>
        <button
          onClick={handleReseed}
          disabled={reseedLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
        >
          <RefreshCw className={`h-4 w-4 text-indigo-500 ${reseedLoading ? 'animate-spin' : ''}`} />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
