import { GoogleGenAI, Type } from '@google/genai';
import { Job, ParsedResume, CandidateAnalysis, ExplainableAI } from '../src/types.js';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// Skill synonym and normalization map
const SYNONYMS: Record<string, string[]> = {
  'machine learning': ['ml', 'statistical modeling', 'predictive modeling'],
  'deep learning': ['neural networks', 'dl', 'transformers'],
  'pytorch': ['torch', 'torchvision'],
  'tensorflow': ['tf', 'keras'],
  'scikit-learn': ['sklearn', 'scikit learn'],
  'natural language processing': ['nlp', 'text mining', 'language models', 'llms', 'large language models'],
  'react': ['react.js', 'reactjs'],
  'node.js': ['node', 'nodejs', 'express'],
  'typescript': ['ts'],
  'javascript': ['js', 'es6'],
  'postgresql': ['postgres', 'psql'],
  'docker': ['containerization', 'containers'],
  'kubernetes': ['k8s'],
  'aws': ['amazon web services', 'ec2', 's3', 'lambda'],
  'gcp': ['google cloud platform', 'google cloud'],
  'rest apis': ['restful api', 'rest api', 'web services', 'restful'],
  'fastapi': ['fast api'],
  'sql': ['relational database', 'rdbms', 'mysql', 'postgres', 'postgresql']
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9+#]/g, ' ').replace(/\s+/g, ' ').trim();
}

function skillIsPresentInCandidate(targetSkill: string, candidateSkills: string[], resumeText: string): boolean {
  const normTarget = normalizeText(targetSkill);
  const normResume = normalizeText(resumeText);

  // Check direct normalized candidate skill list
  for (const s of candidateSkills) {
    const normS = normalizeText(s);
    if (normS === normTarget || normS.includes(normTarget) || normTarget.includes(normS)) {
      return true;
    }
  }

  // Check regex in resume text
  const safeTarget = targetSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const targetRegex = new RegExp(`\\b${safeTarget}\\b`, 'i');
  if (targetRegex.test(resumeText)) {
    return true;
  }

  // Check synonyms
  const key = Object.keys(SYNONYMS).find(k => k === normTarget || SYNONYMS[k].includes(normTarget));
  if (key) {
    const allVariants = [key, ...SYNONYMS[key]];
    for (const v of allVariants) {
      if (normResume.includes(normalizeText(v))) return true;
      for (const s of candidateSkills) {
        if (normalizeText(s).includes(normalizeText(v))) return true;
      }
    }
  }

  return false;
}

// TF-IDF and Cosine Vector Similarity
function calculateCosineSimilarity(textA: string, textB: string): number {
  const tokenize = (t: string) =>
    normalizeText(t)
      .split(' ')
      .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'are', 'will', 'with'].includes(w));

  const wordsA = tokenize(textA);
  const wordsB = tokenize(textB);

  const freqA: Record<string, number> = {};
  const freqB: Record<string, number> = {};
  const vocab = new Set<string>();

  for (const w of wordsA) {
    freqA[w] = (freqA[w] || 0) + 1;
    vocab.add(w);
  }
  for (const w of wordsB) {
    freqB[w] = (freqB[w] || 0) + 1;
    vocab.add(w);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const w of vocab) {
    const a = freqA[w] || 0;
    const b = freqB[w] || 0;
    dotProduct += a * b;
  }

  for (const w in freqA) normA += freqA[w] * freqA[w];
  for (const w in freqB) normB += freqB[w] * freqB[w];

  if (normA === 0 || normB === 0) return 0.5;

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  // Scale and calibrate cosine score to 40 - 98 range for realistic semantic spread
  return Math.min(98, Math.max(30, Math.round(similarity * 100 * 1.6 + 20)));
}

export function calculateSkillsMatch(job: Job, candidate: ParsedResume): {
  score: number;
  matchingRequired: string[];
  missingRequired: string[];
  matchingPreferred: string[];
  missingPreferred: string[];
} {
  const candidateSkillsCombined = [
    ...candidate.skills,
    ...candidate.technicalSkills,
    ...candidate.programmingLanguages,
    ...candidate.frameworks,
    ...candidate.tools
  ];

  const fullResumeContext = `${candidate.summary} ${candidate.rawText} ${candidate.workExperience.map(w => w.description + ' ' + (w.technologies?.join(' ') || '')).join(' ')}`;

  const matchingRequired: string[] = [];
  const missingRequired: string[] = [];

  for (const reqSkill of job.requiredSkills) {
    if (skillIsPresentInCandidate(reqSkill, candidateSkillsCombined, fullResumeContext)) {
      matchingRequired.push(reqSkill);
    } else {
      missingRequired.push(reqSkill);
    }
  }

  const matchingPreferred: string[] = [];
  const missingPreferred: string[] = [];

  for (const prefSkill of job.preferredSkills) {
    if (skillIsPresentInCandidate(prefSkill, candidateSkillsCombined, fullResumeContext)) {
      matchingPreferred.push(prefSkill);
    } else {
      missingPreferred.push(prefSkill);
    }
  }

  const reqRatio = job.requiredSkills.length > 0 ? (matchingRequired.length / job.requiredSkills.length) : 1;
  const prefRatio = job.preferredSkills.length > 0 ? (matchingPreferred.length / job.preferredSkills.length) : 1;

  const score = Math.round(reqRatio * 80 + prefRatio * 20);

  return {
    score: Math.min(100, Math.max(10, score)),
    matchingRequired,
    missingRequired,
    matchingPreferred,
    missingPreferred
  };
}

