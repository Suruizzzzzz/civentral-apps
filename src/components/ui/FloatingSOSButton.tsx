import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';

export interface FloatingSOSButtonProps {
  onPress: () => void;
  size?: number;
}

export function FloatingSOSButton({ onPress, size = 64 }: FloatingSOSButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
      activeOpacity={0.85}
      onPress={onPress}>
      <IconSymbol name="shield.fill" size={size * 0.45} color="#FFFFFF" />
      <Text style={styles.text}>SOS</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: -2,
    letterSpacing: 0.5,
  },
});
