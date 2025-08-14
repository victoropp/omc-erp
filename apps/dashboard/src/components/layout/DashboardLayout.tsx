import React, { ReactNode } from 'react';
import { FuturisticSidebar } from './FuturisticSidebar';
import { FuturisticHeader } from './FuturisticHeader';
import { useAuthStore } from '@/stores/auth.store';
import { Toaster } from 'react-hot-toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ghana OMC ERP</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'text-sm',
        }}
      />
      
      {/* Sidebar */}
      <FuturisticSidebar isOpen={true} onClose={() => {}} />
      
      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Header */}
        <FuturisticHeader onMenuClick={() => {}} />
        
        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;