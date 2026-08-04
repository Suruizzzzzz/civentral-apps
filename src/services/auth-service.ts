import { CitizenUser } from '@/types/citizen';

export interface AuthApiResponse {
  status: 'success' | 'otp_required' | 'error';
  message: string;
  token?: string;
  user?: CitizenUser;
  citizen_user_id?: number;
  email?: string;
  data?: any;
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://civentral.tech/api/citizen';

export class AuthService {
  private static currentUserEmail: string | null = null;
  private static currentUserId: number | null = null;
  private static currentUserData: any = null;

  static setCurrentUser(data: { email?: string; citizen_user_id?: number; user?: any }) {
    if (data.email) this.currentUserEmail = data.email;
    if (data.citizen_user_id) this.currentUserId = data.citizen_user_id;
    if (data.user) {
      this.currentUserData = data.user;
      if (data.user.email) this.currentUserEmail = data.user.email;
      if (data.user.citizen_user_id) this.currentUserId = data.user.citizen_user_id;
    }
  }

  static getCurrentUser() {
    return {
      email: this.currentUserEmail,
      citizen_user_id: this.currentUserId,
      user: this.currentUserData,
    };
  }

  static clearCurrentUser() {
    this.currentUserEmail = null;
    this.currentUserId = null;
    this.currentUserData = null;
  }

