"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const JD_LENGTH_WARN = 15_000;

interface ResumeInputProps {
  value: string;
  onChange: (value: string) => void;
  onLoadSample: () => void;
  disabled?: boolean;
}

export function ResumeInput({
  value,
  onChange,
  onLoadSample,
  disabled,
}: ResumeInputProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const showLengthWarn = value.length > JD_LENGTH_WARN;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      const text = await file.text();
      onChange(text);
      return;
    }

    const formData = new FormData();
    formData.append("resumeFile", file);
    setIsUploading(true);

    try {
      const response = await fetch("/api/parse/resume", {
        method: "POST",
        body: formData,
      });

      let data: { resumeText?: unknown; error?: { message?: unknown } } | null = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          // Ignore json parse error here, handled below
        }
      }

      if (!response.ok) {
        const errorMessage = typeof data?.error?.message === "string"
          ? data.error.message
          : `Failed to extract resume text (Server returned status ${response.status}).`;
        throw new Error(errorMessage);
      }

      if (!data || typeof data.resumeText !== "string") {
        throw new Error("Uploaded resume could not be parsed.");
      }

      onChange(data.resumeText);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Failed to upload file.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="resume-input" className="text-sm font-medium">
          Resume
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-md border border-border px-3 py-2 text-xs font-medium transition hover:bg-muted/50">
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
              className="hidden"
            />
            {isUploading ? "Uploading…" : "Upload file"}
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setUploadedFileName(null);
              setFileError(null);
              onLoadSample();
            }}
            disabled={disabled || isUploading}
          >
            Load sample
          </Button>
        </div>
      </div>
      <Textarea
        id="resume-input"
        placeholder="Paste your resume text here or upload a PDF/DOCX file..."
        value={value}
        onChange={(e) => {
          setUploadedFileName(null);
          setFileError(null);
          onChange(e.target.value);
        }}
        disabled={disabled || isUploading}
        className="min-h-48 font-mono text-sm"
      />
      {uploadedFileName && (
        <p className="text-muted-foreground text-xs">
          Loaded from file: <span className="font-medium">{uploadedFileName}</span>
        </p>
      )}
      {fileError && (
        <p className="text-destructive text-xs">{fileError}</p>
      )}
      {showLengthWarn && (
        <p className="text-amber-600 text-xs dark:text-amber-400">
          Resume is very long ({value.length.toLocaleString()} chars). Parsing
          may be slower in later phases.
        </p>
      )}
    </div>
  );
}
