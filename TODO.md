# Civentral Mobile Application Modernization Roadmap

## Overview
This roadmap establishes a prioritized refactoring and contract alignment plan for the Civentral citizen mobile application (`civentral-apps`). It resolves contract drift against the modernized `civentral-education-backend`, addresses monolithic screen bottlenecks, eliminates orphan shims, and establishes a unified network and state architecture.

### Codebase Health Metrics (Baseline)
- **Framework:** React Native 0.81.5 / Expo SDK ~54.0.37 / Expo Router ~6.0.24 / React 19.1.0 / TypeScript ~5.9.2
- **Tracked Source Files:** 195 source files (~62,049 lines of code)
- **Monolithic Screens & Services ($\ge$ 400 LOC):** 41 files (~38,500 LOC or ~62% of the entire codebase)
- **Top God Screen:** `CitizenScholarshipDetailScreen.tsx` (5,406 lines)
- **Decentralized Network Calls:** 41 raw `fetch()` calls without centralized interceptors or HTTP abstraction
- **Brand Standard:** Civentral

---

## Priority 1: Backend Contract Alignment & Network Hardening

- [x] **[P1-NET-01] Implement Unified `ApiClient` & Standardized Error Envelope Parser**
  - **Location:** `src/services/api-client.ts` & `src/services/education-auth-helper.ts`
  - **Commit Tag:** `refactor(api): implement unified ApiClient with standard envelope unpacking`
  - **Status:** **Completed.** Created centralized `ApiClient` in `src/services/api-client.ts` supporting subsystem base URL resolution (`education`, `citizen`, `core`), automatic bearer token injection from memory/SecureStore, request timeouts, and multipart support. Standardized `unpackApiResponse` for `BaseController` envelopes (`status === 'success' || status === 200`). Implemented `ApiValidationError` for HTTP 422 errors and updated `handleEducationResponse()` in `src/services/education-auth-helper.ts` to parse `json.errors` without breaking existing screen flows.
  - **Scope:**
    - Replace 41 repetitive `fetch()` / `expoFetch()` calls with a centralized, typed HTTP client.
    - Unify response unpacking to handle standard `BaseController` envelopes (`status === 'success' || status === 200`, `data`).
    - Normalize HTTP 422 responses: Extract `json.errors` (`Record<string, string[]>`) alongside `json.message` and throw a structured `ApiValidationError`.

- [x] **[P1-VAL-02] Integrate Field-Level 422 Error Handling Across Form Screens**
  - **Location:** `NewApplicantApplicationScreen.tsx`, `GrantApplicationScreen.tsx`, `RenewalApplicationScreen.tsx`, `VerifyCitizenScreen.tsx`
  - **Commit Tag:** `P1-VAL-02: map 422 field errors`
  - **Status:** **Completed.** Wired `ApiValidationError` into all 4 major application and verification screens (`NewApplicantApplicationScreen`, `GrantApplicationScreen`, `RenewalApplicationScreen`, `VerifyCitizenScreen`). Form catch blocks now extract and store `fieldErrors` (`Record<string, string[]>`), render contextual field-level error messages directly below affected inputs (`course_program`, `valid_id_number`, document slots `cor`, `cog`, `soa`), and display concise top-level banners (`Please check the highlighted fields: ...`) instead of generic alerts. Input change events dynamically clear active field error states.
  - **Scope:**
    - Catch `ApiValidationError` and bind field-level errors directly to UI input components (`errors.general_weighted_average`, `errors.course_program`, `errors.id_number`).
    - Prevent generic `[Backend 422] Validation failed` alerts from blocking submission recovery.

