'use client';

import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileList } from './file-list';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useFileProcessor } from '@/hooks/useFileProcessor';

const ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
const MAX_SIZE_MB = 5;

export function CSVUploader() {
  // Hook para manejar archivos (drag/drop, selección) - ahora manejamos el estado aquí
  const {
    files,
    isDragging,
    handleFiles,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile: handlerRemoveFile,
    setFiles: handlerSetFiles
  } = useFileHandler();

  // Hook para procesar archivos (validación, parsing, actualización de store)
  const fileProcessor = useFileProcessor({ 
    files, 
    setFiles: handlerSetFiles 
  });


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
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="mx-auto h-12 w-12 text-slate-400" />
              <span className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Click to select CSV files
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Or drag and drop files here
              </span>
            </label>
          </div>
          <FileList files={files} removeFile={handlerRemoveFile} />
          
          {files.length > 0 && (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={fileProcessor.resetAll}
                disabled={fileProcessor.isLoading}
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={fileProcessor.processFiles}
                disabled={fileProcessor.isLoading || files.every(f => f.status === 'success')}
              >
                {fileProcessor.isLoading ? 'Processing...' : 'Process Files'}
              </Button>
            </div>
          )}
          
          {fileProcessor.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md text-sm">
              {fileProcessor.error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}