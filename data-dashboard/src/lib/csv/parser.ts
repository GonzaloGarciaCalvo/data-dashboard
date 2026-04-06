import Papa from 'papaparse';
import type { Cliente, Producto, Tiempo, Hecho } from '@/types';

// Función para convertir valores string a números
function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Reemplazar coma por punto para números con formato argentino
  const normalized = value.toString().replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export async function parseCSVFile<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value?.trim() || '',
      complete: (results) => {
        // Convertir valores numéricos después de parsear
        const data = results.data.map((row: Record<string, string>) => {
          const converted: Record<string, string | number> = {};
          for (const [key, val] of Object.entries(row)) {
            // Solo convertir campos claramente numéricos, NO IDs
            if (key.toLowerCase() === 'ventas' || 
                key.toLowerCase() === 'costos' ||
                key.toLowerCase() === 'unidades') {
              converted[key] = parseNumber(val);
            } else {
              // Los IDs deben rester como strings
              converted[key] = val;
            }
          }
          return converted;
        });
        
        if (results.errors.length > 0) {
          console.warn('CSV Parse Warnings:', results.errors);
        }
        resolve(data as T[]);
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
        reject(error);
      },
    });
  });
}

export async function parseClientes(file: File): Promise<Cliente[]> {
  return parseCSVFile<Cliente>(file);
}

export async function parseProductos(file: File): Promise<Producto[]> {
  return parseCSVFile<Producto>(file);
}

export async function parseTiempos(file: File): Promise<Tiempo[]> {
  return parseCSVFile<Tiempo>(file);
}

export async function parseHechos(file: File): Promise<Hecho[]> {
  return parseCSVFile<Hecho>(file);
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const extension = file.name.toLowerCase().split('.').pop();
  const allowedExtensions = ['csv', 'cvs'];
  return allowedExtensions.includes(extension || '') || allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}