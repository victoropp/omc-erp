"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardStats = DashboardStats;
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
function DashboardStats({}) {
    const stats = [
        {
            id: '1',
            title: 'Total Revenue',
            value: '₵2.4M',
            change: '+12.5%',
            changeType: 'positive',
            trend: [20, 35, 25, 45, 30, 55, 40, 60, 45, 70, 55, 80],
            icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
        </svg>),
        },
        {
            id: '2',
            title: 'Active Stations',
            value: '47',
            change: '+3',
            changeType: 'positive',
            trend: [40, 42, 41, 44, 43, 46, 45, 47, 46, 47, 47, 47],
            icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>),
        },
        {
            id: '3',
            title: 'Fuel Volume',
            value: '1.2M L',
            change: '+8.3%',
            changeType: 'positive',
            trend: [100, 110, 105, 125, 120, 140, 135, 150, 145, 160, 155, 170],
            icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>),
        },
        {
            id: '4',
            title: 'UPPF Claims',
            value: '₵485K',
            change: '+15.2%',
            changeType: 'positive',
            trend: [30, 25, 35, 40, 45, 50, 48, 55, 52, 60, 58, 65],
            icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>),
        },
    ];
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };
    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
    };
    return (<framer_motion_1.motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (<framer_motion_1.motion.div key={stat.id} variants={cardVariants} whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 }
            }} className="glass rounded-2xl border border-white/10 p-6 relative overflow-hidden group">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`p-3 rounded-xl glass border border-white/10 text-secondary-400`}>
              {stat.icon}
            </div>
            <div className={`text-sm font-medium px-2 py-1 rounded-full ${stat.changeType === 'positive'
                ? 'text-green-400 bg-green-500/10'
                : stat.changeType === 'negative'
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-dark-400 bg-dark-500/10'}`}>
              {stat.change}
            </div>
          </div>

          {/* Value */}
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-dark-400 mb-4">
              {stat.title}
            </p>
          </div>

          {/* Mini trend chart */}
          <div className="relative z-10">
            <div className="flex items-end space-x-1 h-8">
              {stat.trend.map((value, i) => (<framer_motion_1.motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(value / Math.max(...stat.trend)) * 100}%` }} transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }} className={`w-1 rounded-full ${stat.changeType === 'positive'
                    ? 'bg-green-400/60'
                    : stat.changeType === 'negative'
                        ? 'bg-red-400/60'
                        : 'bg-dark-400/60'}`}/>))}
            </div>
          </div>

          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 blur-xl"/>
          </div>
        </framer_motion_1.motion.div>))}
    </framer_motion_1.motion.div>);
}
//# sourceMappingURL=dashboard-stats.js.map