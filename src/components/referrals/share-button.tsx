import type { ReactNode } from "react";

interface ShareButtonProps {
  href: string;
  label: string;
  icon: ReactNode;
  showLabel?: boolean;
  className?: string;
}

export function ShareButton({
  href,
  label,
  icon,
  showLabel = false,
  className = "",
}: ShareButtonProps) {
  const isWebUrl = href.startsWith("http");

  if (showLabel) {
    return (
      <a
        href={href}
        aria-label={label}
        target={isWebUrl ? "_blank" : undefined}
        rel={isWebUrl ? "noreferrer" : undefined}
        className="group inline-flex min-w-0 items-center gap-2.5 rounded-[10px] border border-ws-border bg-ws-card px-3 py-2.5 text-sm font-medium text-ws-secondary transition hover:border-ws-border hover:bg-ws-page hover:text-ws-primary focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-ws-page text-ws-secondary transition group-hover:bg-ws-card group-hover:text-ws-primary">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      aria-label={label}
      target={isWebUrl ? "_blank" : undefined}
      rel={isWebUrl ? "noreferrer" : undefined}
      className={`group relative inline-flex h-10 items-center justify-center rounded-[10px] border border-ws-border bg-ws-card text-ws-secondary transition hover:bg-ws-page hover:text-ws-primary focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${className || "h-10 w-10"}`}
    >
      <span className="transition group-hover:text-ws-primary">{icon}</span>
      <span className="sr-only">{label}</span>
    </a>
  );
}
