"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const JD_LENGTH_WARN = 15_000;

interface JDInputProps {
  value: string;
  onChange: (value: string) => void;
  onLoadSample: () => void;
  disabled?: boolean;
}

export function JDInput({
  value,
  onChange,
  onLoadSample,
  disabled,
}: JDInputProps) {
  const showLengthWarn = value.length > JD_LENGTH_WARN;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="jd-input" className="text-sm font-medium">
          Job description
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLoadSample}
          disabled={disabled}
        >
          Load sample
        </Button>
      </div>
      <Textarea
        id="jd-input"
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-48 font-mono text-sm"
      />
      {showLengthWarn && (
        <p className="text-amber-600 text-xs dark:text-amber-400">
          Job description is very long ({value.length.toLocaleString()} chars).
          Consider trimming to the core requirements.
        </p>
      )}
    </div>
  );
}
