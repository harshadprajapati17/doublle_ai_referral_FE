"use client";

import { useEffect, useState } from "react";

import type { ProgramTermsData } from "@/lib/referrals/types";

interface ProgramTermsPanelProps {
  terms: ProgramTermsData;
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProgramTermsPanel({ terms }: ProgramTermsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#program-terms") {
        setIsOpen(true);
      }
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.closest('a[href="#program-terms"]')) {
        setIsOpen(true);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return (
    <section
      id="program-terms"
      className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-controls="program-terms-content"
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-6 text-left sm:px-8 sm:py-7"
      >
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {terms.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            {terms.summary}
          </p>
        </div>
        <span
          aria-hidden="true"
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDownIcon className="h-4 w-4" />
        </span>
      </button>

      {isOpen ? (
        <div id="program-terms-content" className="px-6 pb-6 sm:px-8 sm:pb-8">
          <ul className="grid gap-3 sm:grid-cols-2">
            {terms.items.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
