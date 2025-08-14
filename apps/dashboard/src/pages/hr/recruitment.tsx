import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Modal, Input, Select, Table, Badge } from '@/components/ui';
import { hrService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'entry' | 'mid' | 'senior' | 'executive';
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  benefits: string[];
  status: 'draft' | 'published' | 'closed' | 'filled';
  applications: number;
  postedDate: string;
  closingDate: string;
  hiringManager: string;
  createdAt: string;
}

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
  };
  resume: {
    filename: string;
    url: string;
  };
  coverLetter?: string;
  status: 'submitted' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  appliedDate: string;
  experience: number; // years
  education: string;
  skills: string[];
  notes?: string;
  interviews: Array<{
    type: 'phone' | 'video' | 'in-person' | 'technical';
    date: string;
    interviewer: string;
    feedback?: string;
    rating?: number;
  }>;
  score?: number;
}

interface OnboardingChecklist {
  employeeId: string;
  employee: string;
  department: string;
  startDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  buddy: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    category: 'documentation' | 'training' | 'equipment' | 'system-access' | 'orientation';
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
    assignedTo: string;
  }>;
}

const RecruitmentPage: NextPage = () => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [onboardingList, setOnboardingList] = useState<OnboardingChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'job' | 'application' | 'onboarding'>('job');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'onboarding'>('jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    location: 'Accra, Ghana',
    type: 'full-time',
    level: 'mid',
    description: '',
    requirements: '',
    responsibilities: '',
    salaryMin: 0,
    salaryMax: 0,
    benefits: '',
    closingDate: '',
    hiringManager: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, applicationsData, onboardingData] = await Promise.all([
        hrService.getJobPostings?.() || Promise.resolve([]),
        hrService.getJobApplications?.() || Promise.resolve([]),
        hrService.getOnboardingTasks?.() || Promise.resolve([])
      ]);
      
      setJobPostings(jobsData || generateMockJobs());
      setApplications(applicationsData || generateMockApplications());
      setOnboardingList(onboardingData || generateMockOnboarding());
    } catch (error) {
      setJobPostings(generateMockJobs());
      setApplications(generateMockApplications());
      setOnboardingList(generateMockOnboarding());
      toast.error('Failed to load recruitment data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockJobs = (): JobPosting[] => [
    {
      id: 'job1',
      title: 'Fleet Operations Manager',
      department: 'Operations',
      location: 'Accra, Ghana',
      type: 'full-time',
      level: 'senior',
      description: 'Lead fleet operations for petroleum distribution across Ghana. Oversee vehicle maintenance, driver management, and delivery optimization.',
      requirements: ['Bachelor\'s degree in Logistics/Operations', '5+ years fleet management experience', 'Knowledge of GPS tracking systems', 'Strong leadership skills'],
      responsibilities: ['Manage fleet of 50+ vehicles', 'Optimize delivery routes', 'Ensure compliance with safety regulations', 'Lead team of 15+ staff'],
      salary: { min: 15000, max: 20000, currency: 'GHS' },
      benefits: ['Health insurance', 'Performance bonus', 'Company vehicle', 'Professional development'],
      status: 'published',
      applications: 23,
      postedDate: '2024-01-15',
      closingDate: '2024-02-15',
      hiringManager: 'Sarah Johnson',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: 'job2',
      title: 'Financial Analyst',
      department: 'Finance',
      location: 'Accra, Ghana',
      type: 'full-time',
      level: 'mid',
      description: 'Analyze financial data, prepare reports, and support strategic decision-making for petroleum operations.',
      requirements: ['Bachelor\'s in Finance/Accounting', 'CPA/ACCA preferred', '3+ years experience', 'Advanced Excel skills'],
      responsibilities: ['Financial reporting', 'Budget analysis', 'Cost optimization', 'Regulatory compliance'],
      salary: { min: 8000, max: 12000, currency: 'GHS' },
      benefits: ['Health insurance', 'Study support', 'Annual bonus'],
      status: 'published',
      applications: 41,
      postedDate: '2024-01-20',
      closingDate: '2024-02-20',
      hiringManager: 'John Smith',
      createdAt: '2024-01-20T10:30:00Z'
    }
  ];

  const generateMockApplications = (): JobApplication[] => [
    {
      id: 'app1',
      jobId: 'job1',
      jobTitle: 'Fleet Operations Manager',
      candidate: {
        firstName: 'Michael',
        lastName: 'Osei',
        email: 'michael.osei@email.com',
        phone: '+233-24-123-4567',
        location: 'Accra, Ghana',
        linkedIn: 'linkedin.com/in/michaelosei'
      },
      resume: {
        filename: 'michael_osei_resume.pdf',
        url: '/resumes/michael_osei.pdf'
      },
      coverLetter: 'I am excited to apply for the Fleet Operations Manager position...',
      status: 'interviewing',
      appliedDate: '2024-01-18T14:30:00Z',
      experience: 7,
      education: 'Bachelor of Science in Logistics Management',
      skills: ['Fleet Management', 'GPS Systems', 'Team Leadership', 'Route Optimization'],
      notes: 'Strong candidate with relevant experience at competing company.',
      interviews: [
        {
          type: 'phone',
          date: '2024-01-25T10:00:00Z',
          interviewer: 'Sarah Johnson',
          feedback: 'Excellent communication and relevant experience',
          rating: 4
        },
        {
          type: 'in-person',
          date: '2024-01-30T14:00:00Z',
          interviewer: 'David Wilson',
          feedback: 'Technical knowledge is strong, good leadership potential',
          rating: 5
        }
      ],
      score: 85
    },
    {
      id: 'app2',
      jobId: 'job2',
      jobTitle: 'Financial Analyst',
      candidate: {
        firstName: 'Grace',
        lastName: 'Adjei',
        email: 'grace.adjei@email.com',
        phone: '+233-20-987-6543',
        location: 'Kumasi, Ghana'
      },
      resume: {
        filename: 'grace_adjei_resume.pdf',
        url: '/resumes/grace_adjei.pdf'
      },
      status: 'screening',
      appliedDate: '2024-01-22T09:15:00Z',
      experience: 4,
      education: 'Bachelor of Commerce in Finance, ACCA Part-Qualified',
      skills: ['Financial Analysis', 'Excel', 'SAP', 'Budgeting', 'Reporting'],
      interviews: [],
      score: 78
    }
  ];

  const generateMockOnboarding = (): OnboardingChecklist[] => [
    {
      employeeId: 'emp001',
      employee: 'James Kwarteng',
      department: 'Operations',
      startDate: '2024-02-01',
      status: 'in-progress',
      progress: 65,
      buddy: 'Kwame Asante',
      tasks: [
        {
          id: 'task1',
          title: 'Complete Employment Documentation',
          description: 'Submit all required forms and documents',
          category: 'documentation',
          status: 'completed',
          dueDate: '2024-02-01',
          assignedTo: 'HR Team'
        },
        {
          id: 'task2',
          title: 'IT Equipment Setup',
          description: 'Laptop, phone, and access cards',
          category: 'equipment',
          status: 'completed',
          dueDate: '2024-02-01',
          assignedTo: 'IT Department'
        },
        {
          id: 'task3',
          title: 'Safety Training',
          description: 'Complete mandatory safety orientation',
          category: 'training',
          status: 'in-progress',
          dueDate: '2024-02-05',
          assignedTo: 'Safety Officer'
        },
        {
          id: 'task4',
          title: 'System Access Setup',
          description: 'ERP system and email access',
          category: 'system-access',
          status: 'pending',
          dueDate: '2024-02-03',
          assignedTo: 'IT Department'
        }
      ]
    }
  ];

  const filteredJobs = jobPostings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || job.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.candidate.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'published': return 'primary';
      case 'closed': return 'warning';
      case 'filled': return 'success';
      case 'submitted': return 'primary';
      case 'screening': return 'warning';
      case 'interviewing': return 'purple';
      case 'offered': return 'success';
      case 'hired': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      case 'in-progress': return 'primary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const handleCreateJob = () => {
    setModalType('job');
    setJobForm({
      title: '',
      department: '',
      location: 'Accra, Ghana',
      type: 'full-time',
      level: 'mid',
      description: '',
      requirements: '',
      responsibilities: '',
      salaryMin: 0,
      salaryMax: 0,
      benefits: '',
      closingDate: '',
      hiringManager: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveJob = async () => {
    try {
      await hrService.createJobPosting?.(jobForm);
      toast.success('Job posting created successfully');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create job posting');
    }
  };

  const departments = [...new Set(jobPostings.map(job => job.department))];

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Recruitment & Onboarding</h1>
            <p className="text-dark-400 mt-2">
              Manage job postings, applications, and employee onboarding process
            </p>
          </div>
          
          <Button variant="primary" onClick={handleCreateJob}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post Job
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Open Positions</p>
                  <p className="text-2xl font-bold text-white">{jobPostings.filter(j => j.status === 'published').length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Applications</p>
                  <p className="text-2xl font-bold text-white">{applications.length}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">In Interview</p>
                  <p className="text-2xl font-bold text-white">
                    {applications.filter(a => a.status === 'interviewing').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Onboarding</p>
                  <p className="text-2xl font-bold text-white">
                    {onboardingList.filter(o => o.status === 'in-progress').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {[
            { key: 'jobs', label: 'Job Postings' },
            { key: 'applications', label: 'Applications' },
            { key: 'onboarding', label: 'Onboarding' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={
                    activeTab === 'jobs' ? 'Search job titles...' :
                    activeTab === 'applications' ? 'Search candidates...' :
                    'Search employees...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={
                  activeTab === 'jobs' ? [
                    { value: 'all', label: 'All Status' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'closed', label: 'Closed' },
                    { value: 'filled', label: 'Filled' }
                  ] : activeTab === 'applications' ? [
                    { value: 'all', label: 'All Status' },
                    { value: 'submitted', label: 'Submitted' },
                    { value: 'screening', label: 'Screening' },
                    { value: 'interviewing', label: 'Interviewing' },
                    { value: 'offered', label: 'Offered' },
                    { value: 'hired', label: 'Hired' },
                    { value: 'rejected', label: 'Rejected' }
                  ] : [
                    { value: 'all', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' }
                  ]
                }
                className="w-full md:w-48"
              />
              {activeTab === 'jobs' && (
                <Select
                  value={filterDepartment}
                  onChange={setFilterDepartment}
                  options={[
                    { value: 'all', label: 'All Departments' },
                    ...departments.map(dept => ({ value: dept, label: dept }))
                  ]}
                  className="w-full md:w-48"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content based on active tab */}
        {activeTab === 'jobs' && (
          <Card>
            <CardHeader title="Job Postings" />
            <CardContent>
              <Table
                headers={[
                  { key: 'job', label: 'Job Title' },
                  { key: 'department', label: 'Department' },
                  { key: 'type', label: 'Type' },
                  { key: 'applications', label: 'Applications' },
                  { key: 'posted', label: 'Posted Date' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions' }
                ]}
                data={filteredJobs.map(job => ({
                  job: (
                    <div>
                      <p className="font-medium text-white">{job.title}</p>
                      <p className="text-sm text-dark-400">{job.location}</p>
                      <p className="text-xs text-green-400">
                        GHS {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                      </p>
                    </div>
                  ),
                  department: (
                    <Badge variant="outline" className="capitalize">
                      {job.department}
                    </Badge>
                  ),
                  type: (
                    <div>
                      <Badge variant="secondary" className="capitalize mb-1">
                        {job.type.replace('-', ' ')}
                      </Badge>
                      <p className="text-xs text-dark-400 capitalize">{job.level}</p>
                    </div>
                  ),
                  applications: (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{job.applications}</p>
                      <p className="text-xs text-dark-400">applicants</p>
                    </div>
                  ),
                  posted: (
                    <div>
                      <p className="text-white">{new Date(job.postedDate).toLocaleDateString()}</p>
                      <p className="text-xs text-dark-400">
                        Closes: {new Date(job.closingDate).toLocaleDateString()}
                      </p>
                    </div>
                  ),
                  status: (
                    <Badge variant={getStatusColor(job.status)} className="capitalize">
                      {job.status}
                    </Badge>
                  ),
                  actions: (
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  )
                }))}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'applications' && (
          <Card>
            <CardHeader title="Job Applications" />
            <CardContent>
              <Table
                headers={[
                  { key: 'candidate', label: 'Candidate' },
                  { key: 'job', label: 'Position' },
                  { key: 'experience', label: 'Experience' },
                  { key: 'applied', label: 'Applied Date' },
                  { key: 'score', label: 'Score' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions' }
                ]}
                data={filteredApplications.map(app => ({
                  candidate: (
                    <div>
                      <p className="font-medium text-white">
                        {app.candidate.firstName} {app.candidate.lastName}
                      </p>
                      <p className="text-sm text-dark-400">{app.candidate.email}</p>
                      <p className="text-xs text-dark-500">{app.candidate.location}</p>
                    </div>
                  ),
                  job: (
                    <p className="font-medium text-white">{app.jobTitle}</p>
                  ),
                  experience: (
                    <div>
                      <p className="text-white">{app.experience} years</p>
                      <p className="text-xs text-dark-400">{app.education}</p>
                    </div>
                  ),
                  applied: (
                    <p className="text-white">{new Date(app.appliedDate).toLocaleDateString()}</p>
                  ),
                  score: app.score ? (
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-400">{app.score}</p>
                      <div className="w-12 bg-dark-600 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${app.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-dark-400">-</span>
                  ),
                  status: (
                    <Badge variant={getStatusColor(app.status)} className="capitalize">
                      {app.status.replace('-', ' ')}
                    </Badge>
                  ),
                  actions: (
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      {app.status === 'screening' && (
                        <Button variant="primary" size="sm">
                          Interview
                        </Button>
                      )}
                      {app.status === 'interviewing' && (
                        <Button variant="success" size="sm">
                          Offer
                        </Button>
                      )}
                    </div>
                  )
                }))}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'onboarding' && (
          <Card>
            <CardHeader title="Employee Onboarding" />
            <CardContent>
              <Table
                headers={[
                  { key: 'employee', label: 'New Employee' },
                  { key: 'department', label: 'Department' },
                  { key: 'startDate', label: 'Start Date' },
                  { key: 'progress', label: 'Progress' },
                  { key: 'buddy', label: 'Buddy' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions' }
                ]}
                data={onboardingList.map(item => ({
                  employee: (
                    <p className="font-medium text-white">{item.employee}</p>
                  ),
                  department: (
                    <Badge variant="outline">{item.department}</Badge>
                  ),
                  startDate: (
                    <p className="text-white">{new Date(item.startDate).toLocaleDateString()}</p>
                  ),
                  progress: (
                    <div>
                      <p className="text-white">{item.progress}%</p>
                      <div className="w-16 bg-dark-600 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-dark-400 mt-1">
                        {item.tasks.filter(t => t.status === 'completed').length}/{item.tasks.length} tasks
                      </p>
                    </div>
                  ),
                  buddy: (
                    <p className="text-white">{item.buddy}</p>
                  ),
                  status: (
                    <Badge variant={getStatusColor(item.status)} className="capitalize">
                      {item.status.replace('-', ' ')}
                    </Badge>
                  ),
                  actions: (
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View Tasks
                      </Button>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                  )
                }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Job Posting Modal */}
        <Modal
          isOpen={isModalOpen && modalType === 'job'}
          onClose={() => setIsModalOpen(false)}
          title="Create Job Posting"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Job Title"
                type="text"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
              
              <Input
                label="Department"
                type="text"
                value={jobForm.department}
                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Location"
                type="text"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                required
              />
              
              <Select
                label="Job Type"
                value={jobForm.type}
                onChange={(value) => setJobForm({ ...jobForm, type: value as any })}
                options={[
                  { value: 'full-time', label: 'Full Time' },
                  { value: 'part-time', label: 'Part Time' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'internship', label: 'Internship' }
                ]}
                required
              />
              
              <Select
                label="Level"
                value={jobForm.level}
                onChange={(value) => setJobForm({ ...jobForm, level: value as any })}
                options={[
                  { value: 'entry', label: 'Entry Level' },
                  { value: 'mid', label: 'Mid Level' },
                  { value: 'senior', label: 'Senior Level' },
                  { value: 'executive', label: 'Executive' }
                ]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Job Description</label>
              <textarea
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Requirements</label>
                <textarea
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter each requirement on a new line"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Responsibilities</label>
                <textarea
                  value={jobForm.responsibilities}
                  onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter each responsibility on a new line"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Min Salary (GHS)"
                type="number"
                value={jobForm.salaryMin}
                onChange={(e) => setJobForm({ ...jobForm, salaryMin: parseInt(e.target.value) || 0 })}
                required
              />
              
              <Input
                label="Max Salary (GHS)"
                type="number"
                value={jobForm.salaryMax}
                onChange={(e) => setJobForm({ ...jobForm, salaryMax: parseInt(e.target.value) || 0 })}
                required
              />
              
              <Input
                label="Closing Date"
                type="date"
                value={jobForm.closingDate}
                onChange={(e) => setJobForm({ ...jobForm, closingDate: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveJob}>
                Post Job
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default RecruitmentPage;