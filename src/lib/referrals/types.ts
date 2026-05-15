export type ReferralTermsAcceptFormAction = (
  formData: FormData,
) => Promise<void>;

export type CommissionState = "pending" | "earned" | "paid" | "clawedBack";

/** `termsError` query param after accept-referral-terms server action redirect */
export type ReferralTermsAcceptQueryError =
  | "server-unavailable"
  | "terms-misconfigured"
  | "terms-unavailable"
  | "terms-rejected";

export type StatId =
  | "clicks"
  | "signups"
  | "paidConversions"
  | "totalEarned";

export interface HeroData {
  programName: string;
  title: string;
  description: string;
  shareUrl: string;
  code: string;
  rewardSummary: string;
  rewardDuration: string;
  cookieWindowDays: number;
  payoutType: string;
  note: string;
  termsHref: string;
}

export interface StatData {
  id: StatId;
  label: string;
  value: string;
  change: string;
  helper: string;
}

export interface RefereeData {
  id: string;
  name: string;
  company: string;
  source: string;
  joinedAt: string;
  referralStatus: string;
  commissionState: CommissionState;
  plan: string;
  netRevenue: number;
  commission: number;
  nextEvent: string;
}

export interface AdminReferralRow {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  programName: string;
  referralCode: string;
  refereeName: string;
  refereeCompany: string;
  source: string;
  joinedAt: string;
  referralStatus: string;
  commissionState: CommissionState;
  plan: string;
  netRevenue: number;
  commission: number;
  nextEvent: string;
}

export interface TransactionData {
  id: string;
  title: string;
  detail: string;
  occurredAt: string;
  amount: number;
  state: CommissionState;
}

export interface ProgramTermsData {
  programId: string;
  version: string;
  title: string;
  summary: string;
  items: string[];
  helpEmail: string;
}

export interface TermsAcceptanceData {
  programId: string;
  version: string;
  acceptedAt: string;
  ipAddress: string;
}

export interface ReferrerDashboardBaseData {
  hero: HeroData;
  stats: StatData[];
  referees: RefereeData[];
  transactions: TransactionData[];
  programTerms: ProgramTermsData;
}

export interface ReferrerDashboardData extends ReferrerDashboardBaseData {
  termsAcceptance: TermsAcceptanceData | null;
}

export interface ReferrerDashboardRecord extends ReferrerDashboardBaseData {
  id: string;
  userId: string;
}

export interface MockUserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "referrer";
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface MockPricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyRevenue: number;
  labelMonthlyRevenue: number;
  savingsLabel: string;
  badge?: string;
}

export interface MockSignupSubmissionRecord {
  id: string;
  referrerUserId: string;
  workEmail: string;
  companyName: string;
  referralCode: string;
  planId: string;
  planName: string;
  monthlyRevenue: number;
  labelMonthlyRevenue?: number;
  commissionAmount: number;
  source: string;
  status: "paid";
  createdAt: string;
}
