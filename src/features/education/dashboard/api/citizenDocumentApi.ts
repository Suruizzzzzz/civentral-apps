import { getEducationAuthHeaders, handleEducationResponse } from '@/src/services/education-auth-helper';
import { EDUCATION_API_BASE_URL } from '../../new-applicant/api/ScholarshipProgramApi';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform } from 'react-native';

export interface CitizenApplicationDocumentItem {
  document_id: number;
  document_code: string;
  document_name: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  status: string;
  submitted_at: string;
  application_code: string;
  application_id: number;
  certificate_id?: number | null;
  certificate_number?: string | null;
  certificate_status?: string | null;
  validation_result?: string | null;
  review_remarks?: string | null;
}

export interface CitizenRenewalDocumentItem {
  renewal_document_id: number;
  document_type: 'COR' | 'COG' | 'SOA' | string;
  document_name: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  validation_status: string;
  submission_status: string;
  review_remarks?: string | null;
  submitted_at: string;
  renewal_code: string;
  renewal_period: string;
  replaced_document_id?: number | null;
}

export interface CitizenOfficialDocumentItem {
  type: 'SCHOLARSHIP_CERTIFICATE' | 'SCHOLARSHIP_CONTRACT' | 'SWORN_UNDERTAKING' | 'RENEWAL_CERTIFICATE' | string;
  id: number;
  title: string;
  document_number: string;
  status: string;
  date: string;
  period?: string;
  original_filename: string;
  mime_type: string;
}

export interface CitizenScholarshipDocumentsData {
  application_documents: CitizenApplicationDocumentItem[];
  renewal_documents: CitizenRenewalDocumentItem[];
}

export interface CitizenOfficialDocumentsData {
  initial_documents: CitizenOfficialDocumentItem[];
  renewal_documents: CitizenOfficialDocumentItem[];
}

export interface CitizenScholarshipDocumentsResponse {
  status: 'success' | 'error';
  message: string;
  data: CitizenScholarshipDocumentsData | null;
}

export interface CitizenOfficialDocumentsResponse {
  status: 'success' | 'error';
  message: string;
  data: CitizenOfficialDocumentsData | null;
}

export interface CitizenDocumentActionResult {
  success: boolean;
  localUri: string;
  filename: string;
  mimeType: string;
}

export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

export async function validateFileIntegrity(localUri: string, mimeType: string): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (!fileInfo.exists || !fileInfo.size) {
      return false;
    }

    const isPdf = mimeType === 'application/pdf' || localUri.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      // Real PDF must be at least 1024 bytes (1 KB)
      if (fileInfo.size < 1024) {
        console.warn(`[validateFileIntegrity] PDF too small (${fileInfo.size} bytes): ${localUri}`);
        return false;
      }
      // Check magic header %PDF-
      const header = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.UTF8,
        length: 5,
        position: 0,
      });
      if (!header.startsWith('%PDF-')) {
        console.warn(`[validateFileIntegrity] Corrupted PDF magic header ("${header}") in: ${localUri}`);
        return false;
      }
    } else {
      if (fileInfo.size < 100) {
        return false;
      }
    }

    return true;
  } catch (err) {
    console.warn(`[validateFileIntegrity] Error checking ${localUri}:`, err);
    return false;
  }
}

export async function invalidateDocumentCache(filename: string): Promise<void> {
  try {
    const tempCacheUri = `${FileSystem.cacheDirectory}${filename}`;
    const info = await FileSystem.getInfoAsync(tempCacheUri);
    if (info.exists) {
      await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
      console.log(`[invalidateDocumentCache] Cache deleted for ${filename}`);
    }
  } catch (err) {
    console.warn(`[invalidateDocumentCache] Error deleting cache for ${filename}:`, err);
  }
}

export async function fetchCitizenScholarshipDocuments(): Promise<CitizenScholarshipDocumentsData> {
  const headers = await getEducationAuthHeaders({
    'Content-Type': 'application/json',
  });

  const res = await fetch(`${EDUCATION_API_BASE_URL}/education/citizen/scholarship-documents`, {
    headers,
  });

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch citizen documents (HTTP ${res.status})`);
  }

  const json: CitizenScholarshipDocumentsResponse = await res.json();
  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'Unable to retrieve citizen scholarship documents.');
  }

  return json.data;
}

export async function fetchCitizenOfficialDocuments(): Promise<CitizenOfficialDocumentsData> {
  const headers = await getEducationAuthHeaders({
    'Content-Type': 'application/json',
  });

  const res = await fetch(`${EDUCATION_API_BASE_URL}/education/citizen/scholarship-official-documents`, {
    headers,
  });

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch official documents (HTTP ${res.status})`);
  }

  const json: CitizenOfficialDocumentsResponse = await res.json();
  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'Unable to retrieve official scholarship documents.');
  }

  return json.data;
}

