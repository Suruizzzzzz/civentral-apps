export type CivicDomainCategory =
  | 'identity'
  | 'social-services'
  | 'health'
  | 'education'
  | 'emergency'
  | 'housing'
  | 'business'
  | 'treasury'
  | 'transport'
  | 'facilities';

export interface CivicDomainMetadata {
  id: CivicDomainCategory;
  title: string;
  shortName: string;
  description: string;
  icon: string;
  badgeCount?: number;
  color: string;
  subCategories: string[];
}

export type ApplicationStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Completed';

export interface DomainApplication {
  id: string;
  domainId: CivicDomainCategory;
  serviceTitle: string;
  applicantId: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}
