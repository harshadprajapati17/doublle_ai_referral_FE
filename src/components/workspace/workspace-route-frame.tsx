import type { ReactNode } from "react";

import { workspaceFluidContentClass } from "@/components/workspace/workspace-content-inset";

type WorkspaceRouteFrameProps = {
  moduleHeader?: ReactNode;
  children: ReactNode;
};

/** Sticky module header + scrollable main content (used inside {@link WorkspaceLayoutShell}). */
export function WorkspaceRouteFrame({
  moduleHeader,
  children,
}: WorkspaceRouteFrameProps) {
  return (
    <>
      {moduleHeader ? (
        <header className="workspace-toolbar-band w-full shrink-0">
          <div className={`py-3.5 sm:py-4 ${workspaceFluidContentClass}`}>
            {moduleHeader}
          </div>
        </header>
      ) : null}

      <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden bg-ws-page">
        <div
          className={
            moduleHeader ? "w-full pb-8" : "w-full pb-8"
          }
        >
          {children}
        </div>
      </div>
    </>
  );
}
