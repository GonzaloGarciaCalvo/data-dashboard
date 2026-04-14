'use client';

import { useState, useCallback } from 'react';
import type { FileUpload } from '@/types';
import { useDashboardStore } from '@/stores/dashboard';
import { validateFileType, validateFileSize } from '@/lib/csv/parser';
import { parseCustomers, parseProducts, parseTimes, parseSales } from '@/lib/csv/parser';
import type { Customer, Product, Time, Sale } from '@/types';

interface UseFileProcessorProps {
  files: FileUpload[];
  setFiles: React.Dispatch<React.SetStateAction<FileUpload[]>>;
}

export function useFileProcessor({ files, setFiles }: UseFileProcessorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    setCustomers, 
    setProducts, 
    setTimes, 
    setSales,
    setLoading: setStoreLoading,
    setError: setStoreError,
    reset 
  } = useDashboardStore();

  const processFile = useCallback(async (fileUpload: FileUpload): Promise<{ 
    type: FileUpload['type']; 
    data: unknown[] 
  }> => {
    setFiles(prev => prev.map(f => 
      f.file === fileUpload.file ? { ...f, status: 'loading' } : f
    ));
    
    try {
      // Validaciones
      if (!validateFileType(fileUpload.file, ['text/csv', 'application/vnd.ms-excel', 'text/plain'])) {
        throw new Error('Invalid file type. Only CSV files are accepted.');
      }
      
      if (!validateFileSize(fileUpload.file, 5)) { // 5MB max
        throw new Error(`File exceeds maximum size of 5MB.`);
      }
      
      let data: unknown[] = [];

      switch (fileUpload.type) {
        case 'customers':
          data = await parseCustomers(fileUpload.file);
          break;
        case 'products':
          data = await parseProducts(fileUpload.file);
          break;
        case 'times':
          data = await parseTimes(fileUpload.file);
          break;
        case 'sales':
          data = await parseSales(fileUpload.file);
          break;
        default:
          throw new Error(`Unknown file type: ${fileUpload.type}`);
      }

      setFiles(prev => prev.map(f => 
        f.file === fileUpload.file ? { ...f, status: 'success' } : f
      ));

      return { type: fileUpload.type, data };
    } catch (error) {
      console.error("ERROR EN CATCH DE processFile: ", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setFiles(prev => prev.map(f => 
        f.file === fileUpload.file ? { ...f, status: 'error', error: errorMessage } : f
      ));
      
      throw error;
    }
  }, [setFiles]); // Removed files dependency as it's only used in the setter callback

  const processFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStoreLoading(true);
    setStoreError(null);
    
    try {
      const results = await Promise.all(files.map(processFile));
      
      results.forEach((result) => {
        switch (result.type) {
          case "customers":
            setCustomers(result.data as Customer[]);
            break;
          case "products":
            setProducts(result.data as Product[]);
            break;
          case "times":
            setTimes(result.data as Time[]);
            break;
          case "sales":
            setSales(result.data as Sale[]);
            break;
        }
      });

      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error processing files';
      setError(errorMessage);
      setStoreError(errorMessage);
    } finally {
      setIsLoading(false);
      setStoreLoading(false);
    }
  }, [files, processFile, setCustomers, setProducts, setTimes, setSales, setStoreLoading, setStoreError]);

  const resetAll = useCallback(() => {
    setFiles([]);
    reset();
  }, [reset, setFiles]);

  return {
    isLoading,
    error,
    processFiles,
    resetAll
  };
}