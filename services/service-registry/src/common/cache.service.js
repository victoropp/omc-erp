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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
let CacheService = class CacheService {
    cache = new Map();
    async get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return undefined;
        }
        // Check if expired
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return undefined;
        }
        return item.value;
    }
    async set(key, value, ttl = 60000) {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
    }
    async del(key) {
        this.cache.delete(key);
    }
    async reset() {
        this.cache.clear();
    }
    async keys(pattern) {
        const keys = Array.from(this.cache.keys());
        if (!pattern) {
            return keys;
        }
        // Simple pattern matching (supports * wildcard)
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return keys.filter(key => regex.test(key));
    }
    // Cleanup expired entries periodically
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }
    // Start cleanup interval
    constructor() {
        setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CacheService);
//# sourceMappingURL=cache.service.js.map