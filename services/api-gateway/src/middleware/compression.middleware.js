"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressionMiddleware = void 0;
const common_1 = require("@nestjs/common");
const compression_1 = __importDefault(require("compression"));
let CompressionMiddleware = class CompressionMiddleware {
    compressionMiddleware = (0, compression_1.default)({
        filter: (req, res) => {
            // Don't compress if the client doesn't support it
            if (req.headers['x-no-compression']) {
                return false;
            }
            // Use compression default filter function
            return compression_1.default.filter(req, res);
        },
        level: 6, // Default compression level
        threshold: 1024, // Only compress if response is > 1KB
        windowBits: 15,
        memLevel: 8,
    });
    use(req, res, next) {
        this.compressionMiddleware(req, res, next);
    }
};
exports.CompressionMiddleware = CompressionMiddleware;
exports.CompressionMiddleware = CompressionMiddleware = __decorate([
    (0, common_1.Injectable)()
], CompressionMiddleware);
//# sourceMappingURL=compression.middleware.js.map