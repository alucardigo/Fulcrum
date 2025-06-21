"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('3000'),
    API_PREFIX: zod_1.z.string().default('api'),
    DATABASE_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(),
    JWT_EXPIRES_IN: zod_1.z.string().default('1d'),
    JWT_REFRESH_SECRET: zod_1.z.string(),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    RATE_LIMIT_WINDOW: zod_1.z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX: zod_1.z.string().transform(Number).default('100'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FILE_MAX_SIZE: zod_1.z.string().transform(Number).default('10485760'),
    LOG_MAX_FILES: zod_1.z.string().transform(Number).default('5'),
    CORS_ORIGIN: zod_1.z.string().default('*'),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().optional(),
});
exports.config = envSchema.parse(process.env);
//# sourceMappingURL=configuration.js.map