import "server-only";

import {
  listMockDashboards,
  listMockSignupSubmissions,
  listMockUsers,
} from "@/lib/referrals/mock-store";
import type {
  AdminReferralRow,
  MockSignupSubmissionRecord,
  MockUserRecord,
  RefereeData,
  ReferrerDashboardRecord,
} from "@/lib/referrals/types";

function formatNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "new referrer";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatHoldEndDate(value: string) {
  const date = new Date(value);
  date.setDate(date.getDate() + 30);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getReferrerContext(
  userId: string,
  usersById: Map<string, MockUserRecord>,
  dashboardsByUserId: Map<string, ReferrerDashboardRecord>,
) {
  const user = usersById.get(userId);
  const dashboard = dashboardsByUserId.get(userId);

  return {
    referrerId: userId,
    referrerName: user?.name ?? "Unknown referrer",
    referrerEmail: user?.email ?? "Unavailable",
    programName: dashboard?.hero.programName ?? "Standard Program",
    referralCode: dashboard?.hero.code ?? "N/A",
  };
}

function fromDashboardReferee(
  dashboard: ReferrerDashboardRecord,
  referee: RefereeData,
  usersById: Map<string, MockUserRecord>,
): AdminReferralRow {
  const user = usersById.get(dashboard.userId);

  return {
    id: `dashboard_${dashboard.id}_${referee.id}`,
    referrerId: dashboard.userId,
    referrerName: user?.name ?? "Unknown referrer",
    referrerEmail: user?.email ?? "Unavailable",
    programName: dashboard.hero.programName,
    referralCode: dashboard.hero.code,
    refereeName: referee.name,
    refereeCompany: referee.company,
    source: referee.source,
    joinedAt: referee.joinedAt,
    referralStatus: referee.referralStatus,
    commissionState: referee.commissionState,
    plan: referee.plan,
    netRevenue: referee.netRevenue,
    commission: referee.commission,
    nextEvent: referee.nextEvent,
  };
}

function fromSignupSubmission(
  submission: MockSignupSubmissionRecord,
  usersById: Map<string, MockUserRecord>,
  dashboardsByUserId: Map<string, ReferrerDashboardRecord>,
): AdminReferralRow {
  const referrer = getReferrerContext(
    submission.referrerUserId,
    usersById,
    dashboardsByUserId,
  );

  return {
    id: `submission_${submission.id}`,
    ...referrer,
    referralCode:
      submission.referralCode || referrer.referralCode,
    refereeName: formatNameFromEmail(submission.workEmail),
    refereeCompany: submission.companyName,
    source: submission.source,
    joinedAt: submission.createdAt,
    referralStatus: submission.status === "paid" ? "Paying" : "Signed up",
    commissionState: "pending",
    plan: submission.planName,
    netRevenue: submission.labelMonthlyRevenue ?? submission.monthlyRevenue,
    commission: submission.commissionAmount,
    nextEvent: `30-day hold ends ${formatHoldEndDate(submission.createdAt)}`,
  };
}

export async function getAdminReferralRows(): Promise<AdminReferralRow[]> {
  const users = listMockUsers();
  const dashboards = listMockDashboards();
  const submissions = listMockSignupSubmissions();

  const usersById = new Map(users.map((user) => [user.id, user]));
  const dashboardsByUserId = new Map(
    dashboards.map((dashboard) => [dashboard.userId, dashboard]),
  );

  const dashboardRows = dashboards.flatMap((dashboard) =>
    dashboard.referees.map((referee) =>
      fromDashboardReferee(dashboard, referee, usersById),
    ),
  );
  const submissionRows = submissions.map((submission) =>
    fromSignupSubmission(submission, usersById, dashboardsByUserId),
  );

  return [...submissionRows, ...dashboardRows].sort((left, right) =>
    right.joinedAt.localeCompare(left.joinedAt),
  );
}
