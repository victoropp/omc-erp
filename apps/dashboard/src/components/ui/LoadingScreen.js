"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingScreen = LoadingScreen;
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
function LoadingScreen() {
    return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        {/* Glassmorphism container */}
        <div className="glass rounded-3xl p-12 border border-white/10">
          {/* Animated logo */}
          <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-2xl">G</span>
          </framer_motion_1.motion.div>

          {/* Brand title */}
          <framer_motion_1.motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl font-display font-bold text-white mb-2">
            Ghana OMC ERP
          </framer_motion_1.motion.h1>

          {/* Subtitle */}
          <framer_motion_1.motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-dark-400 text-lg mb-8">
            Oil Marketing Company Management System
          </framer_motion_1.motion.p>

          {/* Loading animation */}
          <framer_motion_1.motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center justify-center space-x-2">
            {/* Loading dots */}
            {[0, 1, 2].map((index) => (<framer_motion_1.motion.div key={index} animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
            }} transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
            }} className="w-3 h-3 bg-secondary-500 rounded-full"/>))}
          </framer_motion_1.motion.div>

          {/* Loading text */}
          <framer_motion_1.motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-dark-400 text-sm mt-4">
            Initializing secure connection...
          </framer_motion_1.motion.p>

          {/* Progress bar */}
          <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-6 w-64 mx-auto">
            <div className="w-full bg-dark-700 rounded-full h-1">
              <framer_motion_1.motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3, ease: "easeInOut" }} className="h-1 bg-gradient-secondary rounded-full"/>
            </div>
          </framer_motion_1.motion.div>

          {/* Status indicators */}
          <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-8 space-y-2">
            <LoadingStep label="Authenticating user" delay={0}/>
            <LoadingStep label="Loading dashboard data" delay={0.5}/>
            <LoadingStep label="Checking system status" delay={1}/>
            <LoadingStep label="Establishing real-time connections" delay={1.5}/>
          </framer_motion_1.motion.div>
        </div>

        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Animated particles */}
          {[...Array(20)].map((_, i) => (<framer_motion_1.motion.div key={i} className="absolute w-1 h-1 bg-secondary-400 rounded-full opacity-30" animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0, 1, 0],
            }} transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
            }} style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
            }}/>))}
        </div>
      </framer_motion_1.motion.div>
    </div>);
}
function LoadingStep({ label, delay }) {
    return (<framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.3 }} className="flex items-center space-x-3 text-left">
      <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.2, duration: 0.2 }} className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"/>
      <span className="text-sm text-dark-400">{label}</span>
    </framer_motion_1.motion.div>);
}
//# sourceMappingURL=LoadingScreen.js.map