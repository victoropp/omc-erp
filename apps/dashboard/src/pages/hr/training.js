"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const ui_1 = require("@/components/ui");
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const TrainingPage = () => {
    const [programs, setPrograms] = (0, react_1.useState)([]);
    const [enrollments, setEnrollments] = (0, react_1.useState)([]);
    const [employees, setEmployees] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [modalType, setModalType] = (0, react_1.useState)('program');
    const [selectedProgram, setSelectedProgram] = (0, react_1.useState)(null);
    const [activeTab, setActiveTab] = (0, react_1.useState)('programs');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [filterType, setFilterType] = (0, react_1.useState)('all');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [programForm, setProgramForm] = (0, react_1.useState)({
        title: '',
        description: '',
        type: 'safety',
        category: 'mandatory',
        duration: 8,
        format: 'classroom',
        instructor: '',
        capacity: 20,
        startDate: '',
        endDate: '',
        cost: 0,
        prerequisites: ''
    });
    const [enrollmentForm, setEnrollmentForm] = (0, react_1.useState)({
        programId: '',
        employeeIds: []
    });
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            const [programsData, enrollmentsData, employeesData] = await Promise.all([
                api_1.hrService.getTrainingPrograms?.() || Promise.resolve([]),
                api_1.hrService.getTrainingEnrollments?.() || Promise.resolve([]),
                api_1.hrService.getEmployees()
            ]);
            setPrograms(programsData || generateMockPrograms());
            setEnrollments(enrollmentsData || generateMockEnrollments());
            setEmployees(employeesData || []);
        }
        catch (error) {
            setPrograms(generateMockPrograms());
            setEnrollments(generateMockEnrollments());
            react_hot_toast_1.toast.error('Failed to load training data');
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockPrograms = () => [
        {
            id: 'tp1',
            title: 'Fleet Safety and Security Training',
            description: 'Comprehensive safety training for fleet operations including defensive driving, cargo handling, and emergency procedures.',
            type: 'safety',
            category: 'mandatory',
            duration: 16,
            format: 'workshop',
            instructor: 'Captain James Osei (Safety Officer)',
            capacity: 25,
            enrolled: 18,
            startDate: '2024-02-01',
            endDate: '2024-02-02',
            status: 'published',
            prerequisites: ['Valid driving license', 'Basic first aid knowledge'],
            materials: [
                { name: 'Safety Manual', type: 'document', url: '/training/safety-manual.pdf' },
                { name: 'Defensive Driving Video', type: 'video', url: '/training/defensive-driving.mp4' },
                { name: 'Safety Assessment', type: 'quiz', url: '/training/safety-quiz' }
            ],
            cost: 500,
            createdAt: '2024-01-10T09:00:00Z'
        },
        {
            id: 'tp2',
            title: 'Leadership Development Program',
            description: 'Advanced leadership training for supervisors and managers focusing on team building, communication, and strategic thinking.',
            type: 'leadership',
            category: 'optional',
            duration: 40,
            format: 'online',
            instructor: 'Dr. Grace Adjei (Leadership Coach)',
            capacity: 15,
            enrolled: 12,
            startDate: '2024-02-15',
            endDate: '2024-03-15',
            status: 'published',
            prerequisites: ['2+ years management experience', 'Basic leadership assessment'],
            materials: [
                { name: 'Leadership Handbook', type: 'document', url: '/training/leadership-handbook.pdf' },
                { name: 'Case Studies', type: 'presentation', url: '/training/leadership-cases.pptx' }
            ],
            cost: 1200,
            createdAt: '2024-01-05T14:30:00Z'
        }
    ];
    const generateMockEnrollments = () => [
        {
            id: 'te1',
            programId: 'tp1',
            program: 'Fleet Safety and Security Training',
            employee: {
                id: 'e1',
                name: 'Kwame Asante',
                department: 'Operations',
                position: 'Fleet Manager'
            },
            enrollmentDate: '2024-01-15T10:00:00Z',
            status: 'in-progress',
            progress: 75,
            certificateIssued: false,
            rating: 4
        },
        {
            id: 'te2',
            programId: 'tp2',
            program: 'Leadership Development Program',
            employee: {
                id: 'e2',
                name: 'Akosua Mensah',
                department: 'Finance',
                position: 'Accountant'
            },
            enrollmentDate: '2024-01-20T11:30:00Z',
            status: 'completed',
            progress: 100,
            completionDate: '2024-02-10T16:00:00Z',
            score: 92,
            certificateIssued: true,
            feedback: 'Excellent program with practical insights',
            rating: 5
        }
    ];
    const filteredPrograms = programs.filter(program => {
        const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || program.type === filterType;
        const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });
    const filteredEnrollments = enrollments.filter(enrollment => {
        const matchesSearch = enrollment.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enrollment.program.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
        return matchesSearch && matchesStatus;
    });
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'secondary';
            case 'published': return 'primary';
            case 'ongoing': return 'warning';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            case 'enrolled': return 'primary';
            case 'in-progress': return 'warning';
            case 'failed': return 'danger';
            case 'dropped': return 'secondary';
            default: return 'default';
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'safety': return 'danger';
            case 'technical': return 'primary';
            case 'soft-skills': return 'success';
            case 'compliance': return 'warning';
            case 'leadership': return 'purple';
            case 'onboarding': return 'secondary';
            default: return 'default';
        }
    };
    const handleCreateProgram = () => {
        setModalType('program');
        setProgramForm({
            title: '',
            description: '',
            type: 'safety',
            category: 'mandatory',
            duration: 8,
            format: 'classroom',
            instructor: '',
            capacity: 20,
            startDate: '',
            endDate: '',
            cost: 0,
            prerequisites: ''
        });
        setIsModalOpen(true);
    };
    const handleEnrollEmployees = (program) => {
        setModalType('enrollment');
        setSelectedProgram(program);
        setEnrollmentForm({
            programId: program.id,
            employeeIds: []
        });
        setIsModalOpen(true);
    };
    const handleSaveProgram = async () => {
        try {
            await api_1.hrService.createTrainingProgram?.(programForm);
            react_hot_toast_1.toast.success('Training program created successfully');
            setIsModalOpen(false);
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to create training program');
        }
    };
    const handleSaveEnrollment = async () => {
        try {
            await api_1.hrService.enrollInTraining?.(enrollmentForm);
            react_hot_toast_1.toast.success('Employees enrolled successfully');
            setIsModalOpen(false);
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to enroll employees');
        }
    };
    const getRatingStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (<svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-dark-400'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>));
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Training Management</h1>
            <p className="text-dark-400 mt-2">
              Manage employee training programs and track learning progress
            </p>
          </div>
          
          <ui_1.Button variant="primary" onClick={handleCreateProgram}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Create Program
          </ui_1.Button>
        </framer_motion_1.motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Active Programs</p>
                  <p className="text-2xl font-bold text-white">{programs.filter(p => p.status === 'published').length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Enrollments</p>
                  <p className="text-2xl font-bold text-white">{enrollments.length}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round((enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100 || 0)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Training Hours</p>
                  <p className="text-2xl font-bold text-white">
                    {programs.reduce((sum, p) => sum + (p.duration * p.enrolled), 0)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {[
            { key: 'programs', label: 'Training Programs' },
            { key: 'enrollments', label: 'Enrollments' },
            { key: 'analytics', label: 'Analytics' }
        ].map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
              {tab.label}
            </button>))}
        </div>

        {/* Filters */}
        <ui_1.Card>
          <ui_1.CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <ui_1.Input type="text" placeholder="Search programs or employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full"/>
              </div>
              {activeTab === 'programs' && (<ui_1.Select value={filterType} onChange={setFilterType} options={[
                { value: 'all', label: 'All Types' },
                { value: 'safety', label: 'Safety' },
                { value: 'technical', label: 'Technical' },
                { value: 'soft-skills', label: 'Soft Skills' },
                { value: 'compliance', label: 'Compliance' },
                { value: 'leadership', label: 'Leadership' },
                { value: 'onboarding', label: 'Onboarding' }
            ]} className="w-full md:w-48"/>)}
              <ui_1.Select value={filterStatus} onChange={setFilterStatus} options={[
            { value: 'all', label: 'All Status' },
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'ongoing', label: 'Ongoing' },
            { value: 'completed', label: 'Completed' },
            { value: 'enrolled', label: 'Enrolled' },
            { value: 'in-progress', label: 'In Progress' }
        ]} className="w-full md:w-48"/>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Content based on active tab */}
        {activeTab === 'programs' && (<ui_1.Card>
            <ui_1.CardHeader title="Training Programs"/>
            <ui_1.CardContent>
              <ui_1.Table headers={[
                { key: 'program', label: 'Program' },
                { key: 'type', label: 'Type' },
                { key: 'format', label: 'Format' },
                { key: 'enrollment', label: 'Enrollment' },
                { key: 'schedule', label: 'Schedule' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' }
            ]} data={filteredPrograms.map(program => ({
                program: (<div>
                      <p className="font-medium text-white">{program.title}</p>
                      <p className="text-sm text-dark-400 line-clamp-2">{program.description}</p>
                      <p className="text-xs text-dark-500 mt-1">{program.duration}h • {program.instructor}</p>
                    </div>),
                type: (<div>
                      <ui_1.Badge variant={getTypeColor(program.type)} className="capitalize mb-1">
                        {program.type.replace('-', ' ')}
                      </ui_1.Badge>
                      <p className="text-xs text-dark-400 capitalize">{program.category}</p>
                    </div>),
                format: (<div>
                      <p className="text-white capitalize">{program.format}</p>
                      <p className="text-xs text-dark-400">GHS {program.cost}</p>
                    </div>),
                enrollment: (<div>
                      <p className="text-white">{program.enrolled}/{program.capacity}</p>
                      <div className="w-16 bg-dark-600 rounded-full h-2 mt-1">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(program.enrolled / program.capacity) * 100}%` }}></div>
                      </div>
                    </div>),
                schedule: (<div>
                      <p className="text-white">{new Date(program.startDate).toLocaleDateString()}</p>
                      <p className="text-sm text-dark-400">to {new Date(program.endDate).toLocaleDateString()}</p>
                    </div>),
                status: (<ui_1.Badge variant={getStatusColor(program.status)} className="capitalize">
                      {program.status}
                    </ui_1.Badge>),
                actions: (<div className="flex items-center space-x-2">
                      <ui_1.Button variant="outline" size="sm" onClick={() => handleEnrollEmployees(program)}>
                        Enroll
                      </ui_1.Button>
                      <ui_1.Button variant="outline" size="sm">
                        View
                      </ui_1.Button>
                    </div>)
            }))}/>
            </ui_1.CardContent>
          </ui_1.Card>)}

        {activeTab === 'enrollments' && (<ui_1.Card>
            <ui_1.CardHeader title="Training Enrollments"/>
            <ui_1.CardContent>
              <ui_1.Table headers={[
                { key: 'employee', label: 'Employee' },
                { key: 'program', label: 'Program' },
                { key: 'progress', label: 'Progress' },
                { key: 'status', label: 'Status' },
                { key: 'rating', label: 'Rating' },
                { key: 'completion', label: 'Completion' },
                { key: 'actions', label: 'Actions' }
            ]} data={filteredEnrollments.map(enrollment => ({
                employee: (<div>
                      <p className="font-medium text-white">{enrollment.employee.name}</p>
                      <p className="text-sm text-dark-400">{enrollment.employee.department}</p>
                      <p className="text-xs text-dark-500">{enrollment.employee.position}</p>
                    </div>),
                program: (<p className="font-medium text-white">{enrollment.program}</p>),
                progress: (<div>
                      <p className="text-white">{enrollment.progress}%</p>
                      <div className="w-16 bg-dark-600 rounded-full h-2 mt-1">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                      </div>
                    </div>),
                status: (<ui_1.Badge variant={getStatusColor(enrollment.status)} className="capitalize">
                      {enrollment.status.replace('-', ' ')}
                    </ui_1.Badge>),
                rating: enrollment.rating ? (<div className="flex items-center">
                      <div className="flex">{getRatingStars(enrollment.rating)}</div>
                      <span className="text-white text-sm ml-2">{enrollment.rating}</span>
                    </div>) : (<span className="text-dark-400">-</span>),
                completion: enrollment.completionDate ? (<div>
                      <p className="text-green-400">{new Date(enrollment.completionDate).toLocaleDateString()}</p>
                      {enrollment.score && <p className="text-sm text-white">Score: {enrollment.score}%</p>}
                      {enrollment.certificateIssued && (<ui_1.Badge variant="success" className="text-xs mt-1">Certified</ui_1.Badge>)}
                    </div>) : (<span className="text-dark-400">Pending</span>),
                actions: (<div className="flex items-center space-x-2">
                      <ui_1.Button variant="outline" size="sm">
                        View
                      </ui_1.Button>
                      {enrollment.status === 'completed' && !enrollment.certificateIssued && (<ui_1.Button variant="primary" size="sm">
                          Certificate
                        </ui_1.Button>)}
                    </div>)
            }))}/>
            </ui_1.CardContent>
          </ui_1.Card>)}

        {/* Training Program Modal */}
        <ui_1.Modal isOpen={isModalOpen && modalType === 'program'} onClose={() => setIsModalOpen(false)} title="Create Training Program">
          <div className="space-y-6">
            <ui_1.Input label="Program Title" type="text" value={programForm.title} onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })} required/>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Description</label>
              <textarea value={programForm.description} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" required/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ui_1.Select label="Type" value={programForm.type} onChange={(value) => setProgramForm({ ...programForm, type: value })} options={[
            { value: 'safety', label: 'Safety' },
            { value: 'technical', label: 'Technical' },
            { value: 'soft-skills', label: 'Soft Skills' },
            { value: 'compliance', label: 'Compliance' },
            { value: 'leadership', label: 'Leadership' },
            { value: 'onboarding', label: 'Onboarding' }
        ]} required/>
              
              <ui_1.Select label="Category" value={programForm.category} onChange={(value) => setProgramForm({ ...programForm, category: value })} options={[
            { value: 'mandatory', label: 'Mandatory' },
            { value: 'optional', label: 'Optional' },
            { value: 'certification', label: 'Certification' }
        ]} required/>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <ui_1.Input label="Duration (hours)" type="number" value={programForm.duration} onChange={(e) => setProgramForm({ ...programForm, duration: parseInt(e.target.value) || 0 })} required/>
              
              <ui_1.Input label="Capacity" type="number" value={programForm.capacity} onChange={(e) => setProgramForm({ ...programForm, capacity: parseInt(e.target.value) || 0 })} required/>
              
              <ui_1.Input label="Cost (GHS)" type="number" value={programForm.cost} onChange={(e) => setProgramForm({ ...programForm, cost: parseFloat(e.target.value) || 0 })} required/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ui_1.Select label="Format" value={programForm.format} onChange={(value) => setProgramForm({ ...programForm, format: value })} options={[
            { value: 'online', label: 'Online' },
            { value: 'classroom', label: 'Classroom' },
            { value: 'workshop', label: 'Workshop' },
            { value: 'webinar', label: 'Webinar' },
            { value: 'simulation', label: 'Simulation' }
        ]} required/>
              
              <ui_1.Input label="Instructor" type="text" value={programForm.instructor} onChange={(e) => setProgramForm({ ...programForm, instructor: e.target.value })} required/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ui_1.Input label="Start Date" type="date" value={programForm.startDate} onChange={(e) => setProgramForm({ ...programForm, startDate: e.target.value })} required/>
              
              <ui_1.Input label="End Date" type="date" value={programForm.endDate} onChange={(e) => setProgramForm({ ...programForm, endDate: e.target.value })} required/>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </ui_1.Button>
              <ui_1.Button variant="primary" onClick={handleSaveProgram}>
                Create Program
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>

        {/* Enrollment Modal */}
        <ui_1.Modal isOpen={isModalOpen && modalType === 'enrollment'} onClose={() => setIsModalOpen(false)} title={`Enroll Employees - ${selectedProgram?.title}`}>
          <div className="space-y-6">
            {selectedProgram && (<div className="p-4 bg-dark-700 rounded-lg">
                <h3 className="font-medium text-white mb-2">{selectedProgram.title}</h3>
                <p className="text-sm text-dark-400 mb-2">{selectedProgram.description}</p>
                <div className="text-xs text-dark-500">
                  <p>Available spots: {selectedProgram.capacity - selectedProgram.enrolled}</p>
                  <p>Duration: {selectedProgram.duration} hours • Cost: GHS {selectedProgram.cost}</p>
                </div>
              </div>)}

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Select Employees</label>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {employees.map(employee => (<label key={employee.id} className="flex items-center space-x-3 p-2 hover:bg-dark-700 rounded">
                    <input type="checkbox" checked={enrollmentForm.employeeIds.includes(employee.id)} onChange={(e) => {
                if (e.target.checked) {
                    setEnrollmentForm({
                        ...enrollmentForm,
                        employeeIds: [...enrollmentForm.employeeIds, employee.id]
                    });
                }
                else {
                    setEnrollmentForm({
                        ...enrollmentForm,
                        employeeIds: enrollmentForm.employeeIds.filter(id => id !== employee.id)
                    });
                }
            }} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                    <div>
                      <p className="text-white font-medium">{employee.name}</p>
                      <p className="text-sm text-dark-400">{employee.department} - {employee.position}</p>
                    </div>
                  </label>))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </ui_1.Button>
              <ui_1.Button variant="primary" onClick={handleSaveEnrollment} disabled={enrollmentForm.employeeIds.length === 0}>
                Enroll {enrollmentForm.employeeIds.length} Employee{enrollmentForm.employeeIds.length > 1 ? 's' : ''}
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = TrainingPage;
//# sourceMappingURL=training.js.map