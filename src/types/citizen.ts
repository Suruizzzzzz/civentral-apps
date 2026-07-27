export type CitizenUserStatus = 'Pending' | 'Active' | 'Inactive' | 'Locked' | 'Archived';

export interface CitizenUser {
  citizen_user_id: number;
  first_name: string;
  middle_name?: string | null;
  has_no_middle_name: number; // 0 or 1
  last_name: string;
  suffix?: string | null;
  email: string;
  mobile_number?: string | null;
  password?: string;
  status: CitizenUserStatus;
  registry_completed: number; // 0 or 1
  failed_attempts?: number;
  last_login?: string | null;
  biometric_enabled: number; // 0 or 1
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CitizenProfile {
  citizenId: string;
  fullName: string;
  email: string;
  phone: string;
  barangay: string;
  address: string;
  isVerified: boolean;
  qrCodeToken: string;
  registeredDomains: string[];
}
