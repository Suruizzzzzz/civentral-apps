import { CitizenGrantReleaseItem } from "../../grant/api/grantReleaseApi";

export type BadgeVariant = "info" | "success" | "warning" | "danger" | "neutral";

export interface BadgeConfig {
  label: string;
  variant: BadgeVariant;
}

export function getApplicationBadgeConfig(status?: string): BadgeConfig {
  if (!status) return { label: "Active", variant: "success" };
  switch (status) {
    case "Draft":
      return { label: "Draft", variant: "warning" };
    case "Submitted":
      return { label: "Submitted", variant: "info" };
    case "Under Review":
    case "For Review":
      return { label: "Under Review", variant: "info" };
    case "For Compliance":
    case "Returned":
      return { label: "For Compliance", variant: "warning" };
    case "Ready for SSC":
    case "SSC Evaluation":
      return { label: "Evaluating", variant: "info" };
    case "Approved":
    case "Active":
    case "Post-Approval":
    case "Completed":
      return { label: status === "Completed" ? "Completed" : "Approved", variant: "success" };
    case "Withdrawn":
      return { label: "Withdrawn", variant: "danger" };
    case "Disapproved":
    case "Rejected":
      return { label: "Disapproved", variant: "danger" };
    default:
      return { label: status, variant: "neutral" };
  }
}

export function getGrantBadgeConfig(status?: string): BadgeConfig {
  if (!status) return { label: "Pending / Not Started", variant: "neutral" };
  switch (status) {
    case "Draft":
      return { label: "Draft", variant: "warning" };
    case "Submitted":
      return { label: "Submitted", variant: "success" };
    case "For Review":
    case "Under Review":
      return { label: "Under Review", variant: "info" };
    case "For Compliance":
      return { label: "For Compliance", variant: "warning" };
    case "Approved for Payroll":
    case "Completed":
    case "Released":
    case "Disbursed":
    case "Paid":
    case "Approved":
      return { label: status, variant: "success" };
    case "Withdrawn":
      return { label: "Withdrawn", variant: "danger" };
    default:
      return { label: status, variant: "neutral" };
  }
}

export function getRenewalBadgeConfig(status?: string): BadgeConfig {
  if (!status) return { label: "Pending / Not Started", variant: "neutral" };
  switch (status) {
    case "For Review":
    case "Under Review":
    case "For Evaluation":
      return { label: status.toUpperCase(), variant: "info" };
    case "For Compliance":
    case "Returned":
      return { label: status.toUpperCase(), variant: "warning" };
    case "Recommended for Continuation":
      return { label: "RECOMMENDED", variant: "success" };
    case "Recommended for Non-Continuation":
      return { label: "NON-CONTINUATION", variant: "warning" };
    case "For Certificate":
      return { label: "FOR CERTIFICATE", variant: "info" };
    case "Completed":
      return { label: "COMPLETED", variant: "success" };
    case "Withdrawn":
      return { label: "WITHDRAWN", variant: "danger" };
    default:
      return { label: status.toUpperCase(), variant: "neutral" };
  }
}

export function resolveMatchedRelease(
  grantReleases: CitizenGrantReleaseItem[],
  params: {
    release_code?: string;
    grant_release_id?: string;
    recordId?: string;
    code?: string;
    id?: string;
    academicPeriod?: string;
  }
): {
  matchedRelease?: CitizenGrantReleaseItem;
  targetCleanCode: string;
  targetNumericId: number | null;
  isExplicitRelease: boolean;
} {
  const targetCode = (params.release_code || params.recordId || params.code || params.id || "").trim();
  const targetCleanCode = targetCode.replace(/^release-|^tracked-|^grant-app-/, "");
  const targetNumericId = params.grant_release_id
    ? Number(params.grant_release_id)
    : !isNaN(Number(targetCleanCode)) && targetCleanCode !== ""
    ? Number(targetCleanCode)
    : null;

  const matchedRelease =
    grantReleases.find((r) => {
      if (r.release_code) {
        if (
          r.release_code === targetCode ||
          r.release_code === targetCleanCode ||
          (targetCleanCode.startsWith("REL-") && r.release_code.includes(targetCleanCode)) ||
          (targetCode.startsWith("REL-") && r.release_code.includes(targetCode)) ||
          (targetCleanCode && r.release_code.toLowerCase() === targetCleanCode.toLowerCase())
        ) {
          return true;
        }
      }
      if (r.grant_release_id !== undefined && r.grant_release_id !== null) {
        if (targetNumericId !== null && Number(r.grant_release_id) === targetNumericId) {
          return true;
        }
        if (
          String(r.grant_release_id) === targetCode ||
          String(r.grant_release_id) === targetCleanCode
        ) {
          return true;
        }
      }
      return false;
    }) ||
    (targetCleanCode.startsWith("REL-") && params.academicPeriod
      ? grantReleases.find((r) => {
          const p1 = (params.academicPeriod || "").toLowerCase();
          return (
            p1.includes(r.academic_year.toLowerCase()) &&
            (r.academic_term ? p1.includes(r.academic_term.toLowerCase()) : true)
          );
        })
      : undefined);

  const isExplicitRelease =
    Boolean(matchedRelease) ||
    Boolean(params.release_code) ||
    Boolean(params.grant_release_id) ||
    targetCode.startsWith("REL-") ||
    targetCleanCode.startsWith("REL-");

  return {
    matchedRelease,
    targetCleanCode,
    targetNumericId,
    isExplicitRelease,
  };
}

