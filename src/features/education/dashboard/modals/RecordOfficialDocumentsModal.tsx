import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '../styles/ScholarshipDashboard.styles';
import { CitizenOfficialDocumentItem } from '../api/citizenDocumentApi';

export interface ModalDocItem {
  key: string;
  type: 'SCHOLARSHIP_CERTIFICATE' | 'SCHOLARSHIP_CONTRACT' | 'SWORN_UNDERTAKING' | 'RENEWAL_CERTIFICATE';
  title: string;
  status: string;
  date: string;
  documentNumber: string;
  rawDoc?: CitizenOfficialDocumentItem;
}

export interface RecordOfficialDocumentsModalProps {
  visible: boolean;
  onClose: () => void;
  officialDocs?: ModalDocItem[];
  isDarkMode: boolean;
  selectedRecord?: {
    academicPeriod?: string;
    recordType?: string;
    rawId?: number;
  } | null;
  actionLoadingKey?: string | null;
  onDocAction?: (doc: ModalDocItem, mode: 'view' | 'download') => void;
  onDownloadDocument?: (doc: ModalDocItem) => void;
  onViewDocument?: (doc: ModalDocItem) => void;
}

export function RecordOfficialDocumentsModal({
  visible,
  onClose,
  officialDocs = [],
  isDarkMode,
  selectedRecord,
  actionLoadingKey,
  onDocAction,
  onDownloadDocument,
  onViewDocument,
}: RecordOfficialDocumentsModalProps) {
  const handleAction = (doc: ModalDocItem, mode: 'view' | 'download') => {
    if (onDocAction) {
      onDocAction(doc, mode);
    } else if (mode === 'view' && onViewDocument) {
      onViewDocument(doc);
    } else if (mode === 'download' && onDownloadDocument) {
      onDownloadDocument(doc);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            isDarkMode && {
              backgroundColor: '#1C2541',
              borderColor: '#3A506B',
            },
          ]}
        >
          {/* Modal Header identifying selected record */}
          <View
            style={[
              styles.modalHeader,
              isDarkMode && { borderBottomColor: '#293548' },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                isDarkMode && { color: '#C084FC' },
              ]}
            >
              Official Documents
            </Text>
            {selectedRecord ? (
              <View>
                <Text
                  style={[
                    styles.modalSubtitle,
                    isDarkMode && { color: '#CBD5E1' },
                  ]}
                >
                  {selectedRecord.academicPeriod}
                </Text>
                <Text
                  style={[
                    styles.modalRecordType,
                    isDarkMode && { color: '#94A3B8' },
                  ]}
                >
                  {selectedRecord.recordType}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Modal Body: Documents list (ONLY official documents) */}
          <ScrollView style={styles.modalBody}>
            {officialDocs.map((doc, idx) => {
              const isLast = idx === officialDocs.length - 1;
              const isViewLoading = actionLoadingKey === `${doc.key}_view`;
              const isDlLoading = actionLoadingKey === `${doc.key}_download`;

              return (
                <View
                  key={doc.key}
                  style={[
                    styles.modalDocItem,
                    isLast && styles.modalDocItemLast,
                    isDarkMode && { borderBottomColor: '#293548' },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalDocTitle,
                      isDarkMode && { color: '#F8FAFC' },
                    ]}
                  >
                    {doc.title}
                  </Text>
                  <Text
                    style={[
                      styles.modalDocMeta,
                      isDarkMode && { color: '#94A3B8' },
                    ]}
                  >
                    {doc.status} • {doc.date}
                  </Text>

                  <View style={styles.modalDocActionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.modalBtnPrimary,
                        isDarkMode && { backgroundColor: '#7E22CE' },
                      ]}
                      onPress={() => handleAction(doc, 'view')}
                      disabled={Boolean(actionLoadingKey)}
                      activeOpacity={0.8}
                    >
                      {isViewLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <IconSymbol
                          name="eye.fill"
                          size={12}
                          color="#FFFFFF"
                        />
                      )}
                      <Text style={styles.modalBtnPrimaryText}>
                        {isViewLoading ? 'Opening...' : 'View'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modalBtnOutline,
                        isDarkMode && { borderColor: '#475569' },
                      ]}
                      onPress={() => handleAction(doc, 'download')}
                      disabled={Boolean(actionLoadingKey)}
                      activeOpacity={0.8}
                    >
                      {isDlLoading ? (
                        <ActivityIndicator
                          size="small"
                          color={isDarkMode ? '#F8FAFC' : '#0F172A'}
                        />
                      ) : (
                        <IconSymbol
                          name="arrow.down.circle"
                          size={12}
                          color={isDarkMode ? '#F8FAFC' : '#0F172A'}
                        />
                      )}
                      <Text
                        style={[
                          styles.modalBtnOutlineText,
                          isDarkMode && { color: '#F8FAFC' },
                        ]}
                      >
                        {isDlLoading ? 'Saving...' : 'Download'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Modal Footer */}
          <View
            style={[
              styles.modalFooter,
              isDarkMode && { borderTopColor: '#293548' },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.modalCloseBtn,
                isDarkMode && { backgroundColor: '#111827' },
              ]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.modalCloseBtnText,
                  isDarkMode && { color: '#CBD5E1' },
                ]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
