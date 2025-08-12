import React from 'react';
import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Glassmorphism container */}
        <div className="glass rounded-3xl p-12 border border-white/10">
          {/* Animated logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center"
          >
            <span className="text-white font-bold text-2xl">G</span>
          </motion.div>

          {/* Brand title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-display font-bold text-white mb-2"
          >
            Ghana OMC ERP
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-dark-400 text-lg mb-8"
          >
            Oil Marketing Company Management System
          </motion.p>

          {/* Loading animation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center space-x-2"
          >
            {/* Loading dots */}
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
                className="w-3 h-3 bg-secondary-500 rounded-full"
              />
            ))}
          </motion.div>

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-dark-400 text-sm mt-4"
          >
            Initializing secure connection...
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 w-64 mx-auto"
          >
            <div className="w-full bg-dark-700 rounded-full h-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="h-1 bg-gradient-secondary rounded-full"
              />
            </div>
          </motion.div>

          {/* Status indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 space-y-2"
          >
            <LoadingStep label="Authenticating user" delay={0} />
            <LoadingStep label="Loading dashboard data" delay={0.5} />
            <LoadingStep label="Checking system status" delay={1} />
            <LoadingStep label="Establishing real-time connections" delay={1.5} />
          </motion.div>
        </div>

        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Animated particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-secondary-400 rounded-full opacity-30"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Individual loading step component
interface LoadingStepProps {
  label: string;
  delay: number;
}

function LoadingStep({ label, delay }: LoadingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center space-x-3 text-left"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.2 }}
        className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"
      />
      <span className="text-sm text-dark-400">{label}</span>
    </motion.div>
  );
}