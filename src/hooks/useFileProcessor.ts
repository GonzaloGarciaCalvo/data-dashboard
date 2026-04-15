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
  // Hook for validation, parsing, store activation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<Array<{ file: File; errors: any[] }>>([]);
  const [processedData, setProcessedData] = useState<Array<{ 
    file: File; 
    type: FileUpload['type']; 
    data: unknown[] 
  }>>([]);

  const { 
    setCustomers, 
    setProducts, 
    setTimes, 
    setSales,
    setLoading: setStoreLoading,
    setError: setStoreError,
    reset 
  } = useDashboardStore();

  const parseFile = useCallback(async (fileUpload: FileUpload) => {
    try {
      // Validaciones
      if (!validateFileType(fileUpload.file, ['text/csv', 'application/vnd.ms-excel', 'text/plain'])) {
        throw new Error('Invalid file type. Only CSV files are accepted.');
      }
      
      if (!validateFileSize(fileUpload.file, 5)) { // 5MB max
        throw new Error(`File exceeds maximum size of 5MB.`);
      }

      let result: { data: unknown[]; errors: any[] };

      switch (fileUpload.type) {
        case 'customers':
          result = await parseCustomers(fileUpload.file);
          break;
        case 'products':
          result = await parseProducts(fileUpload.file);
          break;
        case 'times':
          result = await parseTimes(fileUpload.file);
          break;
        case 'sales':
          result = await parseSales(fileUpload.file);
          break;
        default:
          throw new Error(`Unknown file type: ${fileUpload.type}`);
      }

      return { 
        file: fileUpload.file, 
        type: fileUpload.type, 
        data: result.data, 
        errors: result.errors 
      };
    } catch (err) {
      throw err;
    }
  }, []);

  const processFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setParseErrors([]);
    setProcessedData([]);

    try {
      // Process all files in parallel
      const results = await Promise.all(files.map(parseFile));
      
      // Check for any parse errors
      const filesWithErrors = results.filter(r => r.errors.length > 0);
      console.log('[useFileProcessor] results: ', results);
      if (filesWithErrors.length > 0) {
        //console.error('[useFileProcessor] errors found: ', filesWithErrors);
        // Store the errors and the processed data (so we can use if user chooses to continue)
        setParseErrors(filesWithErrors.map(r => ({ 
          file: r.file, 
          errors: r.errors 
        })));
        setProcessedData(results); // Keep all results (including successful ones) for potential continuation
        return;
      }

      // No parse errors - update store with all data
      results.forEach(({ type, data }) => {
        switch (type) {
          case "customers":
            setCustomers(data as Customer[]);
            break;
          case "products":
            setProducts(data as Product[]);
            break;
          case "times":
            setTimes(data as Time[]);
            break;
          case "sales":
            setSales(data as Sale[]);
            break;
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error processing files';
      setError(errorMessage);
      setStoreError(errorMessage);
    } finally {
      setIsLoading(false);
      setStoreLoading(false);
    }
  }, [files, parseFile, setCustomers, setProducts, setTimes, setSales, setStoreLoading, setStoreError]);

  const clearParseErrors = useCallback(() => {
    setParseErrors([]);
    setProcessedData([]);
  }, []);

  const continueProcessing = useCallback(() => {
    // Update store with the processed data (ignoring errors)
    processedData.forEach(({ type, data }) => {
      switch (type) {
        case "customers":
          setCustomers(data as Customer[]);
          break;
        case "products":
          setProducts(data as Product[]);
          break;
        case "times":
          setTimes(data as Time[]);
          break;
        case "sales":
          setSales(data as Sale[]);
          break;
      }
    });
    clearParseErrors();
  }, [processedData, setCustomers, setProducts, setTimes, setSales, clearParseErrors]);

  const resetAll = useCallback(() => {
    setFiles([]);
    reset();
    clearParseErrors();
  }, [reset, setFiles, clearParseErrors]);

  return {
    isLoading,
    error,
    processFiles,
    resetAll,
    parseErrors,
    clearParseErrors,
    continueProcessing
  };
}