"use client";

import { useEffect, useState } from "react";

import { ClipboardIcon } from "@/components/referrals/icons";

interface CopyButtonProps {
  value: string;
  label: string;
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

export function CopyButton({ value, label }: CopyButtonProps) {
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
    status === "copied" ? "Copied" : status === "error" ? "Retry copy" : label;

  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
          status === "copied"
            ? "bg-sky-50 text-sky-700"
            : "hover:bg-slate-100 hover:text-slate-950"
        }`}
        aria-label={buttonLabel}
      >
        <ClipboardIcon className="h-4 w-4" />
        <span className="sr-only" aria-live="polite">
          {buttonLabel}
        </span>
      </button>
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {buttonLabel}
      </span>
    </div>
  );
}
