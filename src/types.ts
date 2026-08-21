export interface User {
  id: string;
  name: string;
  email: string;
  role: 'recruiter' | 'admin' | 'hiring_manager';
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experienceYears: number;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  educationRequirement?: string;
  responsibilities: string[];
  createdAt: string;
  status: 'active' | 'closed' | 'draft';
  candidateCount?: number;
}

export interface ParsedResume {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  candidateName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  technicalSkills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  tools: string[];
  experienceYears: number;
  education: {
    degree: string;
    institution: string;
    year?: string;
    field?: string;
  }[];
  workExperience: {
    role: string;
    company: string;
    duration?: string;
    description: string;
    technologies?: string[];
  }[];
  projects: {
    name: string;
    description: string;
    technologies?: string[];
    link?: string;
  }[];
  certifications: string[];
  rawText: string;
  uploadDate: string;
  parsingStatus: 'completed' | 'processing' | 'failed';
}

export type CandidateStatus = 'New' | 'Screening' | 'Shortlisted' | 'Interview' | 'Rejected';

export interface ExplainableAI {
  strengths: string[];
  missingSkills: string[];
  matchingSkills: string[];
  weakAreas: string[];
  recommendation: 'STRONG_MATCH' | 'GOOD_MATCH' | 'NEEDS_REVIEW' | 'NOT_RECOMMENDED';
  recommendationSummary: string;
  suggestedQuestions: string[];
  scoreBreakdownJustification: string;
}

export interface CandidateAnalysis {
  id: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  email: string;
  phone: string;
  jobTitle: string;
  resumeFileName: string;
  
  overallMatchScore: number;
  skillsMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  semanticSimilarityScore: number;

  matchingSkills: string[];
  missingSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];

  experienceYears: number;
  requiredExperienceYears: number;

  status: CandidateStatus;
  notes?: string;
  explanation: ExplainableAI;
  analyzedAt: string;
  resumeData: ParsedResume;
}

export interface DashboardStats {
  totalResumes: number;
  jobsCreated: number;
  candidatesAnalyzed: number;
  averageMatchScore: number;
  shortlistedCount: number;
  interviewCount: number;
  rejectedCount: number;
  recentActivity: {
    id: string;
    type: 'upload' | 'analysis' | 'status_change' | 'job_created';
    title: string;
    description: string;
    timestamp: string;
  }[];
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  skillDemandSupply: {
    skill: string;
    demanded: number;
    available: number;
  }[];
  pipelineCounts: {
    status: CandidateStatus;
    count: number;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  structuredData?: {
    candidateRecommendations?: {
      name: string;
      score: number;
      reason: string;
    }[];
  };
}
