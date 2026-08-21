# Explainable Neural Semantic Matching for Unstructured Technical Resumes

> **PS5 Hackathon Solution** — Intelligent Resume Screening, Semantic Ranking & Explainable AI Recruiter Platform powered by **Google Gemini 3.7**, **TF-IDF Vector Cosine Similarity**, **FastAPI / Express REST APIs**, and **React + Tailwind CSS**.

---

## 🎯 Executive Overview

Modern technical hiring suffers from keyword-stuffing exploits, fragile ATS filters, and black-box scoring. **NeuralResume AI** solves this with **Explainable Neural Semantic Matching**:
1. **Unstructured Resume Ingestion**: Automatically parses and structures multi-format technical resumes (PDF, DOCX, TXT) into normalized entity profiles.
2. **Multi-Dimensional Match Scoring**: Combines **Skills Alignment (35%)**, **N-gram Semantic Cosine Similarity (25%)**, **Experience Alignment (25%)**, and **Education Pedigree (15%)**.
3. **Transparent Explainable AI (XAI)**: Generates human-readable rationales—itemizing strengths, identifying specific missing competencies, and generating custom technical interview questions tailored to candidate gaps.
4. **Recruiter Command Center**: Interactive Candidate Ranking Leaderboard, Side-by-Side Comparison Matrix, Kanban Screening Pipeline, Real-time Analytics, and a Conversational **AI Recruiter Assistant**.

---

## 🏗️ Architecture & Technology Stack

```
                                    ┌───────────────────────────────────┐
                                    │    Recruiter Web UI (React 19)    │
                                    │  Tailwind CSS + Recharts + Lucide │
                                    └─────────────────┬─────────────────┘
                                                      │ REST JSON / Multipart
                                                      ▼
                      ┌──────────────────────────────────────────────────────────────┐
                      │                 Backend API Service Layer                    │
                      │       • Express / Node.js (Full-stack Container Mode)        │
                      │       • FastAPI / Python 3.11 (Standalone Python Service)    │
                      └───────┬───────────────────────┬───────────────────────┬──────┘
                              │                       │                       │
                              ▼                       ▼                       ▼
                  ┌───────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                  │ Multi-Format Parsers  │  │  Semantic Vector │  │   Google Gemini  │
                  │   • pdf-parse / pypdf │  │     Engine       │  │   2.5 / 3.7 Flash│
                  │   • mammoth / docx    │  │ • Cosine Sim     │  │ • Entity Extract │
                  │   • Regex & Heuristics│  │ • TF-IDF Vectors │  │ • XAI Reasoning  │
                  │                       │  │ • Weight Formula │  │ • AI Assistant   │
                  └───────────────────────┘  └──────────────────┘  └──────────────────┘
```

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Sophisticated Dark/Light palette with mathematical spacing and accessible contrast)
- **Visualizations**: Recharts (Radar charts for candidate skill dimensions, Bar charts for distribution, Histograms)
- **Icons**: Lucide React

### Backend
- **Container Server**: Express with TypeScript type stripping + Vite SPA middleware
- **Python FastAPI Service**: `/backend` directory containing full FastAPI endpoints, Pydantic schemas, and SQLAlchemy models.
- **Data Persistence**: In-memory database with pre-seeded benchmark candidates, resume files, and job descriptions.

### AI & NLP Core
- **Google GenAI SDK (`@google/genai`)**: Structured JSON schema outputs using Gemini 2.5/3.7 Flash for explainable candidate justifications, interview question generation, and JD skill extraction.
- **TF-IDF Cosine Similarity Engine**: Word n-gram vectorization and cosine similarity calculations.
- **Graceful Fallback Mode**: If the Gemini API key is not supplied, the platform falls back to deterministic heuristic parsing and rule-based explainability scoring.

---

## ⚡ Key Features

### 1. Multi-Dimensional Neural Scoring
Instead of a single opaque score, candidate profiles are evaluated across 4 distinct dimensions:
$$\text{Overall Score} = 0.35 \times \text{Skills} + 0.25 \times \text{Semantic} + 0.25 \times \text{Experience} + 0.15 \times \text{Education}$$

