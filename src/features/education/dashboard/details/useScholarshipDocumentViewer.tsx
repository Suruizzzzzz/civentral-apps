import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { InAppDocumentViewerModal } from "@/src/components/document-viewer/InAppDocumentViewerModal";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { sanitizeErrorMessage } from "@/src/utils/errorUtils";
import { formatDate } from "@/utils/dateUtils";
import {
  CitizenOfficialDocumentItem,
  downloadOrViewCitizenContract,
  downloadOrViewCitizenDocument,
  downloadOrViewCitizenInitialCertificate,
  downloadOrViewCitizenRenewalCertificate,
  downloadOrViewCitizenUndertaking,
  getMimeType,
} from "../api/citizenDocumentApi";

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  modalBody: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  modalCloseButton: {
    backgroundColor: "#7E22CE",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  modalCloseButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

export function useScholarshipDocumentViewer() {
  const [actionLoadingDocKey, setActionLoadingDocKey] = useState<string | null>(null);

  // Modal viewer state for document fallback info
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalBody, setModalBody] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // In-App Document Viewer state
  const [viewerModalVisible, setViewerModalVisible] = useState(false);
  const [viewerLocalUri, setViewerLocalUri] = useState<string | null>(null);
  const [viewerFilename, setViewerFilename] = useState("");
  const [viewerMimeType, setViewerMimeType] = useState("application/pdf");
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerRefNumber, setViewerRefNumber] = useState("");
  const [viewerStatus, setViewerStatus] = useState("");
  const [viewerDate, setViewerDate] = useState("");

  const handleDocumentAction = async (
    type: "application" | "renewal" | "grant",
    id: number,
    filename: string,
    mode: "view" | "download"
  ) => {
    const docKey = `${type}_${id}_${mode}`;
    setActionLoadingDocKey(docKey);
    try {
      const docTypeToFetch = type === "grant" ? "application" : type;
      const result = await downloadOrViewCitizenDocument(
        docTypeToFetch,
        id,
        filename,
        mode
      );

      if (mode === "view" && result?.localUri) {
        setViewerLocalUri(result.localUri);
        setViewerFilename(result.filename);
        setViewerMimeType(result.mimeType || getMimeType(result.filename));
        setViewerTitle(filename || `${type.toUpperCase()} Document`);
        setViewerRefNumber(`#${id}`);
        setViewerStatus("Verified Document");
        setViewerDate("");
        setViewerModalVisible(true);
        return;
      }

      setModalTitle("Document Downloaded");
      setModalBody(
        `File Name: ${filename}\nCategory: ${type.toUpperCase()} Requirement\nReference ID: #${id}\nStatus: Verified Document\n\nThe document file has been downloaded and saved to your device storage.`
      );
      setModalVisible(true);
    } catch (err: any) {
      console.error("[handleDocumentAction] error:", err);
      Alert.alert(
        "Unable to Process Document",
        sanitizeErrorMessage(
          err?.message,
          "Please check your connection and try again."
        )
      );
    } finally {
      setActionLoadingDocKey(null);
    }
  };

  const handleOfficialDocAction = async (
    doc: CitizenOfficialDocumentItem,
    mode: "view" | "download"
  ) => {
    const docKey = `${doc.type}_${doc.id}_${mode}`;
    setActionLoadingDocKey(docKey);
    try {
      let result;
      if (doc.type === "SCHOLARSHIP_CERTIFICATE") {
        result = await downloadOrViewCitizenInitialCertificate(
          doc.id,
          doc.document_number,
          mode
        );
      } else if (doc.type === "SCHOLARSHIP_CONTRACT") {
        result = await downloadOrViewCitizenContract(
          doc.id,
          doc.document_number,
          mode
        );
      } else if (doc.type === "SWORN_UNDERTAKING") {
        result = await downloadOrViewCitizenUndertaking(
          doc.id,
          doc.document_number,
          mode
        );
      } else if (doc.type === "RENEWAL_CERTIFICATE") {
        result = await downloadOrViewCitizenRenewalCertificate(
          doc.id,
          doc.document_number,
          mode
        );
      }

      if (mode === "view" && result?.localUri) {
        setViewerLocalUri(result.localUri);
        setViewerFilename(result.filename);
        setViewerMimeType(result.mimeType || "application/pdf");
        setViewerTitle(doc.title);
        setViewerRefNumber(doc.document_number);
        setViewerStatus(doc.status);
        setViewerDate(formatDate(doc.date, "—"));
        setViewerModalVisible(true);
        return;
      }

      setModalTitle(`Downloaded: ${doc.title}`);
      setModalBody(
        `Document Title: ${doc.title}\nDocument Number: ${doc.document_number}\nStatus: ${doc.status}\nDate: ${formatDate(
          doc.date,
          "—"
        )}\n\nOfficial certificate ${doc.document_number} downloaded successfully to your device storage.`
      );
      setModalVisible(true);
    } catch (err: any) {
      console.error("[handleOfficialDocAction] error:", err);
      Alert.alert(
        "Unable to Process Document",
        sanitizeErrorMessage(
          err?.message,
          "Please check your connection and try again."
        )
      );
    } finally {
      setActionLoadingDocKey(null);
    }
  };

  const renderModals = (isDarkMode: boolean) => (
    <>
      <InAppDocumentViewerModal
        visible={viewerModalVisible}
        onClose={() => setViewerModalVisible(false)}
        localUri={viewerLocalUri}
        filename={viewerFilename}
        mimeType={viewerMimeType}
        documentTitle={viewerTitle}
        referenceNumber={viewerRefNumber}
        statusBadge={viewerStatus}
        date={viewerDate}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View
            style={[
              modalStyles.modalContent,
              isDarkMode && {
                backgroundColor: "#1E293B",
                borderColor: "#334155",
              },
            ]}
          >
            <View style={modalStyles.modalHeader}>
              <Text
                style={[
                  modalStyles.modalTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {modalTitle}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol
                  name="xmark"
                  size={18}
                  color={isDarkMode ? "#94A3B8" : "#64748B"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300, marginVertical: 12 }}>
              <Text
                style={[
                  modalStyles.modalBody,
                  isDarkMode && { color: "#CBD5E1" },
                ]}
              >
                {modalBody}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={modalStyles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={modalStyles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );

  return {
    actionLoadingDocKey,
    handleDocumentAction,
    handleOfficialDocAction,
    renderModals,
  };
}
