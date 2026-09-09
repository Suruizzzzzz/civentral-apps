export interface CourseSuggestion {
  name: string;
  code?: string;
  category?: string;
}

export const COMMON_COURSE_SUGGESTIONS: CourseSuggestion[] = [
  // Technology & Computing
  { name: 'Bachelor of Science in Information Technology', code: 'BSIT', category: 'Technology' },
  { name: 'Bachelor of Science in Information Systems', code: 'BSIS', category: 'Technology' },
  { name: 'Bachelor of Science in Computer Science', code: 'BSCS', category: 'Technology' },
  { name: 'Bachelor of Science in Information Technology Management', code: 'BSITM', category: 'Technology' },
  { name: 'Bachelor of Science in Computer Engineering', code: 'BSCpE', category: 'Engineering' },

  // Business, Management & Accountancy
  { name: 'Bachelor of Science in Business Administration', code: 'BSBA', category: 'Business' },
  { name: 'Bachelor of Science in Accountancy', code: 'BSA', category: 'Business' },
  { name: 'Bachelor of Science in Management Accounting', code: 'BSMA', category: 'Business' },
  { name: 'Bachelor of Science in Customs Administration', code: 'BSCA', category: 'Business' },
  { name: 'Bachelor of Science in Real Estate Management', code: 'BSREM', category: 'Business' },
  { name: 'Bachelor of Science in Office Administration', code: 'BSOA', category: 'Business' },

  // Education
  { name: 'Bachelor of Secondary Education', code: 'BSEd', category: 'Education' },
  { name: 'Bachelor of Elementary Education', code: 'BEEd', category: 'Education' },
  { name: 'Bachelor of Special Needs Education', code: 'BSNEd', category: 'Education' },
  { name: 'Bachelor of Early Childhood Education', code: 'BECEd', category: 'Education' },

  // Social Sciences & Humanities
  { name: 'Bachelor of Science in Psychology', code: 'BS Psych', category: 'Social Sciences' },
  { name: 'Bachelor of Arts in Communication', code: 'BA Comm', category: 'Humanities' },
  { name: 'Bachelor of Arts in Political Science', code: 'BA PolSci', category: 'Social Sciences' },
  { name: 'Bachelor of Science in Criminology', code: 'BSCrim', category: 'Criminal Justice' },

  // Hospitality & Tourism
  { name: 'Bachelor of Science in Hospitality Management', code: 'BSHM', category: 'Hospitality' },
  { name: 'Bachelor of Science in Tourism Management', code: 'BSTM', category: 'Hospitality' },

  // Health & Sciences
  { name: 'Bachelor of Science in Nursing', code: 'BSN', category: 'Healthcare' },
  { name: 'Bachelor of Science in Medical Technology', code: 'BSMT', category: 'Healthcare' },
  { name: 'Bachelor of Science in Pharmacy', code: 'BS Pharm', category: 'Healthcare' },
  { name: 'Bachelor of Science in Biology', code: 'BS Bio', category: 'Science' },

  // Engineering & Architecture
  { name: 'Bachelor of Science in Civil Engineering', code: 'BSCE', category: 'Engineering' },
  { name: 'Bachelor of Science in Mechanical Engineering', code: 'BSME', category: 'Engineering' },
  { name: 'Bachelor of Science in Electrical Engineering', code: 'BSEE', category: 'Engineering' },
  { name: 'Bachelor of Science in Industrial Engineering', code: 'BSIE', category: 'Engineering' },
  { name: 'Bachelor of Science in Architecture', code: 'BS Arch', category: 'Architecture' },

  // Senior High School Strands
  { name: 'Science, Technology, Engineering, and Mathematics', code: 'STEM', category: 'Senior High School' },
  { name: 'Accountancy, Business, and Management', code: 'ABM', category: 'Senior High School' },
  { name: 'Humanities and Social Sciences', code: 'HUMSS', category: 'Senior High School' },
  { name: 'General Academic Strand', code: 'GAS', category: 'Senior High School' },
  { name: 'Technical-Vocational-Livelihood', code: 'TVL', category: 'Senior High School' },
  { name: 'Information and Communications Technology Strand', code: 'ICT', category: 'Senior High School' },
  { name: 'Home Economics Strand', code: 'HE', category: 'Senior High School' },
  { name: 'Arts and Design Track', code: 'Arts & Design', category: 'Senior High School' },
  { name: 'Sports Track', code: 'Sports', category: 'Senior High School' },
];
