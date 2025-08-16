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
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const Card_1 = require("@/components/ui/Card");
const Button_1 = require("@/components/ui/Button");
const Table_1 = require("@/components/ui/Table");
const PBUComponents = () => {
    const [components] = (0, react_1.useState)([
        {
            id: '1',
            name: 'Distribution Margin',
            type: 'margin',
            rate: 0.65,
            unit: 'fixed',
            applicableFuels: ['PMS', 'AGO', 'KERO'],
            status: 'active',
            lastUpdated: '2025-01-10',
            description: 'OMC distribution and marketing margin'
        },
        {
            id: '2',
            name: 'Road Fund Levy',
            type: 'levy',
            rate: 0.18,
            unit: 'fixed',
            applicableFuels: ['PMS', 'AGO', 'KERO'],
            status: 'active',
            lastUpdated: '2025-01-08',
            description: 'Government road maintenance levy'
        },
        {
            id: '3',
            name: 'Energy Sector Recovery Levy',
            type: 'levy',
            rate: 0.20,
            unit: 'fixed',
            applicableFuels: ['PMS', 'AGO'],
            status: 'active',
            lastUpdated: '2025-01-05',
            description: 'Energy sector debt recovery levy'
        },
        {
            id: '4',
            name: 'National Health Insurance Levy',
            type: 'tax',
            rate: 2.5,
            unit: 'percentage',
            applicableFuels: ['PMS', 'AGO', 'KERO', 'LPG'],
            status: 'active',
            lastUpdated: '2024-12-15',
            description: '2.5% of ex-refinery price for NHIL'
        }
    ]);
    const getTypeColor = (type) => {
        const colors = {
            tax: 'text-red-400 bg-red-400/10',
            levy: 'text-yellow-400 bg-yellow-400/10',
            margin: 'text-green-400 bg-green-400/10',
            cost: 'text-blue-400 bg-blue-400/10'
        };
        return colors[type];
    };
    const getStatusColor = (status) => {
        return status === 'active'
            ? 'text-green-400 bg-green-400/10 border-green-400/30'
            : 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    };
    const tableColumns = [
        { key: 'name', label: 'Component Name' },
        { key: 'type', label: 'Type' },
        { key: 'rate', label: 'Rate' },
        { key: 'applicableFuels', label: 'Applicable Fuels' },
        { key: 'status', label: 'Status' },
        { key: 'lastUpdated', label: 'Last Updated' },
        { key: 'actions', label: 'Actions' }
    ];
    const tableData = components.map(component => ({
        name: component.name,
        type: (<span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(component.type)}`}>
        {component.type.toUpperCase()}
      </span>),
        rate: `${component.unit === 'percentage' ? component.rate + '%' : '₵' + component.rate.toFixed(3)}`,
        applicableFuels: (<div className="flex flex-wrap gap-1">
        {component.applicableFuels.map(fuel => (<span key={fuel} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded border border-primary-500/30">
            {fuel}
          </span>))}
      </div>),
        status: (<span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(component.status)}`}>
        {component.status.toUpperCase()}
      </span>),
        lastUpdated: component.lastUpdated,
        actions: (<div className="flex space-x-2">
        <Button_1.Button variant="outline" size="sm">Edit</Button_1.Button>
        <Button_1.Button variant="outline" size="sm">History</Button_1.Button>
      </div>)
    }));
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              PBU Components
            </h1>
            <p className="text-dark-400 mt-2">
              Manage Price Build-Up components including taxes, levies, and margins
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button_1.Button variant="outline">Import Components</Button_1.Button>
            <Button_1.Button variant="primary">New Component</Button_1.Button>
          </div>
        </framer_motion_1.motion.div>

        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card_1.Card className="p-6">
            <Table_1.Table columns={tableColumns} data={tableData} className="w-full"/>
          </Card_1.Card>
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = PBUComponents;
//# sourceMappingURL=components.js.map