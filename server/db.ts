import fs from 'fs';
import path from 'path';
import { User, Job, ParsedResume, CandidateAnalysis, CandidateStatus } from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: User[];
  jobs: Job[];
  resumes: ParsedResume[];
  analyses: CandidateAnalysis[];
  activities: {
    id: string;
    type: 'upload' | 'analysis' | 'status_change' | 'job_created';
    title: string;
    description: string;
    timestamp: string;
  }[];
}

const DEFAULT_DEMO_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Data Scientist & ML Engineer',
    company: 'NeuralSphere AI',
    department: 'Machine Learning',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    experienceYears: 3,
    description: 'We are seeking a Senior Data Scientist to architect, train, and deploy production machine learning pipelines and deep learning models for intelligent automated analytics. You will work with PyTorch, TensorFlow, Scikit-learn, SQL, and LLMs to solve unstructured data classification and semantic retrieval challenges.',
    requiredSkills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'],
    preferredSkills: ['TensorFlow', 'LLMs', 'NLP', 'Docker', 'AWS', 'FastAPI', 'MLflow'],
    educationRequirement: 'Bachelor or Master in Computer Science, Data Science, or related STEM field',
    responsibilities: [
      'Architect end-to-end ML training and inference pipelines.',
      'Fine-tune Transformer models and vector semantic search retrieval systems.',
      'Collaborate with data engineers to optimize SQL data pipelines.',
      'Deploy scalable AI microservices with Docker and cloud infrastructure.'
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'active'
  },
  {
    id: 'job-2',
    title: 'Full Stack AI Product Engineer',
    company: 'Cognitive Cloud Labs',
    department: 'Product Engineering',
    location: 'Remote / New York, NY',
    type: 'Full-time',
    experienceYears: 2,
    description: 'Looking for a product-minded Full Stack Engineer skilled in React, TypeScript, Node.js/Python, and generative AI integration to build intelligent user interfaces and low-latency REST/GraphQL APIs.',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'REST APIs', 'PostgreSQL'],
    preferredSkills: ['Next.js', 'Docker', 'FastAPI', 'Gemini API', 'Vector Databases', 'Redis'],
    educationRequirement: 'Bachelor in Computer Science, Software Engineering, or equivalent practical experience',
    responsibilities: [
      'Build responsive, high-performance web applications using React and Tailwind.',
      'Develop robust backend APIs and integrate Generative AI capabilities.',
      'Optimize database queries and state management for real-time collaboration.'
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'active'
  }
];

