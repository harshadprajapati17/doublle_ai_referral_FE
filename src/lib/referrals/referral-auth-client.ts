import type { SignupReferralAttributionSource } from "@/lib/referrals/signup-attribution";

export const AUTH_SIGNUP_REFERRAL_PATH = "/api/v1/auth/signup-referral";
export const AUTH_SIGNIN_REFERRAL_PATH = "/api/v1/auth/signin-referral";

export type SignupReferralRequestBody = {
  email: string;
  password: string;
  name?: string;
  referral?: {
    code: string;
    source: SignupReferralAttributionSource;
  };
};

export type SigninReferralRequestBody = {
  email: string;
  password: string;
};

/** POST signup-referral — required: email, password; optional: name, referral. */
export function buildSignupReferralRequestBody(input: {
  email: string;
  password?: string;
  name?: string;
  referral?: {
    code: string;
    source: SignupReferralAttributionSource;
  };
}): SignupReferralRequestBody {
  const body: SignupReferralRequestBody = {
    email: input.email.trim().toLowerCase(),
    password: String(input.password ?? "").trim(),
  };

  const name = input.name?.trim();
  if (name) {
    body.name = name;
  }

  const code = input.referral?.code.trim().toUpperCase();
  if (code) {
    body.referral = {
      code,
      source: input.referral!.source,
    };
  }

  return body;
}

/** POST signin-referral — ensures `password` is always present on the JSON body. */
export function buildSigninReferralRequestBody(input: {
  email: string;
  password?: string;
}): SigninReferralRequestBody {
  return {
    email: input.email.trim().toLowerCase(),
    password: String(input.password ?? "").trim(),
  };
}
