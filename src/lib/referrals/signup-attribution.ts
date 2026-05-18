export type SignupReferralAttributionSource = "LINK" | "CODE";

/** LINK when the prefilled code came from ?ref= or the attribution cookie. */
export function initialSignupReferralSource(input: {
  fromQuery: boolean;
  cookieCode: string;
  prefilledCode: string;
}): SignupReferralAttributionSource {
  const cookie = input.cookieCode.trim().toUpperCase();
  const prefilled = input.prefilledCode.trim().toUpperCase();
  if (input.fromQuery || (cookie && prefilled === cookie)) {
    return "LINK";
  }
  return "CODE";
}

/** Manual code entry at signup overrides link/cookie attribution (PRD). */
export function resolveSignupReferralSource(
  submittedCode: string,
  initialCode: string,
  initialSource: SignupReferralAttributionSource,
): SignupReferralAttributionSource {
  const submitted = submittedCode.trim().toUpperCase();
  const initial = initialCode.trim().toUpperCase();
  if (initial && submitted !== initial) {
    return "CODE";
  }
  return initialSource;
}
