"use client";

import { useEffect } from "react";

import { ProgramTermsDocument } from "@/components/referrals/program-terms-document";
import type { ProgramTermsData } from "@/lib/referrals/types";

interface ProgramTermsViewModalProps {
  terms: ProgramTermsData;
  open: boolean;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 4 12 12M12 4 4 12" />
    </svg>
  );
}

export function ProgramTermsViewModal({
  terms,
  open,
  onClose,
}: ProgramTermsViewModalProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[#0f172a]/40 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="program-terms-dialog-title"
        className="flex max-h-[min(92dvh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-[#e4e6eb] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.14)] sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e4e6eb] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6fed]">
              Program terms
            </p>
            <h2
              id="program-terms-dialog-title"
              className="mt-1 text-lg font-semibold tracking-tight text-[#0f172a]"
            >
              {terms.title}
            </h2>
            <p className="mt-1 text-xs text-[#8b95a8]">Version {terms.version}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close program terms"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#e4e6eb] bg-[#f3f4f6] text-[#5c6578] transition hover:bg-white hover:text-[#0f172a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6fed]"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <ProgramTermsDocument terms={terms} variant="body" />
        </div>

        <div className="shrink-0 border-t border-[#e4e6eb] bg-[#f3f4f6] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-[10px] bg-[#0f172a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0f172a]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6fed] focus-visible:ring-offset-2"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
