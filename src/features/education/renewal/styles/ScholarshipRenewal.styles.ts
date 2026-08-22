import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 160,
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },

  backIcon: {
    transform: [{ rotate: '180deg' }],
  },

  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9333EA',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  sub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },

  centerContainer: {
    flex: 1,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 6,
  },

  errorText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },

  retryBtn: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },

  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  programTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  programCode: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },

  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  infoValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    marginTop: 8,
  },

  docItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },

  docBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  docBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9333EA',
  },

  docTextCol: {
    flex: 1,
  },

  docName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },

  docDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },

  banner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },

  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },

  bannerText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
