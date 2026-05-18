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
        className={`inline-flex h-full min-h-[2.75rem] items-center justify-center px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-inset ${
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
        className={`inline-flex shrink-0 items-center gap-1.5 border-l border-slate-200 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset ${
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
        className={`inline-flex w-full items-center justify-center gap-1.5 bg-slate-950 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${
          compact
            ? "rounded-lg px-3 py-2 text-xs shadow-sm"
            : "rounded-xl px-4 py-3 text-sm shadow-[0_8px_24px_rgba(15,23,42,0.18)]"
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
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
          status === "copied"
            ? "bg-emerald-50 text-emerald-700"
            : "hover:bg-slate-100 hover:text-slate-950"
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
