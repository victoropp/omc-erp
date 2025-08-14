import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Modal, Input, Select, Table, Badge } from '@/components/ui';
import { hrService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface PerformanceReview {
  id: string;
  employee: {
    id: string;
    name: string;
    department: string;
    position: string;
    manager: string;
  };
  period: string;
  status: 'draft' | 'pending' | 'completed' | 'overdue';
  overallScore: number;
  categories: {
    quality: number;
    productivity: number;
    communication: number;
    teamwork: number;
    leadership: number;
    innovation: number;
  };
  goals: Array<{
    title: string;
    description: string;
    status: 'achieved' | 'partially' | 'not-achieved';
    weight: number;
  }>;
  strengths: string[];
  improvements: string[];
  managerComments: string;
  employeeComments: string;
  reviewDate: string;
  nextReviewDate: string;
  rating: 'outstanding' | 'exceeds' | 'meets' | 'below' | 'unsatisfactory';
}

const PerformancePage: NextPage = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const [reviewForm, setReviewForm] = useState({
    employeeId: '',
    period: new Date().getFullYear().toString(),
    quality: 5,
    productivity: 5,
    communication: 5,
    teamwork: 5,
    leadership: 5,
    innovation: 5,
    managerComments: '',
    strengths: '',
    improvements: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, employeesData] = await Promise.all([
        hrService.getPerformanceReviews(),
        hrService.getEmployees()
      ]);
      
      setReviews(reviewsData || generateMockReviews());
      setEmployees(employeesData || []);
    } catch (error) {
      setReviews(generateMockReviews());
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockReviews = (): PerformanceReview[] => [
    {
      id: 'pr1',
      employee: {
        id: 'e1',
        name: 'Kwame Asante',
        department: 'Operations',
        position: 'Fleet Manager',
        manager: 'Sarah Johnson'
      },
      period: '2024-Q1',
      status: 'completed',
      overallScore: 4.2,
      categories: {
        quality: 4.5,
        productivity: 4.0,
        communication: 4.2,
        teamwork: 4.3,
        leadership: 4.1,
        innovation: 3.9
      },
      goals: [
        { title: 'Reduce fleet downtime', description: 'Achieve 95% fleet availability', status: 'achieved', weight: 30 },
        { title: 'Implement GPS tracking', description: 'Deploy tracking system', status: 'achieved', weight: 25 },
        { title: 'Driver training program', description: 'Train all drivers on safety', status: 'partially', weight: 20 }
      ],
      strengths: ['Strong leadership', 'Technical expertise', 'Problem-solving skills'],
      improvements: ['Time management', 'Delegation skills'],
      managerComments: 'Excellent performance with consistent delivery on key objectives.',
      employeeComments: 'Grateful for the support and looking forward to new challenges.',
      reviewDate: '2024-01-15',
      nextReviewDate: '2024-04-15',
      rating: 'exceeds'
    }
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.employee.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || review.employee.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'overdue': return 'danger';
      default: return 'default';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'outstanding': return 'success';
      case 'exceeds': return 'primary';
      case 'meets': return 'secondary';
      case 'below': return 'warning';
      case 'unsatisfactory': return 'danger';
      default: return 'default';
    }
  };

  const handleCreateReview = () => {
    setReviewForm({
      employeeId: '',
      period: new Date().getFullYear().toString(),
      quality: 5,
      productivity: 5,
      communication: 5,
      teamwork: 5,
      leadership: 5,
      innovation: 5,
      managerComments: '',
      strengths: '',
      improvements: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveReview = async () => {
    try {
      await hrService.createPerformanceReview(reviewForm);
      toast.success('Performance review saved successfully');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save performance review');
    }
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

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
            <h1 className="text-3xl font-display font-bold text-gradient">Performance Management</h1>
            <p className="text-dark-400 mt-2">
              Track and evaluate employee performance with comprehensive reviews
            </p>
          </div>
          
          <Button variant="primary" onClick={handleCreateReview}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Review
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Reviews</p>
                  <p className="text-2xl font-bold text-white">{reviews.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-dark-400">Pending Reviews</p>
                  <p className="text-2xl font-bold text-white">{reviews.filter(r => r.status === 'pending').length}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Avg Score</p>
                  <p className="text-2xl font-bold text-white">
                    {(reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length || 0).toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Top Performers</p>
                  <p className="text-2xl font-bold text-white">
                    {reviews.filter(r => r.overallScore >= 4.5).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by employee name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'overdue', label: 'Overdue' }
                ]}
                className="w-full md:w-48"
              />
              <Select
                value={filterDepartment}
                onChange={setFilterDepartment}
                options={[
                  { value: 'all', label: 'All Departments' },
                  ...departments.map(dept => ({ value: dept, label: dept }))
                ]}
                className="w-full md:w-48"
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Reviews Table */}
        <Card>
          <CardHeader title="Performance Reviews" />
          <CardContent>
            <Table
              headers={[
                { key: 'employee', label: 'Employee' },
                { key: 'period', label: 'Period' },
                { key: 'score', label: 'Overall Score' },
                { key: 'rating', label: 'Rating' },
                { key: 'goals', label: 'Goals Achievement' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' }
              ]}
              data={filteredReviews.map(review => ({
                employee: (
                  <div>
                    <p className="font-medium text-white">{review.employee.name}</p>
                    <p className="text-sm text-dark-400">{review.employee.department}</p>
                    <p className="text-xs text-dark-500">{review.employee.position}</p>
                  </div>
                ),
                period: (
                  <div>
                    <p className="text-white">{review.period}</p>
                    <p className="text-xs text-dark-400">
                      Due: {new Date(review.nextReviewDate).toLocaleDateString()}
                    </p>
                  </div>
                ),
                score: (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{review.overallScore.toFixed(1)}</p>
                    <div className="flex justify-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(review.overallScore) ? 'text-yellow-400' : 'text-dark-400'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                ),
                rating: (
                  <Badge variant={getRatingColor(review.rating)} className="capitalize">
                    {review.rating.replace('-', ' ')}
                  </Badge>
                ),
                goals: (
                  <div className="text-sm">
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="text-green-400">{review.goals.filter(g => g.status === 'achieved').length}</span>
                      <span className="text-yellow-400">{review.goals.filter(g => g.status === 'partially').length}</span>
                      <span className="text-red-400">{review.goals.filter(g => g.status === 'not-achieved').length}</span>
                    </div>
                    <div className="w-16 bg-dark-600 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(review.goals.filter(g => g.status === 'achieved').length / review.goals.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ),
                status: (
                  <Badge variant={getStatusColor(review.status)} className="capitalize">
                    {review.status}
                  </Badge>
                ),
                actions: (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
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

        {/* Performance Review Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Performance Review"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Employee"
                value={reviewForm.employeeId}
                onChange={(value) => setReviewForm({ ...reviewForm, employeeId: value })}
                options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
                required
              />
              <Input
                label="Review Period"
                type="text"
                value={reviewForm.period}
                onChange={(e) => setReviewForm({ ...reviewForm, period: e.target.value })}
                placeholder="2024-Q1"
                required
              />
            </div>

            <div>
              <h3 className="font-medium text-white mb-4">Performance Categories (1-5 Scale)</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'quality', label: 'Quality of Work' },
                  { key: 'productivity', label: 'Productivity' },
                  { key: 'communication', label: 'Communication' },
                  { key: 'teamwork', label: 'Teamwork' },
                  { key: 'leadership', label: 'Leadership' },
                  { key: 'innovation', label: 'Innovation' }
                ].map(category => (
                  <div key={category.key}>
                    <label className="block text-sm font-medium text-dark-400 mb-2">{category.label}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.1"
                      value={reviewForm[category.key as keyof typeof reviewForm]}
                      onChange={(e) => setReviewForm({ 
                        ...reviewForm, 
                        [category.key]: parseFloat(e.target.value) 
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-dark-400 mt-1">
                      <span>1</span>
                      <span className="text-white font-medium">
                        {reviewForm[category.key as keyof typeof reviewForm]}
                      </span>
                      <span>5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Strengths</label>
              <textarea
                value={reviewForm.strengths}
                onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="List employee strengths..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Areas for Improvement</label>
              <textarea
                value={reviewForm.improvements}
                onChange={(e) => setReviewForm({ ...reviewForm, improvements: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Suggest areas for improvement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Manager Comments</label>
              <textarea
                value={reviewForm.managerComments}
                onChange={(e) => setReviewForm({ ...reviewForm, managerComments: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Overall comments and feedback..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveReview}>
                Save Review
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default PerformancePage;