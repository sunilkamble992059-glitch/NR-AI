import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="recruiter")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    jobs = relationship("Job", back_populates="creator")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    department = Column(String, default="Engineering")
    location = Column(String, default="Remote")
    type = Column(String, default="Full-time")
    experience_years = Column(Float, default=2.0)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    education_requirement = Column(String, nullable=True)
    responsibilities = Column(JSON, default=list)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    creator = relationship("User", back_populates="jobs")
    analyses = relationship("CandidateAnalysis", back_populates="job")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, default=0)
    file_type = Column(String, default="application/pdf")
    candidate_name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    skills = Column(JSON, default=list)
    technical_skills = Column(JSON, default=list)
    programming_languages = Column(JSON, default=list)
    frameworks = Column(JSON, default=list)
    tools = Column(JSON, default=list)
    experience_years = Column(Float, default=0.0)
    education = Column(JSON, default=list)
    work_experience = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    raw_text = Column(Text, nullable=True)
    parsing_status = Column(String, default="completed")
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)

    analyses = relationship("CandidateAnalysis", back_populates="resume")

class CandidateAnalysis(Base):
    __tablename__ = "candidate_analyses"

    id = Column(String, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("resumes.id"))
    job_id = Column(String, ForeignKey("jobs.id"))
    candidate_name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    job_title = Column(String, nullable=False)
    resume_file_name = Column(String, nullable=True)

    overall_match_score = Column(Float, default=0.0)
    skills_match_score = Column(Float, default=0.0)
    experience_match_score = Column(Float, default=0.0)
    education_match_score = Column(Float, default=0.0)
    semantic_similarity_score = Column(Float, default=0.0)

    matching_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    matched_preferred_skills = Column(JSON, default=list)
    missing_preferred_skills = Column(JSON, default=list)

    experience_years = Column(Float, default=0.0)
    required_experience_years = Column(Float, default=0.0)

    status = Column(String, default="New") # New, Screening, Shortlisted, Interview, Rejected
    notes = Column(Text, nullable=True)
    explanation = Column(JSON, default=dict)
    analyzed_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")
    job = relationship("Job", back_populates="analyses")
