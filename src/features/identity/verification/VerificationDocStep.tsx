import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '../styles/VerifyCitizenScreen.styles';
import {
  PhilSysParsedData,
  parsePhilSysQrPayload,
  VALID_ID_TYPES,
} from './types';

export interface VerificationDocStepProps {
  selectedIdType: string;
  setSelectedIdType: (val: string) => void;
  isIdTypeDropdownOpen: boolean;
  setIsIdTypeDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  idNumber: string;
  setIdNumber: (val: string) => void;
  clearFieldError: (key: string) => void;
  idImageUri: string | null;
  idBackImageUri?: string | null;
  signatureUri: string | null;
  onOpenPhotoPicker: (target: 'id' | 'selfie' | 'photo1x1' | 'signature') => void;
  onRemovePhoto: (target: 'id' | 'selfie' | 'photo1x1' | 'signature') => void;
  onOpenSignaturePad: () => void;
  onAutofillPhilSys?: (data: PhilSysParsedData) => void;
  onBack: () => void;
  onNext: () => void;
  isDarkMode: boolean;
}

export function VerificationDocStep({
  selectedIdType,
  setSelectedIdType,
  isIdTypeDropdownOpen,
  setIsIdTypeDropdownOpen,
  idNumber,
  setIdNumber,
  clearFieldError,
  idImageUri,
  idBackImageUri,
  signatureUri,
  onOpenPhotoPicker,
  onRemovePhoto,
  onOpenSignaturePad,
  onAutofillPhilSys,
  onBack,
  onNext,
  isDarkMode,
}: VerificationDocStepProps) {
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [qrInputText, setQrInputText] = useState('');
  const [philsysVerified, setPhilsysVerified] = useState(false);

  const dmCard = isDarkMode ? '#1C2541' : '#FFFFFF';
  const dmBorder = isDarkMode ? '#3A506B' : '#E2E8F0';
  const dmText = isDarkMode ? '#FFFFFF' : '#0F172A';
  const dmInputBg = isDarkMode ? '#152238' : '#F8FAFC';
  const dmInputText = isDarkMode ? '#F1F5F9' : '#0F172A';

  const handleApplyQrPayload = (raw: string) => {
    const parsed = parsePhilSysQrPayload(raw);
    if (parsed) {
      if (parsed.psn) {
        setIdNumber(parsed.psn);
      }
      setSelectedIdType('PhilSys National ID');
      setPhilsysVerified(true);
      onAutofillPhilSys?.(parsed);
      setIsQrModalVisible(false);
      setQrInputText('');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: dmCard, borderColor: dmBorder }]}>
      <Text style={[styles.cardTitle, { color: dmText }]}>
        Government ID & Documents
      </Text>

      {/* PHILSYS QR INTEGRATION BUTTON / BADGE */}
      <View
        style={[
          localStyles.philsysBanner,
          isDarkMode && { backgroundColor: '#0C2D48', borderColor: '#0369A1' },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View
            style={[
              localStyles.philsysIconRing,
              isDarkMode && { backgroundColor: '#0284C7' },
            ]}
          >
            <IconSymbol name="qrcode" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[localStyles.philsysTitle, isDarkMode && { color: '#38BDF8' }]}>
              PhilSys National ID Quick-Scan
            </Text>
            <Text style={[localStyles.philsysSubtitle, isDarkMode && { color: '#94A3B8' }]}>
              Scan PhilID QR code or barcode to automatically autofill identity data
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={localStyles.philsysScanBtn}
          onPress={() => setIsQrModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={localStyles.philsysScanBtnText}>
            {philsysVerified ? 'Re-scan QR' : 'Scan QR'}
          </Text>
        </TouchableOpacity>
      </View>

      {philsysVerified ? (
        <View style={localStyles.verifiedTag}>
          <IconSymbol name="checkmark.seal.fill" size={15} color="#16A34A" />
          <Text style={localStyles.verifiedTagText}>
            PhilSys QR Code Successfully Verified & Loaded
          </Text>
        </View>
      ) : null}

      {/* PRIMARY VALID ID SELECTOR */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Select Primary Valid ID *
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            isIdTypeDropdownOpen && styles.dropdownTriggerActive,
            { backgroundColor: dmInputBg, borderColor: isIdTypeDropdownOpen ? '#0284C7' : dmBorder },
          ]}
          onPress={() => setIsIdTypeDropdownOpen((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownValueText, { color: dmText }]}>
            {selectedIdType}
          </Text>
          <IconSymbol
            name={isIdTypeDropdownOpen ? 'chevron.up' : 'chevron.down'}
            size={20}
            color={isDarkMode ? '#94A3B8' : '#64748B'}
          />
        </TouchableOpacity>

        {isIdTypeDropdownOpen && (
          <View
            style={[
              styles.dropdownMenu,
              isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
            ]}
          >
            {VALID_ID_TYPES.map((idType) => {
              const isSelected = selectedIdType === idType;
              return (
                <TouchableOpacity
                  key={idType}
                  style={[
                    styles.dropdownOptionItem,
                    isSelected && styles.dropdownOptionItemActive,
                    isDarkMode && { borderBottomColor: '#152238' },
                    isDarkMode && isSelected && { backgroundColor: '#0369A1' },
                  ]}
                  onPress={() => {
                    setSelectedIdType(idType);
                    setIsIdTypeDropdownOpen(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isSelected && styles.dropdownOptionTextActive,
                      isDarkMode && { color: isSelected ? '#FFFFFF' : '#E2E8F0' },
                    ]}
                  >
                    {idType}
                  </Text>
                  {isSelected && (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={18}
                      color={isDarkMode ? '#FFFFFF' : '#0284C7'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* VALID ID NUMBER */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          {selectedIdType} Number *
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: dmInputBg, color: dmInputText, borderColor: dmBorder }]}
          placeholder={`Enter ${selectedIdType} number`}
          placeholderTextColor="#94A3B8"
          value={idNumber}
          onChangeText={(text) => {
            setIdNumber(text);
            clearFieldError('valid_id_number');
            clearFieldError('id_number');
          }}
        />
      </View>

      {/* ID FRONT PHOTO */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Upload Front of ID Card *
        </Text>

        {idImageUri ? (
          <View style={[styles.photoPreviewCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#10B981' }]}>
            <Image source={{ uri: idImageUri }} style={styles.photoPreviewImage} resizeMode="cover" />
            <View style={[styles.photoPreviewFooter, isDarkMode && { backgroundColor: '#152238', borderTopColor: '#1C2541' }]}>
              <View style={styles.photoStatusBadge}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#10B981" />
                <Text style={styles.photoStatusText}>Front ID Photo Attached</Text>
              </View>
              <View style={styles.photoActionsRow}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                  onPress={() => onOpenPhotoPicker('id')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.photoActionBtnText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, styles.photoRemoveBtn, isDarkMode && { backgroundColor: '#3F1515', borderColor: '#7F1D1D' }]}
                  onPress={() => onRemovePhoto('id')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.photoActionBtnText, styles.photoRemoveBtnText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.uploadBox,
              isDarkMode && { backgroundColor: '#152238', borderColor: dmBorder },
            ]}
            onPress={() => onOpenPhotoPicker('id')}
            activeOpacity={0.8}
          >
            <IconSymbol
              name="person.text.rectangle.fill"
              size={34}
              color={isDarkMode ? '#38BDF8' : '#0284C7'}
            />
            <Text style={[styles.uploadTitle, { color: dmText }]}>
              Tap to Upload or Capture ID Front
            </Text>
            <Text style={[styles.uploadSubtitle, isDarkMode && { color: '#94A3B8' }]}>
              Make sure details and photo on the ID card are clearly legible
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ID BACK PHOTO (OPTIONAL / EXTENSIBLE) */}
      {idBackImageUri !== undefined ? (
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
            Upload Back of ID Card (Optional)
          </Text>

          {idBackImageUri ? (
            <View style={[styles.photoPreviewCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#10B981' }]}>
              <Image source={{ uri: idBackImageUri }} style={styles.photoPreviewImage} resizeMode="cover" />
              <View style={[styles.photoPreviewFooter, isDarkMode && { backgroundColor: '#152238', borderTopColor: '#1C2541' }]}>
                <View style={styles.photoStatusBadge}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color="#10B981" />
                  <Text style={styles.photoStatusText}>Back ID Photo Attached</Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadBox,
                isDarkMode && { backgroundColor: '#152238', borderColor: dmBorder },
              ]}
              onPress={() => onOpenPhotoPicker('id')}
              activeOpacity={0.8}
            >
              <IconSymbol
                name="doc.text.fill"
                size={34}
                color={isDarkMode ? '#38BDF8' : '#0284C7'}
              />
              <Text style={[styles.uploadTitle, { color: dmText }]}>
                Capture Back of ID (Barcode / Address)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* DIGITAL APPLICANT SIGNATURE */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Digital Applicant Signature *
        </Text>

        {signatureUri ? (
          <View style={[styles.photoPreviewCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#10B981' }]}>
            <View style={styles.signaturePreviewBox}>
              <Image source={{ uri: signatureUri }} style={styles.signatureImage} resizeMode="contain" />
            </View>
            <View style={[styles.photoPreviewFooter, isDarkMode && { backgroundColor: '#152238', borderTopColor: '#1C2541' }]}>
              <View style={styles.photoStatusBadge}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#10B981" />
                <Text style={styles.photoStatusText}>Signature Attached</Text>
              </View>
              <View style={styles.photoActionsRow}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                  onPress={onOpenSignaturePad}
                  activeOpacity={0.75}
                >
                  <Text style={styles.photoActionBtnText}>Re-sign</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, styles.photoRemoveBtn, isDarkMode && { backgroundColor: '#3F1515', borderColor: '#7F1D1D' }]}
                  onPress={() => onRemovePhoto('signature')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.photoActionBtnText, styles.photoRemoveBtnText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              style={[
                styles.uploadBox,
                isDarkMode && { backgroundColor: '#152238', borderColor: dmBorder },
              ]}
              onPress={onOpenSignaturePad}
              activeOpacity={0.8}
            >
              <IconSymbol
                name="signature"
                size={34}
                color={isDarkMode ? '#38BDF8' : '#0284C7'}
              />
              <Text style={[styles.uploadTitle, { color: dmText }]}>
                Sign on Screen (Touch Canvas)
              </Text>
              <Text style={[styles.uploadSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                Draw your digital signature directly on your phone screen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 8,
                alignItems: 'center',
              }}
              onPress={() => onOpenPhotoPicker('signature')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: isDarkMode ? '#38BDF8' : '#0284C7' }}>
                Or upload photo of signature on white paper
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* NAVIGATION BUTTONS */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, isDarkMode && { backgroundColor: '#152238', borderColor: dmBorder }]}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryButtonText, isDarkMode && { color: '#CBD5E1' }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Next: Biometrics</Text>
        </TouchableOpacity>
      </View>

      {/* PHILSYS QR SCANNER MODAL */}
      <Modal
        visible={isQrModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsQrModalVisible(false)}
      >
        <View style={localStyles.qrModalOverlay}>
          <View style={[localStyles.qrModalCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
            <View style={localStyles.qrModalHeader}>
              <View>
                <Text style={[localStyles.qrModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  PhilSys QR Code Scanner
                </Text>
                <Text style={[localStyles.qrModalSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                  Scan or paste raw PhilSys QR string
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsQrModalVisible(false)}>
                <IconSymbol name="xmark" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <View style={[localStyles.simulatedScanner, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#0284C7' }]}>
              <IconSymbol name="qrcode.viewfinder" size={64} color="#0284C7" />
              <Text style={[localStyles.scannerHint, isDarkMode && { color: '#CBD5E1' }]}>
                Position PhilID QR barcode in front of camera
              </Text>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
                Or Paste PhilSys QR Data String
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    height: 70,
                    backgroundColor: dmInputBg,
                    color: dmInputText,
                    borderColor: dmBorder,
                    textAlignVertical: 'top',
                    paddingTop: 8,
                  },
                ]}
                placeholder="Paste PhilSys JSON or raw pipe-delimited payload..."
                placeholderTextColor="#94A3B8"
                multiline
                value={qrInputText}
                onChangeText={setQrInputText}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[localStyles.btnSecondary, isDarkMode && { backgroundColor: '#152238', borderColor: '#334155' }]}
                onPress={() => setIsQrModalVisible(false)}
              >
                <Text style={{ fontWeight: '600', color: isDarkMode ? '#CBD5E1' : '#475569' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.btnPrimary}
                onPress={() => handleApplyQrPayload(qrInputText)}
                disabled={!qrInputText.trim()}
              >
                <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Parse & Autofill</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  philsysBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  philsysIconRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  philsysTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  philsysSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  philsysScanBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  philsysScanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedTag: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  verifiedTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  qrModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  qrModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  qrModalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  simulatedScanner: {
    height: 140,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scannerHint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  btnSecondary: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnPrimary: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0284C7',
  },
});
