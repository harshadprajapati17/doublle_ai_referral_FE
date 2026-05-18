import Link from "next/link";

import { CopyButton } from "@/components/referrals/copy-button";
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

function buildShareLinks(hero: HeroData) {
  const shareMessage = `Join Doublle with my referral code ${hero.code}. ${hero.shareUrl}`;

  return {
    email: `mailto:?subject=${encodeURIComponent("Join me on Doublle")}&body=${encodeURIComponent(shareMessage)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(hero.shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
  };
}

export function HeroCard({ hero }: HeroCardProps) {
  const shareLinks = buildShareLinks(hero);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/95 shadow-[0_12px_32px_rgba(15,23,42,0.05)] backdrop-blur">
      <div className="grid gap-8 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-10">
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              {hero.programName}
            </span>
            <div className="space-y-3">
              <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {hero.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {hero.description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Reward
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {hero.rewardSummary}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Duration
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {hero.rewardDuration}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Payout
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {hero.payoutType}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 sm:p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Personal link</p>
              <div className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm font-medium text-slate-900 shadow-sm">
                <span className="block break-all">{hero.shareUrl}</span>
                <div className="absolute top-1/2 right-2 -translate-y-1/2">
                  <CopyButton value={hero.shareUrl} label="Copy link" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Referral code</p>
              <div className="relative inline-flex max-w-full items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 pr-14 text-lg font-semibold tracking-[0.2em] text-slate-950 shadow-sm">
                <span className="truncate">{hero.code}</span>
                <div className="absolute top-1/2 right-2 -translate-y-1/2">
                  <CopyButton value={hero.code} label="Copy code" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Share in one click</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Email, social, and direct messaging links are ready to use.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <ShareButton
                  href={shareLinks.email}
                  label="Email"
                  icon={<EmailIcon className="h-5 w-5" />}
                />
                <ShareButton href={shareLinks.x} label="X" icon={<XIcon className="h-5 w-5" />} />
                <ShareButton
                  href={shareLinks.linkedIn}
                  label="LinkedIn"
                  icon={<LinkedInIcon className="h-5 w-5" />}
                />
                <ShareButton
                  href={shareLinks.whatsapp}
                  label="WhatsApp"
                  icon={<WhatsAppIcon className="h-5 w-5" />}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 flex-1">{hero.note}</p>
              <Link
                className="shrink-0 whitespace-nowrap font-semibold text-sky-700 transition hover:text-sky-900"
                href={hero.termsHref}
              >
                View terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