export async function downloadOrViewCitizenDocument(
  docType: 'application' | 'renewal',
  docId: number,
  originalFilename: string,
  mode: 'view' | 'download'
): Promise<CitizenDocumentActionResult> {
  const headers = await getEducationAuthHeaders();

  const endpointPath = docType === 'application' ? 'application' : 'renewal';
  const queryParam = mode === 'download' ? '?download=1' : '';
  const fileUrl = `${EDUCATION_API_BASE_URL}/education/citizen/scholarship-documents/${endpointPath}/${docId}/file${queryParam}`;

  const safeFilename = originalFilename ? originalFilename.replace(/[^a-zA-Z0-9_.-]/g, '_') : `document_${docId}.png`;
  const tempCacheUri = `${FileSystem.cacheDirectory}${safeFilename}`;
  const mimeType = getMimeType(safeFilename);

  // For view mode, check if file is already cached and valid
  if (mode === 'view') {
    try {
      const isValid = await validateFileIntegrity(tempCacheUri, mimeType);
      if (isValid) {
        return {
          success: true,
          localUri: tempCacheUri,
          filename: safeFilename,
          mimeType,
        };
      } else {
        await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
      }
    } catch {
      // Fall through to download
    }
  }

  const downloadResult = await FileSystem.downloadAsync(fileUrl, tempCacheUri, {
    headers,
  });

  if (downloadResult.status === 401) {
    await handleEducationResponse(new Response(null, { status: 401 }));
  }

  if (downloadResult.status !== 200) {
    try { await FileSystem.deleteAsync(tempCacheUri, { idempotent: true }); } catch {}
    throw new Error(`Unable to fetch file (HTTP ${downloadResult.status}).`);
  }

  const isValidDownloaded = await validateFileIntegrity(tempCacheUri, mimeType);
  if (!isValidDownloaded) {
    let errorSample = '';
    try {
      errorSample = await FileSystem.readAsStringAsync(tempCacheUri, {
        encoding: FileSystem.EncodingType.UTF8,
        length: 256,
        position: 0,
      });
    } catch {}
    await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
    console.error(`[citizenDocumentApi] File ${safeFilename} failed integrity validation: ${errorSample}`);
    throw new Error(`Downloaded document is invalid or corrupted. Server may have returned an error.`);
  }

  if (mode === 'download') {
    await handlePermanentDownload(tempCacheUri, safeFilename);
  }

  return {
    success: true,
    localUri: downloadResult.uri,
    filename: safeFilename,
    mimeType,
  };
}

export async function downloadOrViewCitizenInitialCertificate(
  applicationId: number,
  certNumber: string,
  mode: 'view' | 'download'
): Promise<CitizenDocumentActionResult> {
  const headers = await getEducationAuthHeaders();

  const queryParam = mode === 'download' ? '?download=1' : '';
  const fileUrl = `${EDUCATION_API_BASE_URL}/education/citizen/scholarship-documents/initial-certificate/${applicationId}/file${queryParam}`;

  const safeFilename = certNumber ? `Certificate_${certNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf` : `Certificate_${applicationId}.pdf`;
  const tempCacheUri = `${FileSystem.cacheDirectory}${safeFilename}`;
  const mimeType = 'application/pdf';

  if (mode === 'view') {
    try {
      const isValid = await validateFileIntegrity(tempCacheUri, mimeType);
      if (isValid) {
        return {
          success: true,
          localUri: tempCacheUri,
          filename: safeFilename,
          mimeType,
        };
      } else {
        await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
      }
    } catch {
      // Fall through to download
    }
  }

  const downloadResult = await FileSystem.downloadAsync(fileUrl, tempCacheUri, {
    headers,
  });

  if (downloadResult.status === 401) {
    await handleEducationResponse(new Response(null, { status: 401 }));
  }

  if (downloadResult.status !== 200) {
    try { await FileSystem.deleteAsync(tempCacheUri, { idempotent: true }); } catch {}
    throw new Error(`Unable to fetch certificate PDF (HTTP ${downloadResult.status}).`);
  }

  const isValidDownloaded = await validateFileIntegrity(tempCacheUri, mimeType);
  if (!isValidDownloaded) {
    let errorSample = '';
    try {
      errorSample = await FileSystem.readAsStringAsync(tempCacheUri, {
        encoding: FileSystem.EncodingType.UTF8,
        length: 256,
        position: 0,
      });
    } catch {}
    await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
    console.error(`[citizenDocumentApi] Certificate ${safeFilename} failed integrity validation: ${errorSample}`);
    throw new Error(`Downloaded certificate is invalid or corrupted.`);
  }

  if (mode === 'download') {
    await handlePermanentDownload(tempCacheUri, safeFilename);
  }

  return {
    success: true,
    localUri: downloadResult.uri,
    filename: safeFilename,
    mimeType,
  };
}

