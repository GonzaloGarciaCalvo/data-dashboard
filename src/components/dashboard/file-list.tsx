'use client';

import { useCallback } from 'react';
import { FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { FileListProps } from '@/types';

export function FileList({ files, removeFile }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
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
  );
}