const DEFAULT_DEMO_RESUMES: ParsedResume[] = [
  {
    id: 'res-1',
    fileName: 'Rahul_Sharma_DataScientist.pdf',
    fileSize: 142000,
    fileType: 'application/pdf',
    candidateName: 'Rahul Sharma',
    email: 'rahul.sharma@techlead.dev',
    phone: '+1 (415) 892-4412',
    location: 'San Jose, CA',
    summary: 'Lead Data Scientist with 4+ years of hands-on expertise building transformer-based NLP pipelines, vector retrieval engines, and scalable machine learning workflows in Python, PyTorch, and SQL.',
    skills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'NLP', 'FastAPI', 'Docker', 'MLflow', 'Git'],
    technicalSkills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'Hugging Face', 'SQL'],
    programmingLanguages: ['Python', 'SQL', 'C++'],
    frameworks: ['PyTorch', 'FastAPI', 'Flask', 'MLflow'],
    tools: ['Docker', 'Git', 'PostgreSQL', 'Weights & Biases', 'Jupyter'],
    experienceYears: 4.2,
    education: [
      {
        degree: 'M.S. in Computer Science (AI Specialization)',
        institution: 'Stanford University',
        year: '2021',
        field: 'Artificial Intelligence & Data Mining'
      },
      {
        degree: 'B.Tech in Computer Science',
        institution: 'IIT Bombay',
        year: '2019',
        field: 'Computer Science'
      }
    ],
    workExperience: [
      {
        role: 'Senior Machine Learning Engineer',
        company: 'Vectra Intelligence',
        duration: '2022 - Present',
        description: 'Engineered semantic document search and automated text categorization system serving 2M daily queries. Reduced model inference latency by 40% using ONNX runtime and PyTorch quantization.',
        technologies: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'Vector DB', 'SQL']
      },
      {
        role: 'Data Scientist',
        company: 'Apex Analytics',
        duration: '2020 - 2022',
        description: 'Developed predictive churn models and NLP sentiment classifiers using Scikit-learn and XGBoost, improving retention by 18%.',
        technologies: ['Python', 'Pandas', 'Scikit-learn', 'SQL', 'PostgreSQL']
      }
    ],
    projects: [
      {
        name: 'Neural Semantic Search Engine',
        description: 'Built an open-source neural search engine utilizing sentence-transformers and HNSW vector index with 94% Top-5 recall.',
        technologies: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
        link: 'github.com/rahul-sharma/neural-search'
      },
      {
        name: 'Automated Resume Ranking Pipeline',
        description: 'Created an explainable AI pipeline comparing unstructured candidate resumes with tech JDs using embeddings and LLM reasoning.',
        technologies: ['Python', 'Scikit-learn', 'Gemini API', 'Streamlit']
      }
    ],
    certifications: ['AWS Certified Machine Learning - Specialty', 'Deep Learning Specialization (Coursera)'],
    rawText: 'Rahul Sharma | Senior Data Scientist | rahul.sharma@techlead.dev | +1 (415) 892-4412 | San Jose, CA. Skills: Python, SQL, Machine Learning, PyTorch, Scikit-learn, Pandas, NumPy, NLP, FastAPI, Docker, MLflow.',
    uploadDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    parsingStatus: 'completed'
  },
  {
    id: 'res-2',
    fileName: 'Priya_Patil_ML_Engineer.pdf',
    fileSize: 128000,
    fileType: 'application/pdf',
    candidateName: 'Priya Patil',
    email: 'priya.patil@datasci.io',
    phone: '+1 (650) 334-1189',
    location: 'Seattle, WA',
    summary: 'Data Scientist & ML Researcher with 3.5 years of industry experience specializing in predictive analytics, PyTorch deep learning, feature engineering, and statistical modeling with high SQL fluency.',
    skills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'Tableau', 'AWS'],
    technicalSkills: ['Python', 'PyTorch', 'Scikit-learn', 'TensorFlow', 'Pandas', 'NumPy', 'SQL', 'AWS S3/EC2'],
    programmingLanguages: ['Python', 'R', 'SQL'],
    frameworks: ['PyTorch', 'TensorFlow', 'Keras', 'Django'],
    tools: ['AWS', 'Git', 'Tableau', 'Jupyter', 'PostgreSQL'],
    experienceYears: 3.5,
    education: [
      {
        degree: 'M.S. in Data Science',
        institution: 'University of Washington',
        year: '2022',
        field: 'Data Science & Machine Learning'
      },
      {
        degree: 'B.E. in Information Technology',
        institution: 'Pune University',
        year: '2020',
        field: 'Information Technology'
      }
    ],
    workExperience: [
      {
        role: 'Data Scientist II',
        company: 'CloudMetrics Inc.',
        duration: '2022 - Present',
        description: 'Trained and deployed deep neural networks on AWS for anomaly detection across 50TB+ time-series telemetry streams.',
        technologies: ['Python', 'PyTorch', 'AWS', 'SQL', 'Pandas']
      },
      {
        role: 'Junior ML Engineer',
        company: 'Synthetix Data',
        duration: '2021 - 2022',
        description: 'Conducted exploratory data analysis, built custom Scikit-learn pipelines, and maintained automated SQL reporting models.',
        technologies: ['Python', 'Scikit-learn', 'SQL', 'Tableau']
      }
    ],
    projects: [
      {
        name: 'Distributed PyTorch Anomaly Detector',
        description: 'Multi-GPU deep autoencoder for real-time sensor anomaly scoring.',
        technologies: ['Python', 'PyTorch', 'TensorFlow', 'AWS']
      }
    ],
    certifications: ['TensorFlow Developer Certificate', 'AWS Certified Cloud Practitioner'],
    rawText: 'Priya Patil | Data Scientist & ML Engineer | priya.patil@datasci.io | Seattle, WA. Skills: Python, SQL, Machine Learning, PyTorch, Pandas, NumPy, Scikit-learn, TensorFlow, AWS.',
    uploadDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    parsingStatus: 'completed'
  },
  {
    id: 'res-3',
    fileName: 'Aman_Kumar_PythonDev.docx',
    fileSize: 110000,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    candidateName: 'Aman Kumar',
    email: 'aman.kumar@devmail.org',
    phone: '+1 (408) 551-7723',
    location: 'Austin, TX',
    summary: 'Backend Software Engineer with 2.5 years of experience in Python, SQL, REST APIs, and basic Machine Learning pipeline integration. Passionate about data processing systems.',
    skills: ['Python', 'SQL', 'FastAPI', 'PostgreSQL', 'Scikit-learn', 'Pandas', 'NumPy', 'Docker', 'Git', 'Machine Learning'],
    technicalSkills: ['Python', 'FastAPI', 'Django', 'SQL', 'Scikit-learn', 'Pandas', 'NumPy', 'Redis'],
    programmingLanguages: ['Python', 'SQL', 'Bash'],
    frameworks: ['FastAPI', 'Django', 'Flask'],
    tools: ['Docker', 'Git', 'PostgreSQL', 'Redis', 'Linux'],
    experienceYears: 2.5,
    education: [
      {
        degree: 'B.S. in Computer Science',
        institution: 'University of Texas at Austin',
        year: '2022',
        field: 'Computer Science'
      }
    ],
    workExperience: [
      {
        role: 'Python Backend Engineer',
        company: 'DataFlow Systems',
        duration: '2022 - Present',
        description: 'Built high-throughput REST APIs and backend data processing jobs ingesting financial records with SQL query optimization.',
        technologies: ['Python', 'FastAPI', 'SQL', 'PostgreSQL', 'Docker']
      }
    ],
    projects: [
      {
        name: 'Automated Data Extraction Engine',
        description: 'Python tool for extracting tabular metrics from PDF reports into PostgreSQL.',
        technologies: ['Python', 'Pandas', 'SQL', 'FastAPI']
      }
    ],
    certifications: ['Python Certified Professional'],
    rawText: 'Aman Kumar | Python Backend Engineer | aman.kumar@devmail.org | Austin, TX. Skills: Python, SQL, FastAPI, PostgreSQL, Scikit-learn, Pandas, NumPy, Docker, Git, Machine Learning.',
    uploadDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    parsingStatus: 'completed'
  },
  {
    id: 'res-4',
    fileName: 'Sneha_Singh_FullStack.pdf',
    fileSize: 135000,
    fileType: 'application/pdf',
    candidateName: 'Sneha Singh',
    email: 'sneha.singh@codelab.net',
    phone: '+1 (312) 991-0421',
    location: 'Chicago, IL',
    summary: 'Full Stack & Frontend specialist with 2 years of experience building modern React, TypeScript, and Node.js applications with Tailwind CSS. Strong user experience mindset.',
    skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Tailwind CSS', 'HTML5/CSS3', 'REST APIs', 'PostgreSQL', 'Git', 'Python'],
    technicalSkills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Tailwind CSS', 'Redux Toolkit', 'Next.js', 'PostgreSQL'],
    programmingLanguages: ['TypeScript', 'JavaScript', 'Python', 'HTML/CSS'],
    frameworks: ['React', 'Next.js', 'Express', 'Tailwind CSS'],
    tools: ['Git', 'Vite', 'Figma', 'PostgreSQL', 'Docker'],
    experienceYears: 2.0,
    education: [
      {
        degree: 'B.S. in Software Engineering',
        institution: 'University of Illinois Urbana-Champaign',
        year: '2023',
        field: 'Software Engineering'
      }
    ],
    workExperience: [
      {
        role: 'Frontend / Full Stack Engineer',
        company: 'PixelCraft Digital',
        duration: '2023 - Present',
        description: 'Developed intuitive enterprise SaaS dashboard features in React, TypeScript, and Tailwind CSS. Implemented complex client-side state management and REST API integrations.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL']
      }
    ],
    projects: [
      {
        name: 'AI Document Explorer Web App',
        description: 'Interactive React application for visualizing and filtering AI-generated document summaries with real-time feedback.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js']
      }
    ],
    certifications: ['Meta Certified Front-End Developer'],
    rawText: 'Sneha Singh | Full Stack Developer | sneha.singh@codelab.net | Chicago, IL. Skills: React, TypeScript, JavaScript, Node.js, Tailwind CSS, HTML5/CSS3, REST APIs, PostgreSQL, Git, Python.',
    uploadDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    parsingStatus: 'completed'
  },
  {
    id: 'res-5',
    fileName: 'David_Chen_CloudDevOps.txt',
    fileSize: 85000,
    fileType: 'text/plain',
    candidateName: 'David Chen',
    email: 'david.chen@cloudops.tech',
    phone: '+1 (206) 714-8890',
    location: 'Seattle, WA',
    summary: 'Cloud Infrastructure & DevOps Engineer with 5 years experience maintaining Kubernetes clusters, CI/CD automation, and AWS cloud environments with Bash and Python scripting.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Python', 'Bash', 'Prometheus', 'Grafana'],
    technicalSkills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'GitLab CI', 'Linux', 'Python', 'Grafana'],
    programmingLanguages: ['Python', 'Bash', 'Go'],
    frameworks: ['Terraform', 'Ansible', 'Helm'],
    tools: ['Kubernetes', 'Docker', 'AWS', 'GitLab', 'Prometheus', 'Grafana'],
    experienceYears: 5.0,
    education: [
      {
        degree: 'B.S. in Information Systems',
        institution: 'University of Washington',
        year: '2020',
        field: 'Information Systems'
      }
    ],
    workExperience: [
      {
        role: 'Senior DevOps & Cloud Engineer',
        company: 'Skyline Cloud Systems',
        duration: '2021 - Present',
        description: 'Managed production Kubernetes infrastructure spanning 400+ nodes. Designed automated multi-region deployment pipelines on AWS.',
        technologies: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Python']
      }
    ],
    projects: [
      {
        name: 'Automated Multi-Cluster Disaster Recovery',
        description: 'Terraform and Python orchestration scripts for automated failover across AWS availability zones.',
        technologies: ['AWS', 'Terraform', 'Python', 'Docker']
      }
    ],
    certifications: ['AWS Certified Solutions Architect - Professional', 'Certified Kubernetes Administrator (CKA)'],
    rawText: 'David Chen | Cloud Infrastructure & DevOps Engineer | david.chen@cloudops.tech | Seattle, WA. Skills: AWS, Docker, Kubernetes, Terraform, CI/CD, Linux, Python, Bash, Prometheus, Grafana.',
    uploadDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    parsingStatus: 'completed'
  },
  {
    id: 'res-6',
    fileName: 'Ananya_Verma_JuniorAI.pdf',
    fileSize: 115000,
    fileType: 'application/pdf',
    candidateName: 'Ananya Verma',
    email: 'ananya.verma@gradai.org',
    phone: '+1 (510) 443-9081',
    location: 'Berkeley, CA',
    summary: 'Recent Graduate with strong academic foundation in Machine Learning, Python, PyTorch, and NLP. Completed multiple capstone projects in transformer fine-tuning.',
    skills: ['Python', 'PyTorch', 'Machine Learning', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'NLP', 'Git'],
    technicalSkills: ['Python', 'PyTorch', 'Hugging Face', 'Scikit-learn', 'SQL', 'Pandas', 'NumPy'],
    programmingLanguages: ['Python', 'SQL', 'Java'],
    frameworks: ['PyTorch', 'Flask'],
    tools: ['Git', 'Jupyter', 'Google Colab', 'Linux'],
    experienceYears: 1.0,
    education: [
      {
        degree: 'B.S. in Data Science & Statistics',
        institution: 'UC Berkeley',
        year: '2024',
        field: 'Data Science & Machine Learning'
      }
    ],
    workExperience: [
      {
        role: 'AI / ML Research Assistant',
        company: 'Berkeley AI Lab',
        duration: '2023 - 2024',
        description: 'Researched prompt optimization and fine-tuning techniques for small language models. Benchmarked semantic retrieval pipelines.',
        technologies: ['Python', 'PyTorch', 'NLP', 'Pandas']
      }
    ],
    projects: [
      {
        name: 'Domain-Specific LLM Fine-tuning',
        description: 'Fine-tuned LLaMA-2 model on biomedical dataset using LoRA with 12% accuracy improvement on QA benchmarks.',
        technologies: ['Python', 'PyTorch', 'Hugging Face']
      }
    ],
    certifications: ['DeepLearning.AI NLP Specialization'],
    rawText: 'Ananya Verma | Junior AI Researcher | ananya.verma@gradai.org | Berkeley, CA. Skills: Python, PyTorch, Machine Learning, SQL, Pandas, NumPy, Scikit-learn, NLP, Git.',
    uploadDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    parsingStatus: 'completed'
  }
];

