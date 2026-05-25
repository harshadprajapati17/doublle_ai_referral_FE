"use client";

import { CopyButton } from "@/components/referrals/copy-button";

interface CopyableFieldProps {
  id: string;
  label: string;
  value: string;
  copyLabel: string;
  tone?: "link" | "code";
  layout?: "stacked" | "split";
  copyVariant?: "primary" | "inline";
  density?: "default" | "compact";
}

function normalizeCode(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function CopyableField({
  id,
  label,
  value,
  copyLabel,
  tone = "link",
  layout = "stacked",
  copyVariant = "primary",
  density = "default",
}: CopyableFieldProps) {
  const compact = density === "compact";
  const isCode = tone === "code";
  const copyValue = isCode ? normalizeCode(value) : value;
  const displayValue = copyValue;

  const valueText = isCode
    ? `font-mono font-semibold tracking-[0.12em] text-ws-primary ${layout === "split" ? "text-sm" : compact ? "text-sm" : "text-base sm:text-[1.0625rem]"}`
    : `truncate font-mono text-ws-secondary ${layout === "split" ? "text-sm" : compact ? "text-xs" : "text-xs sm:text-sm"}`;

  if (layout === "split") {
    const ringClass = isCode ? "font-mono" : "";

    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-xs font-medium text-ws-secondary">
          {label}
        </label>
        <div
          className={`flex overflow-hidden rounded-[10px] border border-ws-border bg-ws-card ${ringClass} focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25`}
        >
          <div
            className={`flex min-w-0 flex-1 items-center px-3.5 py-2.5 ${isCode ? "overflow-x-auto" : ""}`}
          >
            <p id={id} title={value} className={`min-w-0 flex-1 ${valueText}`}>
              {displayValue}
            </p>
          </div>
          <CopyButton value={copyValue} label={copyLabel} variant="attached" />
        </div>
      </div>
    );
  }

  const valueShell = isCode
    ? `rounded-[10px] border border-ws-border bg-ws-card ${compact ? "px-3 py-2" : "px-4 py-3.5"}`
    : `rounded-[10px] border border-ws-border bg-ws-page ${compact ? "px-3 py-2" : "px-4 py-3"}`;

  const fieldPadding = compact ? "space-y-2 px-3 py-2.5" : "space-y-3 px-3.5 py-3.5 sm:px-4 sm:py-4";

  if (copyVariant === "inline") {
    return (
      <div className={compact ? "px-2.5 py-2" : "px-3 py-3 sm:px-3.5"}>
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ws-muted">
          {label}
        </label>
        <div
          className={`flex min-w-0 items-stretch overflow-hidden ${valueShell} focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25`}
        >
          <div className="flex min-w-0 flex-1 items-center overflow-x-auto px-3 py-2">
            <p id={id} title={value} className={`min-w-0 flex-1 ${valueText}`}>
              {displayValue}
            </p>
          </div>
          <div className="flex shrink-0 items-stretch border-l border-ws-border">
            <CopyButton
              value={copyValue}
              label={copyLabel}
              variant="inline"
              size={density}
              className="h-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={fieldPadding}>
      <label htmlFor={id} className="block text-xs font-medium text-ws-muted">
        {label}
      </label>
      <div className={valueShell}>
        <p id={id} title={value} className={valueText}>
          {displayValue}
        </p>
      </div>
      <CopyButton value={copyValue} label={copyLabel} variant="primary" size={density} />
    </div>
  );
}
