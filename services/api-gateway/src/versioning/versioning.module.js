"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersioningModule = void 0;
const common_1 = require("@nestjs/common");
const versioning_service_1 = require("./versioning.service");
const versioning_controller_1 = require("./versioning.controller");
const api_version_guard_1 = require("./guards/api-version.guard");
const core_1 = require("@nestjs/core");
let ApiVersioningModule = class ApiVersioningModule {
};
exports.ApiVersioningModule = ApiVersioningModule;
exports.ApiVersioningModule = ApiVersioningModule = __decorate([
    (0, common_1.Module)({
        controllers: [versioning_controller_1.VersioningController],
        providers: [
            versioning_service_1.VersioningService,
            {
                provide: core_1.APP_GUARD,
                useClass: api_version_guard_1.ApiVersionGuard,
            },
        ],
        exports: [versioning_service_1.VersioningService],
    })
], ApiVersioningModule);
//# sourceMappingURL=versioning.module.js.map