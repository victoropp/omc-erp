import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/auth.store';
import { FuturisticBackground } from '@/components/layout/FuturisticBackground';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: 'admin@ghanaomc.com',
    password: 'password',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome to Ghana OMC ERP!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Futuristic background */}
      <FuturisticBackground />
      
      {/* Login form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glassmorphism container */}
        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center"
            >
              <span className="text-white font-bold text-2xl">G</span>
            </motion.div>
            
            <h1 className="text-3xl font-display font-bold text-gradient mb-2">
              Ghana OMC ERP
            </h1>
            <p className="text-dark-400">
              Oil Marketing Company Management System
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 glass rounded-xl border border-white/10 bg-transparent text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 glass rounded-xl border border-white/10 bg-transparent text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-primary text-white font-medium rounded-xl hover:opacity-90 transition-all duration-300 shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 glass rounded-xl border border-secondary-500/30">
            <h3 className="text-sm font-medium text-secondary-400 mb-2">Demo Credentials</h3>
            <div className="text-xs text-dark-400 space-y-1">
              <div>Email: admin@ghanaomc.com</div>
              <div>Password: password</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-dark-500">
              © 2025 Ghana OMC ERP. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}