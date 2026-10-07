import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { AuthService } from '@/src/services/auth-service';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    const token = AuthService.getAuthToken();
    return token ? true : null;
  });

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      // If auth token is already restored and known, skip secondary check
      if (AuthService.getAuthToken()) {
        if (isMounted) setIsAuthenticated(true);
        return;
      }

      const restored = await AuthService.restoreSession();
      if (isMounted) {
        setIsAuthenticated(restored);
      }
    }

    if (isAuthenticated === null) {
      checkSession();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href={'/(tabs)' as any} />;
  }

  return <Redirect href={'/(auth)' as any} />;
}

