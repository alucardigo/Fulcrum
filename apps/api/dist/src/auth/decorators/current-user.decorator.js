"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('CurrentUserDecorator');
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user) {
        return request.user;
    }
    return null;
});
//# sourceMappingURL=current-user.decorator.js.map