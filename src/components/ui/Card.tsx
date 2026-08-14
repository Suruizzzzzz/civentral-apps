import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

export interface CardProps extends PropsWithChildren<ViewProps> {
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function Card({ children, style, variant = 'elevated', ...props }: CardProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  return (
    <View
      style={[
        styles.base,
        isDark ? styles.darkCard : styles.lightCard,
        variant === 'outlined' && (isDark ? styles.darkOutline : styles.lightOutline),
        variant === 'elevated' && styles.shadow,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
  },
  darkCard: {
    backgroundColor: '#1E293B',
  },
  lightOutline: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkOutline: {
    borderWidth: 1,
    borderColor: '#334155',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
});
