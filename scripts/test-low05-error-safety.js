/**
 * LOW-05: Citizen Mobile App Production-Safe Error Messages Test Suite
 * Civentral: Education and Scholarship Management System
 */

'use strict';

const fs = require('fs');
const path = require('path');

console.log('=== Running LOW-05 Citizen Mobile App Safe Error Messages Test Suite ===\n');

let passes = 0;
let failures = 0;

function check(condition, testName, details) {
  if (condition) {
    passes++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failures++;
    console.log(`  [FAIL] ${testName}`);
    if (details) console.log(`         Details: ${details}`);
  }
}

const MOBILE_BASE = path.resolve(__dirname, '../');

// 1. errorUtils.ts verification
const errorUtilsPath = path.join(MOBILE_BASE, 'src/utils/errorUtils.ts');
check(fs.existsSync(errorUtilsPath), '1.1 errorUtils.ts exists');

const errorUtilsContent = fs.readFileSync(errorUtilsPath, 'utf8');
check(errorUtilsContent.includes('SQLSTATE'), '1.2 Matches SQLSTATE');
check(errorUtilsContent.includes('PDOException'), '1.3 Matches PDOException');
check(errorUtilsContent.includes('OPENAI_[\\w_]*KEY'), '1.4 Matches API keys');
check(errorUtilsContent.includes('export function sanitizeErrorMessage'), '1.5 Exports sanitizeErrorMessage');
check(errorUtilsContent.includes('export function isTechnicalErrorMessage'), '1.6 Exports isTechnicalErrorMessage');

// 2. index.ts export verification
const indexPath = path.join(MOBILE_BASE, 'src/utils/index.ts');
const indexContent = fs.readFileSync(indexPath, 'utf8');
check(indexContent.includes("export * from './errorUtils'"), '2.1 errorUtils exported from utils/index.ts');

// 3. auth-service.ts parseJsonResponse verification
const authServicePath = path.join(MOBILE_BASE, 'src/services/auth-service.ts');
const authContent = fs.readFileSync(authServicePath, 'utf8');
check(!authContent.includes('.replace(/<[^>]*>?/gm, " ")'), '3.1 Stripped HTML stack trace scraping removed');
check(authContent.includes('Service temporarily unavailable. Please try again later.'), '3.2 Safe fallback returned on invalid/HTML response');

// 4. API layer sanitization
const renewalApiPath = path.join(MOBILE_BASE, 'src/features/education/renewal/api/renewalApi.ts');
const renewalApiContent = fs.readFileSync(renewalApiPath, 'utf8');
check(renewalApiContent.includes('sanitizeErrorMessage'), '4.1 renewalApi.ts uses sanitizeErrorMessage');

const grantApiPath = path.join(MOBILE_BASE, 'src/features/education/grant/api/grantApi.ts');
const grantApiContent = fs.readFileSync(grantApiPath, 'utf8');
check(grantApiContent.includes('sanitizeErrorMessage'), '4.2 grantApi.ts uses sanitizeErrorMessage');

// 5. Screen alerts & banners sanitization
const screens = [
  'src/features/education/renewal/RenewalApplicationScreen.tsx',
  'src/features/education/grant/ScholarshipGrantScreen.tsx',
  'src/features/education/dashboard/CitizenScholarshipDetailScreen.tsx',
  'src/features/education/compliance/NewApplicantComplianceScreen.tsx'
];

screens.forEach((scr) => {
  const scrPath = path.join(MOBILE_BASE, scr);
  const scrName = path.basename(scr);
  const scrContent = fs.readFileSync(scrPath, 'utf8');
  check(scrContent.includes('sanitizeErrorMessage'), `5.x ${scrName} applies sanitizeErrorMessage`);
});

console.log('\n------------------------------------------------------------');
console.log(`Results: ${passes} Passed, ${failures} Failed`);
console.log('------------------------------------------------------------\n');

if (failures > 0) process.exit(1);
