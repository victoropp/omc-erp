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
const Input_1 = require("@/components/ui/Input");
const Select_1 = require("@/components/ui/Select");
const PriceCalculator = () => {
    const [fuelType, setFuelType] = (0, react_1.useState)('PMS');
    const [basePrice, setBasePrice] = (0, react_1.useState)(12.50);
    const [volume, setVolume] = (0, react_1.useState)(1000);
    const [destination, setDestination] = (0, react_1.useState)('Kumasi');
    const [customRate, setCustomRate] = (0, react_1.useState)('');
    const [showBreakdown, setShowBreakdown] = (0, react_1.useState)(true);
    const fuelTypeOptions = [
        { value: 'PMS', label: 'Premium Motor Spirit (Petrol)' },
        { value: 'AGO', label: 'Automotive Gas Oil (Diesel)' },
        { value: 'KERO', label: 'Kerosene' },
        { value: 'LPG', label: 'Liquefied Petroleum Gas' }
    ];
    const destinationOptions = [
        { value: 'Kumasi', label: 'Kumasi' },
        { value: 'Tamale', label: 'Tamale' },
        { value: 'Cape Coast', label: 'Cape Coast' },
        { value: 'Bolgatanga', label: 'Bolgatanga' },
        { value: 'Wa', label: 'Wa' },
        { value: 'Ho', label: 'Ho' },
        { value: 'Sunyani', label: 'Sunyani' }
    ];
    const priceComponents = (0, react_1.useMemo)(() => {
        const components = [];
        // Base product price
        components.push({
            name: 'Base Product Price',
            value: basePrice,
            percentage: 0,
            isFixed: true,
            description: 'Ex-refinery price from TOR/NPA'
        });
        // Distribution margin
        const distributionMargin = fuelType === 'LPG' ? 0.80 : 0.65;
        components.push({
            name: 'Distribution Margin',
            value: distributionMargin,
            percentage: (distributionMargin / basePrice) * 100,
            isFixed: true,
            description: 'OMC distribution and marketing margin'
        });
        // Primary distribution
        const primaryDist = fuelType === 'AGO' ? 0.15 : 0.12;
        components.push({
            name: 'Primary Distribution',
            value: primaryDist,
            percentage: (primaryDist / basePrice) * 100,
            isFixed: true,
            description: 'Transport from depot to distribution centers'
        });
        // UPPF rate based on destination
        const uppfRates = {
            'Kumasi': 8.333,
            'Tamale': 10.125,
            'Cape Coast': 5.625,
            'Bolgatanga': 12.500,
            'Wa': 7.857,
            'Ho': 6.250,
            'Sunyani': 9.100
        };
        const uppfRate = customRate ? parseFloat(customRate) : (uppfRates[destination] || 8.333);
        components.push({
            name: 'UPPF Rate',
            value: uppfRate,
            percentage: (uppfRate / basePrice) * 100,
            isFixed: false,
            description: 'Under-recovery of Petroleum Pricing Fund rate'
        });
        // Road Fund Levy
        const roadFundLevy = fuelType === 'LPG' ? 0.00 : 0.18;
        components.push({
            name: 'Road Fund Levy',
            value: roadFundLevy,
            percentage: (roadFundLevy / basePrice) * 100,
            isFixed: true,
            description: 'Government road maintenance levy'
        });
        // Energy Sector Recovery Levy
        const esrl = fuelType === 'LPG' ? 0.00 : 0.20;
        components.push({
            name: 'Energy Sector Recovery Levy',
            value: esrl,
            percentage: (esrl / basePrice) * 100,
            isFixed: true,
            description: 'Energy sector debt recovery levy'
        });
        // Price Stabilization and Recovery Levy  
        const psrl = fuelType === 'LPG' ? 0.00 : 0.16;
        components.push({
            name: 'Price Stabilization Levy',
            value: psrl,
            percentage: (psrl / basePrice) * 100,
            isFixed: true,
            description: 'Price stabilization and recovery levy'
        });
        // National Health Insurance Levy
        const nhil = 0.125;
        components.push({
            name: 'National Health Insurance Levy',
            value: nhil,
            percentage: (nhil / basePrice) * 100,
            isFixed: true,
            description: '2.5% of ex-refinery price'
        });
        // TUC Levy
        const tucLevy = 0.02;
        components.push({
            name: 'TUC Levy',
            value: tucLevy,
            percentage: (tucLevy / basePrice) * 100,
            isFixed: true,
            description: 'Tema Oil Refinery debt recovery'
        });
        // Fuel marking margin (if applicable)
        if (fuelType !== 'LPG') {
            components.push({
                name: 'Fuel Marking Margin',
                value: 0.03,
                percentage: (0.03 / basePrice) * 100,
                isFixed: true,
                description: 'Fuel marking for quality assurance'
            });
        }
        return components;
    }, [basePrice, fuelType, destination, customRate]);
    const calculation = (0, react_1.useMemo)(() => {
        const totalPrice = priceComponents.reduce((sum, component) => sum + component.value, 0);
        const totalVolumeCost = totalPrice * volume;
        return {
            basePrice,
            taxes: priceComponents.filter(c => c.name.includes('Levy')).reduce((sum, c) => sum + c.value, 0),
            levy: priceComponents.find(c => c.name === 'UPPF Rate')?.value || 0,
            margin: priceComponents.filter(c => c.name.includes('Margin') || c.name.includes('Distribution')).reduce((sum, c) => sum + c.value, 0),
            transportCost: 0,
            uppfRate: priceComponents.find(c => c.name === 'UPPF Rate')?.value || 0,
            finalPrice: totalPrice,
            volumeCost: totalVolumeCost
        };
    }, [priceComponents, volume]);
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Price Calculator
            </h1>
            <p className="text-dark-400 mt-2">
              Calculate fuel prices including all taxes, levies, and UPPF rates
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button_1.Button variant="outline">
              Save Calculation
            </Button_1.Button>
            <Button_1.Button variant="outline">
              Export Report
            </Button_1.Button>
            <Button_1.Button variant="primary">
              Share Results
            </Button_1.Button>
          </div>
        </framer_motion_1.motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Calculator Input Panel */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-1">
            <Card_1.Card className="p-6 h-fit">
              <h3 className="text-xl font-semibold text-white mb-6">Price Calculator</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Fuel Type
                  </label>
                  <Select_1.Select options={fuelTypeOptions} value={fuelType} onChange={(value) => setFuelType(value)} placeholder="Select fuel type"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Base Price (₵ per liter)
                  </label>
                  <Input_1.Input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)} placeholder="Enter base price"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Destination
                  </label>
                  <Select_1.Select options={destinationOptions} value={destination} onChange={(value) => setDestination(value)} placeholder="Select destination"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Volume (Liters)
                  </label>
                  <Input_1.Input type="number" value={volume} onChange={(e) => setVolume(parseInt(e.target.value) || 0)} placeholder="Enter volume in liters"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Custom UPPF Rate (₵)
                  </label>
                  <Input_1.Input type="number" step="0.001" value={customRate} onChange={(e) => setCustomRate(e.target.value)} placeholder="Leave blank for default rate"/>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="showBreakdown" checked={showBreakdown} onChange={(e) => setShowBreakdown(e.target.checked)} className="w-4 h-4 text-primary-500 bg-dark-700 border-white/20 rounded focus:ring-primary-500 focus:ring-2"/>
                  <label htmlFor="showBreakdown" className="text-sm text-dark-400">
                    Show detailed breakdown
                  </label>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          {/* Results Panel */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="xl:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card_1.Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-400 mb-1">Final Price per Liter</p>
                    <p className="text-2xl font-bold text-white">₵{calculation.finalPrice.toFixed(3)}</p>
                  </div>
                  <div className="p-3 bg-primary-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                  </div>
                </div>
              </Card_1.Card>

              <Card_1.Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-400 mb-1">UPPF Rate</p>
                    <p className="text-2xl font-bold text-white">₵{calculation.uppfRate.toFixed(3)}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                  </div>
                </div>
              </Card_1.Card>

              <Card_1.Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-400 mb-1">Total Volume Cost</p>
                    <p className="text-2xl font-bold text-white">₵{(calculation.volumeCost || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
              </Card_1.Card>
            </div>

            {/* Price Breakdown */}
            {showBreakdown && (<Card_1.Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Price Breakdown</h3>
                  <span className="text-sm text-dark-400">per liter</span>
                </div>

                <div className="space-y-4">
                  {priceComponents.map((component, index) => (<div key={index} className="flex justify-between items-center p-4 bg-dark-900/30 rounded-lg border border-white/5">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">{component.name}</h4>
                          <div className="text-right">
                            <p className="font-semibold text-white">₵{component.value.toFixed(3)}</p>
                            {component.percentage > 0 && (<p className="text-xs text-dark-400">{component.percentage.toFixed(1)}% of base</p>)}
                          </div>
                        </div>
                        <p className="text-sm text-dark-400 mt-1">{component.description}</p>
                        {!component.isFixed && (<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 mt-2">
                            Variable Rate
                          </span>)}
                      </div>
                    </div>))}
                </div>

                <div className="border-t border-white/10 mt-6 pt-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-white">Total Price per Liter:</span>
                    <span className="text-primary-400">₵{calculation.finalPrice.toFixed(3)}</span>
                  </div>
                </div>
              </Card_1.Card>)}

            {/* Comparison Chart */}
            <Card_1.Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Price Comparison by Destination</h3>
              <div className="space-y-4">
                {destinationOptions.map((dest) => {
            const destUppfRates = {
                'Kumasi': 8.333,
                'Tamale': 10.125,
                'Cape Coast': 5.625,
                'Bolgatanga': 12.500,
                'Wa': 7.857,
                'Ho': 6.250,
                'Sunyani': 9.100
            };
            const destPrice = basePrice + (destUppfRates[dest.value] || 8.333) +
                priceComponents.filter(c => !c.name.includes('UPPF')).reduce((sum, c) => sum + c.value, 0);
            const isSelected = dest.value === destination;
            return (<div key={dest.value} className={`flex justify-between items-center p-3 rounded-lg transition-colors ${isSelected ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-dark-900/30 hover:bg-dark-900/50'}`}>
                      <div>
                        <span className={`font-medium ${isSelected ? 'text-primary-400' : 'text-white'}`}>
                          {dest.label}
                        </span>
                        <span className="text-sm text-dark-400 ml-2">
                          UPPF: ₵{(destUppfRates[dest.value] || 8.333).toFixed(3)}
                        </span>
                      </div>
                      <span className={`font-semibold ${isSelected ? 'text-primary-400' : 'text-white'}`}>
                        ₵{destPrice.toFixed(3)}
                      </span>
                    </div>);
        })}
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = PriceCalculator;
//# sourceMappingURL=calculator.js.map