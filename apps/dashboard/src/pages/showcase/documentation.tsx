import React, { useState } from 'react';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui';

interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'guide' | 'api' | 'video' | 'faq' | 'tutorial';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  lastUpdated: string;
  tags: string[];
  content?: string;
  videoUrl?: string;
  downloadUrl?: string;
  popular: boolean;
}

const DocumentationHub: NextPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentationItem | null>(null);
  const [showDocViewer, setShowDocViewer] = useState(false);

  const documentationItems: DocumentationItem[] = [
    {
      id: 'getting-started',
      title: 'Getting Started Guide',
      description: 'Complete introduction to the Ghana OMC ERP system for new users',
      category: 'User Guides',
      type: 'guide',
      difficulty: 'beginner',
      estimatedTime: '15 minutes',
      lastUpdated: '2024-01-13',
      tags: ['basics', 'introduction', 'overview'],
      popular: true,
      content: `# Getting Started with Ghana OMC ERP\n\n## Welcome\n\nThis guide will help you get started with the Ghana OMC ERP system...`,
    },
    {
      id: 'station-management',
      title: 'Fuel Station Management',
      description: 'Comprehensive guide to managing fuel stations, inventory, and operations',
      category: 'User Guides',
      type: 'guide',
      difficulty: 'intermediate',
      estimatedTime: '30 minutes',
      lastUpdated: '2024-01-12',
      tags: ['stations', 'inventory', 'operations'],
      popular: true,
      content: `# Fuel Station Management\n\n## Overview\n\nThis guide covers all aspects of fuel station management...`,
    },
    {
      id: 'uppf-claims-api',
      title: 'UPPF Claims API Reference',
      description: 'Complete API documentation for UPPF claims processing endpoints',
      category: 'API Documentation',
      type: 'api',
      difficulty: 'advanced',
      estimatedTime: '45 minutes',
      lastUpdated: '2024-01-10',
      tags: ['api', 'uppf', 'claims', 'rest'],
      popular: false,
      content: `# UPPF Claims API\n\n## Authentication\n\nAll API requests require authentication...`,
    },
    {
      id: 'system-overview-video',
      title: 'System Overview Video',
      description: 'Complete walkthrough of the system features and capabilities',
      category: 'Video Tutorials',
      type: 'video',
      difficulty: 'beginner',
      estimatedTime: '20 minutes',
      lastUpdated: '2024-01-11',
      tags: ['overview', 'features', 'walkthrough'],
      videoUrl: 'https://example.com/system-overview',
      popular: true,
    },
    {
      id: 'pricing-tutorial',
      title: 'Dynamic Pricing Setup',
      description: 'Step-by-step tutorial for configuring automated pricing rules',
      category: 'Tutorials',
      type: 'tutorial',
      difficulty: 'advanced',
      estimatedTime: '40 minutes',
      lastUpdated: '2024-01-09',
      tags: ['pricing', 'automation', 'configuration'],
      popular: false,
      content: `# Dynamic Pricing Setup\n\n## Prerequisites\n\nBefore setting up dynamic pricing...`,
    },
    {
      id: 'troubleshooting-faq',
      title: 'Troubleshooting FAQ',
      description: 'Frequently asked questions and solutions for common issues',
      category: 'FAQ',
      type: 'faq',
      difficulty: 'beginner',
      estimatedTime: '10 minutes',
      lastUpdated: '2024-01-13',
      tags: ['troubleshooting', 'support', 'issues'],
      popular: true,
      content: `# Frequently Asked Questions\n\n## Common Issues\n\n### Q: How do I reset my password?\nA: Navigate to...`,
    },
    {
      id: 'mobile-app-guide',
      title: 'Mobile App User Guide',
      description: 'Complete guide for using the mobile application features',
      category: 'User Guides',
      type: 'guide',
      difficulty: 'intermediate',
      estimatedTime: '25 minutes',
      lastUpdated: '2024-01-08',
      tags: ['mobile', 'app', 'features'],
      popular: false,
      content: `# Mobile App Guide\n\n## Installation\n\nTo install the mobile app...`,
    },
    {
      id: 'integration-api',
      title: 'Integration API Documentation',
      description: 'API documentation for third-party system integrations',
      category: 'API Documentation',
      type: 'api',
      difficulty: 'advanced',
      estimatedTime: '60 minutes',
      lastUpdated: '2024-01-07',
      tags: ['api', 'integration', 'webhooks'],
      popular: false,
      content: `# Integration API\n\n## Overview\n\nThe Integration API allows...`,
    },
    {
      id: 'security-best-practices',
      title: 'Security Best Practices',
      description: 'Guidelines for maintaining system security and user safety',
      category: 'Security',
      type: 'guide',
      difficulty: 'intermediate',
      estimatedTime: '35 minutes',
      lastUpdated: '2024-01-06',
      tags: ['security', 'best-practices', 'safety'],
      popular: true,
      content: `# Security Best Practices\n\n## Password Policies\n\nImplement strong password...`,
    },
    {
      id: 'backup-restore-video',
      title: 'Backup & Restore Tutorial',
      description: 'Video guide for system backup and data recovery procedures',
      category: 'Video Tutorials',
      type: 'video',
      difficulty: 'intermediate',
      estimatedTime: '30 minutes',
      lastUpdated: '2024-01-05',
      tags: ['backup', 'restore', 'recovery'],
      videoUrl: 'https://example.com/backup-restore',
      popular: false,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Categories', count: documentationItems.length },
    ...Array.from(new Set(documentationItems.map(item => item.category)))
      .map(category => ({
        id: category,
        label: category,
        count: documentationItems.filter(item => item.category === category).length
      }))
  ];

  const types = [
    { id: 'all', label: 'All Types' },
    { id: 'guide', label: 'User Guides', icon: '📚' },
    { id: 'api', label: 'API Docs', icon: '🔧' },
    { id: 'video', label: 'Videos', icon: '🎥' },
    { id: 'tutorial', label: 'Tutorials', icon: '🎯' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
  ];

  const filteredItems = documentationItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const popularItems = documentationItems.filter(item => item.popular);
  const recentItems = documentationItems
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);

  const getTypeIcon = (type: string) => {
    const typeConfig = types.find(t => t.id === type);
    return typeConfig?.icon || '📚';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const openDocViewer = (doc: DocumentationItem) => {
    setSelectedDoc(doc);
    setShowDocViewer(true);
  };

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-gradient">
              Documentation Hub
            </h1>
          </div>
          <p className="text-dark-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Find comprehensive guides, API documentation, video tutorials, and troubleshooting resources 
            for the Ghana OMC ERP system.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-dark-400 text-sm whitespace-nowrap">Found {filteredItems.length} items</span>
                </div>
              </div>
              
              {/* Type Filters */}
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === type.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                    }`}
                  >
                    {type.icon && <span>{type.icon}</span>}
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-dark-400 hover:bg-dark-600 hover:text-white'
                    }`}
                  >
                    {category.label}
                    <span className="ml-1 px-1.5 py-0.5 bg-dark-600 rounded text-xs">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Sections */}
        {!searchQuery && selectedCategory === 'all' && selectedType === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Documentation */}
            <Card>
              <CardHeader title="Popular Documentation" />
              <CardContent>
                <div className="space-y-3">
                  {popularItems.slice(0, 5).map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 bg-dark-700 rounded-lg hover:bg-dark-600 cursor-pointer transition-colors"
                      onClick={() => openDocViewer(item)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getTypeIcon(item.type)}</div>
                        <div>
                          <h4 className="text-white font-medium text-sm">{item.title}</h4>
                          <p className="text-dark-400 text-xs">{item.estimatedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                        <svg className="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Recently Updated */}
            <Card>
              <CardHeader title="Recently Updated" />
              <CardContent>
                <div className="space-y-3">
                  {recentItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 bg-dark-700 rounded-lg hover:bg-dark-600 cursor-pointer transition-colors"
                      onClick={() => openDocViewer(item)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getTypeIcon(item.type)}</div>
                        <div>
                          <h4 className="text-white font-medium text-sm">{item.title}</h4>
                          <p className="text-dark-400 text-xs">
                            Updated {new Date(item.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                        <svg className="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documentation Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 group h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-dark-400 text-xs">{item.category}</p>
                        </div>
                      </div>
                      {item.popular && (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Popular
                        </span>
                      )}
                    </div>
                    
                    <p className="text-dark-400 text-sm mb-4 leading-relaxed flex-grow line-clamp-3">
                      {item.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="inline-flex px-2 py-1 text-xs bg-dark-600 text-dark-300 rounded">
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs text-dark-500">+{item.tags.length - 3}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                        <span className="text-dark-400 text-xs">{item.estimatedTime}</span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDocViewer(item)}
                        className="group-hover:bg-primary-500/20 group-hover:text-primary-400"
                      >
                        {item.type === 'video' ? 'Watch' : 'Read'}
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Documentation Viewer Modal */}
        <AnimatePresence>
          {showDocViewer && selectedDoc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDocViewer(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-dark-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-dark-700">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getTypeIcon(selectedDoc.type)}</div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedDoc.title}</h2>
                      <p className="text-primary-400 text-sm">{selectedDoc.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm rounded-full ${getDifficultyColor(selectedDoc.difficulty)}`}>
                      {selectedDoc.difficulty}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setShowDocViewer(false)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {selectedDoc.type === 'video' ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-dark-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-white font-medium">Video Player</p>
                          <p className="text-dark-400 text-sm mt-1">Video content would be embedded here</p>
                          <p className="text-dark-400 text-sm">{selectedDoc.estimatedTime}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                        <p className="text-dark-300">{selectedDoc.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-dark-300 leading-relaxed">
                        {selectedDoc.content || 'Content would be loaded here from the documentation system.'}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  <div className="mt-6 pt-4 border-t border-dark-700">
                    <h4 className="text-white font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.map((tag, index) => (
                        <span key={index} className="inline-flex px-3 py-1 text-sm bg-primary-500/20 text-primary-400 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-6 border-t border-dark-700">
                  <div className="text-sm text-dark-400">
                    Last updated: {new Date(selectedDoc.lastUpdated).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Helpful
                    </Button>
                    <Button variant="primary">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Documentation Found</h3>
              <p className="text-dark-400 mb-4">Try adjusting your search terms or filters to find what you're looking for.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </FuturisticDashboardLayout>
  );
};

export default DocumentationHub;