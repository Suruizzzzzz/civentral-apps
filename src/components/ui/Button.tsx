import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export function Button({ title, variant = 'primary', size = 'medium', style, ...props }: ButtonProps) {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: '#3B82F6' };
      case 'danger':
        return { backgroundColor: '#EF4444' };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#2563EB' };
      default:
        return { backgroundColor: '#1E40AF' };
    }
  };

  const getTextStyle = (): TextStyle => {
    if (variant === 'outline') {
      return { color: '#2563EB' };
    }
    return { color: '#FFFFFF' };
  };

  return (
    <TouchableOpacity
      style={[styles.base, getVariantStyle(), styles[size], style]}
      activeOpacity={0.8}
      {...props}>
      <Text style={[styles.text, getTextStyle(), styles[`${size}Text` as keyof typeof styles]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 17,
  },
});