const DEFAULT_DEMO_ANALYSES: CandidateAnalysis[] = [
  {
    id: 'ana-1',
    candidateId: 'res-1',
    jobId: 'job-1',
    candidateName: 'Rahul Sharma',
    email: 'rahul.sharma@techlead.dev',
    phone: '+1 (415) 892-4412',
    jobTitle: 'Senior Data Scientist & ML Engineer',
    resumeFileName: 'Rahul_Sharma_DataScientist.pdf',
    overallMatchScore: 94,
    skillsMatchScore: 96,
    experienceMatchScore: 95,
    educationMatchScore: 95,
    semanticSimilarityScore: 92,
    matchingSkills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'],
    missingSkills: [],
    matchedPreferredSkills: ['NLP', 'Docker', 'FastAPI', 'MLflow'],
    missingPreferredSkills: ['TensorFlow', 'AWS'],
    experienceYears: 4.2,
    requiredExperienceYears: 3,
    status: 'Shortlisted',
    notes: 'Exceptional match with strong PyTorch, NLP, and vector retrieval production background. Fast-track to technical round.',
    explanation: {
      strengths: [
        'Matches 100% of all required core skills (Python, SQL, Machine Learning, PyTorch, Scikit-learn, Pandas, NumPy).',
        'Demonstrated production track record deploying vector semantic search and quantized PyTorch pipelines.',
        'Exceeds minimum experience threshold (4.2 years vs. 3.0 required).',
        'Top-tier educational pedigree with M.S. from Stanford (AI specialization).'
      ],
      missingSkills: [
        'TensorFlow experience not explicitly highlighted in main projects (primarily PyTorch focused).',
        'Cloud infrastructure mentions are general Docker/Linux rather than dedicated AWS deployment.'
      ],
      matchingSkills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'NLP', 'Docker', 'FastAPI', 'MLflow'],
      weakAreas: ['AWS cloud-native services not explicitly detailed in recent role.'],
      recommendation: 'STRONG_MATCH',
      recommendationSummary: 'Outstanding candidate with deep neural semantic matching expertise and strong foundational skills. Highly recommended to advance directly to technical panel interview.',
      suggestedQuestions: [
        'How did you achieve a 40% latency reduction using ONNX runtime and PyTorch quantization in your previous role?',
        'Walk us through the architecture of your open-source neural search engine and how you handled vector indexing at scale.',
        'How would you transition our model deployments from Docker containers onto scalable AWS cloud microservices?'
      ],
      scoreBreakdownJustification: 'Full coverage of required skills (96%), relevant industry tenure exceeding requirement (95%), high semantic alignment on NLP/ML systems (92%), and relevant Master degree (95%).'
    },
    analyzedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    resumeData: DEFAULT_DEMO_RESUMES[0]
  },
  {
    id: 'ana-2',
    candidateId: 'res-2',
    jobId: 'job-1',
    candidateName: 'Priya Patil',
    email: 'priya.patil@datasci.io',
    phone: '+1 (650) 334-1189',
    jobTitle: 'Senior Data Scientist & ML Engineer',
    resumeFileName: 'Priya_Patil_ML_Engineer.pdf',
    overallMatchScore: 88,
    skillsMatchScore: 92,
    experienceMatchScore: 90,
    educationMatchScore: 90,
    semanticSimilarityScore: 84,
    matchingSkills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'],
    missingSkills: [],
    matchedPreferredSkills: ['TensorFlow', 'AWS'],
    missingPreferredSkills: ['LLMs', 'NLP', 'FastAPI', 'MLflow'],
    experienceYears: 3.5,
    requiredExperienceYears: 3,
    status: 'Screening',
    notes: 'Solid dual proficiency in PyTorch and TensorFlow with cloud AWS experience.',
    explanation: {
      strengths: [
        'Complete match across all 7 core required technical skills.',
        'Extensive experience on AWS telemetry anomaly detection at scale (50TB+ data).',
        'Strong academic background with M.S. in Data Science from UW.',
        'Solid dual proficiency in both PyTorch and TensorFlow frameworks.'
      ],
      missingSkills: [
        'No direct experience with generative LLMs or Transformer fine-tuning mentioned.',
        'Microservice frameworks like FastAPI or MLflow registry not prominent in resume.'
      ],
      matchingSkills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'TensorFlow', 'AWS'],
      weakAreas: ['Semantic search and modern LLM application development.'],
      recommendation: 'STRONG_MATCH',
      recommendationSummary: 'Very strong candidate with deep statistical and deep learning fundamentals combined with AWS deployment experience.',
      suggestedQuestions: [
        'Describe the deep neural network architecture you deployed on AWS for time-series anomaly detection.',
        'How do you manage feature store versioning and automated model retraining in production?'
      ],
      scoreBreakdownJustification: 'Complete core skill coverage (92%), meets experience requirement (90%), verified AWS/PyTorch experience.'
    },
    analyzedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    resumeData: DEFAULT_DEMO_RESUMES[1]
  },
  {
    id: 'ana-3',
    candidateId: 'res-3',
    jobId: 'job-1',
    candidateName: 'Aman Kumar',
    email: 'aman.kumar@devmail.org',
    phone: '+1 (408) 551-7723',
    jobTitle: 'Senior Data Scientist & ML Engineer',
    resumeFileName: 'Aman_Kumar_PythonDev.docx',
    overallMatchScore: 68,
    skillsMatchScore: 71,
    experienceMatchScore: 75,
    educationMatchScore: 80,
    semanticSimilarityScore: 58,
    matchingSkills: ['Python', 'SQL', 'Scikit-learn', 'Pandas', 'NumPy', 'Machine Learning'],
    missingSkills: ['PyTorch'],
    matchedPreferredSkills: ['FastAPI', 'Docker'],
    missingPreferredSkills: ['TensorFlow', 'LLMs', 'NLP', 'AWS', 'MLflow'],
    experienceYears: 2.5,
    requiredExperienceYears: 3,
    status: 'New',
    notes: 'Good backend Python foundation, but lacks deep neural network / PyTorch architecture experience required for Senior level.',
    explanation: {
      strengths: [
        'Solid Python, SQL, and FastAPI backend engineering capabilities.',
        'Experience building data extraction pipelines and relational database queries.',
        'Demonstrates understanding of basic Scikit-learn machine learning.'
      ],
      missingSkills: [
        'Missing required deep learning framework: PyTorch.',
        'No NLP, Transformer, or vector search background.',
        'Experience (2.5 years) slightly below the required 3.0 years.'
      ],
      matchingSkills: ['Python', 'SQL', 'Scikit-learn', 'Pandas', 'NumPy', 'Machine Learning', 'FastAPI', 'Docker'],
      weakAreas: ['Deep learning model architecture and neural network training.'],
      recommendation: 'NEEDS_REVIEW',
      recommendationSummary: 'Strong backend Python engineer with introductory ML knowledge. May be better suited for a Data Engineering or Backend AI integration role rather than Senior ML Data Scientist.',
      suggestedQuestions: [
        'What experience do you have training neural networks in PyTorch or TensorFlow?',
        'How would you structure a real-time vector similarity search service in Python?'
      ],
      scoreBreakdownJustification: 'Missing PyTorch (core requirement), lower semantic similarity on advanced ML algorithms, 2.5 years vs 3+ years required.'
    },
    analyzedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    resumeData: DEFAULT_DEMO_RESUMES[2]
  },
  {
    id: 'ana-4',
    candidateId: 'res-6',
    jobId: 'job-1',
    candidateName: 'Ananya Verma',
    email: 'ananya.verma@gradai.org',
    phone: '+1 (510) 443-9081',
    jobTitle: 'Senior Data Scientist & ML Engineer',
    resumeFileName: 'Ananya_Verma_JuniorAI.pdf',
    overallMatchScore: 64,
    skillsMatchScore: 85,
    experienceMatchScore: 40,
    educationMatchScore: 78,
    semanticSimilarityScore: 74,
    matchingSkills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'],
    missingSkills: [],
    matchedPreferredSkills: ['NLP'],
    missingPreferredSkills: ['TensorFlow', 'LLMs', 'Docker', 'AWS', 'FastAPI', 'MLflow'],
    experienceYears: 1.0,
    requiredExperienceYears: 3,
    status: 'New',
    notes: 'High technical skill aptitude and NLP research experience, but lacks the 3+ years required for a Senior position.',
    explanation: {
      strengths: [
        'Possesses all core required technical skills including PyTorch and NLP.',
        'High academic quality research on LLM fine-tuning and LoRA techniques at UC Berkeley.',
        'Strong conceptual foundation in modern AI.'
      ],
      missingSkills: [
        'Significant experience gap (1.0 year vs 3.0 years required).',
        'Lacks production microservice and cloud infrastructure (Docker, AWS, MLflow).'
      ],
      matchingSkills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'NLP'],
      weakAreas: ['Production-grade distributed deployment and industry tenure.'],
      recommendation: 'NEEDS_REVIEW',
      recommendationSummary: 'High potential candidate with excellent ML/PyTorch skills. Strongly recommend considering for an Associate/Junior Data Scientist role.',
      suggestedQuestions: [
        'Tell us about your experience fine-tuning LLaMA-2 with LoRA.',
        'How would you transition research code into a production CI/CD deployment?'
      ],
      scoreBreakdownJustification: 'Strong skill match (85%), but penalized heavily on experience years (40% match) for senior role.'
    },
    analyzedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    resumeData: DEFAULT_DEMO_RESUMES[5]
  },
  {
    id: 'ana-5',
    candidateId: 'res-5',
    jobId: 'job-1',
    candidateName: 'David Chen',
    email: 'david.chen@cloudops.tech',
    phone: '+1 (206) 714-8890',
    jobTitle: 'Senior Data Scientist & ML Engineer',
    resumeFileName: 'David_Chen_CloudDevOps.txt',
    overallMatchScore: 42,
    skillsMatchScore: 28,
    experienceMatchScore: 85,
    educationMatchScore: 75,
    semanticSimilarityScore: 32,
    matchingSkills: ['Python'],
    missingSkills: ['SQL', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'],
    matchedPreferredSkills: ['Docker', 'AWS'],
    missingPreferredSkills: ['TensorFlow', 'LLMs', 'NLP', 'FastAPI', 'MLflow'],
    experienceYears: 5.0,
    requiredExperienceYears: 3,
    status: 'Rejected',
    notes: 'Candidate is an experienced Cloud DevOps/Infrastructure specialist, not an ML/Data Scientist.',
    explanation: {
      strengths: [
        '5+ years of robust cloud engineering and Kubernetes infrastructure experience.',
        'Strong Python scripting and automation skills.'
      ],
      missingSkills: [
        'Missing virtually all data science & ML requirements: PyTorch, Scikit-learn, Machine Learning, Pandas, NumPy, SQL data modeling.'
      ],
      matchingSkills: ['Python', 'Docker', 'AWS'],
      weakAreas: ['Machine Learning algorithms, Data Science modeling, Statistical analytics.'],
      recommendation: 'NOT_RECOMMENDED',
      recommendationSummary: 'Candidate profile is centered on DevOps, Terraform, and Kubernetes infrastructure rather than Data Science or Machine Learning. Not suitable for this role.',
      suggestedQuestions: [
        'Are you interested in infrastructure/MLOps roles supporting machine learning clusters rather than modeling?'
      ],
      scoreBreakdownJustification: 'Critical mismatch in core technical domain (28% skill match, 32% semantic similarity).'
    },
    analyzedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    resumeData: DEFAULT_DEMO_RESUMES[4]
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database file, initializing defaults:', err);
    }
    const initial: DatabaseSchema = {
      users: [
        {
          id: 'user-1',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@talentai.io',
          role: 'recruiter',
          createdAt: new Date().toISOString()
        }
      ],
      jobs: DEFAULT_DEMO_JOBS,
      resumes: DEFAULT_DEMO_RESUMES,
      analyses: DEFAULT_DEMO_ANALYSES,
      activities: [
        {
          id: 'act-1',
          type: 'analysis',
          title: 'Semantic Screening Completed',
          description: 'Screened 5 candidate resumes for Senior Data Scientist & ML Engineer position.',
          timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
        },
        {
          id: 'act-2',
          type: 'status_change',
          title: 'Candidate Shortlisted',
          description: 'Rahul Sharma shortlisted with 94% match score.',
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
          id: 'act-3',
          type: 'upload',
          title: 'Batch Resume Upload',
          description: 'Uploaded 6 unstructured technical resumes in PDF, DOCX, and TXT formats.',
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
        }
      ]
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Activity Log
  addActivity(type: 'upload' | 'analysis' | 'status_change' | 'job_created', title: string, description: string) {
    const act = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString()
    };
    this.data.activities.unshift(act);
    if (this.data.activities.length > 50) this.data.activities.pop();
    this.saveData(this.data);
    return act;
  }

  getActivities() {
    return this.data.activities;
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User): User {
    this.data.users.push(user);
    this.saveData(this.data);
    return user;
  }

  // Jobs
  getJobs(): Job[] {
    return this.data.jobs.map(job => {
      const candidateCount = this.data.analyses.filter(a => a.jobId === job.id).length;
      return { ...job, candidateCount };
    });
  }

  getJobById(id: string): Job | undefined {
    const job = this.data.jobs.find(j => j.id === id);
    if (!job) return undefined;
    const candidateCount = this.data.analyses.filter(a => a.jobId === job.id).length;
    return { ...job, candidateCount };
  }

  addJob(job: Job): Job {
    this.data.jobs.unshift(job);
    this.addActivity('job_created', `New Job Created: ${job.title}`, `Created job posting for ${job.company} (${job.department})`);
    this.saveData(this.data);
    return job;
  }

  deleteJob(id: string): boolean {
    const idx = this.data.jobs.findIndex(j => j.id === id);
    if (idx === -1) return false;
    this.data.jobs.splice(idx, 1);
    this.data.analyses = this.data.analyses.filter(a => a.jobId !== id);
    this.saveData(this.data);
    return true;
  }

  // Resumes
  getResumes(): ParsedResume[] {
    return this.data.resumes;
  }

  getResumeById(id: string): ParsedResume | undefined {
    return this.data.resumes.find(r => r.id === id);
  }

  addResume(resume: ParsedResume): ParsedResume {
    const existingIndex = this.data.resumes.findIndex(r => r.id === resume.id);
    if (existingIndex >= 0) {
      this.data.resumes[existingIndex] = resume;
    } else {
      this.data.resumes.unshift(resume);
    }
    this.saveData(this.data);
    return resume;
  }

  deleteResume(id: string): boolean {
    const idx = this.data.resumes.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.resumes.splice(idx, 1);
    this.data.analyses = this.data.analyses.filter(a => a.candidateId !== id);
    this.saveData(this.data);
    return true;
  }

  // Candidate Analyses
  getAnalyses(jobId?: string): CandidateAnalysis[] {
    if (jobId) {
      return this.data.analyses.filter(a => a.jobId === jobId);
    }
    return this.data.analyses;
  }

  getAnalysisById(id: string): CandidateAnalysis | undefined {
    return this.data.analyses.find(a => a.id === id || a.candidateId === id);
  }

  saveAnalysis(analysis: CandidateAnalysis): CandidateAnalysis {
    const idx = this.data.analyses.findIndex(a => a.id === analysis.id || (a.candidateId === analysis.candidateId && a.jobId === analysis.jobId));
    if (idx >= 0) {
      this.data.analyses[idx] = analysis;
    } else {
      this.data.analyses.unshift(analysis);
    }
    this.saveData(this.data);
    return analysis;
  }

  updateCandidateStatus(candidateId: string, jobId: string, status: CandidateStatus, notes?: string): CandidateAnalysis | undefined {
    const analysis = this.data.analyses.find(a => a.candidateId === candidateId && (!jobId || a.jobId === jobId));
    if (!analysis) return undefined;
    analysis.status = status;
    if (notes !== undefined) {
      analysis.notes = notes;
    }
    this.addActivity('status_change', `Status Updated to ${status}`, `${analysis.candidateName} status changed to ${status}`);
    this.saveData(this.data);
    return analysis;
  }

  updateCandidateNotes(id: string, notes: string): CandidateAnalysis | undefined {
    const analysis = this.data.analyses.find(a => a.id === id || a.candidateId === id);
    if (!analysis) return undefined;
    analysis.notes = notes;
    this.saveData(this.data);
    return analysis;
  }

  // Reset / Seed Demo
  seedDemo(): { jobs: number; resumes: number; analyses: number } {
    this.data.jobs = [...DEFAULT_DEMO_JOBS];
    this.data.resumes = [...DEFAULT_DEMO_RESUMES];
    this.data.analyses = [...DEFAULT_DEMO_ANALYSES];
    this.addActivity('upload', 'Demo Environment Re-seeded', 'Reset database with standard realistic technical screening benchmark data.');
    this.saveData(this.data);
    return {
      jobs: this.data.jobs.length,
      resumes: this.data.resumes.length,
      analyses: this.data.analyses.length
    };
  }
}

export const db = new Database();