- **Skills Match**: Exact and fuzzy alias matching against required & preferred job competencies.
- **Semantic Similarity**: Vector cosine similarity between resume text embeddings and the target job description.
- **Experience Match**: Non-linear scaling based on required vs candidate years of relevant technical experience.
- **Education Score**: Degree level normalization (PhD > Master's > Bachelor's > Bootcamp/Self-taught).

### 2. Explainable AI (XAI) Deep-Dive Modal
- **Why This Candidate Matches**: Specific positive bullet points grounded in candidate projects and career history.
- **Missing Skills & Gaps**: Highlighted missing requirements in red chips with explanations of the deficit.
- **Custom Interview Questions**: Gemini dynamically generates 3-5 technical questions targeting the candidate's exact skill gaps.

### 3. Side-by-Side Candidate Comparison Matrix
Select up to 3 candidates simultaneously to compare radar charts, strengths, missing skills, and experience years side-by-side.

### 4. Interactive Screening Pipeline (Kanban)
Transition candidates across 5 recruitment stages: `New Applicants` $\rightarrow$ `Screening` $\rightarrow$ `Shortlisted` $\rightarrow$ `Interview` $\rightarrow$ `Rejected`, complete with private recruiter notes.

### 5. AI Recruiter Assistant
Interactive conversational slide-over drawer allowing recruiters to query candidate data in natural language:
- *"Who has the strongest Python and ML experience?"*
- *"Why did Rahul Sharma score 94%?"*
- *"Which candidates are missing AWS experience?"*

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/login` | `POST` | Authenticate recruiter & obtain JWT token |
| `/api/auth/demo` | `POST` | Instant one-click demo login |
| `/api/jobs` | `GET` | List all job descriptions with applicant counts |
| `/api/jobs` | `POST` | Create a job posting with AI skill extraction |
| `/api/jobs/enhance` | `POST` | Auto-extract skills and experience with Gemini |
| `/api/resumes/upload` | `POST` | Upload and parse multiple resume files (multipart) |
| `/api/resumes` | `GET` | Retrieve parsed resumes and extracted skills |
| `/api/analyze/:jobId` | `POST` | Run neural semantic matching and generate XAI reports |
| `/api/candidates` | `GET` | Retrieve ranked candidates (filters: jobId, status, minScore) |
| `/api/candidates/:id/status` | `POST` | Update candidate pipeline stage |
| `/api/candidates/:id/notes` | `POST` | Save recruiter screening notes |
| `/api/ai/chat` | `POST` | Conversational recruiter AI assistant query |
| `/api/dashboard/stats` | `GET` | Aggregated dashboard metrics & charts |
| `/api/demo/seed` | `POST` | Reset database to benchmark evaluation dataset |

---

## 🚀 Running the Project

### Development Mode (Default Applet)
The application starts automatically on port `3000`:
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Standalone Python FastAPI Service (Optional)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🎬 Hackathon Judge Demo Walkthrough

1. **Dashboard Overview**: Inspect the metric cards, candidate score distribution histogram, and top technical skills in demand.
2. **Candidate Ranking**: Navigate to **Candidate Ranking** to see the benchmark candidates ranked for *Senior Machine Learning Engineer*. Observe the emerald/blue score badges.
3. **Explainable AI Modal**: Click **AI Rationale** on candidate **Rahul Sharma (94%)**. View the Radar chart, why he matches, missing AWS skills, and the tailored interview questions.
4. **Compare Candidates**: Select checkboxes for **Rahul Sharma** and **Ananya Patel**, then click **Compare Selected** to view the side-by-side comparison matrix.
5. **Kanban Pipeline**: Navigate to **Screening Pipeline** and drag/advance candidates into *Shortlisted* or *Technical Interview*.
6. **AI Recruiter Assistant**: Click **Ask AI Recruiter** in the top navbar and select *"Who has the strongest Python experience?"* to see live Gemini reasoning.
7. **Resume Upload**: Go to **Upload Resumes** and drag in your own technical resume (PDF/DOCX/TXT) to test real-time parsing.
