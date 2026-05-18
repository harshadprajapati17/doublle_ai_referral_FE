import { redirect } from "next/navigation";

import { REFERRAL_HOME } from "@/lib/auth/cookie";
import { hasReferralApiSession } from "@/lib/referrals/auth-api";

export default async function Home() {
  if (await hasReferralApiSession()) {
    redirect(REFERRAL_HOME);
  }
  redirect("/login");
}
