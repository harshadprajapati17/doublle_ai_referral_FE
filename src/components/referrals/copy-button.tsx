"use client";

import { useEffect, useState } from "react";

import { ClipboardIcon } from "@/components/referrals/icons";

interface CopyButtonProps {
  value: string;
  label: string;
  variant?: "icon" | "primary" | "inline" | "attached";
  size?: "default" | "compact";
  className?: string;
}

type CopyStatus = "idle" | "copied" | "error";

function fallbackCopy(value: string) {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";

  document.body.appendChild(textArea);
  textArea.select();

  const didCopy = document.execCommand("copy");
  document.body.removeChild(textArea);

  if (!didCopy) {
    throw new Error("Fallback copy failed");
  }
}

export function CopyButton({
  value,
  label,
  variant = "icon",
  size = "default",
  className = "",
}: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (status === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setStatus("idle");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [status]);

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        fallbackCopy(value);
      }
      setStatus("copied");
    } catch {
      try {
        fallbackCopy(value);
        setStatus("copied");
      } catch {
        setStatus("error");
      }
    }
  }

  const buttonLabel =
    status === "copied" ? "Copied!" : status === "error" ? "Retry copy" : label;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex h-full min-h-[2.75rem] items-center justify-center px-4 text-xs font-medium text-ws-secondary transition hover:bg-ws-page hover:text-ws-primary focus:outline-none focus-visible:bg-ws-page focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-inset ${
          status === "copied" ? "text-emerald-700" : ""
        } ${className}`}
        aria-label={buttonLabel}
      >
        <span aria-live="polite">{status === "copied" ? "Copied!" : "Copy"}</span>
      </button>
    );
  }

  if (variant === "attached") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`workspace-btn-primary inline-flex shrink-0 items-center gap-1.5 border-l border-[#e4e6eb] px-3.5 py-2.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6fed] focus-visible:ring-inset ${
          status === "copied" ? "bg-emerald-700 hover:bg-emerald-700" : ""
        } ${className}`}
        aria-label={buttonLabel}
      >
        <ClipboardIcon className="h-3.5 w-3.5 shrink-0" />
        <span aria-live="polite">{status === "copied" ? "Copied!" : "Copy"}</span>
      </button>
    );
  }

  if (variant === "primary") {
    const compact = size === "compact";
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex w-full items-center justify-center gap-1.5 bg-ws-primary text-sm font-medium text-white transition hover:bg-ws-primary/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${
          compact
            ? "rounded-[10px] px-3 py-2 text-xs"
            : "rounded-[10px] px-4 py-2.5 text-sm"
        } ${className}`}
        aria-label={buttonLabel}
      >
        <ClipboardIcon className={compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0"} />
        <span aria-live="polite">{buttonLabel}</span>
      </button>
    );
  }

  return (
    <div className={`group relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-ws-secondary transition focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
          status === "copied"
            ? "bg-emerald-50 text-emerald-800"
            : "hover:bg-ws-page hover:text-ws-primary"
        }`}
        aria-label={buttonLabel}
      >
        <ClipboardIcon className="h-4 w-4" />
        <span className="sr-only" aria-live="polite">
          {buttonLabel}
        </span>
      </button>
      <span className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {buttonLabel}
      </span>
    </div>
  );
}
