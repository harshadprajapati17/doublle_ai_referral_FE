import Link from "next/link";

import { CopyableField } from "@/components/referrals/copyable-field";
import {
  EmailIcon,
  LinkedInIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/referrals/icons";
import { ShareButton } from "@/components/referrals/share-button";
import {
  workspaceFluidContentClass,
  workspaceHeroGridClass,
} from "@/components/workspace/workspace-content-inset";
import type { HeroData } from "@/lib/referrals/types";

interface HeroCardProps {
  hero: HeroData;
}

const referralSteps = [
  {
    step: "1",
    title: "Share",
    description: "Send your link or code to a team you want to refer.",
  },
  {
    step: "2",
    title: "Subscribe",
    description: "They create an account and subscribe with your attribution.",
  },
  {
    step: "3",
    title: "Earn",
    description: "Recurring Doublle credit lands on your account.",
  },
] as const;

function buildShareLinks(hero: HeroData) {
  const shareMessage = `Join Doublle with my referral code ${hero.code}. ${hero.shareUrl}`;

  return {
    email: `mailto:?subject=${encodeURIComponent("Join me on Doublle")}&body=${encodeURIComponent(shareMessage)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(hero.shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
  };
}

function ProgramMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-6 py-5 sm:px-8">
      <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-ws-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-snug text-ws-primary sm:whitespace-nowrap">
        {value}
      </p>
    </div>
  );
}

function HowItWorksSteps() {
  return (
    <ol className="relative mt-6 grid gap-10 sm:grid-cols-3 sm:gap-8">
      {/* Joiner line through step circles (desktop) */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-5 right-[calc(16.667%+1.25rem)] left-[calc(16.667%+1.25rem)] hidden h-px bg-ws-border sm:block"
      />

      {referralSteps.map((item, index) => (
        <li key={item.step} className="relative flex flex-col sm:items-center sm:text-center">
          {index > 0 ? (
            <div
              aria-hidden
              className="mb-4 flex items-center gap-2 sm:hidden"
            >
              <div className="h-px flex-1 bg-ws-border" />
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ws-border bg-white text-brand">
                <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 3l3 3-3 3" />
                </svg>
              </span>
              <div className="h-px flex-1 bg-ws-border" />
            </div>
          ) : null}
          <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand bg-brand text-sm font-bold text-white">
            {item.step}
          </span>
          <p className="mt-3 text-sm font-semibold text-ws-primary">{item.title}</p>
          <p className="mt-1.5 max-w-[11rem] text-xs leading-relaxed text-ws-secondary sm:mx-auto">
            {item.description}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function HeroCard({ hero }: HeroCardProps) {
  const shareLinks = buildShareLinks(hero);

  return (
    <section className="w-full bg-ws-page">
      <div className={`${workspaceFluidContentClass} py-6 sm:py-8`}>
        <div className="referral-hero-container">
          <div className={workspaceHeroGridClass}>
            {/* LEFT — fluid sections edge-to-edge within card */}
            <div className="flex min-w-0 flex-col">
              <header className="space-y-4 px-7 py-7 sm:px-9 sm:py-8 lg:pr-10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/15 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  {hero.programName}
                </span>
                <h2 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-ws-primary sm:text-2xl">
                  {hero.title}
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-ws-secondary">
                  {hero.description}
                </p>
              </header>

              {/* Program terms — full-width band, no nested card radius */}
              <div className="border-t border-ws-border bg-ws-page/40">
                <div className="flex items-center justify-between gap-4 border-b border-ws-border px-7 py-2.5 sm:px-9">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ws-muted">
                    Program terms
                  </p>
                  <Link
                    href={hero.termsHref}
                    className="shrink-0 text-xs font-medium text-brand underline decoration-brand/25 underline-offset-2 hover:text-brand/80"
                  >
                    Learn more
                  </Link>
                </div>
                <div className="grid divide-y divide-ws-border sm:grid-cols-[minmax(0,1.45fr)_minmax(0,0.75fr)_minmax(0,1.2fr)] sm:divide-x sm:divide-y-0">
                  <ProgramMetric label="Reward" value={hero.rewardSummary} />
                  <ProgramMetric label="Duration" value={hero.rewardDuration} />
                  <ProgramMetric label="Payout" value={hero.payoutType} />
                </div>
              </div>

              {/* How it works — full-width band */}
              <div className="border-t border-ws-border px-7 py-7 sm:px-9 sm:py-8 lg:pr-10">
                <h3 className="text-sm font-semibold text-ws-primary">How it works</h3>
                <p className="mt-1 text-xs text-ws-secondary">
                  Three steps from share to recurring credit on your account.
                </p>
                <HowItWorksSteps />
              </div>
            </div>

            {/* RIGHT — invite & share */}
            <aside className="referral-hero-action flex flex-col border-t border-ws-border px-6 py-7 sm:px-8 sm:py-9 lg:border-t-0 lg:border-l">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand/15 bg-brand/5">
                  <svg className="h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </span>
                <h3 className="text-[0.9375rem] font-semibold text-ws-primary">Invite & earn</h3>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-ws-secondary">
                Copy your link or code and share it anywhere you connect with teams.
              </p>

              <div className="mt-6 flex flex-1 flex-col gap-5">
                <CopyableField
                  id="referral-share-url"
                  label="Referral link"
                  value={hero.shareUrl}
                  copyLabel="Copy referral link"
                  tone="link"
                  layout="split"
                />
                <CopyableField
                  id="referral-share-code"
                  label="Referral code"
                  value={hero.code}
                  copyLabel="Copy referral code"
                  tone="code"
                  layout="split"
                />

                <div>
                  <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-ws-muted">
                    Share via
                  </p>
                  <div className="mt-2.5 grid grid-cols-4 gap-2.5">
                    <ShareButton
                      href={shareLinks.email}
                      label="Email"
                      icon={<EmailIcon className="h-4 w-4" />}
                      className="w-full border-ws-border bg-white hover:bg-ws-page"
                    />
                    <ShareButton
                      href={shareLinks.x}
                      label="X"
                      icon={<XIcon className="h-4 w-4" />}
                      className="w-full border-ws-border bg-white hover:bg-ws-page"
                    />
                    <ShareButton
                      href={shareLinks.linkedIn}
                      label="LinkedIn"
                      icon={<LinkedInIcon className="h-4 w-4" />}
                      className="w-full border-ws-border bg-white hover:bg-ws-page"
                    />
                    <ShareButton
                      href={shareLinks.whatsapp}
                      label="WhatsApp"
                      icon={<WhatsAppIcon className="h-4 w-4" />}
                      className="w-full border-ws-border bg-white hover:bg-ws-page"
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
