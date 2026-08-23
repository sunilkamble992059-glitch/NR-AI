import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { extractRawTextFromFile, parseResumeWithAI } from './server/parser.js';
import { analyzeCandidateAgainstJob } from './server/semantic.js';
import { askRecruiterAssistant } from './server/aiAssistant.js';
import { GoogleGenAI, Type } from '@google/genai';
import { CandidateStatus, Job, User } from './src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'neural-resume-screening-jwt-secret-key-2026';
const PORT = 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

export async function returnApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Helper Auth Middleware
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      // Fallback for demo convenience
      return next();
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return next();
      }
      (req as any).user = user;
      next();
    });
  };

  // ----------------------------------------------------
  // AUTHENTICATION ROUTES
  // ----------------------------------------------------
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, role = 'recruiter' } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }
      const existing = db.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }
      const user: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      };
      db.addUser(user);
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      let user = db.getUserByEmail(email);
      if (!user) {
        // Auto create for demo experience
        user = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].replace(/[._]/g, ' '),
          email,
          role: 'recruiter',
          createdAt: new Date().toISOString()
        };
        db.addUser(user);
      }
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed.' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const u = (req as any).user;
    if (u && u.email) {
      const user = db.getUserByEmail(u.email);
      if (user) return res.json({ user });
    }
    const defaultUser = db.getUsers()[0];
    res.json({ user: defaultUser });
  });

  app.post('/api/auth/demo', (req, res) => {
    const user = db.getUsers()[0] || {
      id: 'demo-user-1',
      name: 'Sarah Jenkins (Lead Recruiter)',
      email: 'sarah.jenkins@talentai.io',
      role: 'recruiter',
      createdAt: new Date().toISOString()
    };
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  });

  // ----------------------------------------------------
  // JOBS ROUTES
  // ----------------------------------------------------
  app.get('/api/jobs', (req, res) => {
    try {
      const jobs = db.getJobs();
      res.json({ jobs });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/jobs/:id', (req, res) => {
    try {
      const job = db.getJobById(req.params.id);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      res.json({ job });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/jobs', (req, res) => {
    try {
      const {
        title,
        company,
        department = 'Engineering',
        location = 'Remote / Hybrid',
        type = 'Full-time',
        experienceYears = 2,
        description,
        requiredSkills = [],
        preferredSkills = [],
        educationRequirement = 'Bachelor in Computer Science or related STEM field',
        responsibilities = []
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Job title and description are required.' });
      }

      const newJob: Job = {
        id: `job-${Date.now()}`,
        title,
        company: company || 'Enterprise AI Labs',
        department,
        location,
        type,
        experienceYears: Number(experienceYears) || 2,
        description,
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : String(requiredSkills).split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : String(preferredSkills).split(',').map(s => s.trim()).filter(Boolean),
        educationRequirement,
        responsibilities: Array.isArray(responsibilities) && responsibilities.length > 0 ? responsibilities : [
          'Design and implement scalable software or machine learning workflows.',
          'Collaborate across cross-functional product and infrastructure teams.',
          'Optimize system performance, reliability, and code quality.'
        ],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const saved = db.addJob(newJob);
      res.status(201).json({ job: saved });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/jobs/:id', (req, res) => {
    try {
      const success = db.deleteJob(req.params.id);
      if (!success) return res.status(404).json({ error: 'Job not found' });
      res.json({ success: true, message: 'Job deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI JD Enhancer: Auto-extract skills and structure from raw text
  app.post('/api/jobs/enhance', async (req, res) => {
    try {
      const { description, title } = req.body;
      if (!description && !title) {
        return res.status(400).json({ error: 'Job description or title is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          requiredSkills: ['Python', 'SQL', 'Git', 'REST APIs'],
          preferredSkills: ['Docker', 'AWS', 'CI/CD'],
          suggestedExperience: 2,
          responsibilities: [
            'Architect scalable backend and frontend application modules.',
            'Collaborate with product managers and engineers.',
            'Participate in agile sprint rituals and code reviews.'
          ]
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `Analyze this Job Title and Description. Extract structured recruitment requirements:
Job Title: ${title || 'Software Engineer'}
Job Description:
${description}

Extract:
1. requiredSkills: Core mandatory technical skills
2. preferredSkills: Nice-to-have technical skills
3. suggestedExperience: Minimum years of experience as a number
4. responsibilities: 3-4 concise bullet points describing key duties.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedExperience: { type: Type.NUMBER },
              responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['requiredSkills', 'preferredSkills', 'suggestedExperience', 'responsibilities']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Job enhancer error:', err);
      res.json({
        requiredSkills: ['Python', 'SQL', 'Git', 'Problem Solving'],
        preferredSkills: ['Docker', 'Cloud Services', 'Agile'],
        suggestedExperience: 3,
        responsibilities: [
          'Design and maintain high-quality codebases.',
          'Work with engineering leads to define technical architecture.'
        ]
      });
    }
  });

  // ----------------------------------------------------
  // RESUME UPLOAD & PARSING ROUTES
  // ----------------------------------------------------
  app.post('/api/resumes/upload', upload.array('files', 20), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No resume files uploaded.' });
      }

      const parsedResumes = [];
      for (const file of files) {
        const id = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const rawText = await extractRawTextFromFile(file.buffer, file.originalname, file.mimetype);
        const parsed = await parseResumeWithAI(rawText, file.originalname, file.size, file.mimetype, id);
        db.addResume(parsed);
        parsedResumes.push(parsed);
      }

      db.addActivity('upload', `Uploaded ${files.length} Resume(s)`, `Processed ${files.map(f => f.originalname).join(', ')}`);

      res.json({
        success: true,
        count: parsedResumes.length,
        resumes: parsedResumes
      });
    } catch (err: any) {
      console.error('Resume upload error:', err);
      res.status(500).json({ error: err.message || 'Failed to parse uploaded resumes.' });
    }
  });

  app.get('/api/resumes', (req, res) => {
    try {
      const resumes = db.getResumes();
      res.json({ resumes });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/resumes/:id', (req, res) => {
    try {
      const resume = db.getResumeById(req.params.id);
      if (!resume) return res.status(404).json({ error: 'Resume not found' });
      res.json({ resume });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/resumes/:id', (req, res) => {
    try {
      const success = db.deleteResume(req.params.id);
      if (!success) return res.status(404).json({ error: 'Resume not found' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // SEMANTIC MATCHING & RANKING ROUTES
  // ----------------------------------------------------
  app.post('/api/analyze/:jobId', async (req, res) => {
    try {
      const { jobId } = req.params;
      const { candidateIds } = req.body || {};

      const job = db.getJobById(jobId);
      if (!job) return res.status(404).json({ error: 'Target Job not found.' });

      let resumesToAnalyze = db.getResumes();
      if (Array.isArray(candidateIds) && candidateIds.length > 0) {
        resumesToAnalyze = resumesToAnalyze.filter(r => candidateIds.includes(r.id));
      }

      if (resumesToAnalyze.length === 0) {
        return res.status(400).json({ error: 'No resumes available to screen.' });
      }

      const analyses = [];
      for (const resume of resumesToAnalyze) {
        const analysis = await analyzeCandidateAgainstJob(job, resume);
        db.saveAnalysis(analysis);
        analyses.push(analysis);
      }

      // Sort by overall match score descending
      analyses.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

      db.addActivity('analysis', `Neural Semantic Screening Run`, `Screened ${analyses.length} candidates against ${job.title}. Top score: ${analyses[0]?.overallMatchScore || 0}%.`);

      res.json({
        success: true,
        jobId,
        count: analyses.length,
        candidates: analyses
      });
    } catch (err: any) {
      console.error('Semantic Analysis Error:', err);
      res.status(500).json({ error: err.message || 'Semantic analysis failed.' });
    }
  });

  app.get('/api/candidates', (req, res) => {
    try {
      const { jobId, status, search, minScore } = req.query;
      let candidates = db.getAnalyses(jobId as string | undefined);

      if (status && status !== 'all') {
        candidates = candidates.filter(c => c.status.toLowerCase() === (status as string).toLowerCase());
      }

      if (minScore) {
        const score = Number(minScore);
        if (!isNaN(score)) {
          candidates = candidates.filter(c => c.overallMatchScore >= score);
        }
      }

      if (search) {
        const q = String(search).toLowerCase();
        candidates = candidates.filter(c =>
          c.candidateName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.matchingSkills.some(s => s.toLowerCase().includes(q)) ||
          c.resumeData?.skills?.some(s => s.toLowerCase().includes(q))
        );
      }

      // Default sort by score descending
      candidates.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

      res.json({ candidates });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/candidates/:id', (req, res) => {
    try {
      const candidate = db.getAnalysisById(req.params.id);
      if (!candidate) return res.status(404).json({ error: 'Candidate analysis not found' });
      res.json({ candidate });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/candidates/:id/status', (req, res) => {
    try {
      const { status, jobId, notes } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required.' });

      const updated = db.updateCandidateStatus(req.params.id, jobId, status as CandidateStatus, notes);
      if (!updated) return res.status(404).json({ error: 'Candidate not found' });

      res.json({ success: true, candidate: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/candidates/:id/notes', (req, res) => {
    try {
      const { notes } = req.body;
      const updated = db.updateCandidateNotes(req.params.id, notes || '');
      if (!updated) return res.status(404).json({ error: 'Candidate not found' });
      res.json({ success: true, candidate: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // AI RECRUITER ASSISTANT CHAT ROUTE
  // ----------------------------------------------------
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { prompt, jobId, chatHistory } = req.body;
      if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

      const currentJob = jobId ? db.getJobById(jobId) || null : db.getJobs()[0] || null;
      const candidates = db.getAnalyses(jobId);

      const response = await askRecruiterAssistant(prompt, currentJob, candidates, chatHistory || []);
      res.json(response);
    } catch (err: any) {
      console.error('AI chat error:', err);
      res.status(500).json({ error: err.message || 'AI assistant error.' });
    }
  });

  // ----------------------------------------------------
  // DASHBOARD & ANALYTICS STATS ROUTE
  // ----------------------------------------------------
  app.get('/api/dashboard/stats', (req, res) => {
    try {
      const resumes = db.getResumes();
      const jobs = db.getJobs();
      const analyses = db.getAnalyses();

      const totalResumes = resumes.length;
      const jobsCreated = jobs.length;
      const candidatesAnalyzed = analyses.length;

      const avgScore = candidatesAnalyzed > 0
        ? Math.round(analyses.reduce((acc, curr) => acc + curr.overallMatchScore, 0) / candidatesAnalyzed)
        : 0;

      const shortlistedCount = analyses.filter(a => a.status === 'Shortlisted').length;
      const interviewCount = analyses.filter(a => a.status === 'Interview').length;
      const rejectedCount = analyses.filter(a => a.status === 'Rejected').length;

      // Score distribution bins: 0-50, 51-70, 71-85, 86-100
      const scoreDistribution = [
        { range: '0-50%', count: analyses.filter(a => a.overallMatchScore <= 50).length },
        { range: '51-70%', count: analyses.filter(a => a.overallMatchScore > 50 && a.overallMatchScore <= 70).length },
        { range: '71-85%', count: analyses.filter(a => a.overallMatchScore > 70 && a.overallMatchScore <= 85).length },
        { range: '86-100%', count: analyses.filter(a => a.overallMatchScore > 85).length }
      ];

      // Skill demand vs supply frequency
      const skillCounts: Record<string, { demanded: number; available: number }> = {};

      jobs.forEach(j => {
        [...j.requiredSkills, ...j.preferredSkills].forEach(sk => {
          if (!skillCounts[sk]) skillCounts[sk] = { demanded: 0, available: 0 };
          skillCounts[sk].demanded += 1;
        });
      });

      resumes.forEach(r => {
        (r.skills || []).forEach(sk => {
          if (!skillCounts[sk]) skillCounts[sk] = { demanded: 0, available: 0 };
          skillCounts[sk].available += 1;
        });
      });

      const skillDemandSupply = Object.entries(skillCounts)
        .map(([skill, counts]) => ({ skill, ...counts }))
        .sort((a, b) => (b.demanded + b.available) - (a.demanded + a.available))
        .slice(0, 8);

      const pipelineCounts: { status: CandidateStatus; count: number }[] = [
        { status: 'New', count: analyses.filter(a => a.status === 'New').length },
        { status: 'Screening', count: analyses.filter(a => a.status === 'Screening').length },
        { status: 'Shortlisted', count: shortlistedCount },
        { status: 'Interview', count: interviewCount },
        { status: 'Rejected', count: rejectedCount }
      ];

      res.json({
        totalResumes,
        jobsCreated,
        candidatesAnalyzed,
        averageMatchScore: avgScore,
        shortlistedCount,
        interviewCount,
        rejectedCount,
        recentActivity: db.getActivities().slice(0, 8),
        scoreDistribution,
        skillDemandSupply,
        pipelineCounts
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // DEMO RESET & SEED
  // ----------------------------------------------------
  app.post('/api/demo/seed', (req, res) => {
    try {
      const stats = db.seedDemo();
      res.json({ success: true, message: 'Demo data reseeded successfully', stats });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), geminiConfigured: !!process.env.GEMINI_API_KEY });
  });

  // ----------------------------------------------------
  // VITE / STATIC MIDDLEWARE
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

if (!process.env.VERCEL) {
  returnApp().then((app) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

