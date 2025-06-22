import { z } from 'zod';
import { PurchaseRequestPriority } from '@prisma/client';
declare const CreatePurchaseRequestDto_base: import("nestjs-zod").ZodDto<{
    [x: string]: any;
    title?: unknown;
    description?: unknown;
    priority?: unknown;
    projectId?: unknown;
    costCenter?: unknown;
    justification?: unknown;
    expectedDeliveryDate?: unknown;
    items?: unknown;
}, z.ZodObjectDef<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodNativeEnum<any>;
    projectId: z.ZodOptional<z.ZodString>;
    costCenter: z.ZodOptional<z.ZodString>;
    justification: z.ZodString;
    expectedDeliveryDate: z.ZodOptional<z.ZodDate>;
    items: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        supplier: z.ZodOptional<z.ZodString>;
        supplierCNPJ: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        name: string;
        unitPrice: number;
        description?: string | undefined;
        supplier?: string | undefined;
        supplierCNPJ?: string | undefined;
    }, {
        quantity: number;
        name: string;
        unitPrice: number;
        description?: string | undefined;
        supplier?: string | undefined;
        supplierCNPJ?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    [x: string]: any;
    title?: unknown;
    description?: unknown;
    priority?: unknown;
    projectId?: unknown;
    costCenter?: unknown;
    justification?: unknown;
    expectedDeliveryDate?: unknown;
    items?: unknown;
}>;
export declare class CreatePurchaseRequestDto extends CreatePurchaseRequestDto_base {
    title: string;
    description?: string;
    priority: PurchaseRequestPriority;
    projectId?: string;
    costCenter?: string;
    justification: string;
    expectedDeliveryDate?: Date;
    items: {
        name: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        supplier?: string;
        supplierCNPJ?: string;
    }[];
}
export {};
