import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BadgeProps {
  label: string;
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
}

export function Badge({ label, variant = 'info' }: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'warning':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'danger':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'neutral':
        return { bg: '#F1F5F9', text: '#475569' };
      default:
        return { bg: '#DBEAFE', text: '#1D4ED8' };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
