import { GoogleGenAI } from '@google/genai';
import { Job, CandidateAnalysis } from '../src/types.js';

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

export async function askRecruiterAssistant(
  prompt: string,
  currentJob: Job | null,
  candidates: CandidateAnalysis[],
  chatHistory: { sender: 'user' | 'assistant'; text: string }[] = []
): Promise<{ text: string; structuredRecommendations?: { name: string; score: number; reason: string }[] }> {
  const ai = getGeminiClient();

  // Prepare context data
  const candidateContext = candidates.map((c, idx) => `
Candidate #${idx + 1}: ${c.candidateName} (${c.email})
- Overall Match: ${c.overallMatchScore}% | Skills Match: ${c.skillsMatchScore}% | Experience Match: ${c.experienceMatchScore}% | Semantic Similarity: ${c.semanticSimilarityScore}%
- Experience: ${c.experienceYears} years (Job requires: ${c.requiredExperienceYears}+ yrs)
- Matching Skills: ${c.matchingSkills.join(', ')}
- Missing Skills: ${c.missingSkills.join(', ') || 'None'}
- Matched Preferred: ${c.matchedPreferredSkills.join(', ')}
- Status: ${c.status}
- Summary: ${c.resumeData?.summary || 'N/A'}
- AI Recommendation: ${c.explanation?.recommendation || 'N/A'} (${c.explanation?.recommendationSummary || ''})
- Key Strengths: ${c.explanation?.strengths?.slice(0, 2).join('; ') || 'N/A'}
`).join('\n---\n');

  const jobContext = currentJob
    ? `Target Job: ${currentJob.title} at ${currentJob.company}
Required Skills: ${currentJob.requiredSkills.join(', ')}
Preferred Skills: ${currentJob.preferredSkills.join(', ')}
Min Experience: ${currentJob.experienceYears} years
Job Summary: ${currentJob.description}`
    : 'No specific job selected. Analyzing across all candidates.';

  if (!ai) {
    // Intelligent fallback rule engine
    const lower = prompt.toLowerCase();
    
    if (lower.includes('best') || lower.includes('top') || lower.includes('highest')) {
      const sorted = [...candidates].sort((a, b) => b.overallMatchScore - a.overallMatchScore);
      const top = sorted[0];
      if (top) {
        return {
          text: `Based on neural semantic match scores and skill requirements, **${top.candidateName}** is the top-ranked candidate with an **Overall Match Score of ${top.overallMatchScore}%** (${top.skillsMatchScore}% skills match, ${top.experienceYears} years experience). Key strengths: ${top.explanation.strengths.slice(0, 2).join(', ')}.`,
          structuredRecommendations: sorted.slice(0, 3).map(c => ({
            name: c.candidateName,
            score: c.overallMatchScore,
            reason: c.explanation.recommendationSummary
          }))
        };
      }
    }

    if (lower.includes('missing') || lower.includes('lacks') || lower.includes('gap')) {
      const filtered = candidates.filter(c => c.missingSkills.length > 0);
      const list = filtered.map(c => `• **${c.candidateName}**: Missing ${c.missingSkills.join(', ')}`).join('\n');
      return {
        text: `Here is the missing skills breakdown across screened candidates:\n\n${list || 'All current candidates meet the core required skills.'}`
      };
    }

    if (lower.includes('experience') || lower.includes('years')) {
      const sorted = [...candidates].sort((a, b) => b.experienceYears - a.experienceYears);
      const list = sorted.map(c => `• **${c.candidateName}**: ${c.experienceYears} years (${c.overallMatchScore}% match score)`).join('\n');
      return {
        text: `Candidates ranked by verified years of experience:\n\n${list}`
      };
    }

    return {
      text: `I've analyzed the ${candidates.length} candidates for ${currentJob ? currentJob.title : 'the active position'}. The average match score is ${Math.round(candidates.reduce((a, b) => a + b.overallMatchScore, 0) / (candidates.length || 1))}%. Let me know if you would like me to compare specific candidates, list missing technical requirements, or draft tailored interview questions!`
    };
  }

  try {
    const historyText = chatHistory.slice(-4).map(h => `${h.sender === 'user' ? 'Recruiter' : 'Assistant'}: ${h.text}`).join('\n');

    const systemInstruction = `You are a high-level Technical Recruiter & Talent AI Assistant for the "Explainable Neural Semantic Resume Screening" system.
Your job is to provide direct, insightful, data-driven comparisons, explanations, and advice to the hiring manager.
Always cite actual numbers, skills, and experience from the provided candidate context.
Be professional, structured, concise, and highlight actionable hiring insights.`;

    const fullPrompt = `CONTEXT:
${jobContext}

CANDIDATES DATA (${candidates.length} profiles):
${candidateContext}

RECENT CHAT HISTORY:
${historyText}

RECRUITER QUERY:
"${prompt}"

Please respond thoroughly with clear formatting, bold candidate names, and bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.4
      }
    });

    return {
      text: response.text || 'I analyzed the candidates based on your query.'
    };
  } catch (error) {
    console.error('AI Recruiter Assistant error:', error);
    return {
      text: `Unable to query live AI model at this moment. You can review the candidate scores and rankings in the main dashboard.`
    };
  }
}
