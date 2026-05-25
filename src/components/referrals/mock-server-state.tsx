import { WorkspaceEmptyState } from "@/components/workspace/workspace-empty-state";

interface MockServerStateProps {
  title: string;
  description: string;
}

export function MockServerState({ title, description }: MockServerStateProps) {
  return (
    <div className="flex min-h-[min(24rem,50vh)] items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <WorkspaceEmptyState title={title} description={description} />
      </div>
    </div>
  );
}
