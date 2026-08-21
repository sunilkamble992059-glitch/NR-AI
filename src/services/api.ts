import { User, Job, ParsedResume, CandidateAnalysis, DashboardStats, ChatMessage, CandidateStatus } from '../types.js';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async loginDemo(): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Demo login failed');
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to get current user');
    return res.json();
  },

  // Jobs
  async getJobs(): Promise<{ jobs: Job[] }> {
    const res = await fetch(`${API_BASE}/jobs`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  async getJob(id: string): Promise<{ job: Job }> {
    const res = await fetch(`${API_BASE}/jobs/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Job not found');
    return res.json();
  },

  async createJob(jobData: Partial<Job>): Promise<{ job: Job }> {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(jobData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create job');
    }
    return res.json();
  },

  async deleteJob(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete job');
    return res.json();
  },

  async enhanceJobDescription(title: string, description: string): Promise<{
    requiredSkills: string[];
    preferredSkills: string[];
    suggestedExperience: number;
    responsibilities: string[];
  }> {
    const res = await fetch(`${API_BASE}/jobs/enhance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, description })
    });
    if (!res.ok) throw new Error('Failed to enhance job description');
    return res.json();
  },

  // Resumes
  async uploadResumes(files: File[]): Promise<{ count: number; resumes: ParsedResume[] }> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },

  async getResumes(): Promise<{ resumes: ParsedResume[] }> {
    const res = await fetch(`${API_BASE}/resumes`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch resumes');
    return res.json();
  },

  async getResume(id: string): Promise<{ resume: ParsedResume }> {
    const res = await fetch(`${API_BASE}/resumes/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Resume not found');
    return res.json();
  },

  async deleteResume(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete resume');
    return res.json();
  },

  // Candidates & Analysis
  async runSemanticAnalysis(jobId: string, candidateIds?: string[]): Promise<{
    success: boolean;
    jobId: string;
    count: number;
    candidates: CandidateAnalysis[];
  }> {
    const res = await fetch(`${API_BASE}/analyze/${jobId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ candidateIds })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Analysis failed');
    }
    return res.json();
  },

  async getCandidates(params?: {
    jobId?: string;
    status?: string;
    search?: string;
    minScore?: number;
  }): Promise<{ candidates: CandidateAnalysis[] }> {
    const query = new URLSearchParams();
    if (params?.jobId) query.set('jobId', params.jobId);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.minScore) query.set('minScore', String(params.minScore));

    const res = await fetch(`${API_BASE}/candidates?${query.toString()}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
  },

  async getCandidate(id: string): Promise<{ candidate: CandidateAnalysis }> {
    const res = await fetch(`${API_BASE}/candidates/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Candidate not found');
    return res.json();
  },

  async updateCandidateStatus(id: string, status: CandidateStatus, jobId?: string, notes?: string): Promise<{ success: boolean; candidate: CandidateAnalysis }> {
    const res = await fetch(`${API_BASE}/candidates/${id}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status, jobId, notes })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async updateCandidateNotes(id: string, notes: string): Promise<{ success: boolean; candidate: CandidateAnalysis }> {
    const res = await fetch(`${API_BASE}/candidates/${id}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ notes })
    });
    if (!res.ok) throw new Error('Failed to update notes');
    return res.json();
  },

  // AI Chat Assistant
  async sendAIChatMessage(prompt: string, jobId?: string, chatHistory?: { sender: 'user' | 'assistant'; text: string }[]): Promise<{
    text: string;
    structuredRecommendations?: { name: string; score: number; reason: string }[];
  }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt, jobId, chatHistory })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'AI Chat request failed');
    }
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Reseed Demo Data
  async reseedDemo(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/demo/seed`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to reseed demo data');
    return res.json();
  }
};
