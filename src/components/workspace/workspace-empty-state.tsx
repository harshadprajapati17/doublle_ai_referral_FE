import type { ReactNode } from "react";

type WorkspaceEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function WorkspaceEmptyState({
  icon,
  title,
  description,
  action,
}: WorkspaceEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_72%)] px-6 py-14 text-center sm:px-10 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 right-1/4 h-40 w-40 rounded-full bg-[#2f6fed]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-[#2f6fed]/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-md">
        {icon ? (
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-ws-border bg-ws-card text-ws-secondary">
            {icon}
          </div>
        ) : null}
        <h3 className="text-base font-semibold text-ws-primary sm:text-lg">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ws-secondary">{description}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
