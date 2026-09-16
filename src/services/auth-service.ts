import * as SecureStore from "expo-secure-store";
import { CitizenUser } from "@/types/citizen";

export interface AuthApiResponse {
  status: "success" | "otp_required" | "error";
  message: string;
  token?: string;
  user?: CitizenUser;
  citizen_user_id?: number;
  email?: string;
  data?: any;
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://civentral.tech/api/citizen";

export const SECURE_SESSION_KEY = "civentral_citizen_session";

function parseJsonResponse(text: string): { json: any; errorText?: string } {
  if (!text) return { json: null, errorText: "Empty response from server." };
  try {
    return { json: JSON.parse(text) };
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return { json: JSON.parse(jsonMatch[0]) };
      } catch {}
    }
  }
  const cleanText = text
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    json: null,
    errorText: cleanText || "Server returned an invalid response format.",
  };
}

export class AuthService {
  private static isGuest: boolean = false;
  private static currentUserEmail: string | null = null;
  private static currentUserPhone: string | null = null;
  private static currentUserId: number | null = null;
  private static currentUserData: any = null;
  private static authToken: string | null = null;

  private static isHandlingUnauthorized: boolean = false;
  private static unauthorizedListener: (() => void) | null = null;

  static setUnauthorizedListener(listener: (() => void) | null) {
    this.unauthorizedListener = listener;
  }

  /**
   * Single-flight 401 handler to prevent redirect loops when multiple concurrent requests return 401.
   */
  static async handleUnauthorizedAccess(): Promise<void> {
    if (this.isHandlingUnauthorized) return;
    this.isHandlingUnauthorized = true;

    try {
      await this.clearSession();
      if (this.unauthorizedListener) {
        this.unauthorizedListener();
      }
    } finally {
      setTimeout(() => {
        this.isHandlingUnauthorized = false;
      }, 1500);
    }
  }

  static setGuestMode(guest: boolean) {
    this.isGuest = guest;
    if (guest) {
      this.currentUserEmail = null;
      this.currentUserPhone = null;
      this.currentUserId = null;
      this.currentUserData = null;
      this.authToken = null;
    }
  }

  static isGuestMode(): boolean {
    return (
      this.isGuest ||
      (!this.currentUserEmail && !this.currentUserPhone && !this.currentUserId)
    );
  }

  static getAuthToken(): string | null {
    if (this.isGuest) return null;
    return this.authToken;
  }

  static setCurrentUser(data: {
    email?: string;
    phone?: string;
    citizen_user_id?: number;
    user?: any;
    token?: string;
  }) {
    this.isGuest = false;
    if (data.email) this.currentUserEmail = data.email;
    if (data.phone) this.currentUserPhone = data.phone;
    if (data.token) this.authToken = data.token;

    const extractedId =
      data.citizen_user_id ||
      data.user?.citizen_user_id ||
      data.user?.id ||
      data.user?.user_id;

    if (extractedId) {
      this.currentUserId = Number(extractedId);
    }

    if (data.user) {
      this.currentUserData = data.user;
      if (data.user.email) this.currentUserEmail = data.user.email;
      if (data.user.mobile_number || data.user.phone)
        this.currentUserPhone = data.user.mobile_number || data.user.phone;
      if (data.user.token) this.authToken = data.user.token;
    }
  }

  static getCurrentUser() {
    const isGuestSession = this.isGuest;
    const effectiveUserId = isGuestSession ? null : this.currentUserId;
    const effectiveEmail = isGuestSession ? null : this.currentUserEmail;

    return {
      isGuest: isGuestSession,
      email: effectiveEmail,
      phone: isGuestSession ? null : this.currentUserPhone,
      citizen_user_id: effectiveUserId,
      token: isGuestSession ? null : this.authToken,
      user: isGuestSession
        ? null
        : {
            ...(this.currentUserData || {}),
            citizen_user_id: effectiveUserId,
            email: effectiveEmail,
            token: this.authToken,
          },
    };
  }

  static clearCurrentUser() {
    this.isGuest = false;
    this.currentUserEmail = null;
    this.currentUserPhone = null;
    this.currentUserId = null;
    this.currentUserData = null;
    this.authToken = null;
  }

