"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CaslAbilityFactory_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaslAbilityFactory = exports.Action = exports.PurchaseRequestState = exports.UserRole = void 0;
const common_1 = require("@nestjs/common");
const ability_1 = require("@casl/ability");
var UserRole;
(function (UserRole) {
    UserRole["SOLICITANTE"] = "SOLICITANTE";
    UserRole["COMPRAS"] = "COMPRAS";
    UserRole["GERENCIA"] = "GERENCIA";
    UserRole["ADMINISTRADOR"] = "ADMINISTRADOR";
})(UserRole || (exports.UserRole = UserRole = {}));
var PurchaseRequestState;
(function (PurchaseRequestState) {
    PurchaseRequestState["RASCUNHO"] = "RASCUNHO";
    PurchaseRequestState["PENDENTE_COMPRAS"] = "PENDENTE_COMPRAS";
    PurchaseRequestState["PENDENTE_GERENCIA"] = "PENDENTE_GERENCIA";
    PurchaseRequestState["APROVADO"] = "APROVADO";
    PurchaseRequestState["REJEITADO"] = "REJEITADO";
    PurchaseRequestState["COMPRADO"] = "COMPRADO";
    PurchaseRequestState["ENTREGUE"] = "ENTREGUE";
    PurchaseRequestState["CANCELADO"] = "CANCELADO";
})(PurchaseRequestState || (exports.PurchaseRequestState = PurchaseRequestState = {}));
var Action;
(function (Action) {
    Action["Manage"] = "manage";
    Action["Create"] = "create";
    Action["Read"] = "read";
    Action["Update"] = "update";
    Action["Delete"] = "delete";
    Action["Submit"] = "submit";
    Action["ApprovePurchase"] = "approve_purchase";
    Action["ApproveManagement"] = "approve_management";
    Action["Reject"] = "reject";
    Action["PlaceOrder"] = "place_order";
    Action["ReceiveItems"] = "receive_items";
    Action["Cancel"] = "cancel";
})(Action || (exports.Action = Action = {}));
let CaslAbilityFactory = CaslAbilityFactory_1 = class CaslAbilityFactory {
    logger = new common_1.Logger(CaslAbilityFactory_1.name);
    createForUser(user) {
        const { can, cannot, build } = new ability_1.AbilityBuilder(ability_1.Ability);
        if (!user) {
            this.logger.debug('Construindo habilidades para usuário não autenticado');
            cannot(Action.Manage, 'all');
            return build();
        }
        this.logger.debug(`Construindo habilidades para usuário: ${user.email} (ID: ${user.id}), Roles: ${user.roles.map(r => r.role).join(', ')}`);
        if (user.roles.some(r => r.role === UserRole.ADMINISTRADOR)) {
            can(Action.Manage, 'all');
        }
        if (user.roles.some(r => r.role === UserRole.SOLICITANTE)) {
            can(Action.Create, 'PurchaseRequest');
            can([Action.Read, Action.Update], 'PurchaseRequest');
            can(Action.Submit, 'PurchaseRequest');
            can(Action.Cancel, 'PurchaseRequest');
        }
        if (user.roles.some(r => r.role === UserRole.COMPRAS)) {
            can(Action.Read, 'PurchaseRequest');
            can(Action.ApprovePurchase, 'PurchaseRequest');
            can(Action.Reject, 'PurchaseRequest');
            can(Action.PlaceOrder, 'PurchaseRequest');
            can(Action.ReceiveItems, 'PurchaseRequest');
        }
        if (user.roles.some(r => r.role === UserRole.GERENCIA)) {
            can(Action.Read, 'PurchaseRequest');
            can(Action.ApproveManagement, 'PurchaseRequest');
            can(Action.Reject, 'PurchaseRequest');
        }
        return build({
            detectSubjectType: (item) => {
                if (item === 'all')
                    return item;
                if (item && typeof item === 'object' && 'email' in item)
                    return 'User';
                if (item && typeof item === 'object' && 'title' in item)
                    return 'PurchaseRequest';
                if (item && typeof item === 'object' && 'budget' in item)
                    return 'Project';
                if (item && typeof item === 'object' && 'quantity' in item)
                    return 'Item';
                try {
                    return item?.constructor?.name || 'all';
                }
                catch {
                    return 'all';
                }
            }
        });
    }
};
exports.CaslAbilityFactory = CaslAbilityFactory;
exports.CaslAbilityFactory = CaslAbilityFactory = CaslAbilityFactory_1 = __decorate([
    (0, common_1.Injectable)()
], CaslAbilityFactory);
//# sourceMappingURL=casl-ability.factory.js.map