# Civentral Mobile Application — Surgical Condensation Roadmap

## Overview
This roadmap outlines a strict, zero-regression condensation plan to de-bloat monolithic screens, deduplicate boilerplate, and reduce codebase weight across `civentral-apps` without modifying runtime business logic, API contracts, or wizard state lifecycles.

### Guardrails & Do-Not-Touch List
- **DO NOT TOUCH:** `useNewApplicantWizard.ts`, `useCitizenVerificationWizard.ts` (Wizard state hooks).
- **DO NOT TOUCH:** Multipart file builders, document ID keys (`doc_<id>`), and `FormData` assembly.
- **DO NOT TOUCH:** `api-client.ts`, auth token interceptors, and SecureStore routines.
- **DO NOT TOUCH:** Cryptographic QR payload generation (`generateQrClaimPayload`).
- **DO NOT TOUCH:** Complex `useEffect` dependency arrays.

---

## Phase 1: Pure Utility Deduplication (Zero UI/Runtime Risk)
- [x] **[PH1-01] Deduplicate Status Badge Pickers**
  - Target Files: `MyApplicationScreen.tsx`, `GrantApplicationScreen.tsx`, `DistributionScheduleScreen.tsx`, `ScholarshipGrantScreen.tsx`, `RenewalApplicationScreen.tsx`
  - Action: Replace redundant local `switch` helpers (~140 LOC) with central `getStatusBadgeVariant()` and `formatStatusLabel()` from `@/src/utils/statusTheme.ts`.
- [x] **[PH1-02] Shared OCR Feedback Component**
  - Target Files: `GrantApplicationScreen.tsx`, `RenewalApplicationScreen.tsx`, `Step5DocumentUploads.tsx`
  - Action: Create a single `<OcrValidationBadge />` component in `src/components/common/OcrValidationBadge.tsx` and replace ~210 duplicated lines of UI badge rendering.
- [x] **[PH1-03] Externalize Official Citizen Card HTML Template**
  - Target File: `OfficialCitizenCard.tsx`
  - Action: Move the 420-line static HTML/CSS template string from the React Native component file into `src/utils/citizenCardHtmlTemplate.ts`.

---

## Phase 2: Declarative Mapping & JSX De-Bloat
- [ ] **[PH2-01] Array-Driven Info Row Mapping**
  - Target File: `ApplicationStatusCard.tsx`
  - Action: Convert 8+ repeated `<View style={styles.infoRow}>` blocks into declarative field arrays mapped with `.map()`, saving ~280 LOC.
- [ ] **[PH2-02] Centralize 5-Stage Stepper Calculation**
  - Target Files: `ApplicationStatusCard.tsx`, `ScholarshipDashboardScreen.tsx`
  - Action: Move duplicated `computeScholarshipStages` logic into a pure exported helper in `detailHelpers.ts` (-120 LOC).

---

## Phase 3: Modal Component Extraction
- [ ] **[PH3-01] Decouple Dashboard Modals**
  - Target File: `ScholarshipDashboardScreen.tsx`
  - Action: Extract the 3 self-contained modals (Progress Timeline, Record Documents, Document Action Feedback) from lines 1882–2856 into `src/features/education/dashboard/modals/` to reduce file weight by ~972 LOC.
- [ ] **[PH3-02] Extract Withdrawal Modal**
  - Target File: `MyApplicationScreen.tsx`
  - Action: Extract the 135-line embedded voluntary withdrawal confirmation modal into a dedicated modal component.

---

## Phase 4: Shared Style Tokens & Verification
- [ ] **[PH4-01] Consolidate Shared Layout Styles**
  - Target Files: `NewApplicantApplication.styles.ts`, `ScholarshipGrant.styles.ts`, `VerifyCitizenScreen.styles.ts`, `ScholarshipDashboard.styles.ts`
  - Action: Reference shared card, header, and back-button style tokens from `common.styles.ts`.
- [ ] **[PH4-02] Final Clean Compile & Zero-Error Check**
  - Action: Run `npx tsc --noEmit` and `npm run lint` to guarantee 0 type errors, 0 runtime breaks, and 100% defense alignment.