  static async saveSession(session: {
    token: string;
    citizen_user_id: number;
    email?: string | null;
    expires_at?: string | number | null;
  }): Promise<boolean> {
    if (!session.token || !session.citizen_user_id) {
      return false;
    }
    try {
      const payload = JSON.stringify({
        token: session.token,
        citizen_user_id: Number(session.citizen_user_id),
        email: session.email || null,
        expires_at: session.expires_at || null,
      });
      await SecureStore.setItemAsync(SECURE_SESSION_KEY, payload);
      return true;
    } catch {
      return false;
    }
  }

  static async clearSession(): Promise<void> {
    this.clearCurrentUser();
    try {
      await SecureStore.deleteItemAsync(SECURE_SESSION_KEY);
    } catch {}
  }

  /**
   * Session Restoration Flow:
   * 1. Read stored session from SecureStore
   * 2. Validate structure & local expiry
   * 3. Authoritatively verify with Core POST https://civentral.tech/api/citizen/auth/verify.php
   * 4. Restore authenticated memory state or clear session if invalid
   */
  static async restoreSession(): Promise<boolean> {
    try {
      const jsonStr = await SecureStore.getItemAsync(SECURE_SESSION_KEY);
      if (!jsonStr) {
        this.clearCurrentUser();
        return false;
      }

      let stored: any;
      try {
        stored = JSON.parse(jsonStr);
      } catch {
        await this.clearSession();
        return false;
      }

      if (!stored || !stored.token || !stored.citizen_user_id) {
        await this.clearSession();
        return false;
      }

      if (stored.expires_at) {
        const expTime = new Date(stored.expires_at).getTime();
        if (!isNaN(expTime) && Date.now() >= expTime) {
          await this.clearSession();
          return false;
        }
      }

      // Perform authoritative Core verify check
      let verifyRes: Response | null = null;
      const verifyRoutes = ["/auth/verify.php", "/verify.php"];
      for (const route of verifyRoutes) {
        try {
          const url = `https://civentral.tech/api/citizen${route}`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${stored.token}`,
            },
          });
          if (res.status !== 404) {
            verifyRes = res;
            break;
          }
        } catch {}
      }

      if (!verifyRes || !verifyRes.ok) {
        await this.clearSession();
        return false;
      }

      const text = await verifyRes.text();
      const { json } = parseJsonResponse(text);

      if (
        !json ||
        (json.status !== "success" && json.success !== true && json.valid !== true)
      ) {
        await this.clearSession();
        return false;
      }

      const coreUserId =
        json.citizen_user_id ||
        json.user?.citizen_user_id ||
        json.user?.id ||
        json.data?.citizen_user_id ||
        json.data?.user_id ||
        stored.citizen_user_id;

      const validatedUserId = Number(coreUserId);
      if (isNaN(validatedUserId) || validatedUserId <= 0) {
        await this.clearSession();
        return false;
      }

      const validatedEmail = json.email || json.user?.email || stored.email;
      const updatedToken = json.token || stored.token;
      const updatedExpiresAt = json.expires_at || json.session?.expires_at || stored.expires_at;

      if (validatedUserId !== stored.citizen_user_id || updatedToken !== stored.token) {
        await this.saveSession({
          token: updatedToken,
          citizen_user_id: validatedUserId,
          email: validatedEmail,
          expires_at: updatedExpiresAt,
        });
      }

      this.isGuest = false;
      this.authToken = updatedToken;
      this.currentUserId = validatedUserId;
      this.currentUserEmail = validatedEmail;
      this.currentUserData = json.user || json.data || null;

      return true;
    } catch {
      await this.clearSession();
      return false;
    }
  }

  /**
   * Helper to attempt multiple endpoints (REST Gateway primary, legacy fallback)
   */
  private static async postRequest(
    routes: string[],
    body: any,
  ): Promise<Response | null> {
    let lastResponse: Response | null = null;
    for (const route of routes) {
      try {
        const url = `${API_BASE_URL}${route.startsWith("/") ? route : "/" + route}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const contentType = res.headers.get("content-type") || "";
        if (res.status === 404 || contentType.includes("text/html")) {
          lastResponse = res;
          continue;
        }

        return res;
      } catch {}
    }
    return lastResponse;
  }

  /**
   * Check if account exists for email or phone number
   * Endpoint: POST /auth/check-account
   */
  static async checkAccount(identifier: string): Promise<{
    exists: boolean;
    userStatus?: string;
    message?: string;
  }> {
    try {
      const payload = {
        email: identifier,
        identifier: identifier,
        mobile_number: identifier,
      };

      const response = await AuthService.postRequest(
        ["/check-account.php", "/auth/check-account"],
        payload,
      );
      if (!response) return { exists: false };

      const text = await response.text();
      const { json } = parseJsonResponse(text);
      if (!json) return { exists: false };

      if (json.exists === true || json.status === "exists") {
        return {
          exists: true,
          userStatus: json.user_status,
          message: json.message,
        };
      }

      return { exists: false, message: json.message };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Citizen Login to REST API Gateway
   * Endpoint: POST /auth/login
   */
  static async login(
    identifier: string,
    password: string,
  ): Promise<AuthApiResponse> {
    try {
      const payload = {
        email: identifier,
        mobile_number: identifier,
        identifier: identifier,
        password: password,
      };

      const response = await AuthService.postRequest(
        ["/login.php", "/auth/login"],
        payload,
      );
      if (!response) {
        return {
          status: "error",
          message: "Unable to reach backend authentication gateway.",
        };
      }

      const text = await response.text();
      const { json, errorText } = parseJsonResponse(text);
      if (!json) {
        return {
          status: "error",
          message: errorText || "Server returned an invalid response format.",
        };
      }

      if (
        json.status === "otp_required" ||
        json.status === "verification_required" ||
        json.verification_required === true
      ) {
        return {
          status: "otp_required",
          message:
            json.message || "Please verify your email to complete login.",
          email: json.email || identifier,
        };
      }

      if (json.status === "success" || json.success === true) {
        const userObj = json.user || json.data?.user || json.data;
        const userEmail = json.email || userObj?.email || identifier;
        const userId =
          json.citizen_user_id ||
          userObj?.citizen_user_id ||
          userObj?.id ||
          userObj?.user_id;
        const token =
          json.token || json.data?.token || json.session?.refresh_token || json.session?.token;
        const expiresAt =
          json.expires_at || json.session?.expires_at || json.data?.expires_at;

        if (!token || !userId) {
          return {
            status: "error",
            message: "Invalid session credentials received from server.",
          };
        }

        const sessionSaved = await AuthService.saveSession({
          token: token,
          citizen_user_id: Number(userId),
          email: userEmail,
          expires_at: expiresAt,
        });

        if (!sessionSaved) {
          return {
            status: "error",
            message: "Failed to securely save session credentials on device.",
          };
        }

        AuthService.setCurrentUser({
          email: userEmail,
          citizen_user_id: Number(userId),
          user: userObj,
          token: token,
        });

        return {
          status: "success",
          message: json.message || "Login successful.",
          token: token,
          user: userObj,
          citizen_user_id: Number(userId),
          email: userEmail,
          data: json.data,
        };
      }

      return {
        status: "error",
        message: json.message || "Invalid Email / Mobile Number or Password.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message:
          error?.message || "Network error connecting to Civentral servers.",
      };
    }
  }

  /**
   * Citizen Registration to REST API Gateway
   * Endpoint: POST /auth/register
   */
  static async register(userData: {
    email: string;
    firstName: string;
    middleName?: string;
    hasNoMiddleName: boolean;
    lastName: string;
    suffix?: string;
    mobileNumber?: string;
    password: string;
  }): Promise<AuthApiResponse> {
    try {
      const payload = {
        first_name: userData.firstName,
        middle_name: userData.middleName || "",
        has_no_middle_name: userData.hasNoMiddleName ? 1 : 0,
        last_name: userData.lastName,
        suffix: userData.suffix || "",
        email: userData.email,
        mobile_number: userData.mobileNumber || "",
        password: userData.password,
      };

      const response = await AuthService.postRequest(
        ["/register.php", "/auth/register"],
        payload,
      );
      if (!response) {
        return {
          status: "error",
          message: "Unable to reach backend registration gateway.",
        };
      }

      const text = await response.text();
      const { json, errorText } = parseJsonResponse(text);
      if (!json) {
        return {
          status: "error",
          message: errorText || "Server returned an invalid response format.",
        };
      }

      if (
        json.status === "otp_required" ||
        json.status === "verification_required" ||
        json.verification_required === true ||
        json.status === "success" ||
        json.success === true
      ) {
        const userId = json.citizen_user_id || json.data?.citizen_user_id;
        const userEmail = json.email || userData.email;
        const token = json.token || json.data?.token || json.session?.refresh_token;

        if (token && userId) {
          await AuthService.saveSession({
            token: token,
            citizen_user_id: Number(userId),
            email: userEmail,
          });
        }

        AuthService.setCurrentUser({
          email: userEmail,
          citizen_user_id: userId,
          token: token,
        });

        return {
          status:
            json.status === "otp_required" ||
            json.status === "verification_required" ||
            json.verification_required
              ? "otp_required"
              : "success",
          message:
            json.message ||
            "Account created! Verification code sent to your email.",
          citizen_user_id: userId,
          email: userEmail,
          data: json.data,
        };
      }

      return {
        status: "error",
        message: json.message || "Registration failed. Please try again.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message:
          error?.message || "Network error connecting to Civentral servers.",
      };
    }
  }

  /**
   * OTP Verification to REST API Gateway
   * Endpoint: POST /auth/verify-otp
   */
  static async verifyOtp(
    identifier: string,
    otpCode: string,
    purpose: string = "Registration",
    hasResetToken: boolean = false,
  ): Promise<AuthApiResponse> {
    try {
      const payload = {
        email: identifier,
        mobile_number: identifier,
        phone: identifier,
        identifier: identifier,
        otp_code: otpCode,
        otp: otpCode,
        code: otpCode,
        purpose: purpose,
      };

      const response = await AuthService.postRequest(
        ["/verify-otp.php"],
        payload,
      );
      if (response) {
        const text = await response.text();
        const { json } = parseJsonResponse(text);

        if (json && (json.status === "success" || json.success === true)) {
          const userObj = json.user || json.data?.user || json.data;
          const userEmail = json.email || userObj?.email || identifier;
          const userId =
            json.citizen_user_id ||
            userObj?.citizen_user_id ||
            userObj?.id ||
            userObj?.user_id ||
            json.data?.citizen_user_id;
          const token =
            json.token ||
            json.session?.refresh_token ||
            json.session?.token ||
            json.reset_token ||
            json.data?.token ||
            json.data?.reset_token;
          const expiresAt =
            json.expires_at ||
            json.session?.expires_at ||
            json.data?.expires_at;

          if (token && userId && purpose !== "Password Reset") {
            await AuthService.saveSession({
              token: token,
              citizen_user_id: Number(userId),
              email: userEmail,
              expires_at: expiresAt,
            });
          }

          AuthService.setCurrentUser({
            email: userEmail,
            citizen_user_id: userId ? Number(userId) : undefined,
            token: token,
            user: userObj,
          });

          return {
            status: "success",
            message: json.message || "Verification successful.",
            token: token,
            user: userObj,
            citizen_user_id: userId ? Number(userId) : undefined,
            email: userEmail,
            data: json.data,
          };
        }

        if (json && (json.status === "error" || json.message)) {
          return {
            status: "error",
            message: json.message || "Invalid or expired OTP code.",
          };
        }
      }

      return {
        status: "error",
        message: "Invalid or expired OTP code.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message:
          error?.message || "Network error connecting to Civentral servers.",
      };
    }
  }

  /**
   * Resend OTP code to Email or Mobile Number
   */
  static async resendOtp(
    identifier: string,
    purpose: string = "Registration",
  ): Promise<AuthApiResponse> {
    try {
      const payload = {
        email: identifier,
        mobile_number: identifier,
        phone: identifier,
        identifier: identifier,
        purpose: purpose,
      };

      const response = await AuthService.postRequest(
        ["/resend-otp.php"],
        payload,
      );
      if (!response) {
        return { status: "error", message: "Unable to reach backend gateway." };
      }

      const text = await response.text();
      const { json, errorText } = parseJsonResponse(text);
      if (!json) {
        return {
          status: "error",
          message: errorText || "Failed to resend code.",
        };
      }

      return {
        status: json.status || "success",
        message: json.message || "Verification code resent successfully.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error?.message || "Network error.",
      };
    }
  }

  /**
   * Change password via REST API Gateway
   * Endpoint: POST /profile/password
   */
  static async changePassword(params: {
    citizenUserId: number;
    email: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<AuthApiResponse> {
    try {
      const payload = {
        citizen_user_id: params.citizenUserId,
        email: params.email,
        current_password: params.currentPassword,
        new_password: params.newPassword,
      };

      const response = await AuthService.postRequest(
        ["/change-password.php", "/profile/password"],
        payload,
      );
      if (!response) {
        return {
          status: "error",
          message: "Unable to reach backend password gateway.",
        };
      }

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return {
          status: "error",
          message: "Server returned an invalid response format.",
        };
      }

      if (json.status === "success" || json.success === true) {
        return {
          status: "success",
          message: json.message || "Password changed successfully.",
        };
      }

      return {
        status: "error",
        message: json.message || "Failed to change password.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message:
          error?.message || "Network error connecting to Civentral servers.",
      };
    }
  }

  /**
   * Request Password Reset (Forgot Password) via REST API Gateway
   * Endpoint: POST /auth/forgot-password or /forgot-password.php
   */
  static async forgotPassword(identifier: string): Promise<AuthApiResponse> {
    try {
      const payload = {
        email: identifier,
        mobile_number: identifier,
        phone: identifier,
        identifier: identifier,
        purpose: "Password Reset",
      };

      const response = await AuthService.postRequest(
        ["/forgot-password.php", "/auth/forgot-password"],
        payload,
      );
      if (!response) {
        return {
          status: "error",
          message: "Unable to reach Civentral authentication server.",
        };
      }

      const text = await response.text();
      const { json, errorText } = parseJsonResponse(text);
      if (!json) {
        return {
          status: "error",
          message: errorText || "Server returned an invalid response format.",
        };
      }

      if (json.status === "success" || json.success === true) {
        return {
          status: "success",
          message:
            json.message ||
            "If an account exists with this email, password reset instructions have been sent.",
          email: json.email || identifier,
          token:
            json.reset_token ||
            json.token ||
            json.data?.reset_token ||
            json.data?.token,
        };
      }

      return {
        status: "error",
        message: json.message || "Failed to request password reset code.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message:
          error?.message || "Network error connecting to Civentral servers.",
      };
    }
  }

  /**
   * Complete Password Reset via REST API Gateway
   * Endpoint: POST /auth/reset-password
   */
  static async resetPassword(params: {
    token?: string;
    otpCode?: string;
    email?: string;
    identifier?: string;
    newPassword: string;
  }): Promise<AuthApiResponse> {
    try {
      const payload = {
        email: params.email || params.identifier,
        mobile_number: params.identifier || params.email,
        phone: params.identifier || params.email,
        identifier: params.identifier || params.email,
        reset_token: params.token || params.otpCode,
        token: params.token || params.otpCode,
        resetToken: params.token || params.otpCode,
        otp_code: params.otpCode || params.token,
        otp: params.otpCode || params.token,
        code: params.otpCode || params.token,
        new_password: params.newPassword,
        password: params.newPassword,
        confirm_password: params.newPassword,
      };

      const response = await AuthService.postRequest(
        ["/reset-password.php", "/auth/reset-password", "/change-password.php"],
        payload,
      );
      if (!response) {
        return {
          status: "error",
          message: "Unable to reach backend password reset gateway.",
        };
      }

      const text = await response.text();
      const { json } = parseJsonResponse(text);
      if (!json) {
        return {
          status: "error",
          message: "Server returned an invalid response format.",
        };
      }

      if (json.status === "success" || json.success === true) {
        return {
          status: "success",
          message: json.message || "Password reset successfully.",
        };
      }

      return {
        status: "error",
        message: json.message || "Failed to reset password.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message:
          error?.message || "Network error connecting to Civentral servers.",
      };
    }
  }

  /**
   * Citizen Logout via REST API Gateway
   * Endpoint: POST /auth/logout
   */
  static async logout(): Promise<AuthApiResponse> {
    try {
      const token = this.getAuthToken();
      const currentUser = AuthService.getCurrentUser();
      const payload = {
        citizen_user_id: currentUser.citizen_user_id,
        email: currentUser.email,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }).catch(() => {});
    } finally {
      await AuthService.clearSession();
    }

    return {
      status: "success",
      message: "Successfully logged out.",
    };
  }
}
