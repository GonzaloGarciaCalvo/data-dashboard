import Papa from 'papaparse';
import type { Customer, Product, Time, Sale, ParseResult } from '@/types';

function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Replace comma with dot for Argentine number format
  const normalized = value.toString().replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

// Map Spanish CSV column names to English keys
const columnMap: Record<string, string> = {
  'fecha': 'date',
  'year': 'year',
  'idcliente': 'customerId',
  'idproducto': 'productId',
  'ventas': 'sales',
  'costos': 'costs',
  'unidades': 'units',
  'idventa': 'saleId',
  'nombre': 'name',
  'región': 'region',
  'segmento': 'segment',
  'categoría': 'category',
  'marca': 'brand',
  'idtiempo': 'timeId',
  'mes': 'month',
  'trimestre': 'quarter',
  'año': 'year',
};

function normalizeKey(key: string): string {
  const trimmed = key.trim().toLowerCase();
  return columnMap[trimmed] || key;
}

export async function parseCSVFile<T>(file: File): Promise<ParseResult<T>> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy", // Handle lines with only commas/whitespace
      transformHeader: (header) => header.trim(),
      transform: (value) => value?.trim() || '',
      complete: (results) => {
        const data = results.data.map((row) => {
          const converted: Record<string, string | number> = {};
            for (const [key, val] of Object.entries(row as Record<string, unknown>)) {
            // Normalize key to English
            const englishKey = normalizeKey(key as string);        
            // Convert numeric fields
            const lowerKey = englishKey.toLowerCase();
            if (lowerKey === 'sales' || lowerKey === 'costs' || lowerKey === 'units') {
              converted[englishKey] = parseNumber(val as string | number);
            } else {
              converted[englishKey] = val as string;
            }
          }
          return converted as T;
        });
        resolve({
          data: data,
          errors: results.errors
        });
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
        resolve({
          data: [],
          errors: [error]
        });
      },
    });
  });
}

export async function parseCustomers(file: File): Promise<ParseResult<Customer>> {
  return parseCSVFile<Customer>(file);
}

export async function parseProducts(file: File): Promise<ParseResult<Product>> {
  return parseCSVFile<Product>(file);
}

export async function parseTimes(file: File): Promise<ParseResult<Time>> {
  return parseCSVFile<Time>(file);
}

export async function parseSales(file: File): Promise<ParseResult<Sale>> {
  return parseCSVFile<Sale>(file);
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const extension = file.name.toLowerCase().split('.').pop();
  const allowedExtensions = ['csv', 'cvs'];
  return allowedExtensions.includes(extension || '') || allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}