- [x] **[P1-REL-03] Align Alphanumeric Release References & Dual-Identifier Typing**
  - **Location:** `src/features/education/grant/api/grantReleaseApi.ts`, `GrantClaimVoucherScreen.tsx`, `CitizenScholarshipDetailScreen.tsx`
  - **Commit Tag:** `P1-REL-03: alphanumeric release codes`
  - **Status:** **Completed.** Updated `CitizenGrantReleaseItem` interface to support dual identifiers (`grant_release_id?: number` and `release_code: string`). Added `fetchCitizenGrantRelease` helper and normalized response mapping in `grantReleaseApi.ts`. Enhanced `CitizenScholarshipDetailScreen.tsx` navigation matchers to resolve both integer IDs and alphanumeric `REL-*` reference strings seamlessly, passing dual identifiers to `/education/grant/voucher`. Updated `GrantClaimVoucherScreen.tsx` to accept both identifiers, multi-voucher selector support, release reference details, and aligned system brand spelling to "Civentral".
  - **Scope:**
    - Update `CitizenGrantReleaseItem` interface to include both `grant_release_id?: number` and `release_code: string`.
    - Update `CitizenScholarshipDetailScreen.tsx` navigation matchers to resolve both integer IDs and `REL-*` reference strings seamlessly.
    - Support dual identifier parsing and selection in `GrantClaimVoucherScreen.tsx` and enforce strict "Civentral" branding.

---

## Priority 2: Deconstruct God Screen Monoliths (> 2,500 LOC)

- [x] **[P2-MOD-01] Decompose `CitizenScholarshipDetailScreen.tsx` (5,406 LOC -> 437 LOC orchestrator)**
  - **Location:** `src/features/education/dashboard/details/`
  - **Commit Tag:** `P2-MOD-01: decompose scholarship detail screen`
  - **Target Modules:**
    1. `ApplicationStatusCard.tsx` (Status pill, timeline milestones, cancellation handler, lifecycle progress tracker)
    2. `ContractUndertakingTab.tsx` (Digital signature status, orientation schedule, PDF preview modal)
    3. `GrantPayoutTab.tsx` (Disbursement channels, payout claim QR voucher button, bank/F2F details)
    4. `RenewalHistoryTab.tsx` (Evaluation criteria, GWA records, term progression cards)
    5. `ComplianceReplacementTab.tsx` (Document deficiencies, re-upload triggers, reviewer notes)
    6. `HeaderContextCard.tsx` (Standardized record context header card)
    7. `detailHelpers.ts` & `useScholarshipDocumentViewer.tsx` & `useScholarshipDetailData.ts` (Modular domain hooks & utilities)
    8. Orchestrator reduced to 437 lines (< 450 limit).

- [x] **[P2-MOD-02] Decompose `NewApplicantApplicationScreen.tsx` (3,214 LOC)**
  - **Location:** `src/features/education/new-applicant/steps/`
  - **Commit Tag:** `P2-MOD-02: decompose new applicant wizard`
  - **Target Modules:**
    1. `Step1PersonalInfo.tsx` (Personal information, contact details, residence)
    2. `Step2FamilyGuardian.tsx` (Guardian info, family roster, emergency contact)
    3. `Step3AcademicBackground.tsx` (School selector, course, year level, GWA inputs & grade scales)
    4. `Step4FinancialDetails.tsx` (Income tiers, employment status, socioeconomic indicators)
    5. `Step5DocumentUploads.tsx` (Requirement slots, file picker triggers, OCR scan feedback, 422 field errors)
    6. `Step6VideoDeclaration.tsx` (Video confirmation, applicant declaration, final review summary)
    7. `WizardModals.tsx` (ConfirmSubmitModal, FullVideoGuideModal, SchoolModal, CourseModal, SuffixModal)
    8. `WizardStepperHeader.tsx` & `ApplicationSuccessView.tsx`
    9. Orchestrator reduced to 328 lines (< 450 limit).

