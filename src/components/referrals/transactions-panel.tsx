import Link from "next/link";

import { StateBadge } from "@/components/referrals/state-badge";
import { formatDate, formatSignedCurrency } from "@/lib/referrals/format";
import type { ProgramTermsData, TransactionData } from "@/lib/referrals/types";

interface TransactionsPanelProps {
  transactions: TransactionData[];
  programTerms: ProgramTermsData;
}

function EmptyTransactionsState() {
  return (
    <div className="flex min-h-[186px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">No transactions yet</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Pending, earned, paid, and clawed-back commission events will appear as
          soon as referred customers start converting.
        </p>
      </div>
    </div>
  );
}

export function TransactionsPanel({
  transactions,
  programTerms,
}: TransactionsPanelProps) {
  return (
    <aside className="flex h-full flex-col rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Transactions
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Review the latest pending, earned, paid, and clawed-back commission
          events tied to your referrals.
        </p>
      </div>

      <div className="mt-6 flex-1">
        {transactions.length === 0 ? (
          <EmptyTransactionsState />
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <article
                key={transaction.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-950">
                      {transaction.title}
                    </p>
                    <p className="text-sm leading-6 text-slate-600">
                      {transaction.detail}
                    </p>
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
                    {formatSignedCurrency(transaction.amount)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[24px] border border-sky-100 bg-sky-50 px-5 py-5">
        <p className="text-sm font-semibold text-slate-950">{programTerms.title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Need help with payout timing, refund reversals, or eligibility?
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
          <Link className="text-sky-700 transition hover:text-sky-900" href="#program-terms">
            Referral terms
          </Link>
          <a
            className="text-sky-700 transition hover:text-sky-900"
            href={`mailto:${programTerms.helpEmail}`}
          >
            Contact support
          </a>
        </div>
      </div>
    </aside>
  );
}
