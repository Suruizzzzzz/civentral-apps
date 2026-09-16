import * as FileSystem from 'expo-file-system/legacy';

export interface DraftEnvelope<T = any> {
  citizen_user_id: number;
  form_type: string;
  scope_id: string;
  saved_at: string;
  data: T;
}

/**
 * Directory where form drafts are saved locally on device.
 */
function getDraftsBaseDir(): string {
  const base = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
  return `${base}civentral_drafts/`;
}

function sanitizeKey(val: string | number): string {
  return String(val).replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * In-memory fallback for non-native environments (such as unit test scripts or SSR)
 */
const memoryDraftStore = new Map<string, string>();

export class FormDraftService {
  private static async ensureDirectory(): Promise<void> {
    try {
      const baseDir = getDraftsBaseDir();
      if (!baseDir) return;
      const info = await FileSystem.getInfoAsync(baseDir);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
      }
    } catch {
      // Ignore directory creation errors in non-file environments
    }
  }

  private static getFilePath(
    formType: string,
    citizenUserId: number,
    scopeId: string | number
  ): string {
    const safeForm = sanitizeKey(formType);
    const safeUser = sanitizeKey(citizenUserId);
    const safeScope = sanitizeKey(scopeId);
    return `${getDraftsBaseDir()}draft_${safeUser}_${safeForm}_${safeScope}.json`;
  }

  private static getStoreKey(
    formType: string,
    citizenUserId: number,
    scopeId: string | number
  ): string {
    return `${citizenUserId}::${formType}::${scopeId}`;
  }

  /**
   * Save a form draft scoped by citizen_user_id, form_type, and scope_id.
   * Authentication credentials or tokens must NEVER be passed into data.
   */
  static async saveDraft<T>(
    formType: string,
    citizenUserId: number | null | undefined,
    scopeId: string | number,
    data: T
  ): Promise<boolean> {
    if (!citizenUserId || typeof citizenUserId !== 'number' || citizenUserId <= 0) {
      return false;
    }
    if (!formType || scopeId === undefined || scopeId === null) {
      return false;
    }

    const envelope: DraftEnvelope<T> = {
      citizen_user_id: citizenUserId,
      form_type: formType,
      scope_id: String(scopeId),
      saved_at: new Date().toISOString(),
      data,
    };

    const json = JSON.stringify(envelope);

    try {
      const baseDir = getDraftsBaseDir();
      if (baseDir && FileSystem.writeAsStringAsync) {
        await this.ensureDirectory();
        const path = this.getFilePath(formType, citizenUserId, scopeId);
        await FileSystem.writeAsStringAsync(path, json);
        return true;
      }
    } catch {
      // Fallback to memory store
    }

    memoryDraftStore.set(this.getStoreKey(formType, citizenUserId, scopeId), json);
    return true;
  }

  /**
   * Load a form draft scoped by citizen_user_id, form_type, and scope_id.
   * Ensures the draft belongs to the currently authenticated citizen_user_id.
   */
  static async loadDraft<T>(
    formType: string,
    citizenUserId: number | null | undefined,
    scopeId: string | number
  ): Promise<T | null> {
    if (!citizenUserId || typeof citizenUserId !== 'number' || citizenUserId <= 0) {
      return null;
    }
    if (!formType || scopeId === undefined || scopeId === null) {
      return null;
    }

    let rawJson: string | null = null;

    try {
      const baseDir = getDraftsBaseDir();
      if (baseDir && FileSystem.readAsStringAsync) {
        const path = this.getFilePath(formType, citizenUserId, scopeId);
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) {
          rawJson = await FileSystem.readAsStringAsync(path);
        }
      }
    } catch {
      // Fallback to memory store if file read fails
    }

    if (!rawJson) {
      rawJson = memoryDraftStore.get(this.getStoreKey(formType, citizenUserId, scopeId)) || null;
    }

    if (!rawJson) {
      return null;
    }

    try {
      const envelope: DraftEnvelope<T> = JSON.parse(rawJson);

      // Strict citizen ID check: never load another citizen's draft
      if (Number(envelope.citizen_user_id) !== Number(citizenUserId)) {
        console.warn('[FormDraftService] Mismatched citizen_user_id in draft, rejecting.');
        return null;
      }

      // Strict context/scope check
      if (envelope.form_type !== formType || String(envelope.scope_id) !== String(scopeId)) {
        console.warn('[FormDraftService] Mismatched form_type or scope_id in draft, rejecting.');
        return null;
      }

      return envelope.data;
    } catch (parseErr) {
      console.warn('[FormDraftService] Failed to parse draft payload:', parseErr);
      return null;
    }
  }

  /**
   * Clear a draft after successful submission or explicit form cancellation.
   */
  static async clearDraft(
    formType: string,
    citizenUserId: number | null | undefined,
    scopeId: string | number
  ): Promise<boolean> {
    if (!citizenUserId || !formType || scopeId === undefined || scopeId === null) {
      return false;
    }

    let fileDeleted = false;

    try {
      const baseDir = getDraftsBaseDir();
      if (baseDir && FileSystem.deleteAsync) {
        const path = this.getFilePath(formType, citizenUserId, scopeId);
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) {
          await FileSystem.deleteAsync(path, { idempotent: true });
          fileDeleted = true;
        }
      }
    } catch {
      // Ignore file deletion error
    }

    memoryDraftStore.delete(this.getStoreKey(formType, citizenUserId, scopeId));
    return fileDeleted || true;
  }

  /**
   * Verify whether a local file still exists at the given URI.
   * If the file was cleared by the OS cache, this returns false so the app does not
   * fabricate a valid attachment.
   */
  static async verifyFileExists(uri?: string | null): Promise<boolean> {
    if (!uri || typeof uri !== 'string' || uri.trim() === '') {
      return false;
    }

    try {
      if (FileSystem.getInfoAsync) {
        const info = await FileSystem.getInfoAsync(uri);
        return Boolean(info && info.exists && (info.size === undefined || info.size > 0));
      }
    } catch {
      // Fallback
    }

    // In non-native environments, consider non-empty string verifiable if not starting with file://
    return false;
  }
}
