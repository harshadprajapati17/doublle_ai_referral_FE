"use client";

import { useEffect, useRef } from "react";

import { getClientAuthBearer } from "@/lib/referrals/auth-token";

type LoginRedirectIfAuthedProps = {
  returnTo: string;
};

/** Client-only session check — matches how the referral dashboard reads the token. */
export function LoginRedirectIfAuthed({ returnTo }: LoginRedirectIfAuthedProps) {
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current) {
      return;
    }
    if (getClientAuthBearer()) {
      didRedirect.current = true;
      window.location.replace(returnTo);
    }
  }, [returnTo]);

  return null;
}
