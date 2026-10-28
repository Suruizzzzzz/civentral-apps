import React from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { ClarityResult } from '@/src/utils/imageCompression';
import { ScholarshipRequiredDocument } from '../api/ScholarshipProgramApi';
import { styles } from '../styles/NewApplicantApplication.styles';

export interface SelectedFileState {
  name: string;
  size?: number;
  uri: string;
  mimeType?: string;
  asset?: DocumentPicker.DocumentPickerAsset;
}

export interface DocumentValidationState {
  status: 'idle' | 'validating' | 'validated';
  result?: 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE';
  message?: string;
  expectedCode?: string;
  detectedCode?: string | null;
  confidence?: number;
  clarity?: ClarityResult;
}

export interface Step5DocumentUploadsProps {
  requiredDocsList: ScholarshipRequiredDocument[];
  files: Record<string, SelectedFileState | undefined>;
  docValidations: Record<string, DocumentValidationState | undefined>;
  fieldErrors?: Record<string, string | string[]>;
  onPickDocument: (doc: ScholarshipRequiredDocument) => void;
  onOpenFullGuideModal: () => void;
  videoDeclarationGuideImg: any;
  isDarkMode: boolean;
  stepNumber?: number;
  totalSteps?: number;
}

export function Step5DocumentUploads({
  requiredDocsList,
  files,
  docValidations,
  fieldErrors = {},
  onPickDocument,
  onOpenFullGuideModal,
  videoDeclarationGuideImg,
  isDarkMode,
  stepNumber = 3,
  totalSteps = 3,
}: Step5DocumentUploadsProps) {
  return (
    <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <View style={styles.stepHeaderRow}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
          Required Documents Upload
        </Text>
        <View style={[styles.stepProgressBadge, isDarkMode && { backgroundColor: '#0369A1' }]}>
          <Text style={[styles.stepProgressBadgeText, isDarkMode && { color: '#BAE6FD' }]}>
            Step {stepNumber} of {totalSteps}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 12 }}>
        Maximum allowed file size: 5 MB per document (PDF, PNG, JPG accepted).
      </Text>

      {requiredDocsList.map((doc) => {
        const key = doc.program_document_id
          ? `doc_${doc.program_document_id}`
          : `doc_${doc.document_requirement_id}`;
        const selectedFile = files[key];
        const isVideoDoc =
          doc.document_code?.toUpperCase().includes('VIDEO') ||
          doc.document_name?.toUpperCase().includes('VIDEO');

        const fieldError =
          fieldErrors[key] ||
          (doc.document_code ? fieldErrors[doc.document_code] : undefined) ||
          (doc.document_name ? fieldErrors[doc.document_name] : undefined);

        return (
          <View
            key={key}
            style={[
              styles.docItemCard,
              isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
              Boolean(fieldError) && { borderColor: '#EF4444', borderWidth: 1.5 },
            ]}
          >
            <View style={styles.docHeaderRow}>
              <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                {doc.document_name}
              </Text>
              <Badge
                variant={selectedFile ? 'success' : 'warning'}
                label={selectedFile ? 'Attached' : 'Required'}
              />
            </View>

            {doc.description ? (
              <Text style={[styles.docInstructions, isDarkMode && { color: '#94A3B8' }]}>
                {doc.description}
              </Text>
            ) : doc.instructions ? (
              <Text style={[styles.docInstructions, isDarkMode && { color: '#94A3B8' }]}>
                {doc.instructions}
              </Text>
            ) : null}

            {fieldError ? (
              <View
                style={{
                  backgroundColor: isDarkMode ? '#450A0A' : '#FEF2F2',
                  borderColor: isDarkMode ? '#991B1B' : '#F87171',
                  borderWidth: 1,
                  borderRadius: 6,
                  padding: 8,
                  marginTop: 6,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <IconSymbol name="exclamationmark.circle.fill" size={14} color="#EF4444" />
                <Text style={{ fontSize: 12, color: isDarkMode ? '#FCA5A5' : '#B91C1C', flex: 1 }}>
                  {Array.isArray(fieldError) ? fieldError.join(', ') : fieldError}
                </Text>
              </View>
            ) : null}

            {isVideoDoc ? (
              <View style={[styles.videoGuideCard, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#0369A1' }]}>
                <View style={styles.videoGuideHeader}>
                  <IconSymbol name="info.circle.fill" size={16} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                  <Text style={[styles.videoGuideTitle, isDarkMode && { color: '#38BDF8' }]}>
                    Video Declaration Guide
                  </Text>
                </View>

                <Text style={[styles.videoGuideSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                  Use the guide below as your script when recording your video declaration.
                </Text>

                <View style={[styles.videoGuideImageWrapper, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                  <Image
                    source={videoDeclarationGuideImg}
                    style={styles.videoGuideImage}
                    resizeMode="contain"
                  />
                </View>

                <TouchableOpacity
                  style={styles.viewFullGuideBtn}
                  onPress={onOpenFullGuideModal}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="eye.fill" size={14} color="#FFFFFF" />
                  <Text style={styles.viewFullGuideBtnText}>View Full Guide</Text>
                </TouchableOpacity>

                <Text style={[styles.videoGuideFooter, isDarkMode && { color: '#CBD5E1' }]}>
                  Record your video clearly, show your valid ID when instructed, and upload the completed recording below.
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.uploadBox,
                selectedFile && styles.uploadBoxSuccess,
                isDarkMode && !selectedFile && { backgroundColor: '#1E293B', borderColor: '#0284C7' },
              ]}
              onPress={() => onPickDocument(doc)}
              activeOpacity={0.75}
            >
              <IconSymbol
                name={
                  selectedFile
                    ? 'checkmark.circle.fill'
                    : isVideoDoc
                      ? 'video.fill'
                      : 'doc.badge.plus'
                }
                size={18}
                color={selectedFile ? '#16A34A' : '#0284C7'}
              />
              <Text style={[styles.uploadText, selectedFile && styles.fileNameText]}>
                {selectedFile
                  ? selectedFile.name
                  : (doc.document_code?.toUpperCase().includes('VIDEO') || doc.document_name?.toUpperCase().includes('VIDEO'))
                    ? `Select ${doc.document_name} (MP4, MOV, WEBM up to 60MB)`
                    : `Select ${doc.document_name} (PDF, PNG, JPG up to 5MB)`}
              </Text>
            </TouchableOpacity>

            {/* OCR Document Validation Feedback (non-video documents only) */}
            {!isVideoDoc && selectedFile && docValidations[key]?.status === 'validating' ? (
              <View
                style={[
                  styles.ocrFeedbackBox,
                  styles.ocrValidatingBox,
                  isDarkMode && { backgroundColor: '#0F243A', borderColor: '#0369A1' },
                ]}
              >
                <ActivityIndicator size="small" color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                <Text style={[styles.ocrValidatingText, isDarkMode && { color: '#38BDF8' }]}>
                  Checking document with OCR pre-validation...
                </Text>
              </View>
            ) : null}

            {!isVideoDoc && selectedFile && docValidations[key]?.status === 'validated' && docValidations[key]?.result === 'MATCH' ? (
              <View
                style={[
                  styles.ocrFeedbackBox,
                  styles.ocrMatchBox,
                  isDarkMode && { backgroundColor: '#052E16', borderColor: '#15803D' },
                ]}
              >
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={16}
                  color={isDarkMode ? '#4ADE80' : '#16A34A'}
                />
                <Text style={[styles.ocrMatchText, isDarkMode && { color: '#86EFAC' }]}>
                  {docValidations[key]?.message || `Document appears to be a ${doc.document_name}.`}
                </Text>
              </View>
            ) : null}

            {!isVideoDoc && selectedFile && docValidations[key]?.status === 'validated' && docValidations[key]?.result === 'MISMATCH' ? (
              <View
                style={[
                  styles.ocrFeedbackBox,
                  styles.ocrMismatchBox,
                  isDarkMode && { backgroundColor: '#451A03', borderColor: '#B45309' },
                ]}
              >
                <View style={styles.ocrMismatchContentRow}>
                  <IconSymbol
                    name="exclamationmark.triangle.fill"
                    size={16}
                    color={isDarkMode ? '#FBBF24' : '#D97706'}
                  />
                  <Text style={[styles.ocrMismatchText, isDarkMode && { color: '#FDE68A' }]}>
                    {docValidations[key]?.message && docValidations[key]?.message?.includes('Please upload')
                      ? docValidations[key]?.message
                      : `${docValidations[key]?.message || 'This file does not appear to match the required document.'} Please upload the required ${doc.document_name}.`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.ocrChangeFileBtn,
                    isDarkMode && { backgroundColor: '#78350F', borderColor: '#B45309' },
                  ]}
                  onPress={() => onPickDocument(doc)}
                  activeOpacity={0.8}
                >
                  <IconSymbol
                    name="pencil"
                    size={12}
                    color={isDarkMode ? '#FDE68A' : '#92400E'}
                  />
                  <Text style={[styles.ocrChangeFileBtnText, isDarkMode && { color: '#FDE68A' }]}>
                    Change File
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {!isVideoDoc && selectedFile && docValidations[key]?.status === 'validated' && docValidations[key]?.result === 'INCONCLUSIVE' ? (
              <View
                style={[
                  styles.ocrFeedbackBox,
                  styles.ocrInconclusiveBox,
                  isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' },
                ]}
              >
                <IconSymbol
                  name="info.circle.fill"
                  size={16}
                  color={isDarkMode ? '#94A3B8' : '#64748B'}
                />
                <Text style={[styles.ocrInconclusiveText, isDarkMode && { color: '#CBD5E1' }]}>
                  {docValidations[key]?.message?.includes('unavailable') || docValidations[key]?.message?.includes('network')
                    ? 'Automatic verification is unavailable. Your document can still be reviewed manually.'
                    : 'Automatic identification was inconclusive. Your document can still be reviewed manually.'}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
