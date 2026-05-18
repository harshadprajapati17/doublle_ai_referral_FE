import { clearClientAuthSession } from "@/lib/referrals/auth-token";

/** Clears HttpOnly + document cookies, then navigates to `/login`. */
export async function logoutClient(): Promise<void> {
  clearClientAuthSession();

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    /* still navigate so the user is not stuck on a protected page */
  }

  window.location.replace("/login");
}