export async function downloadOrViewCitizenContract(
  applicationId: number,
  docNumber: string,
  mode: 'view' | 'download'
): Promise<CitizenDocumentActionResult> {
  const headers = await getEducationAuthHeaders();

  const queryParam = mode === 'download' ? '?download=1' : '';
  const fileUrl = `${EDUCATION_API_BASE_URL}/education/citizen/scholarship-documents/contract/${applicationId}/file${queryParam}`;

  const safeFilename = docNumber ? `Scholarship-Agreement-${docNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf` : `Contract_${applicationId}.pdf`;
  const tempCacheUri = `${FileSystem.cacheDirectory}${safeFilename}`;
  const mimeType = 'application/pdf';

  if (mode === 'view') {
    try {
      const isValid = await validateFileIntegrity(tempCacheUri, mimeType);
      if (isValid) {
        return {
          success: true,
          localUri: tempCacheUri,
          filename: safeFilename,
          mimeType,
        };
      } else {
        await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
      }
    } catch {
      // Fall through to download
    }
  }

  const downloadResult = await FileSystem.downloadAsync(fileUrl, tempCacheUri, {
    headers,
  });

  if (downloadResult.status === 401) {
    await handleEducationResponse(new Response(null, { status: 401 }));
  }

  if (downloadResult.status !== 200) {
    try { await FileSystem.deleteAsync(tempCacheUri, { idempotent: true }); } catch {}
    throw new Error(`Unable to fetch contract PDF (HTTP ${downloadResult.status}).`);
  }

  const isValidDownloaded = await validateFileIntegrity(tempCacheUri, mimeType);
  if (!isValidDownloaded) {
    let errorSample = '';
    try {
      errorSample = await FileSystem.readAsStringAsync(tempCacheUri, {
        encoding: FileSystem.EncodingType.UTF8,
        length: 256,
        position: 0,
      });
    } catch {}
    await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
    console.error(`[citizenDocumentApi] Contract PDF ${safeFilename} failed integrity validation: ${errorSample}`);
    throw new Error(`Downloaded contract PDF is invalid or corrupted. Server returned non-PDF data.`);
  }

  if (mode === 'download') {
    await handlePermanentDownload(tempCacheUri, safeFilename);
  }

  return {
    success: true,
    localUri: downloadResult.uri,
    filename: safeFilename,
    mimeType,
  };
}

export async function downloadOrViewCitizenUndertaking(
  applicationId: number,
  docNumber: string,
  mode: 'view' | 'download'
): Promise<CitizenDocumentActionResult> {
  const headers = await getEducationAuthHeaders();

  const queryParam = mode === 'download' ? '?download=1' : '';
  const fileUrl = `${EDUCATION_API_BASE_URL}/education/citizen/scholarship-documents/undertaking/${applicationId}/file${queryParam}`;

  const safeFilename = docNumber ? `Sworn-Undertaking-${docNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf` : `Undertaking_${applicationId}.pdf`;
  const tempCacheUri = `${FileSystem.cacheDirectory}${safeFilename}`;
  const mimeType = 'application/pdf';

  if (mode === 'view') {
    try {
      const isValid = await validateFileIntegrity(tempCacheUri, mimeType);
      if (isValid) {
        return {
          success: true,
          localUri: tempCacheUri,
          filename: safeFilename,
          mimeType,
        };
      } else {
        await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
      }
    } catch {
      // Fall through to download
    }
  }

  const downloadResult = await FileSystem.downloadAsync(fileUrl, tempCacheUri, {
    headers,
  });

  if (downloadResult.status === 401) {
    await handleEducationResponse(new Response(null, { status: 401 }));
  }

  if (downloadResult.status !== 200) {
    try { await FileSystem.deleteAsync(tempCacheUri, { idempotent: true }); } catch {}
    throw new Error(`Unable to fetch undertaking PDF (HTTP ${downloadResult.status}).`);
  }

  const isValidDownloaded = await validateFileIntegrity(tempCacheUri, mimeType);
  if (!isValidDownloaded) {
    let errorSample = '';
    try {
      errorSample = await FileSystem.readAsStringAsync(tempCacheUri, {
        encoding: FileSystem.EncodingType.UTF8,
        length: 256,
        position: 0,
      });
    } catch {}
    await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
    console.error(`[citizenDocumentApi] Undertaking PDF ${safeFilename} failed integrity validation: ${errorSample}`);
    throw new Error(`Downloaded undertaking is invalid or corrupted.`);
  }

  if (mode === 'download') {
    await handlePermanentDownload(tempCacheUri, safeFilename);
  }

  return {
    success: true,
    localUri: downloadResult.uri,
    filename: safeFilename,
    mimeType,
  };
}

