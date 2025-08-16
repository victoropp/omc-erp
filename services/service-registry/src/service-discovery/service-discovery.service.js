"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ServiceDiscoveryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_service_1 = require("../common/cache.service");
const service_registry_service_1 = require("../service-registry/service-registry.service");
let ServiceDiscoveryService = ServiceDiscoveryService_1 = class ServiceDiscoveryService {
    configService;
    cacheService;
    serviceRegistryService;
    logger = new common_1.Logger(ServiceDiscoveryService_1.name);
    DISCOVERY_CACHE_KEY = 'discovery:services';
    LOAD_BALANCER_STATE_KEY = 'discovery:load_balancer_state';
    loadBalancerState = {};
    constructor(configService, cacheService, serviceRegistryService) {
        this.configService = configService;
        this.cacheService = cacheService;
        this.serviceRegistryService = serviceRegistryService;
        this.initializeLoadBalancerState();
    }
    /**
     * Discover services by name with load balancing
     */
    async discoverService(serviceName, options) {
        try {
            const services = await this.getServiceInstances(serviceName, options);
            if (services.length === 0) {
                this.logger.warn(`No instances found for service: ${serviceName}`);
                return null;
            }
            if (services.length === 1) {
                return services[0];
            }
            const config = await this.getDiscoveryConfig();
            if (!config.enableLoadBalancing) {
                return services[0];
            }
            return this.selectServiceInstance(serviceName, services, config.strategy);
        }
        catch (error) {
            this.logger.error(`Failed to discover service ${serviceName}: ${error.message}`);
            return null;
        }
    }
    /**
     * Discover all instances of a service
     */
    async discoverAllServices(serviceName, options) {
        try {
            return await this.getServiceInstances(serviceName, options);
        }
        catch (error) {
            this.logger.error(`Failed to discover all instances for service ${serviceName}: ${error.message}`);
            return [];
        }
    }
    /**
     * Get service URL for HTTP requests
     */
    async getServiceUrl(serviceName, path = '', options) {
        const service = await this.discoverService(serviceName, options);
        if (!service) {
            return null;
        }
        const protocol = options?.protocol || 'http';
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${protocol}://${service.host}:${service.port}${cleanPath}`;
    }
    /**
     * Get all available services
     */
    async getAvailableServices() {
        const allServices = await this.serviceRegistryService.getAllServices();
        const groupedServices = {};
        Object.values(allServices).forEach(service => {
            if (!groupedServices[service.name]) {
                groupedServices[service.name] = [];
            }
            groupedServices[service.name].push(service);
        });
        return groupedServices;
    }
    /**
     * Report service call success/failure for load balancing
     */
    async reportServiceCall(serviceId, success, responseTime) {
        try {
            const service = await this.serviceRegistryService.getService(serviceId);
            if (!service)
                return;
            const state = this.loadBalancerState[service.name];
            if (!state)
                return;
            if (success) {
                state.failureCount[serviceId] = 0;
                if (responseTime) {
                    // Update connection tracking for least-connections strategy
                    if (state.connections[serviceId]) {
                        state.connections[serviceId]--;
                    }
                }
            }
            else {
                state.failureCount[serviceId] = (state.failureCount[serviceId] || 0) + 1;
            }
            state.lastUsed[serviceId] = new Date();
            // Persist state
            await this.cacheService.set(this.LOAD_BALANCER_STATE_KEY, this.loadBalancerState, 300000);
            this.logger.debug(`Reported service call for ${serviceId}: success=${success}, responseTime=${responseTime}ms`);
        }
        catch (error) {
            this.logger.error(`Failed to report service call: ${error.message}`);
        }
    }
    /**
     * Get service instances with filtering
     */
    async getServiceInstances(serviceName, options) {
        const cacheKey = `${this.DISCOVERY_CACHE_KEY}:${serviceName}:${JSON.stringify(options)}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const allServices = await this.serviceRegistryService.getAllServices();
        let services = Object.values(allServices).filter(service => service.name === serviceName);
        // Apply filters
        if (options?.version) {
            services = services.filter(service => service.version === options.version);
        }
        if (options?.tags && options.tags.length > 0) {
            services = services.filter(service => options.tags.every(tag => service.tags?.includes(tag)));
        }
        if (options?.excludeUnhealthy !== false) {
            services = services.filter(service => service.status === 'healthy' || service.status === 'starting');
        }
        // Cache results for 30 seconds
        await this.cacheService.set(cacheKey, services, 30000);
        return services;
    }
    /**
     * Select service instance using load balancing strategy
     */
    selectServiceInstance(serviceName, services, strategy) {
        const state = this.loadBalancerState[serviceName];
        if (!state) {
            this.initializeServiceState(serviceName, services);
        }
        switch (strategy) {
            case 'round-robin':
                return this.roundRobinSelection(serviceName, services);
            case 'weighted':
                return this.weightedSelection(serviceName, services);
            case 'least-connections':
                return this.leastConnectionsSelection(serviceName, services);
            case 'random':
            default:
                return services[Math.floor(Math.random() * services.length)];
        }
    }
    /**
     * Round-robin load balancing
     */
    roundRobinSelection(serviceName, services) {
        const state = this.loadBalancerState[serviceName];
        const availableServices = services.filter(service => (state.failureCount[service.id] || 0) < 3 // Circuit breaker threshold
        );
        if (availableServices.length === 0) {
            // Reset failure counts if all services are failed
            services.forEach(service => {
                state.failureCount[service.id] = 0;
            });
            return services[0];
        }
        const currentIndex = state.currentIndex % availableServices.length;
        state.currentIndex = currentIndex + 1;
        return availableServices[currentIndex];
    }
    /**
     * Weighted load balancing (based on inverse failure rate)
     */
    weightedSelection(serviceName, services) {
        const state = this.loadBalancerState[serviceName];
        // Calculate weights (inverse of failure count + 1)
        const weights = services.map(service => {
            const failures = state.failureCount[service.id] || 0;
            return 1 / (failures + 1);
        });
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < services.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return services[i];
            }
        }
        return services[services.length - 1];
    }
    /**
     * Least connections load balancing
     */
    leastConnectionsSelection(serviceName, services) {
        const state = this.loadBalancerState[serviceName];
        let minConnections = Infinity;
        let selectedService = services[0];
        services.forEach(service => {
            const connections = state.connections[service.id] || 0;
            const failures = state.failureCount[service.id] || 0;
            // Skip services with too many failures
            if (failures < 3 && connections < minConnections) {
                minConnections = connections;
                selectedService = service;
            }
        });
        // Increment connection count
        state.connections[selectedService.id] = (state.connections[selectedService.id] || 0) + 1;
        return selectedService;
    }
    /**
     * Initialize load balancer state
     */
    async initializeLoadBalancerState() {
        try {
            const cached = await this.cacheService.get(this.LOAD_BALANCER_STATE_KEY);
            if (cached) {
                this.loadBalancerState = cached;
            }
        }
        catch (error) {
            this.logger.error(`Failed to initialize load balancer state: ${error.message}`);
        }
    }
    /**
     * Initialize state for a service
     */
    initializeServiceState(serviceName, services) {
        this.loadBalancerState[serviceName] = {
            currentIndex: 0,
            connections: {},
            failureCount: {},
            lastUsed: {},
        };
        services.forEach(service => {
            const state = this.loadBalancerState[serviceName];
            state.connections[service.id] = 0;
            state.failureCount[service.id] = 0;
            state.lastUsed[service.id] = new Date();
        });
    }
    /**
     * Get discovery configuration
     */
    async getDiscoveryConfig() {
        return {
            enableLoadBalancing: this.configService.get('SERVICE_DISCOVERY_ENABLE_LOAD_BALANCING', true),
            strategy: this.configService.get('SERVICE_DISCOVERY_STRATEGY', 'round-robin'),
            healthCheckInterval: this.configService.get('SERVICE_DISCOVERY_HEALTH_CHECK_INTERVAL', 30000),
            circuitBreakerThreshold: this.configService.get('SERVICE_DISCOVERY_CIRCUIT_BREAKER_THRESHOLD', 3),
        };
    }
    /**
     * Clear discovery cache
     */
    async clearDiscoveryCache() {
        try {
            const cacheKeys = await this.cacheService.keys(`${this.DISCOVERY_CACHE_KEY}:*`);
            if (cacheKeys && cacheKeys.length > 0) {
                await Promise.all(cacheKeys.map(key => this.cacheService.del(key)));
            }
            this.logger.debug('Discovery cache cleared');
        }
        catch (error) {
            this.logger.error(`Failed to clear discovery cache: ${error.message}`);
        }
    }
};
exports.ServiceDiscoveryService = ServiceDiscoveryService;
exports.ServiceDiscoveryService = ServiceDiscoveryService = ServiceDiscoveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        cache_service_1.CacheService,
        service_registry_service_1.ServiceRegistryService])
], ServiceDiscoveryService);
//# sourceMappingURL=service-discovery.service.js.map