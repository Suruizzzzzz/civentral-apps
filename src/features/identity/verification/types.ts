export interface CitizenCategory {
  title: string;
  type: string;
  stops: [string, string, string, string];
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  color: string;
  gradient: string;
  hex: string;
  lightHex: string;
  darkHex: string;
}

export type CitizenClassification = CitizenCategory;

export function resolveCitizenCategory(
  birthDateStr?: string | null,
  isPwd = false,
  isNonResident = false
): CitizenCategory {
  if (isNonResident) {
    return {
      title: 'NON-RESIDENT',
      type: 'NON-RESIDENT',
      stops: ['#0F172A', '#334155', '#475569', '#64748B'],
      accentColor: '#475569',
      badgeBg: '#F1F5F9',
      badgeText: '#334155',
      color: '#475569',
      gradient: 'from-slate-700 to-slate-500',
      hex: '#475569',
      lightHex: '#64748B',
      darkHex: '#0F172A',
    };
  }
  if (isPwd) {
    return {
      title: 'PWD',
      type: 'PWD',
      stops: ['#7C2D12', '#C2410C', '#EA580C', '#F97316'],
      accentColor: '#EA580C',
      badgeBg: '#FFF7ED',
      badgeText: '#C2410C',
      color: '#EA580C',
      gradient: 'from-orange-700 to-orange-500',
      hex: '#EA580C',
      lightHex: '#F97316',
      darkHex: '#7C2D12',
    };
  }

  let age = 30; // fallback adult
  if (birthDateStr) {
    const bDate = new Date(birthDateStr);
    if (!isNaN(bDate.getTime())) {
      const diff = Date.now() - bDate.getTime();
      age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }
  }

  if (age >= 60) {
    return {
      title: 'SENIOR CITIZEN',
      type: 'SENIOR CITIZEN',
      stops: ['#172554', '#1E3A8A', '#2563EB', '#1D4ED8'],
      accentColor: '#2563EB',
      badgeBg: '#EFF6FF',
      badgeText: '#1E40AF',
      color: '#2563EB',
      gradient: 'from-blue-900 to-blue-600',
      hex: '#2563EB',
      lightHex: '#2563EB',
      darkHex: '#172554',
    };
  }

  if (age < 18) {
    return {
      title: 'MINOR / RESIDENT',
      type: 'MINOR / RESIDENT',
      stops: ['#881337', '#991B1B', '#DC2626', '#B91C1C'],
      accentColor: '#DC2626',
      badgeBg: '#FEF2F2',
      badgeText: '#991B1B',
      color: '#DC2626',
      gradient: 'from-red-800 to-red-600',
      hex: '#DC2626',
      lightHex: '#DC2626',
      darkHex: '#881337',
    };
  }

  return {
    title: 'RESIDENT',
    type: 'RESIDENT',
    stops: ['#881337', '#991B1B', '#DC2626', '#B91C1C'],
    accentColor: '#DC2626',
    badgeBg: '#FEF2F2',
    badgeText: '#991B1B',
    color: '#DC2626',
    gradient: 'from-red-800 to-red-600',
    hex: '#DC2626',
    lightHex: '#DC2626',
    darkHex: '#881337',
  };
}

export const getCitizenClassification = resolveCitizenCategory;

export interface CaloocanDistrict {
  id: string;
  name: string;
  shortName: string;
  areaDescription: string;
  barangayCount: number;
  barangays: string[];
}

export const CALOOCAN_DISTRICTS: CaloocanDistrict[] = [
  {
    id: 'district-1',
    name: 'District 1 (North Caloocan - West)',
    shortName: 'District 1',
    areaDescription: 'Bagong Silang, Bagumbong, Deparo, Llano, 167-177, etc.',
    barangayCount: 59,
    barangays: [
      1, 2, 3, 4, 77, 78, 79, 80, 81, 82, 83, 84, 85,
      132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150,
      151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169,
      170, 171, 172, 173, 174, 175, 176, 177,
    ].map((num) => `Barangay ${num}`),
  },
  {
    id: 'district-2',
    name: 'District 2 (South Caloocan)',
    shortName: 'District 2',
    areaDescription: 'Grace Park, Monumento, Maypajo, Sangandaan, 5-76 & 86-131',
    barangayCount: 118,
    barangays: [
      ...Array.from({ length: 72 }, (_, i) => i + 5),
      ...Array.from({ length: 46 }, (_, i) => i + 86),
    ].map((num) => `Barangay ${num}`),
  },
  {
    id: 'district-3',
    name: 'District 3 (North Caloocan - East)',
    shortName: 'District 3',
    areaDescription: 'Camarin, Amparo, Tala, Bankers Village (Brgy 178 - 188)',
    barangayCount: 11,
    barangays: [
      178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188,
    ].map((num) => `Barangay ${num}`),
  },
];

