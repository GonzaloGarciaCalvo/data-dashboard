'use client';

import { useState, useCallback, DragEvent } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseClientes, parseProductos, parseTiempos, parseHechos, validateFileType, validateFileSize } from '@/lib/csv/parser';
import { useDashboardStore } from '@/stores/dashboard';
import type { Cliente, Producto, Tiempo, Hecho } from '@/types';

interface FileUpload {
  file: File;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  type: 'clientes' | 'productos' | 'tiempos' | 'hechos';
}

const ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
const MAX_SIZE_MB = 5;

export function CSVUploader() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { setClientes, setProductos, setTiempos, setHechos, isLoading, setLoading, setError } = useDashboardStore();

  const detectFileType = (filename: string): FileUpload['type'] => {
    const lower = filename.toLowerCase();
    if (lower.includes('cliente') || lower.includes('dimclientes')) return 'clientes';
    if (lower.includes('producto') || lower.includes('dimproductos')) return 'productos';
    if (lower.includes('tiempo') || lower.includes('dimtiempo')) return 'tiempos';
    if (lower.includes('hecho') || lower.includes('fact')) return 'hechos';
    return 'hechos'; // default
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileUpload[] = Array.from(fileList).map(file => ({
      file,
      status: 'pending' as const,
      type: detectFileType(file.name),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

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
        // Validar tipo
        if (!validateFileType(fileUpload.file, ALLOWED_TYPES)) {
          throw new Error('Tipo de archivo no válido. Solo se aceptan CSV.');
        }

        // Validar tamaño
        if (!validateFileSize(fileUpload.file, MAX_SIZE_MB)) {
          throw new Error(`El archivo excede el tamaño máximo de ${MAX_SIZE_MB}MB.`);
        }

        let data: unknown[] = [];

        switch (fileUpload.type) {
          case 'clientes':
            data = await parseClientes(fileUpload.file);
            break;
          case 'productos':
            data = await parseProductos(fileUpload.file);
            break;
          case 'tiempos':
            data = await parseTiempos(fileUpload.file);
            break;
          case 'hechos':
            data = await parseHechos(fileUpload.file);
            break;
        }

        setFiles(prev => prev.map(f => 
          f.file === fileUpload.file ? { ...f, status: 'success' } : f
        ));

        return { type: fileUpload.type, data };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setFiles(prev => prev.map(f => 
          f.file === fileUpload.file ? { ...f, status: 'error', error: errorMessage } : f
        ));
        throw error;
      }
    };

    try {
      const results = await Promise.all(files.map(processFile));

      // Actualizar el store con los datos
      results.forEach(result => {
        switch (result.type) {
          case 'clientes':
            setClientes(result.data as Cliente[]);
            break;
          case 'productos':
            setProductos(result.data as Producto[]);
            break;
          case 'tiempos':
            setTiempos(result.data as Tiempo[]);
            break;
          case 'hechos':
            setHechos(result.data as Hecho[]);
            break;
        }
      });

      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar los archivos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [files, setClientes, setProductos, setTiempos, setHechos, setLoading, setError]);

  const removeFile = useCallback((file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Cargar Archivos CSV
        </CardTitle>
        <CardDescription>
          Sube tus archivos CSV con los datos de clientes, productos, tiempos y hechos.
          Tamaño máximo: {MAX_SIZE_MB}MB por archivo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Área de drop/upload */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,.cvs"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600">
                Haz clic para seleccionar archivos CSV
              </p>
              <p className="text-xs text-slate-400 mt-1">
                O arrastra los archivos aquí
              </p>
            </label>
          </div>

          {/* Lista de archivos */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((fileUpload, index) => (
                <div
                  key={`${fileUpload.file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium">{fileUpload.file.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{fileUpload.type}</p>
                      {fileUpload.error && (
                        <p className="text-xs text-red-500">{fileUpload.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fileUpload.status === 'pending' && (
                      <span className="text-xs text-slate-400">Pendiente</span>
                    )}
                    {fileUpload.status === 'loading' && (
                      <span className="text-xs text-blue-500">Procesando...</span>
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
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <X className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón de procesar */}
          {files.length > 0 && (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFiles([])}
                disabled={isLoading}
              >
                Limpiar
              </Button>
              <Button
                type="button"
                onClick={processFiles}
                disabled={isLoading || files.every(f => f.status === 'success')}
              >
                {isLoading ? 'Procesando...' : 'Procesar Archivos'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}