import type { ProgramTermsData } from "@/lib/referrals/types";

interface ProgramTermsDocumentProps {
  terms: ProgramTermsData;
  className?: string;
  /** Full document with title and intro; body is clauses only (e.g. accordion). */
  variant?: "full" | "body";
}

function ProgramTermsClauses({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ol
      className={`list-decimal space-y-4 pl-[1.125rem] text-sm leading-[1.75] text-slate-800 marker:text-slate-500 ${className ?? ""}`}
    >
      {items.map((item) => (
        <li key={item} className="pl-2">
          {item}
        </li>
      ))}
    </ol>
  );
}

export function ProgramTermsDocument({
  terms,
  className = "",
  variant = "full",
}: ProgramTermsDocumentProps) {
  const isFull = variant === "full";

  return (
    <article className={`text-slate-800 ${className}`.trim()}>
      {isFull ? (
        <header>
          <h1
            id="program-terms-title"
            className="text-[1.375rem] font-semibold leading-snug tracking-tight text-slate-950 sm:text-2xl"
          >
            {terms.title}
          </h1>
          <p className="mt-2 text-[0.8125rem] text-slate-500">
            Program terms · Version {terms.version}
          </p>
          {terms.summary ? (
            <p className="mt-5 text-sm leading-[1.75] text-slate-700">{terms.summary}</p>
          ) : null}
        </header>
      ) : null}

      {!isFull && terms.summary ? (
        <p className="text-sm leading-[1.75] text-slate-700">{terms.summary}</p>
      ) : null}

      <ProgramTermsClauses
        items={terms.items}
        className={isFull ? "mt-6" : terms.summary ? "mt-5" : "mt-0"}
      />
    </article>
  );
}
