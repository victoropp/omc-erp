"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
nimport;
{
    UPPFPage;
}
from;
'@/components/templates/UniversalPageTemplate';
nimport;
{
    Card;
}
from;
'@/components/ui/Card';
nimport;
{
    motion;
}
from;
'framer-motion';
nimport;
{
    useRouter;
}
from;
'next/router';
n;
nexport;
function UPPFManagement() { n; const router = useRouter(); n; n; const modules = [n, { n, title: 'UPPF Dashboard', n, description: 'Real-time KPIs and analytics', n, href: '/uppf/dashboard', n, color: 'bg-blue-500', n, stats: '24/7 Monitoring', n }, n, { n, title: 'Claims Management', n, description: 'Automated claim generation and processing', n, href: '/uppf/claims', n, color: 'bg-green-500', n, stats: '3 Active Claims', n }, n, { n, title: 'GPS Tracking', n, description: 'Real-time vehicle tracking and route monitoring', n, href: '/uppf/gps-tracking', n, color: 'bg-purple-500', n, stats: '15 Active Routes', n }, n, { n, title: 'Reconciliation', n, description: 'Three-way reconciliation automation', n, href: '/uppf/reconciliation', n, color: 'bg-orange-500', n, stats: '98% Accuracy', n }, n, { n, title: 'Settlements', n, description: 'Settlement processing and tracking', n, href: '/uppf/settlements', n, color: 'bg-teal-500', n, stats: '₵2.4M Processed', n }, n, { n, title: 'Route Management', n, description: 'Optimize delivery routes and schedules', n, href: '/uppf/routes', n, color: 'bg-indigo-500', n, stats: '12 Routes Active', n }, n]; n; n; const stats = [n, { n, label: 'Active Claims', n, value: '3', n, change: '+2 today', n, changeType: 'positive', n, icon: 'Claims', n }, n, { n, label: 'GPS Alerts', n, value: '0', n, change: 'No issues', n, changeType: 'positive', n, icon: 'GPS', n }, n, { n, label: 'Settlement Value', n, value: '₵2.4M', n, change: '+8.2%', n, changeType: 'positive', n, icon: 'Settlements', n }, n, { n, label: 'Route Efficiency', n, value: '94.2%', n, change: '+2.1%', n, changeType: 'positive', n, icon: 'Routes', n }, n]; n; n; return (); n < UPPFPage; n; title = ; "UPPF Management System\"\n      description=\"Comprehensive Underground Petroleum Product Fund management with automated claims processing\"\n      stats={stats}\n      actions={[\n        {\n          label: 'Create New Claim',\n          icon: 'Claims',\n          onClick: () => router.push('/uppf/claims/create'),\n          variant: 'primary'\n        },\n        {\n          label: 'View Analytics',\n          icon: 'Analytics',\n          onClick: () => router.push('/uppf/analytics'),\n          variant: 'secondary'\n        }\n      ]}\n    >\n      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">\n        {modules.map((module, index) => (\n          <motion.div\n            key={module.title}\n            initial={{ y: 20, opacity: 0 }}\n            animate={{ y: 0, opacity: 1 }}\n            transition={{ delay: index * 0.1 }}\n            whileHover={{ y: -4 }}\n          >\n            <Card \n              className=\"p-6 h-full cursor-pointer transition-all duration-300 hover:border-primary-500/50 group\"\n              onClick={() => router.push(module.href)}\n            >\n              <div className=\"flex items-start justify-between mb-4\">\n                <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>\n                  <span className=\"text-white font-bold text-lg\">\n                    {module.title.charAt(0)}\n                  </span>\n                </div>\n                <span className=\"text-xs bg-gray-100 dark:bg-dark-800 px-2 py-1 rounded-full\">\n                  {module.stats}\n                </span>\n              </div>\n              \n              <h3 className=\"text-lg font-semibold mb-2 group-hover:text-primary-500 transition-colors\">\n                {module.title}\n              </h3>\n              \n              <p className=\"text-gray-600 dark:text-dark-400 text-sm\">\n                {module.description}\n              </p>\n\n              <div className=\"mt-4 flex items-center text-primary-500 text-sm font-medium group-hover:translate-x-2 transition-transform duration-300\">\n                <span>Access Module</span>\n                <svg className=\"w-4 h-4 ml-2\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n                  <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 5l7 7-7 7\" />\n                </svg>\n              </div>\n            </Card>\n          </motion.div>\n        ))}\n      </div>\n    </UPPFPage>\n  );\n}; }
//# sourceMappingURL=index.js.map