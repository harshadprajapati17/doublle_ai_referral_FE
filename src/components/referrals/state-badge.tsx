import type { CommissionState } from "@/lib/referrals/types";

const stateStyles: Record<CommissionState, string> = {
  pending: "border-amber-200/80 bg-amber-50 text-amber-800",
  earned: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
  paid: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
  clawedBack: "border-red-200/80 bg-red-50 text-red-800",
};

const stateLabels: Record<CommissionState, string> = {
  pending: "Pending",
  earned: "Earned",
  paid: "Paid",
  clawedBack: "Clawed back",
};

interface StateBadgeProps {
  state: CommissionState;
}

export function StateBadge({ state }: StateBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${stateStyles[state]}`}
    >
      {stateLabels[state]}
    </span>
  );
}
