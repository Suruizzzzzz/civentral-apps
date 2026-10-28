import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AuthService } from '@/src/services/auth-service';

export interface UseRegisterFormParams {
  identifier?: string;
  email?: string;
  phone?: string;
  mode?: string;
}

export const SUFFIX_OPTIONS = ['None', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

export const parseRawPhone = (val?: string): string => {
  if (!val) return '';
  let d = val.replace(/[^0-9]/g, '');
  if (d.startsWith('63')) d = d.slice(2);
  if (d.startsWith('0')) d = d.replace(/^0+/, '');
  return d.slice(0, 10);
};

export const formatPhoneNumber = (digits: string): string => {
  if (!digits) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
};

export function useRegisterForm(params: UseRegisterFormParams = {}) {
  const router = useRouter();

  const initialEmail = params.email || (params.identifier?.includes('@') ? params.identifier : '');
  const initialPhone = params.phone || (!params.identifier?.includes('@') ? params.identifier : '');

  const [email, setEmail] = useState(initialEmail || '');
  const [phoneDigits, setPhoneDigits] = useState(parseRawPhone(initialPhone));
  const [firstName, setFirstName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [showSuffixModal, setShowSuffixModal] = useState(false);
  const [middleName, setMiddleName] = useState('');
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhoneChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('63')) cleaned = cleaned.slice(2);
    if (cleaned.startsWith('0')) cleaned = cleaned.replace(/^0+/, '');
    cleaned = cleaned.slice(0, 10);
    setPhoneDigits(cleaned);
    if (errorMessage) setErrorMessage(null);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMessage) setErrorMessage(null);
  };

  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    if (errorMessage) setErrorMessage(null);
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);
    if (errorMessage) setErrorMessage(null);
  };

  const handleMiddleNameChange = (text: string) => {
    setMiddleName(text);
    if (errorMessage) setErrorMessage(null);
  };

  const toggleNoMiddleName = () => {
    setNoMiddleName((prev) => {
      const next = !prev;
      if (next) setMiddleName('');
      return next;
    });
    if (errorMessage) setErrorMessage(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMessage) setErrorMessage(null);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (errorMessage) setErrorMessage(null);
  };

  // REAL-TIME PASSWORD STRENGTH EVALUATION
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const getStrengthLevel = (): 'weak' | 'medium' | 'strong' | '' => {
    if (password.length === 0) return '';
    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;

    if (score >= 4 && hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol) {
      return 'strong';
    } else if (score >= 3 && hasMinLength) {
      return 'medium';
    } else {
      return 'weak';
    }
  };

  const strengthLevel = getStrengthLevel();

  const handleVerifyAccount = async () => {
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPhoneDigits = phoneDigits.trim();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanMiddleName = middleName.trim();

    // 1. Email Address Validation
    const isEmailMode =
      params.mode === 'email' ||
      (!!cleanEmail && cleanEmail.includes('@')) ||
      !!params.email ||
      params.identifier?.includes('@');
    if (isEmailMode && !cleanEmail) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
        return;
      }
    }

    // 2. Mobile Phone Validation (Numeric, 10 digits after +63, starts with 9)
    const isPhoneRequired = params.mode === 'phone' || (!cleanEmail && !params.email);
    if (isPhoneRequired && !cleanPhoneDigits) {
      setErrorMessage('Mobile phone number is required.');
      return;
    }
    if (cleanPhoneDigits) {
      if (cleanPhoneDigits.length !== 10 || !cleanPhoneDigits.startsWith('9')) {
        setErrorMessage('Mobile phone number must be 10 digits starting with 9 (e.g. 917 123 4567).');
        return;
      }
    }

    const normalizedPhone = cleanPhoneDigits ? `+63${cleanPhoneDigits}` : '';

    // 3. First Name (Required, min 2 chars)
    if (!cleanFirstName) {
      setErrorMessage('First Name is required.');
      return;
    }
    if (cleanFirstName.length < 2) {
      setErrorMessage('First Name must be at least 2 characters long.');
      return;
    }

    // 4. Last Name (Required, min 2 chars)
    if (!cleanLastName) {
      setErrorMessage('Last Name is required.');
      return;
    }
    if (cleanLastName.length < 2) {
      setErrorMessage('Last Name must be at least 2 characters long.');
      return;
    }

    // 5. Middle Name (Optional, min 2 chars if entered)
    if (!noMiddleName && cleanMiddleName && cleanMiddleName.length < 2) {
      setErrorMessage('Middle Name must be at least 2 characters long, or select "I have no middle name".');
      return;
    }

    // 6. Password Required & Strict Strength Enforcement
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    if (strengthLevel !== 'strong') {
      setErrorMessage(
        'Password strength is ' +
          (strengthLevel ? strengthLevel.toUpperCase() : 'WEAK') +
          '. Registration requires a STRONG password (at least 8 characters with uppercase, lowercase, number, and special symbol).'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    // Duplicate Email Pre-Check
    if (email.trim()) {
      const emailCheck = await AuthService.checkAccount(email.trim());
      if (emailCheck.exists) {
        setErrorMessage('An account with this email address already exists. Please use a different email or sign in.');
        setIsLoading(false);
        return;
      }
    }

    // Duplicate Mobile Number Pre-Check
    if (normalizedPhone) {
      let phoneCheck = await AuthService.checkAccount(normalizedPhone);
      if (!phoneCheck.exists && cleanPhoneDigits) {
        phoneCheck = await AuthService.checkAccount(`0${cleanPhoneDigits}`);
      }
      if (phoneCheck.exists) {
        setErrorMessage('This mobile number is already associated with another account. Please use a different number or sign in.');
        setIsLoading(false);
        return;
      }
    }

    const res = await AuthService.register({
      email: cleanEmail,
      mobileNumber: normalizedPhone,
      firstName: cleanFirstName,
      middleName: cleanMiddleName,
      hasNoMiddleName: noMiddleName,
      lastName: cleanLastName,
      suffix: suffix.trim(),
      password,
    });
    setIsLoading(false);

    if (res.status === 'otp_required' || res.status === 'success') {
      const isPhoneRegistration =
        params.mode === 'phone'
          ? true
          : params.mode === 'email'
          ? false
          : (!params.email && !params.identifier?.includes('@') && (!!params.phone || !cleanEmail));

      const targetRoute = isPhoneRegistration ? '/(auth)/verify-phone' : '/(auth)/verify';
      const modeParam = isPhoneRegistration ? 'phone' : 'email';

      const primaryId = isPhoneRegistration
        ? (normalizedPhone || params.phone || (res as any).mobile_number || res.email || cleanEmail)
        : (cleanEmail || res.email || normalizedPhone);

      router.push({
        pathname: targetRoute as any,
        params: {
          mode: modeParam,
          email: cleanEmail || res.email,
          phone: normalizedPhone || params.phone,
          identifier: primaryId,
          citizen_user_id: res.citizen_user_id ? String(res.citizen_user_id) : '',
        },
      });
    } else {
      setErrorMessage(res.message);
    }
  };

  return {
    email,
    setEmail,
    handleEmailChange,
    phoneDigits,
    setPhoneDigits,
    handlePhoneChange,
    firstName,
    setFirstName,
    handleFirstNameChange,
    suffix,
    setSuffix,
    showSuffixModal,
    setShowSuffixModal,
    SUFFIX_OPTIONS,
    middleName,
    setMiddleName,
    handleMiddleNameChange,
    noMiddleName,
    setNoMiddleName,
    toggleNoMiddleName,
    lastName,
    setLastName,
    handleLastNameChange,
    password,
    setPassword,
    handlePasswordChange,
    confirmPassword,
    setConfirmPassword,
    handleConfirmPasswordChange,
    isPasswordVisible,
    setIsPasswordVisible,
    isConfirmPasswordVisible,
    setIsConfirmPasswordVisible,
    isLoading,
    errorMessage,
    setErrorMessage,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    strengthLevel,
    formatPhoneNumber,
    handleVerifyAccount,
  };
}
