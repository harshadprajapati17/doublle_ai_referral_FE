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
        className="group inline-flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition group-hover:bg-white group-hover:text-slate-900">
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
      className={`group relative inline-flex h-10 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${className || "h-11 w-11"}`}
    >
      <span className="text-slate-500 transition group-hover:text-slate-900">{icon}</span>
      <span className="sr-only">{label}</span>
    </a>
  );
}
