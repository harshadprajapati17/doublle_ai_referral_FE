type WorkspaceHeadingBlockProps = {
  title: string;
  description?: string;
};

export const workspaceModuleTitleClass =
  "text-lg font-semibold tracking-tight text-ws-primary sm:text-xl";

export const workspaceModuleDescriptionClass =
  "mt-1 max-w-3xl text-xs leading-5 text-ws-secondary";

function WorkspaceHeadingBlock({
  title,
  description,
  heading: Heading,
}: WorkspaceHeadingBlockProps & { heading: "h1" | "h2" }) {
  return (
    <div className="min-w-0">
      <Heading className={workspaceModuleTitleClass}>{title}</Heading>
      {description ? (
        <p className={workspaceModuleDescriptionClass}>{description}</p>
      ) : null}
    </div>
  );
}

/** Toolbar page header (Billing, Referral, etc.). */
export function WorkspaceModuleHeader({
  title,
  description,
}: WorkspaceHeadingBlockProps) {
  return <WorkspaceHeadingBlock title={title} description={description} heading="h1" />;
}

/** In-page section header — same spacing and typography as {@link WorkspaceModuleHeader}. */
export function WorkspaceSectionHeader({
  title,
  description,
}: WorkspaceHeadingBlockProps) {
  return <WorkspaceHeadingBlock title={title} description={description} heading="h2" />;
}
