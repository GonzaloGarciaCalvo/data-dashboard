'use client';

import { useState, useCallback, DragEvent } from 'react';
import type { FileUpload } from '@/types';
import { detectFileType } from '@/lib/csv/detectFileType';

export function useFileHandler() {
  // Hook for drag/drop, selección
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
  }, []);


  return {
    files,
    isDragging,
    handleFiles,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    setFiles
  };
}