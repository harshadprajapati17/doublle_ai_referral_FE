/** Max width for fluid workspace pages on large screens (~72rem), centered in main column. */
export const workspaceFluidMaxWidthClass = "mx-auto w-full max-w-7xl";

/** Horizontal inset for fluid module pages (24 → 32 → 40px). */
export const workspaceContentInsetClass = "px-6 sm:px-8 lg:px-10";

/** Vertical padding for module toolbar bands. */
export const workspaceModuleBandPaddingClass = "py-3.5 sm:py-4";

/** Top padding for the first in-page block below a module toolbar (matches band top rhythm). */
export const workspaceModuleContentTopPaddingClass = "pt-3.5 sm:pt-4";

/** Centered content block: max width + horizontal padding (use inside full-bleed sections). */
export const workspaceFluidContentClass = `${workspaceFluidMaxWidthClass} ${workspaceContentInsetClass}`;

/** Hero / two-column rows: left gutter only so a right panel background fills to the max-width edge. */
export const workspaceFluidContentLeftInsetClass = `${workspaceFluidMaxWidthClass} pl-6 sm:pl-8 lg:pl-10`;

/** Hero two-column layout inside container card: story left, action panel right. */
export const workspaceHeroGridClass =
  "grid w-full lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:items-stretch";

/** Full-bleed section band — background spans the main column; pair with {@link workspaceFluidContentClass}. */
export const workspaceSectionBandClass =
  "w-full border-b border-[#e4e6eb] bg-[#e9eaee]/55";
