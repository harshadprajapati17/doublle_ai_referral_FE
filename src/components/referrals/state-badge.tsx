import type { CommissionState } from "@/lib/referrals/types";

const stateStyles: Record<CommissionState, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  earned: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paid: "border-sky-200 bg-sky-50 text-sky-700",
  clawedBack: "border-rose-200 bg-rose-50 text-rose-700",
};

const stateLabels: Record<CommissionState, string> = {
  pending: "Pending",
  earned: "Earned",
  paid: "Paid",
  clawedBack: "Clawed Back",
};

interface StateBadgeProps {
  state: CommissionState;
}

export function StateBadge({ state }: StateBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${stateStyles[state]}`}
    >
      {stateLabels[state]}
    </span>
  );
}
