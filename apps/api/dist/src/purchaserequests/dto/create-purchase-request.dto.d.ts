import { z } from 'zod';
import { PurchaseRequestPriority } from '@prisma/client';
declare const CreatePurchaseRequestDto_base: import("nestjs-zod").ZodDto<{
    title: string;
    priority: "BAIXA" | "NORMAL" | "ALTA" | "URGENTE";
    justification: string;
    items: {
        name: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        supplier?: string | undefined;
        supplierCNPJ?: string | undefined;
    }[];
    costCenter?: string | undefined;
    description?: string | undefined;
    projectId?: string | undefined;
    expectedDeliveryDate?: Date | undefined;
}, z.ZodObjectDef<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodNativeEnum<{
        BAIXA: "BAIXA";
        NORMAL: "NORMAL";
        ALTA: "ALTA";
        URGENTE: "URGENTE";
    }>;
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
        name: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        supplier?: string | undefined;
        supplierCNPJ?: string | undefined;
    }, {
        name: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        supplier?: string | undefined;
        supplierCNPJ?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    title: string;
    priority: "BAIXA" | "NORMAL" | "ALTA" | "URGENTE";
    justification: string;
    items: {
        name: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
        supplier?: string | undefined;
        supplierCNPJ?: string | undefined;
    }[];
    costCenter?: string | undefined;
    description?: string | undefined;
    projectId?: string | undefined;
    expectedDeliveryDate?: Date | undefined;
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
