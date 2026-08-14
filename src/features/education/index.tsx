import React from 'react';
import { Text, View } from 'react-native';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { styles } from './styles/EducationDomainCard.styles';

export { EducationScreen } from './EducationScreen';

export function EducationDomainCard() {
  return (
    <Card variant="outlined">
      <View style={styles.header}>
        <Text style={styles.title}>Education & City Scholarships</Text>
        <Badge label="SY 2026-2027" variant="info" />
      </View>
      <Text style={styles.desc}>
        City Educational Grants, Student Registry & Financial Allowance Disbursement tracking.
      </Text>
    </Card>
  );
}
