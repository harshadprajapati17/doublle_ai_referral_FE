import type { ReactNode } from "react";

interface ShareButtonProps {
  href: string;
  label: string;
  icon: ReactNode;
}

export function ShareButton({ href, label, icon }: ShareButtonProps) {
  const isWebUrl = href.startsWith("http");

  return (
    <a
      href={href}
      aria-label={label}
      target={isWebUrl ? "_blank" : undefined}
      rel={isWebUrl ? "noreferrer" : undefined}
      className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
    >
      <span className="text-slate-500 transition group-hover:text-slate-900">
        {icon}
      </span>
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </a>
  );
}
