/**
 * Civentral Mobile Apps - Central Status Color & Badge Theme Utility
 * Consolidates status colors across Dashboard, Home, Grant, and Renewal features.
 */

export interface SimpleStatusColor {
  bg: string;
  text: string;
}

export interface StatusColorTokens {
  dotColor: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  pillBg: string;
  pillBorder: string;
  bg: string;
  text: string;
}

/**
 * Return simplified background and text colors for status badges (e.g. HomeScreen tracked items).
 */
export function getStatusColor(status?: string | null): SimpleStatusColor {
  switch (status) {
    case 'Approved':
      return { bg: '#DCFCE7', text: '#15803D' };
    case 'Completed':
      return { bg: '#DBEAFE', text: '#1D4ED8' };
    case 'Processing':
      return { bg: '#FEF3C7', text: '#B45309' };
    default:
      return { bg: '#F1F5F9', text: '#475569' };
  }
}

/**
 * Return full theme color tokens (dot, text, badgeBg, badgeBorder, pillBg, pillBorder)
 * matching dark and light mode appearances for scholarship application and grant statuses.
 */
export function getStatusColors(status?: string | null, isDarkMode = false): StatusColorTokens {
  const s = (status || '').toLowerCase();

  // 1. Negative / Terminal statuses (Disapproved, Rejected, Withdrawn, Cancelled, Failed)
  if (
    s.includes('disapprov') ||
    s.includes('reject') ||
    s.includes('withdraw') ||
    s.includes('fail') ||
    s.includes('cancel')
  ) {
    const dotColor = '#DC2626';
    const textColor = isDarkMode ? '#F87171' : '#DC2626';
    const bg = isDarkMode ? '#3B1D28' : '#FEF2F2';
    const border = isDarkMode ? '#991B1B' : '#FCA5A5';
    return {
      dotColor,
      textColor,
      badgeBg: bg,
      badgeBorder: border,
      pillBg: bg,
      pillBorder: border,
      bg,
      text: textColor,
    };
  }

  // 2. Positive / Completed statuses (Completed, Approved, Disbursed, Released, Active)
  if (
    s.includes('complet') ||
    (s.includes('approv') && !s.includes('disapprov')) ||
    s.includes('disburs') ||
    s.includes('releas') ||
    s.includes('active')
  ) {
    const dotColor = '#16A34A';
    const textColor = isDarkMode ? '#4ADE80' : '#16A34A';
    const bg = isDarkMode ? '#064E3B' : '#DCFCE7';
    const border = isDarkMode ? '#059669' : '#86EFAC';
    return {
      dotColor,
      textColor,
      badgeBg: bg,
      badgeBorder: border,
      pillBg: bg,
      pillBorder: border,
      bg,
      text: textColor,
    };
  }

  // 3. Draft statuses
  if (s === 'draft' || s.includes('draft')) {
    const dotColor = '#D97706';
    const textColor = isDarkMode ? '#FBBF24' : '#B45309';
    const bg = isDarkMode ? '#451A03' : '#FEF3C7';
    const border = isDarkMode ? '#B45309' : '#FDE68A';
    return {
      dotColor,
      textColor,
      badgeBg: bg,
      badgeBorder: border,
      pillBg: bg,
      pillBorder: border,
      bg,
      text: textColor,
    };
  }

  // 4. Processing / Evaluation / Scheduling / Review statuses
  if (
    s.includes('review') ||
    s.includes('eval') ||
    s.includes('ssc') ||
    s.includes('process') ||
    s.includes('schedul') ||
    s.includes('payroll')
  ) {
    const dotColor = '#7E22CE';
    const textColor = isDarkMode ? '#C084FC' : '#7E22CE';
    const bg = isDarkMode ? '#3B0764' : '#F3E8FF';
    const border = isDarkMode ? '#7E22CE' : '#E9D5FF';
    return {
      dotColor,
      textColor,
      badgeBg: bg,
      badgeBorder: border,
      pillBg: bg,
      pillBorder: border,
      bg,
      text: textColor,
    };
  }

  // 5. Compliance / Pending / Action Required statuses
  if (
    s.includes('complian') ||
    s.includes('action') ||
    s.includes('return') ||
    s.includes('pend')
  ) {
    const dotColor = '#D97706';
    const textColor = isDarkMode ? '#FBBF24' : '#D97706';
    const bg = isDarkMode ? '#451A03' : '#FEF3C7';
    const border = isDarkMode ? '#B45309' : '#FDE68A';
    return {
      dotColor,
      textColor,
      badgeBg: bg,
      badgeBorder: border,
      pillBg: bg,
      pillBorder: border,
      bg,
      text: textColor,
    };
  }

  // Default neutral status tokens
  const dotColor = '#64748B';
  const textColor = isDarkMode ? '#94A3B8' : '#64748B';
  const bg = isDarkMode ? '#1E293B' : '#F1F5F9';
  const border = isDarkMode ? '#334155' : '#E2E8F0';
  return {
    dotColor,
    textColor,
    badgeBg: bg,
    badgeBorder: border,
    pillBg: bg,
    pillBorder: border,
    bg,
    text: textColor,
  };
}

export type StatusBadgeVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

/**
 * Map status string to standard Badge variant identifier.
 */
export function getStatusBadgeVariant(status?: string | null): StatusBadgeVariant {
  if (!status || status === '--' || status === '—') return 'neutral';
  switch (status) {
    case 'Draft':
    case 'In Progress':
    case 'Pending':
    case 'For Compliance':
    case 'On Hold — Institution Verification Required':
    case 'Institution Verification Required':
      return 'warning';
    case 'For Review':
    case 'Under Review':
    case 'Processing':
    case 'Ready for Processing':
    case 'Endorsed to Mayor':
    case 'Ready for SSC':
      return 'info';
    case 'Submitted':
    case 'Approved':
    case 'Approved for Payroll':
    case 'Active':
    case 'Paid':
    case 'Disbursed':
    case 'Released':
      return 'success';
    case 'Disapproved':
    case 'Rejected':
    case 'Withdrawn':
    case 'Cancelled':
    case 'Invalid':
      return 'danger';
    default:
      return 'neutral';
  }
}

/**
 * Format raw status keys into clean readable display labels.
 */
export function formatStatusLabel(status?: string | null): string {
  if (!status) return '—';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
