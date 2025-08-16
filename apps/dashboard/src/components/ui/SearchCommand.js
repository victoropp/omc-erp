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
exports.SearchCommand = SearchCommand;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const router_1 = require("next/router");
function SearchCommand() {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [query, setQuery] = (0, react_1.useState)('');
    const [results, setResults] = (0, react_1.useState)([]);
    const [selectedIndex, setSelectedIndex] = (0, react_1.useState)(0);
    const inputRef = (0, react_1.useRef)(null);
    const router = (0, router_1.useRouter)();
    // Mock search data
    const searchData = [
        {
            id: '1',
            title: 'Dashboard Overview',
            subtitle: 'Main dashboard with key metrics',
            href: '/dashboard',
            category: 'Navigation',
            icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>),
        },
        {
            id: '2',
            title: 'Stations Management',
            subtitle: 'Manage fuel stations and infrastructure',
            href: '/stations',
            category: 'Navigation',
            icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>),
        },
        {
            id: '3',
            title: 'UPPF Claims',
            subtitle: 'Uniform Pump Price Fund claims processing',
            href: '/pricing/uppf-claims',
            category: 'Pricing',
            icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>),
        },
        {
            id: '4',
            title: 'Price Windows',
            subtitle: 'Manage pricing windows and periods',
            href: '/pricing/windows',
            category: 'Pricing',
            icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
        </svg>),
        },
        {
            id: '5',
            title: 'Transactions',
            subtitle: 'View and manage fuel transactions',
            href: '/transactions',
            category: 'Operations',
            icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
        </svg>),
        },
    ];
    // Filter search results based on query
    (0, react_1.useEffect)(() => {
        if (query.trim() === '') {
            setResults([]);
            setSelectedIndex(0);
            return;
        }
        const filtered = searchData.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase()));
        setResults(filtered);
        setSelectedIndex(0);
    }, [query]);
    // Handle keyboard navigation
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (e) => {
            if (!isOpen)
                return;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (results[selectedIndex]) {
                        handleSelect(results[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setIsOpen(false);
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex]);
    // Global search shortcut (Cmd+K / Ctrl+K)
    (0, react_1.useEffect)(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);
    const handleSelect = (result) => {
        router.push(result.href);
        setIsOpen(false);
        setQuery('');
    };
    const groupedResults = results.reduce((acc, result) => {
        if (!acc[result.category]) {
            acc[result.category] = [];
        }
        acc[result.category].push(result);
        return acc;
    }, {});
    return (<>
      {/* Search trigger */}
      <framer_motion_1.motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        }} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl glass border border-white/10 
                 text-dark-400 hover:text-white hover:bg-white/10 transition-all duration-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <span className="flex-1 text-left text-sm">Search...</span>
        <div className="flex items-center space-x-1">
          <kbd className="px-2 py-1 text-xs glass rounded border border-white/20">⌘</kbd>
          <kbd className="px-2 py-1 text-xs glass rounded border border-white/20">K</kbd>
        </div>
      </framer_motion_1.motion.button>

      {/* Search modal */}
      <framer_motion_1.AnimatePresence>
        {isOpen && (<>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)}/>

            {/* Search dialog */}
            <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ duration: 0.2 }} className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50">
              <div className="glass rounded-2xl border border-white/10 shadow-glass-lg overflow-hidden">
                {/* Search input */}
                <div className="flex items-center px-6 py-4 border-b border-white/10">
                  <svg className="w-5 h-5 text-dark-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for stations, transactions, pricing..." className="flex-1 bg-transparent text-white placeholder-dark-400 outline-none text-lg"/>
                  <button onClick={() => setIsOpen(false)} className="ml-3 text-dark-400 hover:text-white transition-colors">
                    <kbd className="px-2 py-1 text-xs glass rounded border border-white/20">ESC</kbd>
                  </button>
                </div>

                {/* Search results */}
                <div className="max-h-96 overflow-y-auto">
                  {query.trim() === '' ? (<div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                        <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                      </div>
                      <p className="text-dark-400 text-sm">Start typing to search...</p>
                      <p className="text-dark-500 text-xs mt-2">Try searching for "stations", "pricing", or "transactions"</p>
                    </div>) : results.length === 0 ? (<div className="p-8 text-center">
                      <p className="text-dark-400">No results found for "{query}"</p>
                    </div>) : (<div className="py-2">
                      {Object.entries(groupedResults).map(([category, categoryResults]) => (<div key={category}>
                          <div className="px-6 py-2">
                            <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider">{category}</h3>
                          </div>
                          {categoryResults.map((result, index) => {
                        const globalIndex = results.indexOf(result);
                        return (<framer_motion_1.motion.button key={result.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} onClick={() => handleSelect(result)} className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all duration-200 ${globalIndex === selectedIndex
                                ? 'bg-primary-500/20 text-white'
                                : 'text-dark-400 hover:text-white hover:bg-white/5'}`}>
                                <div className="flex-shrink-0 text-secondary-400">
                                  {result.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium">{result.title}</div>
                                  {result.subtitle && (<div className="text-sm text-dark-500 truncate">{result.subtitle}</div>)}
                                </div>
                                <div className="flex-shrink-0">
                                  <svg className="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                  </svg>
                                </div>
                              </framer_motion_1.motion.button>);
                    })}
                        </div>))}
                    </div>)}
                </div>

                {/* Footer */}
                {results.length > 0 && (<div className="px-6 py-3 border-t border-white/10 text-xs text-dark-400">
                    <div className="flex items-center justify-between">
                      <span>Use ↑↓ to navigate, ↵ to select, esc to close</span>
                      <span>{results.length} results</span>
                    </div>
                  </div>)}
              </div>
            </framer_motion_1.motion.div>
          </>)}
      </framer_motion_1.AnimatePresence>
    </>);
}
//# sourceMappingURL=SearchCommand.js.map