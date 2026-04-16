"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileList } from "./file-list";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useFileProcessor } from "@/hooks/useFileProcessor";

const ALLOWED_TYPES = ["text/csv", "application/vnd.ms-excel", "text/plain"];
const MAX_SIZE_MB = 5;

export function CSVUploader() {
  const {
    files,
    isDragging,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile: handlerRemoveFile,
    setFiles: handlerSetFiles,
  } = useFileHandler();

  const {
    isLoading,
    error,
    processFiles,
    resetAll,
    parseErrors,
    continueProcessing,
  } = useFileProcessor({
    files,
    setFiles: handlerSetFiles,
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
        <div className="space-y-4 border-2 border-dashed rounded-lg p-4">
          {/* Drop/upload area */}
          <label
            className={` p-8 text-center transition-colors flex flex-col ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
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
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Click to select CSV files
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Or drag and drop files here
            </p>
          </label>
          <FileList files={files} removeFile={handlerRemoveFile} />

          {files.length > 0 && (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetAll}
                disabled={isLoading}
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={processFiles}
                disabled={
                  isLoading || files.every((f) => f.status === "success")
                }
              >
                {isLoading ? "Processing..." : "Process Files"}
              </Button>
            </div>
          )}

          {parseErrors.length > 0 && (
            <div className="p-3 text-white bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md text-sm">
              {error} -- HAY ERROR
              {parseErrors.map((err, idx) => (
                <div key={idx} className="mt-2">
                  <strong>Error in file {err.file.name}:</strong>
                  <ul className="list-disc list-inside mt-1 text-xs text-white dark:text-white">
                    {err.errors.map((e, i) => (
                      <li key={i}>
                        {e.message} in row {e.row}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    continueProcessing();
                  }}
                >
                  Continue Anyway
                </Button>
                <Button
                  onClick={() => {
                    resetAll();
                  }}
                >
                  Cancel and Fix File
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
