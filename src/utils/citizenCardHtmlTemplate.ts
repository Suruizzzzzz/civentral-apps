import { CITIZEN_API_BASE_URL } from '@/src/services/api-client';

export interface CitizenCardHtmlParams {
  logoDataUri?: string;
  effectiveCitizenId: string;
  fullName: string;
  birth_date?: string | null;
  sex?: string | null;
  civil_status?: string | null;
  blood_type?: string | null;
  reviewed_at?: string | null;
  submitted_at?: string | null;
  valid_until?: string | null;
  street_address?: string | null;
  barangay?: string | null;
  district?: string | null;
  emergency_contact?: string | null;
  photo_1x1_url?: string | null;
  signature_photo_url?: string | null;
  effectiveQrToken?: string;
  classification: {
    title: string;
    stops: string[];
    [key: string]: any;
  };
}

export function resolveCardAssetUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanPath = url.replace(/^\/+/, '');
  const baseDomain = CITIZEN_API_BASE_URL.replace(/\/api\/citizen\/?$/, '');
  return `${baseDomain}/${cleanPath}`;
}

export function generateCitizenCardHtml(params: CitizenCardHtmlParams): string {
  const {
    logoDataUri,
    effectiveCitizenId,
    fullName,
    birth_date,
    sex,
    civil_status,
    blood_type,
    reviewed_at,
    submitted_at,
    valid_until,
    street_address,
    barangay,
    district,
    emergency_contact,
    photo_1x1_url,
    signature_photo_url,
    effectiveQrToken = '',
    classification,
  } = params;

  const resolvedLogoUri =
    logoDataUri || 'https://ui-avatars.com/api/?name=CV&background=0F4C81&color=fff&size=64';
  const numericSeed = effectiveCitizenId.replace(/\D/g, '') || '000004';
  const barcodeNum = '0100' + numericSeed.padStart(10, '0');

  const dob = birth_date ? String(birth_date).replace(/-/g, '/') : '1998/05/15';
  const sexChar = (sex || 'Male').toUpperCase().startsWith('F') ? 'F' : 'M';
  const civil = (civil_status || 'Single').toUpperCase();
  const blood = (blood_type || 'N/A').toUpperCase();

  const issuedDate = (reviewed_at || submitted_at || '2026-10-04').slice(0, 10).replace(/-/g, '/');
  const validUntilDate = (valid_until || '2031/10/04').slice(0, 10).replace(/-/g, '/');

  const street = (street_address || 'BLOCK 5 LOT 6').toUpperCase();
  const brgy = (barangay || 'BARANGAY 1').toUpperCase();
  const dist = (district || 'DISTRICT 1').toUpperCase();
  const fullAddress = `${street}, ${brgy}, ${dist}`;

  const emergency = emergency_contact || '(02) 8366-3101';
  const photoUrl =
    resolveCardAssetUrl(photo_1x1_url) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0F4C81&color=fff&size=200`;
  const signatureUrl = resolveCardAssetUrl(signature_photo_url) || '';
  const qrPayload = `CIVENTRAL:ID:${effectiveCitizenId}|TOKEN:${effectiveQrToken}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrPayload)}`;

  const stops = classification.stops;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Civentral Citizen ID Card - ${effectiveCitizenId}</title>
  <style>
    @page {
      size: portrait;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #F1F5F9;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page-title {
      font-size: 16px;
      font-weight: 800;
      color: #0F4C81;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .page-subtitle {
      font-size: 11px;
      color: #64748B;
      margin-bottom: 20px;
    }
    .card-frame {
      width: 336px;
      height: 212px;
      background: #FFFFFF;
      border-radius: 12px;
      border: 1px solid #CBD5E1;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .wave-header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 60px;
      z-index: 1;
    }
    .header-content {
      position: relative;
      z-index: 2;
      padding: 6px 10px 0 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .rep-title {
      font-size: 6px;
      font-weight: 700;
      color: #FEE2E2;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-align: center;
    }
    .brand-row {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-top: 2px;
    }
    .seal-img {
      width: 26px;
      height: 26px;
      border-radius: 13px;
      background: #FFFFFF;
      border: 1.5px solid #F59E0B;
      padding: 1px;
      object-fit: contain;
      margin-right: 6px;
    }
    .brand-text-col {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .brand-title {
      font-size: 12px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .brand-sub {
      font-size: 6px;
      font-weight: 700;
      color: #FDE047;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .card-body {
      position: relative;
      z-index: 3;
      padding: 8px 10px;
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    .left-col {
      width: 68px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .photo-box {
      width: 66px;
      height: 66px;
      border: 1px solid #CBD5E1;
      border-radius: 4px;
      background: #F8FAFC;
      overflow: hidden;
    }
    .photo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .sig-box {
      width: 66px;
      height: 20px;
      border-bottom: 1px dashed #94A3B8;
      margin-top: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .sig-box img {
      width: 90%;
      height: 85%;
      object-fit: contain;
    }
    .sig-label {
      font-size: 5.5px;
      color: #64748B;
      text-transform: uppercase;
      margin-top: 1px;
    }
    .resident-class {
      font-size: 8px;
      font-weight: 900;
      color: #0F172A;
      text-transform: uppercase;
      margin-top: 2px;
      text-align: center;
    }
    .center-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .name-label {
      font-size: 5.5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .full-name {
      font-size: 11px;
      font-weight: 900;
      color: #0F172A;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .demog-table {
      width: 100%;
      border-top: 1px solid #CBD5E1;
      padding-top: 2px;
      margin-top: 2px;
    }
    .demog-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .demog-cell {
      display: flex;
      flex-direction: column;
    }
    .d-label {
      font-size: 5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .d-val {
      font-size: 7.5px;
      font-weight: 800;
      color: #0F172A;
    }
    .addr-box {
      border-top: 1px solid #CBD5E1;
      padding-top: 2px;
      margin-top: 2px;
    }
    .addr-text {
      font-size: 6.8px;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
      line-height: 8.5px;
    }
    .emerg-text {
      font-size: 5.5px;
      color: #475569;
      margin-top: 2px;
    }
    .emerg-bold {
      font-weight: 700;
      color: #0F172A;
    }
    .right-col {
      width: 64px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .qr-box {
      width: 62px;
      height: 62px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-box img {
      width: 58px;
      height: 58px;
    }
    .barcode-num {
      font-size: 6px;
      font-family: monospace;
      font-weight: 700;
      color: #334155;
      margin-top: 2px;
      text-align: center;
    }
    .sec-code {
      font-size: 7px;
      font-family: monospace;
      font-weight: 800;
      color: #334155;
      align-self: flex-end;
    }
    .back-header {
      background: #0F4C81;
      padding: 6px 12px;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .back-body {
      padding: 10px;
      font-size: 6px;
      line-height: 8.5px;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="page-title">City of Civentral Official Resident Credential</div>
  <div class="page-subtitle">Printed via Civentral Municipal Digital Identity Portal</div>

  <!-- FRONT CARD -->
  <div class="card-frame" id="printableCitizenCard">
    <svg class="wave-header" viewBox="0 0 336 60" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="${stops[0]}" />
          <stop offset="30%" stop-color="${stops[1]}" />
          <stop offset="75%" stop-color="${stops[2]}" />
          <stop offset="100%" stop-color="${stops[3]}" />
        </linearGradient>
        <linearGradient id="pGold" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="#D97706" />
          <stop offset="50%" stop-color="#FDE047" />
          <stop offset="100%" stop-color="#D97706" />
        </linearGradient>
      </defs>
      <path d="M 0,0 L 336,0 L 336,44 Q 248,52 168,47 T 0,57 Z" fill="url(#pGrad)" />
      <path d="M 0,57 Q 88,47 168,47 T 336,44 L 336,47 Q 248,55 168,50 T 0,60 Z" fill="url(#pGold)" />
    </svg>

    <div class="header-content">
      <div class="rep-title">REPUBLIC OF THE PHILIPPINES</div>
      <div class="brand-row">
        <img src="${resolvedLogoUri}" class="seal-img" alt="Logo" />
        <div class="brand-text-col">
          <div class="brand-title">CIVENTRAL CITIZEN CARD</div>
          <div class="brand-sub">KASAMA KA SA PAG-UNLAD • CITY OF CIVENTRAL</div>
        </div>
      </div>
    </div>

    <div class="card-body">
      <!-- Col 1 -->
      <div class="left-col">
        <div class="photo-box">
          <img src="${photoUrl}" alt="Photo" />
        </div>
        <div class="sig-box">
          ${signatureUrl ? `<img src="${signatureUrl}" alt="Signature" />` : '<span style="font-size:5.5px;color:#94A3B8;font-style:italic;">Signature</span>'}
        </div>
        <div class="sig-label">Cardholder Signature</div>
        <div class="resident-class">${classification.title}</div>
      </div>

      <!-- Col 2 -->
      <div class="center-col">
        <div>
          <div class="name-label">Last Name, First Name, M.I.</div>
          <div class="full-name">${fullName}</div>

          <div class="demog-table">
            <div class="demog-row">
              <div class="demog-cell" style="flex:0.8;">
                <span class="d-label">Sex</span>
                <span class="d-val">${sexChar}</span>
              </div>
              <div class="demog-cell" style="flex:1.3;">
                <span class="d-label">Date of Birth</span>
                <span class="d-val">${dob}</span>
              </div>
              <div class="demog-cell" style="flex:1.1;">
                <span class="d-label">Civil Status</span>
                <span class="d-val">${civil}</span>
              </div>
            </div>
            <div class="demog-row">
              <div class="demog-cell" style="flex:0.8;">
                <span class="d-label">Blood</span>
                <span class="d-val">${blood}</span>
              </div>
              <div class="demog-cell" style="flex:1.3;">
                <span class="d-label">Date Issued</span>
                <span class="d-val">${issuedDate}</span>
              </div>
              <div class="demog-cell" style="flex:1.1;">
                <span class="d-label">Valid Until</span>
                <span class="d-val">${validUntilDate}</span>
              </div>
            </div>
          </div>

          <div class="addr-box">
            <div class="addr-text">${fullAddress}</div>
            <div class="addr-text">CIVENTRAL CITY</div>
          </div>
        </div>

        <div class="emerg-text">
          In case of Emergency: <span class="emerg-bold">${emergency}</span>
        </div>
      </div>

      <!-- Col 3 -->
      <div class="right-col">
        <div>
          <div class="qr-box">
            <img src="${qrImgUrl}" alt="QR" />
          </div>
          <div class="barcode-num">${barcodeNum}</div>
        </div>
        <div class="sec-code">00</div>
      </div>
    </div>
  </div>

  <!-- BACK CARD -->
  <div class="card-frame" id="printableCardBack">
    <div class="back-header">
      <div style="font-size:7px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">CITY CIVIL REGISTRY &amp; IDENTITY BUREAU</div>
      <div style="font-size:6.5px;font-family:monospace;font-weight:700;">ID: ${effectiveCitizenId}</div>
    </div>
    <div class="back-body">
      <p style="margin-bottom:6px;">
        <strong>CONDITIONS OF ISSUANCE:</strong> This official digital card certifies that the named bearer is a duly verified citizen resident of Civentral City. This card remains the property of the City Government of Civentral.
      </p>
      <p style="margin-bottom:6px;">
        <strong>VERIFICATION:</strong> The authentic digital credential can be validated using the Civentral Officer Scanner or the municipal portal by scanning the cryptographic QR credential on the front side.
      </p>
      <div style="margin-top:12px;border-top:1px solid #CBD5E1;padding-top:6px;display:flex;justify-content:space-between;align-items:flex-end;">
        <div>
          <div style="font-size:5.5px;color:#64748B;">MUNICIPALITY REGISTRATION CODE</div>
          <div style="font-size:7.5px;font-weight:800;font-family:monospace;">CAL-2026-NCR</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:5.5px;color:#64748B;">HOTLINE INQUIRIES</div>
          <div style="font-size:7.5px;font-weight:800;">(02) 8888-CIVENTRAL</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