export async function downloadOrViewCitizenRenewalCertificate(
  renewalId: number,
  certNumber: string,
  mode: 'view' | 'download'
): Promise<CitizenDocumentActionResult> {
  const headers = await getEducationAuthHeaders();

  const queryParam = mode === 'download' ? '?download=1' : '';
  const fileUrl = `${EDUCATION_API_BASE_URL}/scholarship-renewals/citizen/certificate/${renewalId}/pdf${queryParam}`;

  const safeFilename = certNumber ? `Renewal_Certificate_${certNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf` : `Renewal_Certificate_${renewalId}.pdf`;
  const tempCacheUri = `${FileSystem.cacheDirectory}${safeFilename}`;
  const mimeType = 'application/pdf';

  if (mode === 'view') {
    try {
      const isValid = await validateFileIntegrity(tempCacheUri, mimeType);
      if (isValid) {
        return {
          success: true,
          localUri: tempCacheUri,
          filename: safeFilename,
          mimeType,
        };
      } else {
        await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
      }
    } catch {
      // Fall through to download
    }
  }

  const downloadResult = await FileSystem.downloadAsync(fileUrl, tempCacheUri, {
    headers,
  });

  if (downloadResult.status === 401) {
    await handleEducationResponse(new Response(null, { status: 401 }));
  }

  if (downloadResult.status !== 200) {
    try { await FileSystem.deleteAsync(tempCacheUri, { idempotent: true }); } catch {}
    throw new Error(`Unable to fetch renewal certificate PDF (HTTP ${downloadResult.status}).`);
  }

  const isValidDownloaded = await validateFileIntegrity(tempCacheUri, mimeType);
  if (!isValidDownloaded) {
    let errorSample = '';
    try {
      errorSample = await FileSystem.readAsStringAsync(tempCacheUri, {
        encoding: FileSystem.EncodingType.UTF8,
        length: 256,
        position: 0,
      });
    } catch {}
    await FileSystem.deleteAsync(tempCacheUri, { idempotent: true });
    console.error(`[citizenDocumentApi] Renewal certificate ${safeFilename} failed integrity validation: ${errorSample}`);
    throw new Error(`Downloaded renewal certificate is invalid or corrupted.`);
  }

  if (mode === 'download') {
    await handlePermanentDownload(tempCacheUri, safeFilename);
  }

  return {
    success: true,
    localUri: downloadResult.uri,
    filename: safeFilename,
    mimeType,
  };
}

export async function handlePermanentDownload(tempCacheUri: string, filename: string): Promise<void> {
  if (Platform.OS === 'android') {
    const { StorageAccessFramework } = FileSystem;
    try {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64Data = await FileSystem.readAsStringAsync(tempCacheUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const mimeType = getMimeType(filename);
        const createdFileUri = await StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          mimeType
        );
        await StorageAccessFramework.writeAsStringAsync(createdFileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        Alert.alert('Download Complete', 'Document downloaded successfully.');
      } else {
        Alert.alert('Download Cancelled', 'Folder permission was not granted.');
      }
    } catch (safErr: any) {
      console.warn('[handlePermanentDownload] SAF error, falling back to document directory:', safErr);
      const targetDocUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.copyAsync({ from: tempCacheUri, to: targetDocUri });
      Alert.alert('Download Complete', 'Document downloaded successfully.');
    }
  } else {
    const targetDocUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.copyAsync({ from: tempCacheUri, to: targetDocUri });
    Alert.alert('Download Complete', 'Document downloaded successfully.');
  }
}