export const VALID_ID_TYPES = [
  'PhilSys National ID',
  "Driver's License",
  'UMID',
  'Passport',
  "Voter's ID / Certificate",
  'Barangay ID',
  'Postal ID',
  'Student ID',
];

export const CIVIL_STATUS_OPTIONS = [
  'Single',
  'Married',
  'Widowed',
  'Separated',
  'Divorced / Annulled',
  'Common-Law / Live-In',
];

export const SEX_OPTIONS = ['Male', 'Female'];

export const EMPLOYMENT_STATUS_OPTIONS = [
  'Employed (Private Sector)',
  'Employed (Government / Public)',
  'Self-Employed / Freelancer',
  'Business Owner / Entrepreneur',
  'Unemployed / Job Seeker',
  'Student',
  'Retired / Senior Citizen',
  'OFW (Overseas Filipino Worker)',
  'Homemaker / Houseparent',
];

export const OCCUPATION_OPTIONS = [
  'Government / Public Servant',
  'Corporate / Office Employee',
  'Healthcare / Medical Professional',
  'Teacher / Professor / Educator',
  'IT / Tech / BPO Professional',
  'Driver / Transport Operator',
  'Retail / Sales / Merchant',
  'Skilled Trade / Construction / Technical',
  'Service Industry / Hospitality',
  'Student / Non-Working',
  'Others',
];

export const EDUCATIONAL_ATTAINMENT_OPTIONS = [
  'Elementary Undergraduate',
  'Elementary Graduate',
  'High School / Junior High Graduate',
  'Senior High School Graduate',
  'Vocational / Technical Course',
  'College Undergraduate',
  'College / Bachelor’s Degree Graduate',
  'Postgraduate (Master’s / Doctorate)',
];

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
export const YEAR_OPTIONS = Array.from({ length: 97 }, (_, i) => 2026 - i);

export interface PhilSysParsedData {
  psn?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  sex?: string;
  birthDate?: string;
  placeOfBirth?: string;
  address?: string;
  raw?: string;
}

export function parsePhilSysQrPayload(raw: string): PhilSysParsedData | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // 1. JSON PhilSys QR structure
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const subject = parsed.subject || parsed.data || parsed;
      return {
        psn: subject.PCN || subject.psn || subject.id || subject.id_number,
        firstName: subject.FName || subject.first_name || subject.firstName,
        middleName: subject.MName || subject.middle_name || subject.middleName,
        lastName: subject.LName || subject.last_name || subject.lastName,
        suffix: subject.Suffix || subject.suffix,
        sex: subject.Sex || subject.sex,
        birthDate: subject.DOB || subject.birth_date || subject.birthDate,
        placeOfBirth: subject.POB || subject.place_of_birth || subject.pob,
        address: subject.Address || subject.address,
        raw: trimmed,
      };
    } catch {
      // ignore json parse error and try delimiter format
    }
  }

  // 2. Pipe-delimited or comma-delimited PhilSys QR structure
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|').map((p) => p.trim());
    if (parts.length >= 3) {
      return {
        psn: parts[0] || undefined,
        lastName: parts[1] || undefined,
        firstName: parts[2] || undefined,
        middleName: parts[3] || undefined,
        suffix: parts[4] || undefined,
        sex: parts[5] || undefined,
        birthDate: parts[6] || undefined,
        placeOfBirth: parts[7] || undefined,
        address: parts[8] || undefined,
        raw: trimmed,
      };
    }
  }

  return {
    raw: trimmed,
    psn: trimmed,
  };
}