export function calculateExperienceScore(requiredYears: number, candidateYears: number): number {
  if (requiredYears <= 0) return 95;
  const diff = candidateYears - requiredYears;

  if (diff >= 2) return 98;
  if (diff >= 0) return 90 + Math.round(diff * 4);
  if (diff >= -1) return 75;
  if (diff >= -2) return 55;
  return Math.max(30, Math.round(30 + candidateYears * 10));
}

export function calculateEducationScore(candidate: ParsedResume): number {
  const eduStr = candidate.education.map(e => `${e.degree} ${e.field || ''}`).join(' ').toLowerCase();
  if (eduStr.includes('ph.d') || eduStr.includes('phd') || eduStr.includes('doctorate')) return 98;
  if (eduStr.includes('master') || eduStr.includes('m.s') || eduStr.includes('m.tech') || eduStr.includes('mba')) return 92;
  if (eduStr.includes('bachelor') || eduStr.includes('b.s') || eduStr.includes('b.tech') || eduStr.includes('b.e')) return 85;
  if (candidate.education.length > 0) return 78;
  return 70;
}

export async function generateExplainableAI(
  job: Job,
  candidate: ParsedResume,
  scores: {
    overall: number;
    skills: number;
    experience: number;
    education: number;
    semantic: number;
  },
  skillMatch: {
    matchingRequired: string[];
    missingRequired: string[];
    matchingPreferred: string[];
    missingPreferred: string[];
  }
): Promise<ExplainableAI> {
  const ai = getGeminiClient();

  const fallbackExplanation = (): ExplainableAI => {
    const strengths = [
      `Matches ${skillMatch.matchingRequired.length} of ${job.requiredSkills.length} required core skills (${skillMatch.matchingRequired.join(', ')}).`,
      `${candidate.experienceYears} years of documented experience (Job requires ${job.experienceYears}+ years).`,
      candidate.education[0] ? `Holds degree: ${candidate.education[0].degree} from ${candidate.education[0].institution}.` : 'Relevant technical background.'
    ];

    const missingSkills = [
      ...skillMatch.missingRequired.map(s => `Required skill '${s}' not explicitly verified.`),
      ...skillMatch.missingPreferred.map(s => `Preferred skill '${s}' not identified.`)
    ];

    let rec: 'STRONG_MATCH' | 'GOOD_MATCH' | 'NEEDS_REVIEW' | 'NOT_RECOMMENDED' = 'NEEDS_REVIEW';
    if (scores.overall >= 85) rec = 'STRONG_MATCH';
    else if (scores.overall >= 70) rec = 'GOOD_MATCH';
    else if (scores.overall < 50) rec = 'NOT_RECOMMENDED';

    return {
      strengths,
      missingSkills: missingSkills.length ? missingSkills : ['No major missing core requirements detected.'],
      matchingSkills: [...skillMatch.matchingRequired, ...skillMatch.matchingPreferred],
      weakAreas: skillMatch.missingRequired.length > 0 ? [`Gaps in core required stack: ${skillMatch.missingRequired.join(', ')}`] : ['Ensure hands-on depth during technical interview.'],
      recommendation: rec,
      recommendationSummary: scores.overall >= 80 
        ? `Candidate demonstrates high capability in ${job.title} with ${scores.overall}% overall match. Strong technical profile.`
        : scores.overall >= 60 
        ? `Candidate satisfies baseline requirements with a ${scores.overall}% match score. Further review recommended.`
        : `Significant gaps against the target ${job.title} profile (${scores.overall}% match).`,
      suggestedQuestions: [
        `Can you describe a complex production challenge you solved using ${skillMatch.matchingRequired[0] || 'your core tech stack'}?`,
        `How do you handle performance optimization and scalability in your recent projects?`,
        `What is your familiarity with ${skillMatch.missingRequired[0] || job.requiredSkills[0] || 'the required toolset'}?`
      ],
      scoreBreakdownJustification: `Calculated from Skills Match (${scores.skills}%), Semantic Similarity (${scores.semantic}%), Experience Alignment (${scores.experience}%), and Education Pedigree (${scores.education}%).`
    };
  };

  if (!ai) {
    return fallbackExplanation();
  }

  try {
    const prompt = `You are an Explainable AI Hiring & Technical Recruiter engine.
Evaluate this candidate against the job description and output a structured JSON analysis explaining the match score.

JOB DESCRIPTION:
- Title: ${job.title}
- Company: ${job.company}
- Required Skills: ${job.requiredSkills.join(', ')}
- Preferred Skills: ${job.preferredSkills.join(', ')}
- Required Experience: ${job.experienceYears} years
- Summary: ${job.description}

CANDIDATE PROFILE:
- Name: ${candidate.candidateName}
- Total Experience: ${candidate.experienceYears} years
- Skills Extracted: ${candidate.skills.join(', ')}
- Education: ${candidate.education.map(e => `${e.degree} (${e.institution})`).join(', ')}
- Summary: ${candidate.summary}
- Work Experience Highlights: ${candidate.workExperience.map(w => `${w.role} at ${w.company}: ${w.description}`).join(' | ')}
- Projects: ${candidate.projects.map(p => `${p.name}: ${p.description}`).join(' | ')}

SCORES:
- Overall: ${scores.overall}%
- Skills: ${scores.skills}%
- Experience: ${scores.experience}%
- Semantic Similarity: ${scores.semantic}%
- Education: ${scores.education}%

Generate concise, factual, and high-impact recruiter explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert technical hiring analyst. Provide direct, factual, and explainable recruitment insights.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            matchingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            weakAreas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendation: {
              type: Type.STRING,
              enum: ['STRONG_MATCH', 'GOOD_MATCH', 'NEEDS_REVIEW', 'NOT_RECOMMENDED']
            },
            recommendationSummary: { type: Type.STRING },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            scoreBreakdownJustification: { type: Type.STRING }
          },
          required: [
            'strengths',
            'missingSkills',
            'matchingSkills',
            'weakAreas',
            'recommendation',
            'recommendationSummary',
            'suggestedQuestions',
            'scoreBreakdownJustification'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      strengths: parsed.strengths || [],
      missingSkills: parsed.missingSkills || [],
      matchingSkills: parsed.matchingSkills || [...skillMatch.matchingRequired],
      weakAreas: parsed.weakAreas || [],
      recommendation: parsed.recommendation || 'NEEDS_REVIEW',
      recommendationSummary: parsed.recommendationSummary || '',
      suggestedQuestions: parsed.suggestedQuestions || [],
      scoreBreakdownJustification: parsed.scoreBreakdownJustification || ''
    };
  } catch (err) {
    console.error('Gemini Explainable AI error, using fallback:', err);
    return fallbackExplanation();
  }
}

export async function analyzeCandidateAgainstJob(job: Job, resume: ParsedResume): Promise<CandidateAnalysis> {
  const skillMatch = calculateSkillsMatch(job, resume);
  
  const jdFullText = `${job.title} ${job.description} ${job.requiredSkills.join(' ')} ${job.preferredSkills.join(' ')} ${job.responsibilities.join(' ')}`;
  const resumeFullText = `${resume.candidateName} ${resume.summary} ${resume.skills.join(' ')} ${resume.workExperience.map(w => w.role + ' ' + w.description).join(' ')} ${resume.projects.map(p => p.name + ' ' + p.description).join(' ')} ${resume.rawText}`;
  
  const semanticSimilarityScore = calculateCosineSimilarity(jdFullText, resumeFullText);
  const experienceMatchScore = calculateExperienceScore(job.experienceYears, resume.experienceYears);
  const educationMatchScore = calculateEducationScore(resume);
  const skillsMatchScore = skillMatch.score;

  // Weighted overall calculation: 35% skills + 25% semantic + 25% experience + 15% education
  const overallMatchScore = Math.min(100, Math.max(15, Math.round(
    0.35 * skillsMatchScore +
    0.25 * semanticSimilarityScore +
    0.25 * experienceMatchScore +
    0.15 * educationMatchScore
  )));

  const scores = {
    overall: overallMatchScore,
    skills: skillsMatchScore,
    experience: experienceMatchScore,
    education: educationMatchScore,
    semantic: semanticSimilarityScore
  };

  const explanation = await generateExplainableAI(job, resume, scores, skillMatch);

  return {
    id: `ana-${job.id}-${resume.id}`,
    candidateId: resume.id,
    jobId: job.id,
    candidateName: resume.candidateName,
    email: resume.email,
    phone: resume.phone,
    jobTitle: job.title,
    resumeFileName: resume.fileName,
    overallMatchScore,
    skillsMatchScore,
    experienceMatchScore,
    educationMatchScore,
    semanticSimilarityScore,
    matchingSkills: skillMatch.matchingRequired,
    missingSkills: skillMatch.missingRequired,
    matchedPreferredSkills: skillMatch.matchingPreferred,
    missingPreferredSkills: skillMatch.missingPreferred,
    experienceYears: resume.experienceYears,
    requiredExperienceYears: job.experienceYears,
    status: overallMatchScore >= 85 ? 'Shortlisted' : overallMatchScore >= 70 ? 'Screening' : overallMatchScore >= 50 ? 'New' : 'Rejected',
    explanation,
    analyzedAt: new Date().toISOString(),
    resumeData: resume
  };
}
