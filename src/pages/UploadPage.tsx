import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Loader2,
  Sparkles,
  UserCheck,
  Mail,
  Phone,
  Briefcase,
  ListOrdered,
  Plus
} from 'lucide-react';
import { ParsedResume } from '../types.js';
import { api } from '../services/api.js';

interface UploadPageProps {
  resumes: ParsedResume[];
  onResumesUploaded: (newResumes: ParsedResume[]) => void;
  onDeleteResume: (id: string) => void;
  onNavigateToRanking: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  resumes,
  onResumesUploaded,
  onDeleteResume,
  onNavigateToRanking
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const validFiles = files.filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return validExtensions.includes(ext);
    });

    if (validFiles.length === 0) {
      setUploadError('Please upload valid resume files (PDF, DOCX, or TXT).');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    setUploadProgress(20);

    try {
      // Simulate visual progress increments
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 15 : prev));
      }, 400);

      const res = await api.uploadResumes(validFiles);
      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccess(`Successfully parsed and extracted ${res.count} candidate resume${res.count > 1 ? 's' : ''}!`);
      onResumesUploaded(res.resumes);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload and parse resumes.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Resume Ingestion & Structured Parsing
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {resumes.length} Ingested
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload multiple technical resumes (PDF, DOCX, TXT) for instant neural skill extraction and vector indexing
          </p>
        </div>

        {resumes.length > 0 && (
          <button
            id="btn-upload-go-ranking"
            onClick={onNavigateToRanking}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all shrink-0"
          >
            <ListOrdered className="h-4 w-4" />
            <span>Screen Candidate Pool ({resumes.length})</span>
          </button>
        )}
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-indigo-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-input"
        />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-inner mb-4">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Drag & Drop Candidate Resumes Here
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Supports multi-file upload for <strong className="text-slate-700 dark:text-slate-300">PDF, DOCX, DOC, and TXT</strong>. Gemini and NLP parsers will automatically extract skills, contact info, and experience.
        </p>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            id="btn-browse-resume-files"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Select Files from Computer</span>
          </button>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="mt-6 max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Parsing Resumes & Extracting Entities...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {uploadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {uploadSuccess}
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 font-semibold inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            {uploadError}
          </div>
        )}
      </div>

      {/* Uploaded Resumes Library */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            Parsed Candidate Resume Pool ({resumes.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((res) => (
            <div
              key={res.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                      {res.candidateName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {res.candidateName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                        {res.fileName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteResume(res.id)}
                    title="Delete resume"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Contact & Meta */}
                <div className="mt-3 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  {res.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{res.email}</span>
                    </div>
                  )}
                  {res.phone && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{res.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{res.experienceYears} Years Estimated Experience</span>
                  </div>
                </div>

                {/* Extracted Skills Chips */}
                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Extracted Skills ({res.skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {res.skills.slice(0, 5).map((sk, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                        {sk}
                      </span>
                    ))}
                    {res.skills.length > 5 && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-1 py-0.5">
                        +{res.skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  Parsed
                </span>
                <span>{new Date(res.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {resumes.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              No resumes uploaded yet. Drag files into the box above to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