- [x] **[P2-MOD-03] Decompose `VerifyCitizenScreen.tsx` (2,943 LOC)**
  - **Location:** `src/features/identity/verification/`
  - **Commit Tag:** `P2-MOD-03: decompose verify citizen screen`
  - **Status:** **Completed.** Deconstructed the 2,943 LOC god screen into 13 modular sub-components, types, modals, and hooks under `src/features/identity/verification/`. Orchestrator reduced to 398 lines (< 400 LOC limit).
  - **Delivered Modules:**
    1. `VerificationDocStep.tsx` (ID card selector, front/back camera triggers, PhilSys QR barcode scanner)
    2. `LivenessSelfieStep.tsx` (Selfie camera guide, face alignment oval, blink/smile liveness check, 1x1 photo)
    3. `SignaturePadModal.tsx` (Interactive touch signature canvas with SVG path renderer & photo fallback)
    4. `VerificationReviewStep.tsx` (Summary dossier, extracted citizen attributes, data privacy consent)
    5. `VerificationPersonalStep.tsx` (Personal info, sex selector, place of birth, calendar picker)
    6. `VerificationResidencyStep.tsx` (District cards, barangay picker, street address, years of residency)
    7. `VerificationStatusGuards.tsx` & `VerificationSuccessStep.tsx` (Guest guard, in-review guard, official citizen card with Civic directory)
    8. `BarangayPickerModal.tsx` & `PhotoSourcePickerModal.tsx` (Barangay search and photo source selection)
    9. `useCitizenVerificationWizard.ts` (State machine, multi-step flow, candidate endpoints, 422 error binding)
    10. `index.ts` (Barrel export)

---

## Priority 3: State Management & Academic Period Scoping

- [ ] **[P3-PER-01] Parameterize Academic Period Lookups for Scholar Listings**
  - **Location:** `src/features/education/new-applicant/api/ScholarshipProgramApi.ts`, `ScholarshipMatchingScreen.tsx`
  - **Commit Tag:** `feat(scholarship): add period_id query support to program listing endpoints`
  - **Scope:**
    - Support optional `period_id` parameter in `fetchScholarshipPrograms()` and `fetchMatchingEducationLevels()` to align with backend `AcademicPeriodScope`.
    - Provide active period selector header on the mobile scholarship catalog screen.

- [ ] **[P3-STA-02] Introduce Lightweight Global State Store (Zustand)**
  - **Location:** `src/store/`
  - **Commit Tag:** `feat(store): introduce Zustand stores for auth, citizen profile, and active scholarship cycle`
  - **Scope:**
    - Create `useAuthStore` to replace scattered static `AuthService` state.
    - Create `useScholarshipStore` to eliminate duplicate fetches of `/education/citizen/scholarship-dashboard` between `ScholarshipDashboardScreen`, `CitizenScholarshipDetailScreen`, and `ScholarshipHistoryScreen`.

---

## Priority 4: Dead Code Elimination & Configuration Hygiene

- [x] **[P4-CLN-01] Delete Orphan Mock Table & Deprecated API Methods**
  - **Location:** `src/services/local-citizen-table.ts`, `src/services/api.ts`, `src/features/identity/screens/VerifyCitizenScreen.tsx`
  - **Commit Tag:** `chore(cleanup): remove orphan local-citizen-table and unused getApplications shim`
  - **Status:** **Completed.** Deleted unreferenced `src/services/local-citizen-table.ts` (138 LOC mock table) and removed unused `LocalCitizenTable` import and call in `VerifyCitizenScreen.tsx`. Replaced unused `CivicApiService.getApplications()` in `src/services/api.ts` with a clean `@deprecated` stub returning an empty array.
  - **Scope:**
    - Delete `src/services/local-citizen-table.ts` (138 lines unused in-memory mock table).
    - Remove `CivicApiService.getApplications()` calling legacy `get-applications.php` or replace with clean no-op stub.

- [x] **[P4-CLN-02] Purge Hardcoded Developer LAN IPs & Candidate Ping Loops**
  - **Location:** `src/services/citizenVerificationService.ts`
  - **Commit Tag:** `fix(network): remove hardcoded LAN IP addresses and sanitize candidate endpoints`
  - **Status:** **Completed.** Removed all hardcoded private LAN IP addresses (`192.168.1.5` and `10.0.2.2`) and local emulator loops from `getCandidateVerificationEndpoints()` and `getCandidateStatusEndpoints()`. Both functions now rely exclusively on `EXPO_PUBLIC_CITIZEN_API_URL` with defensive fallback to production `https://api-citizen.civentral.tech/api/citizen`.
  - **Scope:**
    - Remove hardcoded `192.168.1.5` and `10.0.2.2` private addresses in `getCandidateVerificationEndpoints()` and `getCandidateStatusEndpoints()`.
    - Rely strictly on environment variable `EXPO_PUBLIC_CITIZEN_API_URL` with defensive production fallback (`https://api-citizen.civentral.tech/api/citizen`).
