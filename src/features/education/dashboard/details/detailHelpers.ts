import { CitizenGrantReleaseItem } from "../../grant/api/grantReleaseApi";
import { formatDate } from "@/src/utils";

export type ScholarshipStageState =
  | "completed"
  | "current"
  | "stopped"
  | "not_reached"
  | "upcoming";

export interface ProgressStage {
  id: number;
  label: string;
  title: string;
  description: string;
  date?: string | null;
  state: ScholarshipStageState;
  subLabel?: string;
  isActionable?: boolean;
  evaluatorName?: string | null;
  stageNumber?: number;
  stageBadge?: string;
  stageCategory?: string;
  statusLabel?: string;
  reason?: string | null;
  remarks?: string | null;
  subtitle?: string | null;
  isTerminal?: boolean;
}

export interface ScholarshipStatusStage extends ProgressStage {
  stageNumber: number;
  stageBadge: string;
  stageCategory: string;
  statusLabel: string;
  reason: string | null;
  remarks: string | null;
  subtitle: string | null;
  isTerminal: boolean;
}

export function computeScholarshipStages(
  scholar: any,
  application: any,
  processTimeline: any[] = [],
  grantOverview: any = null,
  latestUpdateTimestamp?: string | null,
  grantReleases: CitizenGrantReleaseItem[] = [],
  dashboardData: any = null
): ScholarshipStatusStage[] {
  const isApplicationDisapproved = Boolean(
    !scholar &&
    (application?.application_status === "Disapproved" ||
      application?.application_status?.toLowerCase() === "rejected")
  );

  const submittedItem = processTimeline.find(
    (i) =>
      i.key === "submitted" || i.title?.toLowerCase?.().includes("submitted")
  );
  const stage1Completed = Boolean(
    scholar ||
    application?.submitted_at ||
    submittedItem?.is_completed ||
    processTimeline.length > 0
  );
  const stage1Current =
    !stage1Completed && application?.application_status === "Draft";
  const stage1Date = formatDate(
    submittedItem?.date || application?.submitted_at || scholar?.admitted_at
  );

  const reviewItem = processTimeline.find(
    (i) =>
      i.key === "review" ||
      i.key === "under_review" ||
      i.title?.toLowerCase?.().includes("review")
  );
  const stage2Completed = Boolean(
    scholar ||
    reviewItem?.is_completed ||
    ["Ready for SSC", "For Evaluation", "Approved", "Post-Approval", "Completed"].includes(
      application?.application_status || ""
    )
  );
  const stage2Current =
    !stage2Completed &&
    !isApplicationDisapproved &&
    (Boolean(reviewItem?.is_current) ||
      application?.application_status === "Under Review");
  const stage2Date = formatDate(
    reviewItem?.date || (stage2Completed ? application?.submitted_at : null)
  );
  const reviewEvaluatorName =
    reviewItem?.evaluator_name ||
    reviewItem?.coordinator_name ||
    application?.coordinator_name ||
    application?.evaluator_name ||
    null;

  const sscItem = processTimeline.find(
    (i) =>
      i.key?.toLowerCase?.().includes("ssc") ||
      i.key?.toLowerCase?.().includes("eval") ||
      i.title?.toLowerCase?.().includes("ssc") ||
      i.title?.toLowerCase?.().includes("eval")
  );
  const stage3Completed = Boolean(
    scholar ||
    sscItem?.is_completed ||
    ["Approved", "Post-Approval", "Completed"].includes(
      application?.application_status || ""
    )
  );
  const stage3Current =
    !stage3Completed &&
    !isApplicationDisapproved &&
    (Boolean(sscItem?.is_current) ||
      ["Ready for SSC", "For Evaluation", "SSC Evaluation"].includes(
        application?.application_status || ""
      ));
  const stage3Date = formatDate(sscItem?.date);
  const sscEvaluatorName =
    sscItem?.evaluator_name ||
    sscItem?.coordinator_name ||
    application?.evaluator_name ||
    application?.coordinator_name ||
    application?.decided_by?.full_name ||
    (dashboardData as any)?.evaluator_name ||
    null;

  const approvedItem = processTimeline.find(
    (i) => i.key === "approved" || i.title?.toLowerCase?.().includes("approved")
  );
  const stage4Completed = Boolean(
    scholar?.scholar_status === "Active" ||
    ["Approved", "Post-Approval", "Completed"].includes(
      application?.application_status || ""
    ) ||
    approvedItem?.is_completed
  );
  const stage4Date = formatDate(approvedItem?.date || scholar?.admitted_at);

  const activeGrantApp =
    (grantOverview?.has_existing_application && grantOverview.application)
      ? grantOverview.application
      : dashboardData?.grant
      ? (dashboardData.grant as any)
      : (grantOverview?.application || null);

  const activeGrantStatus = (activeGrantApp?.grant_status || activeGrantApp?.status || "") as string;
  const isGrantActive = Boolean(
    activeGrantApp &&
      ["Draft", "Submitted", "For Review", "Under Review", "For Compliance", "Approved for Payroll"].includes(
        activeGrantStatus
      )
  );

  const hasGrantDisbursed =
    (!isGrantActive && grantReleases && grantReleases.some(
      (r) => r.release_status === "Completed" || r.release_status === "Released"
    )) || activeGrantStatus === "Disbursed";

  const hasGrantProcessing =
    (!isGrantActive && grantReleases && grantReleases.some((r) =>
      ["Scheduled", "Processing", "Active", "Pending"].includes(r.release_status)
    )) || ["Scheduled", "Processing", "Active", "Pending"].includes(activeGrantStatus);

  let grantState: ScholarshipStageState = "upcoming";
  let grantSubLabel = "Pending";
  let grantDesc =
    "Educational financial assistance and stipend release processing.";
  let grantDate: string | null = null;

  if (isGrantActive) {
    grantState = "current";
    grantSubLabel = activeGrantStatus || "Under Review";
    grantDate = formatDate(activeGrantApp?.submitted_at || (activeGrantApp as any)?.created_at) || "In Progress";
    if (activeGrantStatus === "Approved for Payroll") {
      grantDesc = "Grant application validated and approved for municipal payroll processing.";
    } else if (activeGrantStatus === "For Compliance") {
      grantDesc = "Additional documentation required for grant compliance verification.";
    } else if (activeGrantStatus === "Under Review" || activeGrantStatus === "For Review") {
      grantDesc = "Grant verification in progress by scholarship administrator.";
    } else if (activeGrantStatus === "Submitted") {
      grantDesc = "Grant application submitted and awaiting initial review.";
    } else if (activeGrantStatus === "Draft") {
      grantDesc = "Grant application drafted and awaiting final submission.";
    } else {
      grantDesc = `Grant status: ${activeGrantStatus}.`;
    }
  } else if (hasGrantDisbursed) {
    grantState = "completed";
    grantSubLabel = "Disbursed";
    grantDesc =
      "Scholarship grant successfully disbursed to scholar account.";
    const releasedItem = grantReleases?.find(
      (r) => r.release_status === "Completed" || r.release_status === "Released"
    );
    grantDate = formatDate(releasedItem?.components?.[0]?.released_at);
  } else if (hasGrantProcessing) {
    grantState = "current";
    grantSubLabel = "Processing";
    grantDesc =
      "Grant disbursement release is currently being scheduled and processed.";
  } else if (scholar?.scholar_status === "Active") {
    grantState = "upcoming";
    grantSubLabel = "No Application";
    grantDesc = "Grant application not yet submitted for this period.";
  } else {
    grantState = "upcoming";
    grantSubLabel = "Pending";
    grantDesc =
      "Grant processing unlocks upon official scholarship admission.";
  }

  if (isApplicationDisapproved) {
    const decidedDate = formatDate(
      application?.decided_at ||
        latestUpdateTimestamp ||
        application?.submitted_at
    );
    const disapprovalCategory =
      application?.disapproval_category || "Criteria Not Met";
    const disapprovalRemarks =
      application?.decision_remarks ||
      "Application process concluded following eligibility review.";

    const categoryLower = disapprovalCategory.toLowerCase();
    const remarksLower = disapprovalRemarks.toLowerCase();

    const isEligibilityFailure =
      categoryLower.includes("eligib") ||
      categoryLower.includes("criteri") ||
      categoryLower.includes("document") ||
      categoryLower.includes("requirement") ||
      categoryLower.includes("ineligible") ||
      categoryLower.includes("qualification") ||
      remarksLower.includes("eligib") ||
      remarksLower.includes("criterion") ||
      remarksLower.includes("criteria") ||
      remarksLower.includes("gwa") ||
      remarksLower.includes("percentage") ||
      remarksLower.includes("grade") ||
      remarksLower.includes("secretariat") ||
      remarksLower.includes("document") ||
      remarksLower.includes("credential");

    const hasReachedSSC =
      !isEligibilityFailure &&
      (Boolean(
        sscItem &&
        (sscItem.is_completed || sscItem.is_current || Boolean(sscItem.date))
      ) ||
        categoryLower.includes("ssc") ||
        categoryLower.includes("committee") ||
        categoryLower.includes("deliberation") ||
        remarksLower.includes("committee") ||
        remarksLower.includes("ssc deliberation"));

    const isStage2Terminal = !hasReachedSSC;

    return [
      {
        id: 1,
        label: "Submitted",
        stageNumber: 1,
        stageBadge: "STAGE 1 OF 5",
        stageCategory: "Initial Submission",
        title: "Application Submitted",
        description:
          "Initial scholarship application and credentials submitted.",
        date: stage1Date,
        state: "completed",
        statusLabel: "Completed",
        reason: null,
        remarks: null,
        subtitle: null,
        isTerminal: false,
      },
      {
        id: 2,
        label: "Review",
        stageNumber: 2,
        stageBadge: "STAGE 2 OF 5",
        stageCategory: "Secretariat Verification",
        title: "Document & Secretariat Review",
        description:
          "Secretariat verification of applicant credentials and eligibility.",
        date: isStage2Terminal ? decidedDate : stage2Date || stage1Date,
        state: isStage2Terminal ? "stopped" : "completed",
        statusLabel: isStage2Terminal ? "Disapproved" : "Completed",
        reason: isStage2Terminal ? disapprovalCategory : null,
        remarks: isStage2Terminal ? disapprovalRemarks : null,
        subtitle: isStage2Terminal
          ? "Application process ended at this stage"
          : null,
        isTerminal: isStage2Terminal,
        evaluatorName: reviewEvaluatorName,
      },
      {
        id: 3,
        label: "SSC Eval",
        stageNumber: 3,
        stageBadge: "STAGE 3 OF 5",
        stageCategory: "Committee Evaluation",
        title: "SSC Evaluation",
        description:
          "Scholarship Selection Committee review and qualification evaluation.",
        date: isStage2Terminal ? null : decidedDate,
        state: isStage2Terminal ? "not_reached" : "stopped",
        statusLabel: isStage2Terminal ? "Not Reached" : "Disapproved",
        reason: isStage2Terminal ? null : disapprovalCategory,
        remarks: isStage2Terminal ? null : disapprovalRemarks,
        subtitle: isStage2Terminal
          ? "Process ended prior to committee evaluation"
          : "Application evaluated and disapproved. Process ended.",
        isTerminal: !isStage2Terminal,
        evaluatorName: isStage2Terminal ? null : sscEvaluatorName,
      },
      {
        id: 4,
        label: "Approved",
        stageNumber: 4,
        stageBadge: "STAGE 4 OF 5",
        stageCategory: "Official Admission",
        title: "Scholarship Approved",
        description:
          "Official municipal scholarship approval and scholar admission.",
        date: null,
        state: "not_reached",
        statusLabel: "Not Reached",
        reason: null,
        remarks: null,
        subtitle: "Process ended prior to approval",
        isTerminal: false,
      },
      {
        id: 5,
        label: "Grant",
        stageNumber: 5,
        stageBadge: "STAGE 5 OF 5",
        stageCategory: "Financial Assistance",
        title: "Scholarship Grant",
        description:
          "Educational financial assistance and stipend release processing.",
        date: null,
        state: "not_reached",
        statusLabel: "Not Reached",
        reason: null,
        remarks: null,
        subtitle: "Locked — Requires active scholarship admission",
        isTerminal: false,
      },
    ];
  }

  const stage4Current =
    stage4Completed &&
    grantState === "upcoming" &&
    grantSubLabel === "No Application";

  return [
    {
      id: 1,
      label: "Submitted",
      stageNumber: 1,
      stageBadge: "STAGE 1 OF 5",
      stageCategory: "Initial Submission",
      title: "Application Submitted",
      description:
        "Initial scholarship application and credentials submitted.",
      date: stage1Date,
      state: stage1Completed ? "completed" : stage1Current ? "current" : "upcoming",
      statusLabel: stage1Completed ? "Completed" : stage1Current ? "In Progress" : "Pending",
      reason: null,
      remarks: null,
      subtitle: null,
      isTerminal: false,
    },
    {
      id: 2,
      label: "Review",
      stageNumber: 2,
      stageBadge: "STAGE 2 OF 5",
      stageCategory: "Secretariat Verification",
      title: "Document & Secretariat Review",
      description:
        "Secretariat verification of applicant credentials and eligibility.",
      date: stage2Date,
      state: stage2Completed ? "completed" : stage2Current ? "current" : "upcoming",
      statusLabel: stage2Completed ? "Completed" : stage2Current ? "In Progress" : "Pending",
      reason: null,
      remarks: null,
      subtitle: null,
      isTerminal: false,
      evaluatorName: reviewEvaluatorName,
    },
    {
      id: 3,
      label: "SSC Eval",
      stageNumber: 3,
      stageBadge: "STAGE 3 OF 5",
      stageCategory: "Committee Evaluation",
      title: "SSC Evaluation",
      description:
        "Scholarship Selection Committee review and qualification evaluation.",
      date: stage3Date,
      state: stage3Completed ? "completed" : stage3Current ? "current" : "upcoming",
      statusLabel: stage3Completed ? "Completed" : stage3Current ? "In Progress" : "Pending",
      reason: null,
      remarks: null,
      subtitle: null,
      isTerminal: false,
      evaluatorName: sscEvaluatorName,
    },
    {
      id: 4,
      label: "Approved",
      stageNumber: 4,
      stageBadge: "STAGE 4 OF 5",
      stageCategory: "Official Admission",
      title: "Scholarship Approved",
      description:
        "Official municipal scholarship approval and scholar admission.",
      date: stage4Date,
      state: stage4Completed ? (stage4Current ? "current" : "completed") : "upcoming",
      statusLabel: stage4Completed ? (stage4Current ? "In Progress" : "Completed") : "Pending",
      reason: null,
      remarks: null,
      subtitle: null,
      isTerminal: false,
      evaluatorName: sscEvaluatorName || reviewEvaluatorName,
    },
    {
      id: 5,
      label: "Grant",
      stageNumber: 5,
      stageBadge: "STAGE 5 OF 5",
      stageCategory: "Financial Assistance",
      title: "Scholarship Grant",
      description: grantDesc,
      date: grantDate,
      state: grantState,
      statusLabel: grantSubLabel,
      subLabel: grantSubLabel,
      isActionable:
        grantSubLabel !== "Pending" &&
        (Boolean(scholar?.scholar_status === "Active") ||
          Boolean(grantOverview?.has_existing_application) ||
          hasGrantProcessing ||
          hasGrantDisbursed),
      reason: null,
      remarks: null,
      subtitle: null,
      isTerminal: false,
    },
  ];
}

export const computeScholarshipFiveStages = computeScholarshipStages;

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
