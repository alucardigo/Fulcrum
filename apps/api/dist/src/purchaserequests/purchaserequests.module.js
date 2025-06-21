"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const purchaserequests_service_1 = require("./services/purchaserequests.service");
const purchaserequests_controller_1 = require("./controllers/purchaserequests.controller");
const auth_module_1 = require("../auth/auth.module");
const items_module_1 = require("../items/items.module");
const casl_module_1 = require("../casl/casl.module");
let PurchaseRequestsModule = class PurchaseRequestsModule {
};
exports.PurchaseRequestsModule = PurchaseRequestsModule;
exports.PurchaseRequestsModule = PurchaseRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            items_module_1.ItemsModule,
            casl_module_1.CaslModule,
        ],
        controllers: [purchaserequests_controller_1.PurchaseRequestsController],
        providers: [
            purchaserequests_service_1.PurchaseRequestsService,
        ],
    })
], PurchaseRequestsModule);
//# sourceMappingURL=purchaserequests.module.js.map