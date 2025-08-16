"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
nimport;
{
    motion;
}
from;
'framer-motion';
nimport;
{
    Card;
}
from;
'@/components/ui/Card';
nimport;
{
    Button;
}
from;
'@/components/ui/Button';
nimport;
{
    NavigationIcons;
}
from;
'@/components/ui/NavigationIcons';
nimport;
{
    useTheme;
}
from;
'@/contexts/ThemeContext';
n;
ninterface;
PageAction;
{
    n;
    label: string;
    n;
    icon ?  : keyof;
    typeof NavigationIcons;
    n;
    onClick ?  : () => void ;
    n;
    variant ?  : 'primary' | 'secondary' | 'danger';
    n;
    disabled ?  : boolean;
    n;
}
n;
ninterface;
PageStat;
{
    n;
    label: string;
    n;
    value: string;
    n;
    change ?  : string;
    n;
    changeType ?  : 'positive' | 'negative' | 'neutral';
    n;
    icon ?  : keyof;
    typeof NavigationIcons;
    n;
}
n;
ninterface;
UniversalPageTemplateProps;
{
    n;
    title: string;
    n;
    description ?  : string;
    n;
    icon ?  : keyof;
    typeof NavigationIcons;
    n;
    breadcrumbs ?  : { label: string, href: string }[];
    n;
    actions ?  : PageAction[];
    n;
    stats ?  : PageStat[];
    n;
    children ?  : react_1.default.ReactNode;
    n;
    loading ?  : boolean;
    n;
    error ?  : string;
    n;
    showSearch ?  : boolean;
    n;
    searchPlaceholder ?  : string;
    n;
}
n;
nexport;
function UniversalPageTemplate({ n, title, n, description, n, icon, n, breadcrumbs, n, actions = [], n, stats = [], n, children, n, loading = false, n, error, n, showSearch = false, n, searchPlaceholder = 'Search...', n }) { n; const { actualTheme } = useTheme(); n; const [searchTerm, setSearchTerm] = react_1.default.useState(''); n; n; const IconComponent = icon ? NavigationIcons[icon] : null; n; n; if (loading) {
    n;
    return ();
    n < div;
    className = ;
    "min-h-screen flex items-center justify-center\">\n        <motion.div\n          animate={{ rotate: 360 }}\n          transition={{ duration: 2, repeat: Infinity, ease: \"linear\" }}\n          className=\"w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500\"\n        />\n      </div>\n    );\n  }\n\n  if (error) {\n    return (\n      <div className=\"min-h-screen flex items-center justify-center\">\n        <Card className=\"p-8 text-center\">\n          <NavigationIcons.Settings className=\"w-16 h-16 mx-auto mb-4 text-red-500\" />\n          <h2 className=\"text-2xl font-bold mb-2 text-red-500\">Error</h2>\n          <p className=\"text-gray-600 mb-4\">{error}</p>\n          <Button onClick={() => window.location.reload()}>Retry</Button>\n        </Card>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"min-h-screen space-y-6\">\n      {/* Header Section */}\n      <motion.div\n        initial={{ y: -20, opacity: 0 }}\n        animate={{ y: 0, opacity: 1 }}\n        transition={{ duration: 0.5 }}\n        className=\"space-y-4\"\n      >\n        {/* Breadcrumbs */}\n        {breadcrumbs && breadcrumbs.length > 0 && (\n          <nav className=\"flex items-center space-x-2 text-sm\">\n            {breadcrumbs.map((crumb, index) => (\n              <React.Fragment key={index}>\n                {index > 0 && (\n                  <span className={`text-${actualTheme === 'dark' ? 'dark-400' : 'gray-400'}`}>/</span>\n                )}\n                {crumb.href ? (\n                  <a \n                    href={crumb.href}\n                    className={`hover:text-primary-500 transition-colors ${\n                      actualTheme === 'dark' ? 'text-dark-300' : 'text-gray-600'\n                    }`}\n                  >\n                    {crumb.label}\n                  </a>\n                ) : (\n                  <span className={`font-medium ${\n                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'\n                  }`}>\n                    {crumb.label}\n                  </span>\n                )}\n              </React.Fragment>\n            ))}\n          </nav>\n        )}\n\n        {/* Title Section */}\n        <div className=\"flex items-center justify-between\">\n          <div className=\"flex items-center space-x-4\">\n            {IconComponent && (\n              <motion.div\n                initial={{ scale: 0 }}\n                animate={{ scale: 1 }}\n                transition={{ type: \"spring\", stiffness: 200, damping: 15 }}\n                className=\"w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center\"\n              >\n                <IconComponent className=\"w-6 h-6 text-white\" />\n              </motion.div>\n            )}\n            <div>\n              <h1 className={`text-3xl font-display font-bold transition-colors duration-300 ${\n                actualTheme === 'dark' ? 'text-white' : 'text-gray-900'\n              }`}>\n                {title}\n              </h1>\n              {description && (\n                <p className={`text-lg mt-1 transition-colors duration-300 ${\n                  actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'\n                }`}>\n                  {description}\n                </p>\n              )}\n            </div>\n          </div>\n\n          {/* Actions */}\n          {actions.length > 0 && (\n            <div className=\"flex items-center space-x-3\">\n              {actions.map((action, index) => {\n                const ActionIcon = action.icon ? NavigationIcons[action.icon] : null;\n                return (\n                  <Button\n                    key={index}\n                    onClick={action.onClick}\n                    variant={action.variant || 'primary'}\n                    disabled={action.disabled}\n                    className=\"flex items-center space-x-2\"\n                  >\n                    {ActionIcon && <ActionIcon className=\"w-4 h-4\" />}\n                    <span>{action.label}</span>\n                  </Button>\n                );\n              })}\n            </div>\n          )}\n        </div>\n\n        {/* Search Bar */}\n        {showSearch && (\n          <motion.div\n            initial={{ y: 20, opacity: 0 }}\n            animate={{ y: 0, opacity: 1 }}\n            transition={{ delay: 0.2 }}\n            className=\"relative max-w-md\"\n          >\n            <input\n              type=\"text\"\n              placeholder={searchPlaceholder}\n              value={searchTerm}\n              onChange={(e) => setSearchTerm(e.target.value)}\n              className={`w-full px-4 py-3 pl-10 rounded-xl border transition-all duration-300 ${\n                actualTheme === 'dark'\n                  ? 'bg-dark-800 border-dark-700 text-white placeholder-dark-400 focus:border-primary-500'\n                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'\n              } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}\n            />\n            <NavigationIcons.Settings className=\"absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400\" />\n          </motion.div>\n        )}\n      </motion.div>\n\n      {/* Stats Section */}\n      {stats.length > 0 && (\n        <motion.div\n          initial={{ y: 20, opacity: 0 }}\n          animate={{ y: 0, opacity: 1 }}\n          transition={{ delay: 0.3 }}\n          className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\"\n        >\n          {stats.map((stat, index) => {\n            const StatIcon = stat.icon ? NavigationIcons[stat.icon] : null;\n            return (\n              <motion.div\n                key={index}\n                whileHover={{ y: -4 }}\n                className=\"glass rounded-xl p-6 border transition-all duration-300 hover:border-primary-500/50\"\n              >\n                <div className=\"flex items-center justify-between mb-2\">\n                  <span className={`text-sm font-medium transition-colors duration-300 ${\n                    actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'\n                  }`}>\n                    {stat.label}\n                  </span>\n                  {StatIcon && (\n                    <StatIcon className={`w-5 h-5 transition-colors duration-300 ${\n                      actualTheme === 'dark' ? 'text-dark-500' : 'text-gray-400'\n                    }`} />\n                  )}\n                </div>\n                <div className=\"flex items-center justify-between\">\n                  <span className={`text-2xl font-bold transition-colors duration-300 ${\n                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'\n                  }`}>\n                    {stat.value}\n                  </span>\n                  {stat.change && (\n                    <span className={`text-sm font-medium ${\n                      stat.changeType === 'positive' ? 'text-green-500' :\n                      stat.changeType === 'negative' ? 'text-red-500' :\n                      actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'\n                    }`}>\n                      {stat.change}\n                    </span>\n                  )}\n                </div>\n              </motion.div>\n            );\n          })}\n        </motion.div>\n      )}\n\n      {/* Content Section */}\n      <motion.div\n        initial={{ y: 20, opacity: 0 }}\n        animate={{ y: 0, opacity: 1 }}\n        transition={{ delay: 0.4 }}\n        className=\"space-y-6\"\n      >\n        {children}\n      </motion.div>\n    </div>\n  );\n}\n\n// Quick page wrapper for common patterns\nexport function DashboardPage({ title, children, ...props }: Omit<UniversalPageTemplateProps, 'icon'>) {\n  return (\n    <UniversalPageTemplate \n      icon=\"Dashboard\" \n      title={title}\n      {...props}\n    >\n      {children}\n    </UniversalPageTemplate>\n  );\n}\n\nexport function UPPFPage({ title, children, ...props }: Omit<UniversalPageTemplateProps, 'icon'>) {\n  return (\n    <UniversalPageTemplate \n      icon=\"UPPF\" \n      title={title}\n      breadcrumbs={[{ label: 'UPPF Management' }, { label: title }]}\n      {...props}\n    >\n      {children}\n    </UniversalPageTemplate>\n  );\n}\n\nexport function PricingPage({ title, children, ...props }: Omit<UniversalPageTemplateProps, 'icon'>) {\n  return (\n    <UniversalPageTemplate \n      icon=\"Pricing\" \n      title={title}\n      breadcrumbs={[{ label: 'Pricing Management' }, { label: title }]}\n      {...props}\n    >\n      {children}\n    </UniversalPageTemplate>\n  );\n}\n\nexport function DealerPage({ title, children, ...props }: Omit<UniversalPageTemplateProps, 'icon'>) {\n  return (\n    <UniversalPageTemplate \n      icon=\"Dealers\" \n      title={title}\n      breadcrumbs={[{ label: 'Dealer Management' }, { label: title }]}\n      {...props}\n    >\n      {children}\n    </UniversalPageTemplate>\n  );\n}\n\nexport function IFRSPage({ title, children, ...props }: Omit<UniversalPageTemplateProps, 'icon'>) {\n  return (\n    <UniversalPageTemplate \n      icon=\"IFRS\" \n      title={title}\n      breadcrumbs={[{ label: 'IFRS Compliance' }, { label: title }]}\n      {...props}\n    >\n      {children}\n    </UniversalPageTemplate>\n  );\n};
} }
//# sourceMappingURL=UniversalPageTemplate.js.map