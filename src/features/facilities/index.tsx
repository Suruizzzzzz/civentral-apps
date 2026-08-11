import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';

export function FacilitiesDomainCard() {
  return (
    <Card variant="outlined">
      <View style={styles.header}>
        <Text style={styles.title}>Public Assets & Facilities</Text>
        <Badge label="Public Services" variant="neutral" />
      </View>
      <Text style={styles.desc}>
        Municipal Cemetery Database, Public Park Reservations & Water/Drainage Repair Maintenance.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8, color: '#0F172A' },
  desc: { fontSize: 13, color: '#64748B', marginTop: 6 },
});