  /**
  /**
   * Helper to attempt multiple endpoints (REST Gateway primary, legacy fallback)
   */
  private static async postRequest(routes: string[], body: any): Promise<Response | null> {
    for (const route of routes) {
      try {
        const url = `${API_BASE_URL}${route.startsWith('/') ? route : '/' + route}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) return res;
      } catch {}
    }
    return null;
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

      const response = await AuthService.postRequest(['/auth/check-account', '/check-account.php'], payload);
      if (!response) return { exists: false };

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return { exists: false };
      }

      if (json.exists === true || json.status === 'exists') {
        return { exists: true, userStatus: json.user_status, message: json.message };
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
  static async login(identifier: string, password: string): Promise<AuthApiResponse> {
    try {
      const payload = {
        email: identifier,
        mobile_number: identifier,
        identifier: identifier,
        password: password,
      };

      const response = await AuthService.postRequest(['/auth/login', '/login.php'], payload);
      if (!response) {
        return { status: 'error', message: 'Unable to reach backend authentication gateway.' };
      }

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return {
          status: 'error',
          message: text || 'Server returned an invalid response format.',
        };
      }

      if (json.status === 'otp_required' || json.status === 'verification_required' || json.verification_required === true) {
        return {
          status: 'otp_required',
          message: json.message || 'Please verify your email to complete login.',
          email: json.email || identifier,
        };
      }

      if (json.status === 'success' || json.success === true) {
        const userObj = json.user || json.data?.user || json.data;
        const userEmail = json.email || userObj?.email || identifier;
        const userId = json.citizen_user_id || userObj?.citizen_user_id || userObj?.id;

        AuthService.setCurrentUser({
          email: userEmail,
          citizen_user_id: userId,
          user: userObj,
        });

        return {
          status: 'success',
          message: json.message || 'Login successful.',
          token: json.token || json.data?.token || json.session?.refresh_token,
          user: userObj,
          citizen_user_id: userId,
          email: userEmail,
          data: json.data,
        };
      }

      return {
        status: 'error',
        message: json.message || 'Invalid Email / Mobile Number or Password.',
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Network error connecting to Civentral servers.',
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
        middle_name: userData.middleName || '',
        has_no_middle_name: userData.hasNoMiddleName ? 1 : 0,
        last_name: userData.lastName,
        suffix: userData.suffix || '',
        email: userData.email,
        mobile_number: userData.mobileNumber || '',
        password: userData.password,
      };

      const response = await AuthService.postRequest(['/auth/register', '/register.php'], payload);
      if (!response) {
        return { status: 'error', message: 'Unable to reach backend registration gateway.' };
      }

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return {
          status: 'error',
          message: text || 'Server returned an invalid response format.',
        };
      }

      if (json.status === 'otp_required' || json.status === 'verification_required' || json.verification_required === true || json.status === 'success' || json.success === true) {
        const userId = json.citizen_user_id || json.data?.citizen_user_id;
        const userEmail = json.email || userData.email;

        AuthService.setCurrentUser({
          email: userEmail,
          citizen_user_id: userId,
        });

        return {
          status: (json.status === 'otp_required' || json.status === 'verification_required' || json.verification_required) ? 'otp_required' : 'success',
          message: json.message || 'Account created! Verification code sent to your email.',
          citizen_user_id: userId,
          email: userEmail,
          data: json.data,
        };
      }

      return {
        status: 'error',
        message: json.message || 'Registration failed. Please try again.',
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Network error connecting to Civentral servers.',
      };
    }
  }

  /**
   * OTP Verification to REST API Gateway
   * Endpoint: POST /auth/verify-otp
   */
  static async verifyOtp(email: string, otpCode: string): Promise<AuthApiResponse> {
    try {
      const payload = {
        email: email,
        otp_code: otpCode,
        otp: otpCode,
        code: otpCode,
      };

      const response = await AuthService.postRequest(['/auth/verify-otp', '/verify.php', '/verify-otp.php'], payload);
      if (!response) {
        return { status: 'error', message: 'Unable to reach backend verification gateway.' };
      }

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return {
          status: 'error',
          message: text || 'Server returned an invalid response format.',
        };
      }

      if (json.status === 'success' || json.success === true) {
        AuthService.setCurrentUser({
          email: email,
        });

        return {
          status: 'success',
          message: json.message || 'Verification successful.',
          data: json.data,
        };
      }

      return {
        status: 'error',
        message: json.message || 'Invalid or expired OTP code.',
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Network error connecting to Civentral servers.',
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

      const response = await AuthService.postRequest(['/profile/password', '/change-password.php'], payload);
      if (!response) {
        return { status: 'error', message: 'Unable to reach backend password gateway.' };
      }

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return {
          status: 'error',
          message: text || 'Server returned an invalid response format.',
        };
      }

      if (json.status === 'success' || json.success === true) {
        return {
          status: 'success',
          message: json.message || 'Password changed successfully.',
        };
      }

      return {
        status: 'error',
        message: json.message || 'Failed to change password.',
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Network error connecting to Civentral servers.',
      };
    }
  }

  /**
   * Request Password Reset (Forgot Password) via REST API Gateway
   * Endpoint: POST /auth/forgot-password
   */
  static async forgotPassword(email: string): Promise<AuthApiResponse> {
    try {
      const response = await AuthService.postRequest(['/auth/forgot-password', '/forgot-password.php'], { email });
      if (!response) {
        return { status: 'error', message: 'Unable to reach backend password reset gateway.' };
      }

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return {
          status: 'error',
          message: text || 'Server returned an invalid response format.',
        };
      }

      if (json.status === 'success' || json.success === true) {
        return {
          status: 'success',
          message: json.message || 'Password reset instructions sent to your email.',
          email: json.email || email,
        };
      }

      return {
        status: 'error',
        message: json.message || 'Failed to request password reset.',
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Network error connecting to Civentral servers.',
      };
    }
  }

  /**
   * Complete Password Reset via REST API Gateway
   * Endpoint: POST /auth/reset-password
   */
  static async resetPassword(params: { token?: string; email?: string; newPassword: string }): Promise<AuthApiResponse> {
    try {
      const payload = {
        reset_token: params.token,
        email: params.email,
        new_password: params.newPassword,
      };

      const response = await AuthService.postRequest(['/auth/reset-password', '/reset-password.php'], payload);
      if (!response) {
        return { status: 'error', message: 'Unable to reach backend reset password gateway.' };
      }

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return {
          status: 'error',
          message: text || 'Server returned an invalid response format.',
        };
      }

      if (json.status === 'success' || json.success === true) {
        return {
          status: 'success',
          message: json.message || 'Password reset successfully.',
        };
      }

      return {
        status: 'error',
        message: json.message || 'Failed to reset password.',
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Network error connecting to Civentral servers.',
      };
    }
  }

  /**
   * Citizen Logout via REST API Gateway
   * Endpoint: POST /auth/logout
   */
  static async logout(): Promise<AuthApiResponse> {
    try {
      const currentUser = AuthService.getCurrentUser();
      const payload = {
        citizen_user_id: currentUser.citizen_user_id,
        email: currentUser.email,
      };

      await AuthService.postRequest(['/auth/logout', '/logout.php'], payload);

      AuthService.clearCurrentUser();
      return {
        status: 'success',
        message: 'Successfully logged out.',
      };
    } catch (error: any) {
      AuthService.clearCurrentUser();
      return {
        status: 'success',
        message: 'Logged out locally.',
      };
    }
  }
}