export interface RecordMetadataInput {
  activeRecordType: "Application" | "Grant" | "Renewal";
  application: any;
  scholar: any;
  scholarship: any;
  academicPeriod: any;
  params: {
    recordId?: string;
    academicPeriod?: string;
    status?: string;
  };
  effectiveGrantStatus: string;
  isExplicitRelease: boolean;
  matchedRelease?: CitizenGrantReleaseItem;
  targetCleanCode: string;
  grantApp?: any;
  renewalItem?: any;
  renewalPeriodStr: string;
}

export function computeRecordMetadata(input: RecordMetadataInput): {
  recordBadgeConfig: BadgeConfig;
  recordReference: string;
  recordPeriod: string;
  headerSubtitle: string;
} {
  const {
    activeRecordType,
    application,
    scholar,
    scholarship,
    academicPeriod,
    params,
    effectiveGrantStatus,
    isExplicitRelease,
    matchedRelease,
    targetCleanCode,
    grantApp,
    renewalItem,
    renewalPeriodStr,
  } = input;

  if (activeRecordType === "Application") {
    const rawStatus =
      application?.application_status || scholar?.scholar_status || "Active";
    const currentStatus =
      rawStatus.toLowerCase() === "rejected" ? "Disapproved" : rawStatus;
    return {
      recordBadgeConfig: getApplicationBadgeConfig(currentStatus),
      recordReference:
        params.recordId ||
        application?.application_code ||
        scholar?.scholar_code ||
        "—",
      recordPeriod:
        params.academicPeriod ||
        (academicPeriod
          ? `${academicPeriod.academic_year} • ${academicPeriod.term}`
          : "AY 2026-2027 • Whole Academic Year"),
      headerSubtitle:
        scholarship?.category_name || "City Government Educational Scholarship",
    };
  }

  if (activeRecordType === "Grant") {
    return {
      recordBadgeConfig: getGrantBadgeConfig(effectiveGrantStatus),
      recordReference:
        (isExplicitRelease
          ? (matchedRelease?.release_code || (matchedRelease?.grant_release_id ? `REL-${matchedRelease.grant_release_id}` : targetCleanCode))
          : (grantApp?.grant_application_code || targetCleanCode)) ||
        params.recordId ||
        "—",
      recordPeriod:
        params.academicPeriod ||
        (matchedRelease
          ? (matchedRelease.academic_term
              ? `AY ${matchedRelease.academic_year} • ${matchedRelease.academic_term}`
              : `AY ${matchedRelease.academic_year}`)
          : grantApp
            ? `AY ${grantApp.academic_year} • ${grantApp.academic_term}`
            : "AY 2026-2027 • Whole Academic Year"),
      headerSubtitle: isExplicitRelease
        ? (matchedRelease?.academic_term
            ? `${matchedRelease.academic_term} Grant Disbursement`
            : "Scholarship Grant Release")
        : grantApp?.institution_name
          ? `${grantApp.institution_name} • Grant Application`
          : "Scholarship Grant Application",
    };
  }

  const currentStatus =
    params.status || renewalItem?.renewal_status || "Pending";
  return {
    recordBadgeConfig: getRenewalBadgeConfig(currentStatus),
    recordReference: params.recordId || renewalItem?.renewal_code || "—",
    recordPeriod: params.academicPeriod || renewalPeriodStr,
    headerSubtitle: "Scholarship Renewal Continuation Application",
  };
}
