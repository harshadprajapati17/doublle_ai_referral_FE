import Link from "next/link";

import { CopyableField } from "@/components/referrals/copyable-field";
import {
  EmailIcon,
  LinkedInIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/referrals/icons";
import { ShareButton } from "@/components/referrals/share-button";
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

function MetricCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`bg-white px-4 py-4 sm:px-5 sm:py-5 ${className}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-snug text-slate-950 sm:text-[0.9375rem]">
        {value}
      </p>
    </div>
  );
}

export function HeroCard({ hero }: HeroCardProps) {
  const shareLinks = buildShareLinks(hero);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="order-2 px-6 py-6 sm:px-8 sm:py-8 lg:order-1">
          <div>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              {hero.programName}
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.75rem] sm:leading-tight">
              {hero.title}
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-600">{hero.description}</p>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl ring-1 ring-slate-200/80">
            <div className="grid divide-y divide-slate-200/80 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <MetricCell label="Reward" value={hero.rewardSummary} />
              <MetricCell label="Duration" value={hero.rewardDuration} />
              <MetricCell label="Payout" value={hero.payoutType} />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-900">How it works</h3>
            <ol className="relative mt-6 grid gap-8 sm:grid-cols-3 sm:gap-4">
              <div
                aria-hidden
                className="absolute top-4 right-[16.666%] left-[16.666%] hidden h-px bg-slate-200 sm:block"
              />
              {referralSteps.map((item) => (
                <li key={item.step} className="relative flex flex-col sm:items-center sm:text-center">
                  <span className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 ring-1 ring-slate-200 shadow-sm">
                    {item.step}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:max-w-[11rem]">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="order-1 border-b border-slate-200/70 bg-[#f8fafc] px-6 py-6 sm:px-8 sm:py-8 lg:order-2 lg:border-b-0 lg:border-l">
          <div className="lg:sticky lg:top-8">
            <h3 className="text-base font-semibold text-slate-900">Invite & earn</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Copy your link or code and share it anywhere you connect with teams.
            </p>

            <div className="mt-6 space-y-4">
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

              <div className="pt-1">
                <p className="text-[0.8125rem] font-medium text-slate-700">Share via</p>
                <div className="mt-2.5 grid grid-cols-4 gap-2">
                  <ShareButton
                    href={shareLinks.email}
                    label="Email"
                    icon={<EmailIcon className="h-4 w-4" />}
                    className="w-full"
                  />
                  <ShareButton
                    href={shareLinks.x}
                    label="X"
                    icon={<XIcon className="h-4 w-4" />}
                    className="w-full"
                  />
                  <ShareButton
                    href={shareLinks.linkedIn}
                    label="LinkedIn"
                    icon={<LinkedInIcon className="h-4 w-4" />}
                    className="w-full"
                  />
                  <ShareButton
                    href={shareLinks.whatsapp}
                    label="WhatsApp"
                    icon={<WhatsAppIcon className="h-4 w-4" />}
                    className="w-full"
                  />
                </div>
              </div>

              <p className="border-t border-slate-200/80 pt-4 text-xs leading-relaxed text-slate-500">
                {hero.note}{" "}
                <Link
                  href={hero.termsHref}
                  className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
                >
                  View terms
                </Link>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
