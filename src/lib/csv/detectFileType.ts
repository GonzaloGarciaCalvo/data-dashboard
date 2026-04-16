import { FileUpload } from "@/types";

export const detectFileType = (filename: string): FileUpload['type'] => {
    const lower = filename.toLowerCase();
    if (lower.includes('customer') || lower.includes('cliente') || lower.includes('dimclientes')) return 'customers';
    if (lower.includes('product') || lower.includes('dimproductos')) return 'products';
    if (lower.includes('time') || lower.includes('tiempo') || lower.includes('dimtiempo')) return 'times';
    if (lower.includes('sale') || lower.includes('hecho') || lower.includes('fact')) return 'sales';
    return 'sales';
};