import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
    marginBottom: 16,
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  backText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#176B87',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
