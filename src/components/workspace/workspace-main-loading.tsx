type WorkspaceMainLoadingProps = {
  label: string;
};

/** Centered loading state for the workspace main pane (sidebar stays visible). */
export function WorkspaceMainLoading({ label }: WorkspaceMainLoadingProps) {
  return (
    <div className="flex min-h-[min(24rem,50vh)] items-center justify-center px-6 py-16">
      <p className="text-sm text-ws-secondary">{label}</p>
    </div>
  );
}
