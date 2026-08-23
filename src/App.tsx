import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar, NavTab } from './components/Sidebar.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { RankingPage } from './pages/RankingPage.js';
import { PipelinePage } from './pages/PipelinePage.js';
import { JobsPage } from './pages/JobsPage.js';
import { UploadPage } from './pages/UploadPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { CandidateDetailsModal } from './components/CandidateDetailsModal.js';
import { CandidateCompareModal } from './components/CandidateCompareModal.js';
import { CreateJobModal } from './components/CreateJobModal.js';
import { AIChatDrawer } from './components/AIChatDrawer.js';
import { Job, ParsedResume, CandidateAnalysis, DashboardStats, CandidateStatus } from './types.js';
import { api } from './services/api.js';
import { Loader2 } from 'lucide-react';

export function App() {
  const { user, loading: authLoading } = useAuth();
  // Application Data State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [resumes, setResumes] = useState<ParsedResume[]>([]);
  const [candidates, setCandidates] = useState<CandidateAnalysis[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Modals & Drawers
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAnalysis | null>(null);
  const [compareCandidatesList, setCompareCandidatesList] = useState<CandidateAnalysis[]>([]);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState<boolean>(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);

  // Fetch all core application data
  const loadAppData = useCallback(async () => {
    try {
      const [jobsRes, resumesRes, candidatesRes, statsRes] = await Promise.all([
        api.getJobs(),
        api.getResumes(),
        api.getCandidates(),
        api.getDashboardStats()
      ]);

      setJobs(jobsRes.jobs);
      setResumes(resumesRes.resumes);
      setCandidates(candidatesRes.candidates);
      setStats(statsRes);

      if (jobsRes.jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsRes.jobs[0].id);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setInitialLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    if (user) {
      loadAppData();
    }
  }, [user, loadAppData]);

  // Run Semantic Analysis
  const handleRefreshAnalysis = async (jobId: string) => {
    try {
      await api.runSemanticAnalysis(jobId);
      await loadAppData();
    } catch (err) {
      console.error('Failed to refresh analysis:', err);
    }
  };

  // Status Change
  const handleStatusChange = (id: string, newStatus: CandidateStatus, notes?: string) => {
    setCandidates(prev =>
      prev.map(c => (c.candidateId === id ? { ...c, status: newStatus, notes: notes ?? c.notes } : c))
    );
    if (selectedCandidate && selectedCandidate.candidateId === id) {
      setSelectedCandidate(prev => prev ? { ...prev, status: newStatus, notes: notes ?? prev.notes } : null);
    }
    // Refresh stats in background
    api.getDashboardStats().then(setStats).catch(console.error);
  };

  // Resumes Uploaded
  const handleResumesUploaded = (newResumes: ParsedResume[]) => {
    setResumes(prev => [...newResumes, ...prev]);
    loadAppData();
  };

  // Resume Deleted
  const handleDeleteResume = async (id: string) => {
    try {
      await api.deleteResume(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      setCandidates(prev => prev.filter(c => c.candidateId !== id));
      loadAppData();
    } catch (e) {
      console.error(e);
    }
  };

  // Job Created
  const handleJobCreated = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    loadAppData();
  };

  // Job Deleted
  const handleDeleteJob = async (id: string) => {
    try {
      await api.deleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      if (selectedJobId === id) {
        setSelectedJobId(jobs[0]?.id || '');
      }
      loadAppData();
    } catch (e) {
      console.error(e);
    }
  };

  // Wait for the automatic demo session before loading application data.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs text-zinc-500 font-medium">Initializing Neural Engine...</p>
        </div>
      </div>
    );
  }

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        jobs={jobs}
        selectedJobId={selectedJobId}
        onSelectJob={(id) => setSelectedJobId(id)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateJob={() => setIsCreateJobOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'assistant') {
              setIsAIChatOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          candidateCount={candidates.length}
          jobCount={jobs.length}
          resumeCount={resumes.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {initialLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-xs text-slate-500 font-semibold">Loading applicant pool & semantic vectors...</p>
              </div>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardPage
                  stats={stats}
                  onNavigate={setCurrentTab}
                  onSelectCandidate={(c) => setSelectedCandidate(c)}
                  onSelectJob={(jId) => {
                    setSelectedJobId(jId);
                    setCurrentTab('ranking');
                  }}
                  jobs={jobs}
                />
              )}

              {currentTab === 'ranking' && (
                <RankingPage
                  jobs={jobs}
                  selectedJobId={selectedJobId}
                  onSelectJob={setSelectedJobId}
                  candidates={candidates}
                  onSelectCandidate={(c) => setSelectedCandidate(c)}
                  onCompareCandidates={(list) => setCompareCandidatesList(list)}
                  onRefreshAnalysis={handleRefreshAnalysis}
                  onStatusChange={handleStatusChange}
                />
              )}

              {currentTab === 'pipeline' && (
                <PipelinePage
                  jobs={jobs}
                  selectedJobId={selectedJobId}
                  onSelectJob={setSelectedJobId}
                  candidates={candidates}
                  onSelectCandidate={(c) => setSelectedCandidate(c)}
                  onStatusChange={handleStatusChange}
                />
              )}

              {currentTab === 'jobs' && (
                <JobsPage
                  jobs={jobs}
                  onOpenCreateJob={() => setIsCreateJobOpen(true)}
                  onSelectJobForScreening={(jId) => {
                    setSelectedJobId(jId);
                    setCurrentTab('ranking');
                  }}
                  onDeleteJob={handleDeleteJob}
                />
              )}

              {currentTab === 'upload' && (
                <UploadPage
                  resumes={resumes}
                  onResumesUploaded={handleResumesUploaded}
                  onDeleteResume={handleDeleteResume}
                  onNavigateToRanking={() => setCurrentTab('ranking')}
                />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsPage
                  stats={stats}
                  candidates={candidates}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsPage onReseed={loadAppData} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Deep-Dive Explainable AI Candidate Details Modal */}
      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Side-by-Side Candidate Comparison Matrix Modal */}
      {compareCandidatesList.length > 0 && (
        <CandidateCompareModal
          candidates={compareCandidatesList}
          onClose={() => setCompareCandidatesList([])}
          onOpenDetails={(cand) => {
            setCompareCandidatesList([]);
            setSelectedCandidate(cand);
          }}
        />
      )}

      {/* Create Job Description Modal with AI Enhancer */}
      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
        onJobCreated={handleJobCreated}
      />

      {/* AI Recruiter Assistant Slide-Over Drawer */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        currentJob={currentJob}
        candidates={candidates}
        onSelectCandidate={(cand) => {
          setIsAIChatOpen(false);
          setSelectedCandidate(cand);
        }}
      />
    </div>
  );
}

export default App;
