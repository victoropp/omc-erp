"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
const PriceBuildUpPage = () => {
    const pbuComponents = [
        {
            category: 'Ex-Refinery',
            components: [
                { code: 'EXR_PETROL', name: 'Ex-Refinery Petrol', rate: 8.4500, type: 'GHp/L', status: 'active' },
                { code: 'EXR_DIESEL', name: 'Ex-Refinery Diesel', rate: 8.2100, type: 'GHp/L', status: 'active' },
                { code: 'EXR_KEROSENE', name: 'Ex-Refinery Kerosene', rate: 7.9800, type: 'GHp/L', status: 'active' }
            ]
        },
        {
            category: 'Taxes & Levies',
            components: [
                { code: 'ESRL', name: 'Energy Sector Recovery Levy', rate: 0.2000, type: 'GHp/L', status: 'active' },
                { code: 'PSRL', name: 'Primary School Recovery Levy', rate: 0.0400, type: 'GHp/L', status: 'active' },
                { code: 'ROAD_FUND', name: 'Road Fund', rate: 0.1800, type: 'GHp/L', status: 'active' },
                { code: 'FUEL_MARKING', name: 'Fuel Marking', rate: 0.0100, type: 'GHp/L', status: 'active' }
            ]
        },
        {
            category: 'Regulatory Margins',
            components: [
                { code: 'BOST_MARGIN', name: 'BOST Margin', rate: 0.0300, type: 'GHp/L', status: 'active' },
                { code: 'UPPF_MARGIN', name: 'UPPF Margin', rate: 0.0900, type: 'GHp/L', status: 'active' },
                { code: 'NPA_MARGIN', name: 'NPA Margin', rate: 0.0050, type: 'GHp/L', status: 'active' }
            ]
        },
        {
            category: 'Commercial Margins',
            components: [
                { code: 'OMC_MARGIN', name: 'OMC Margin', rate: 0.1500, type: 'GHp/L', status: 'active' },
                { code: 'DEALER_MARGIN', name: 'Dealer Margin', rate: 0.2200, type: 'GHp/L', status: 'active' }
            ]
        }
    ];
    const exPumpCalculation = {
        product: 'Petrol (95 Octane)',
        basePrice: 8.4500,
        components: [
            { name: 'Ex-Refinery Price', amount: 8.4500 },
            { name: 'Energy Sector Recovery Levy', amount: 0.2000 },
            { name: 'Primary School Recovery Levy', amount: 0.0400 },
            { name: 'Road Fund', amount: 0.1800 },
            { name: 'Fuel Marking', amount: 0.0100 },
            { name: 'BOST Margin', amount: 0.0300 },
            { name: 'UPPF Margin', amount: 0.0900 },
            { name: 'NPA Margin', amount: 0.0050 },
            { name: 'OMC Margin', amount: 0.1500 },
            { name: 'Dealer Margin', amount: 0.2200 }
        ],
        totalExPump: 9.3750
    };
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Price Build-Up Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">PBU Components & Ex-Pump Price Calculation</p>
        </div>

        <div className="space-y-6">
          {/* Live Price Calculator */}
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Live Ex-Pump Price Calculator</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Price Build-Up Components</h4>
                {exPumpCalculation.components.map((component, index) => (<framer_motion_1.motion.div key={component.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.05 }} className="flex justify-between items-center py-2 px-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{component.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">₵{component.amount.toFixed(4)}</span>
                  </framer_motion_1.motion.div>))}
              </div>
              <div className="flex flex-col justify-center items-center space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Final Ex-Pump Price</p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">₵{exPumpCalculation.totalExPump.toFixed(4)}</p>
                </div>
                <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  Recalculate Price
                </framer_motion_1.motion.button>
              </div>
            </div>
          </framer_motion_1.motion.div>

          {/* PBU Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pbuComponents.map((category, categoryIndex) => (<framer_motion_1.motion.div key={category.category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + categoryIndex * 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{category.category}</h3>
                <div className="space-y-3">
                  {category.components.map((component) => (<div key={component.code} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{component.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{component.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">₵{component.rate.toFixed(4)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{component.type}</p>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${component.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {component.status}
                        </span>
                      </div>
                    </div>))}
                </div>
              </framer_motion_1.motion.div>))}
          </div>

          {/* Action Buttons */}
          <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex justify-end space-x-4">
            <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Export PBU
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Update Components
            </button>
          </framer_motion_1.motion.div>
        </div>
      </div>
    </div>);
};
exports.default = PriceBuildUpPage;
//# sourceMappingURL=build-up.js.map