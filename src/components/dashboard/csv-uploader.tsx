'use client';

import { useState, useCallback, DragEvent } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseCustomers, parseProducts, parseTimes, parseSales, validateFileType, validateFileSize } from '@/lib/csv/parser';
import { useDashboardStore } from '@/stores/dashboard';
import type { Customer, Product, Time, Sale } from '@/types';

interface FileUpload {
  file: File;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  type: 'customers' | 'products' | 'times' | 'sales';
}

const ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
const MAX_SIZE_MB = 5;

export function CSVUploader() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasHadData, setHasHadData] = useState(false);
   /* const { setCustomers, setProducts, setTimes, setSales, isLoading, setLoading, setError, reset, sales } = useDashboardStore(); */
const setCustomers = useDashboardStore(state => state.setCustomers);
const setProducts = useDashboardStore(state => state.setProducts);
const setTimes = useDashboardStore(state => state.setTimes);
const setSales = useDashboardStore(state => state.setSales);
const isLoading = useDashboardStore(state => state.isLoading);
const setLoading = useDashboardStore(state => state.setLoading);
const setError = useDashboardStore(state => state.setError);
const reset = useDashboardStore(state => state.reset);
const sales = useDashboardStore(state => state.sales);

const detectFileType = (filename: string): FileUpload['type'] => {
    const lower = filename.toLowerCase();
    if (lower.includes('customer') || lower.includes('cliente') || lower.includes('dimclientes')) return 'customers';
    if (lower.includes('product') || lower.includes('dimproductos')) return 'products';
    if (lower.includes('time') || lower.includes('tiempo') || lower.includes('dimtiempo')) return 'times';
    if (lower.includes('sale') || lower.includes('hecho') || lower.includes('fact')) return 'sales';
    return 'sales'; // default
};

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileUpload[] = Array.from(fileList).map(file => ({
      file,
      status: 'pending' as const,
      type: detectFileType(file.name),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, [detectFileType]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const processFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const processFile = async (fileUpload: FileUpload): Promise<{ type: FileUpload['type']; data: unknown[] }> => {
      setFiles(prev => prev.map(f => 
        f.file === fileUpload.file ? { ...f, status: 'loading' } : f
      ));

      try {
        if (!validateFileType(fileUpload.file, ALLOWED_TYPES)) {
          throw new Error('Invalid file type. Only CSV files are accepted.');
        }

        if (!validateFileSize(fileUpload.file, MAX_SIZE_MB)) {
          throw new Error(`File exceeds maximum size of ${MAX_SIZE_MB}MB.`);
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
        }

        setFiles(prev => prev.map(f => 
          f.file === fileUpload.file ? { ...f, status: 'success' } : f
        ));

        return { type: fileUpload.type, data };
      } catch (error) {
        console.log("ERROR EN CATCH DE processFile: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setFiles(prev => prev.map(f => 
          f.file === fileUpload.file ? { ...f, status: 'error', error: errorMessage } : f
        ));
        throw error;
      }
    };

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
    } finally {
      setLoading(false);
    }
  }, [files, setCustomers, setProducts, setTimes, setSales, setLoading, setError]);

  const removeFile = useCallback((file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Load CSV Files
        </CardTitle>
        <CardDescription>
          Upload your CSV files with customer, product, time, and sales data.
          Maximum file size: {MAX_SIZE_MB}MB per file.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Drop/upload area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,text/csv"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Click to select CSV files
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Or drag and drop files here
              </p>
            </label>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((fileUpload, index) => (
                <div
                  key={`${fileUpload.file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{fileUpload.file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{fileUpload.type}</p>
                      {fileUpload.error && (
                        <p className="text-xs text-red-500">{fileUpload.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fileUpload.status === 'pending' && (
                      <span className="text-xs text-slate-400">Pending</span>
                    )}
                    {fileUpload.status === 'loading' && (
                      <span className="text-xs text-blue-500">Processing...</span>
                    )}
                    {fileUpload.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {fileUpload.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(fileUpload.file)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                    >
                      <X className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

           {/* Process button */}
           {files.length > 0 && (
             <div className="flex justify-end gap-2">
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => {
                   setFiles([]);
                   reset();
                   // Small delay to ensure reset is fully processed
                   setTimeout(() => {
                     // This helps ensure Zustand subscriptions are reset properly
                   }, 50);
                 }}
                 disabled={isLoading}
               >
                 Clear
               </Button>
               <Button
                 type="button"
                 onClick={processFiles}
                 disabled={isLoading || files.every(f => f.status === 'success')}
               >
                 {isLoading ? 'Processing...' : 'Process Files'}
               </Button>
             </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
}