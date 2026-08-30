import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { AuthService } from '@/src/services/auth-service';

export default function Index() {
  const [isRestoring, setIsRestoring] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      const restored = await AuthService.restoreSession();
      if (isMounted) {
        setIsAuthenticated(restored);
        setIsRestoring(false);
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isRestoring) {
    return (
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Civentral</Text>
        <Text style={styles.subtitle}>CITY OF CALOOCAN</Text>
        <ActivityIndicator size="large" color="#165B7E" style={styles.spinner} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={'/(tabs)' as any} />;
  }

  return <Redirect href={'/(auth)' as any} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: 32,
  },
  spinner: {
    marginTop: 16,
  },
});
