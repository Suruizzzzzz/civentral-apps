import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Modal, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { AuthService } from '@/src/services/auth-service';
import { styles } from './SessionTimeoutContext.styles';

/**
 * SESSION TIMEOUT CONFIGURATION:
 * - TOTAL_INACTIVITY_MS: 30 minutes total inactivity limit (30 * 60 * 1000)
 * - WARNING_THRESHOLD_MS: 15 minutes remaining warning trigger (15 * 60 * 1000)
 *
 * After 15 minutes of idle time, a warning modal pops up displaying a live 15-minute countdown.
 * Clicking "Keep Me Signed In" closes the modal and resets the session back to 30 minutes.
 */
export const TOTAL_INACTIVITY_MS = 30 * 60 * 1000; // 30 Minutes Total Inactivity
export const WARNING_THRESHOLD_MS = 15 * 60 * 1000; // 15 Minutes Remaining Warning Trigger

interface SessionTimeoutContextType {
  resetTimer: () => void;
  setTimeoutDuration: (durationMs: number) => void;
  remainingSeconds: number;
  isWarningVisible: boolean;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType>({
  resetTimer: () => {},
  setTimeoutDuration: () => {},
  remainingSeconds: 1800,
  isWarningVisible: false,
});

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [timeoutMs, setTimeoutMs] = useState(TOTAL_INACTIVITY_MS);
  const [remainingSeconds, setRemainingSeconds] = useState(Math.floor(TOTAL_INACTIVITY_MS / 1000));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  // Absolute Expiration Timestamp (Date.now() + 30 mins)
  const expirationTimestampRef = useRef<number>(Date.now() + TOTAL_INACTIVITY_MS);
  const isWarningModalOpenRef = useRef<boolean>(false);
  const masterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSessionTimeout = useCallback(() => {
    isWarningModalOpenRef.current = false;
    setIsWarningVisible(false);
    AuthService.clearCurrentUser();
    setIsLoggedIn(false);

    Alert.alert(
      'Session Expired',
      'You have been logged out due to 30 minutes of inactivity for account security.',
      [
        {
          text: 'Sign In Again',
          onPress: () => {
            router.replace('/(auth)' as any);
          },
        },
      ]
    );
    router.replace('/(auth)' as any);
  }, [router]);

  // Reset session timer back to 30 minutes (only if warning modal is not active)
  const resetTimer = useCallback(() => {
    if (isWarningModalOpenRef.current) return;

    const session = AuthService.getCurrentUser();
    const activeUser = !session.isGuest && !!(session.email || session.phone || session.citizen_user_id);
    setIsLoggedIn(activeUser);

    if (activeUser) {
      expirationTimestampRef.current = Date.now() + timeoutMs;
      const secs = Math.max(0, Math.ceil((expirationTimestampRef.current - Date.now()) / 1000));
      setRemainingSeconds(secs);
    } else {
      isWarningModalOpenRef.current = false;
      setIsWarningVisible(false);
    }
  }, [timeoutMs]);

  // Explicitly extends session back to full 30 minutes when user taps "Keep Me Signed In"
  const handleKeepSignedIn = () => {
    isWarningModalOpenRef.current = false;
    setIsWarningVisible(false);
    expirationTimestampRef.current = Date.now() + timeoutMs;
    const secs = Math.max(0, Math.ceil((expirationTimestampRef.current - Date.now()) / 1000));
    setRemainingSeconds(secs);
  };

  // MASTER 1-SECOND TICKER (Relies on Date.now() timestamp so it NEVER freezes)
  useEffect(() => {
    masterIntervalRef.current = setInterval(() => {
      const session = AuthService.getCurrentUser();
      const activeUser = !session.isGuest && !!(session.email || session.phone || session.citizen_user_id);
      setIsLoggedIn(activeUser);

      if (!activeUser) {
        isWarningModalOpenRef.current = false;
        setIsWarningVisible(false);
        return;
      }

      const now = Date.now();
      const remainingMs = Math.max(0, expirationTimestampRef.current - now);
      const remainingSecs = Math.ceil(remainingMs / 1000);

      setRemainingSeconds(remainingSecs);

      // Trigger Warning Modal when 15 minutes or less remain (<= 900 seconds)
      const warningSecs = Math.floor(WARNING_THRESHOLD_MS / 1000);
      if (remainingSecs <= warningSecs && remainingSecs > 0) {
        if (!isWarningModalOpenRef.current) {
          isWarningModalOpenRef.current = true;
          setIsWarningVisible(true);
        }
      }

      // Automatic Logout when timer reaches 0
      if (remainingMs <= 0) {
        if (masterIntervalRef.current) clearInterval(masterIntervalRef.current);
        handleSessionTimeout();
      }
    }, 1000);

    return () => {
      if (masterIntervalRef.current) clearInterval(masterIntervalRef.current);
    };
  }, [handleSessionTimeout]);

  // Initialize timer on component mount
  useEffect(() => {
    resetTimer();
  }, [resetTimer]);

  // Capture background touch gestures across the app to reset idle timer when warning modal is not active
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        if (!isWarningModalOpenRef.current) {
          resetTimer();
        }
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        if (!isWarningModalOpenRef.current) {
          resetTimer();
        }
        return false;
      },
    })
  ).current;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <SessionTimeoutContext.Provider
      value={{
        resetTimer,
        setTimeoutDuration: setTimeoutMs,
        remainingSeconds,
        isWarningVisible,
      }}>
      <View style={styles.container} {...panResponder.panHandlers}>
        {children}

        {/* HIGH-END 15-MINUTE INACTIVITY WARNING MODAL */}
        <Modal
          visible={isWarningVisible && isLoggedIn}
          transparent
          animationType="fade"
          onRequestClose={handleKeepSignedIn}>
          <View style={styles.modalOverlay}>
            <View style={styles.warningCard}>
              {/* Warning Header Icon Badge with Pulsing Glow */}
              <View style={styles.iconCircle}>
                <View style={styles.iconGlow} />
                <IconSymbol name="exclamationmark.triangle.fill" size={34} color="#D97706" />
              </View>

              {/* Title & Description */}
              <Text style={styles.modalTitle}>Are You Still There?</Text>
              <Text style={styles.modalSub}>
                Your session has been inactive for 15 minutes. For your security, you will be automatically logged out when the timer below reaches zero:
              </Text>

              {/* Live Digital Countdown Box */}
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
                <View style={styles.timerStatusRow}>
                  <View style={styles.activeDot} />
                  <Text style={styles.timerSubText}>Auto logout countdown active</Text>
                </View>
              </View>

              {/* Modal Actions */}
              <View style={styles.actionButtonsCol}>
                <TouchableOpacity
                  style={styles.keepBtn}
                  onPress={handleKeepSignedIn}
                  activeOpacity={0.88}>
                  <IconSymbol name="checkmark.seal.fill" size={18} color="#FFFFFF" />
                  <Text style={styles.keepBtnText}>Keep Me Signed In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={handleSessionTimeout}
                  activeOpacity={0.7}>
                  <Text style={styles.logoutBtnText}>Sign Out Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SessionTimeoutContext.Provider>
  );
}

export function useSessionTimeout() {
  return useContext(SessionTimeoutContext);
}
