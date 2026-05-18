"use client";

import { useEffect } from "react";

import { StateBadge } from "@/components/referrals/state-badge";
import { formatDate, formatSignedCurrency } from "@/lib/referrals/format";
import type { RefereeData } from "@/lib/referrals/types";

type RefereeCommissionSheetProps = {
  referee: RefereeData | null;
  open: boolean;
  onClose: () => void;
};

export function RefereeCommissionSheet({
  referee,
  open,
  onClose,
}: RefereeCommissionSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !referee) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Close commission details"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="commission-sheet-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-[-24px_0_60px_rgba(15,23,42,0.12)]"
      >
        <header className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Commission details
              </p>
              <h2
                id="commission-sheet-title"
                className="mt-2 text-xl font-semibold tracking-tight text-slate-950"
              >
                {referee.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {referee.company} · {referee.plan}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              aria-label="Close"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {referee.transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-900">No commissions yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Commission events will appear here when this referee generates qualifying
                revenue.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {referee.transactions.map((transaction) => (
                <article
                  key={transaction.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-950">
                        {transaction.title}
                      </p>
                      <p className="text-sm leading-6 text-slate-600">{transaction.detail}</p>
                    </div>
                    <StateBadge state={transaction.state} />
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <p className="text-sm font-medium text-slate-500">
                      {formatDate(transaction.occurredAt)}
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        transaction.amount >= 0 ? "text-slate-950" : "text-rose-700"
                      }`}
                    >
                      {formatSignedCurrency(
                        transaction.amount,
                        transaction.currency ?? "USD",
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
