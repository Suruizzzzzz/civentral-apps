import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import {
  handlePermanentDownload,
  invalidateDocumentCache,
} from '@/src/features/education/dashboard/api/citizenDocumentApi';

export interface InAppDocumentViewerModalProps {
  visible: boolean;
  onClose: () => void;
  localUri: string | null;
  filename: string;
  mimeType?: string;
  documentTitle?: string;
  referenceNumber?: string;
  statusBadge?: string;
  date?: string;
  onDownloadSuccess?: () => void;
}

export function InAppDocumentViewerModal({
  visible,
  onClose,
  localUri,
  filename,
  mimeType,
  documentTitle,
  referenceNumber,
  statusBadge,
  date,
  onDownloadSuccess,
}: InAppDocumentViewerModalProps) {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const webViewRef = useRef<WebView>(null);
  const isWebViewReadyRef = useRef(false);

  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageProgress, setPageProgress] = useState<{ current: number; total: number } | null>(null);

  const cleanFilename = filename || 'document.pdf';
  const effectiveMimeType = (mimeType || '').toLowerCase();
  const isPdf =
    effectiveMimeType.includes('pdf') ||
    cleanFilename.toLowerCase().endsWith('.pdf');
  const isImage =
    effectiveMimeType.startsWith('image/') ||
    /\.(png|jpe?g|webp)$/i.test(cleanFilename);

  // Send PDF base64 payload to WebView safely via postMessage
  const sendPdfToWebView = (b64: string) => {
    if (!webViewRef.current) return;
    try {
      const message = JSON.stringify({
        type: 'LOAD_PDF',
        base64: b64,
      });
      webViewRef.current.postMessage(message);
    } catch (err) {
      console.error('[InAppDocumentViewerModal] postMessage error:', err);
    }
  };

  // Load PDF base64 on Android when modal opens
  useEffect(() => {
    if (!visible || !localUri) {
      setPdfBase64(null);
      setIsLoadingPdf(false);
      setLoadError(null);
      setPageProgress(null);
      isWebViewReadyRef.current = false;
      return;
    }

    if (isPdf && Platform.OS === 'android') {
      let isMounted = true;
      setIsLoadingPdf(true);
      setLoadError(null);
      setPageProgress(null);
      isWebViewReadyRef.current = false;

      FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
        .then((b64) => {
          if (isMounted) {
            setPdfBase64(b64);
            if (isWebViewReadyRef.current) {
              sendPdfToWebView(b64);
            }
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error('[InAppDocumentViewerModal] Base64 read error:', err);
            setLoadError('Unable to prepare PDF preview. You can still download the document directly.');
            setIsLoadingPdf(false);
          }
        });

      return () => {
        isMounted = false;
      };
    } else {
      setIsLoadingPdf(false);
      setLoadError(null);
    }
  }, [visible, localUri, isPdf]);

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'VIEWER_READY') {
        isWebViewReadyRef.current = true;
        if (pdfBase64) {
          sendPdfToWebView(pdfBase64);
        }
      } else if (data.type === 'PDF_LOADED') {
        setPageProgress({ current: 0, total: data.pages || 1 });
      } else if (data.type === 'PAGE_RENDERED') {
        setPageProgress({ current: data.page, total: data.total });
      } else if (data.type === 'PDF_RENDER_COMPLETE') {
        setIsLoadingPdf(false);
        setPageProgress({ current: data.pages, total: data.pages });
      } else if (data.type === 'PDF_ERROR') {
        console.error('[InAppDocumentViewerModal] PDF error from WebView:', data);
        await invalidateDocumentCache(cleanFilename);
        setLoadError(`Unable to parse PDF pages: ${data.message || 'Invalid PDF structure'}.`);
        setIsLoadingPdf(false);
      }
    } catch (err) {
      console.warn('[InAppDocumentViewerModal] Message parsing warning:', err);
    }
  };

  const handleDownloadPress = async () => {
    if (isDownloading || !localUri) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsDownloading(true);
      await handlePermanentDownload(localUri, cleanFilename);
      if (onDownloadSuccess) {
        onDownloadSuccess();
      }
    } catch (err: any) {
      console.error('[InAppDocumentViewerModal] Download error:', err);
      Alert.alert('Download Failed', err?.message || 'Could not save file to device storage.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    Haptics.selectionAsync();
    setPdfBase64(null);
    setLoadError(null);
    setPageProgress(null);
    isWebViewReadyRef.current = false;
    onClose();
  };

  // Static HTML template without inlined dynamic Base64 data
  const renderPdfAndroidHtml = () => {
    const bgColor = isDarkMode ? '#0F172A' : '#1E293B';
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background-color: ${bgColor};
      width: 100%;
      min-height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    #container {
      width: 100%;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 10px;
    }
    .pdf-page-canvas {
      width: 100% !important;
      max-width: 850px;
      height: auto !important;
      display: block;
      margin: 8px auto 20px auto;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      background-color: #FFFFFF;
    }
    #status-msg {
      color: #94A3B8;
      font-size: 14px;
      text-align: center;
      margin-top: 40px;
      padding: 16px;
    }
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top: 3px solid #7C3AED;
      width: 32px;
      height: 32px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
  <div id="status-msg">
    <div class="spinner"></div>
    <div>Preparing document viewer...</div>
  </div>
  <div id="container"></div>

  <script>
    (function() {
      var container = document.getElementById("container");
      var statusMsg = document.getElementById("status-msg");

      function postToRN(obj) {
        try {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(obj));
          }
        } catch(e) {}
      }

      function handleMessage(event) {
        try {
          var data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (data && data.type === "LOAD_PDF" && data.base64) {
            renderPdf(data.base64);
          }
        } catch (err) {
          postToRN({
            type: "PDF_ERROR",
            message: "Incoming message parse failure: " + err.message,
            name: err.name
          });
        }
      }

      window.addEventListener("message", handleMessage);
      document.addEventListener("message", handleMessage);

      function notifyReady() {
        postToRN({ type: "VIEWER_READY" });
      }

      if (document.readyState === "complete") {
        notifyReady();
      } else {
        window.addEventListener("load", notifyReady);
      }
      setTimeout(notifyReady, 400);

      async function renderPdf(base64Data) {
        statusMsg.style.display = "block";
        statusMsg.innerHTML = '<div class="spinner"></div><div>Decoding PDF document...</div>';

        try {
          if (typeof pdfjsLib === "undefined") {
            throw new Error("PDF.js rendering engine could not be loaded");
          }

          pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

          var rawData = atob(base64Data);
          var uint8Array = new Uint8Array(rawData.length);
          for (var i = 0; i < rawData.length; i++) {
            uint8Array[i] = rawData.charCodeAt(i);
          }

          var loadingTask = pdfjsLib.getDocument({ data: uint8Array });
          loadingTask.promise.then(async function(pdf) {
            statusMsg.style.display = "none";
            container.innerHTML = "";
            var totalPages = pdf.numPages;

            postToRN({
              type: "PDF_LOADED",
              pages: totalPages
            });

            for (var pageNum = 1; pageNum <= totalPages; pageNum++) {
              try {
                var page = await pdf.getPage(pageNum);
                var viewport = page.getViewport({ scale: 2.0 });

                var canvas = document.createElement("canvas");
                canvas.className = "pdf-page-canvas";
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                var ctx = canvas.getContext("2d");
                var renderContext = {
                  canvasContext: ctx,
                  viewport: viewport
                };

                container.appendChild(canvas);
                await page.render(renderContext).promise;

                postToRN({
                  type: "PAGE_RENDERED",
                  page: pageNum,
                  total: totalPages
                });
              } catch (pageErr) {
                console.error("Error rendering page " + pageNum, pageErr);
              }
            }

            postToRN({
              type: "PDF_RENDER_COMPLETE",
              pages: totalPages
            });
          }).catch(function(err) {
            statusMsg.style.display = "block";
            statusMsg.innerHTML = '<div style="color: #F87171; padding: 20px;">Unable to parse PDF pages: ' + (err.message || "Invalid structure") + '</div>';
            postToRN({
              type: "PDF_ERROR",
              message: err.message,
              name: err.name
            });
          });
        } catch (err) {
          statusMsg.style.display = "block";
          statusMsg.innerHTML = '<div style="color: #F87171; padding: 20px;">Initialization error: ' + err.message + '</div>';
          postToRN({
            type: "PDF_ERROR",
            message: err.message,
            name: err.name
          });
        }
      }
    })();
  </script>
</body>
</html>`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View
        style={[
          styles.modalContainer,
          isDarkMode ? styles.darkBg : styles.lightBg,
          { paddingTop: Math.max(insets.top, 14) },
        ]}
      >
        {/* EXECUTIVE CLEAN HEADER */}
        <View
          style={[
            styles.headerContainer,
            isDarkMode ? styles.darkBorder : styles.lightBorder,
          ]}
        >
          <View style={styles.headerInfoCol}>
            {/* Title Row */}
            <Text
              style={[
                styles.documentTitle,
                isDarkMode ? styles.darkText : styles.lightText,
              ]}
              numberOfLines={1}
            >
              {documentTitle || cleanFilename}
            </Text>

            {/* Subtitle Row (Reference & Date) */}
            {(referenceNumber || date) ? (
              <Text
                style={[
                  styles.referenceMetaText,
                  isDarkMode ? styles.darkMutedText : styles.lightMutedText,
                ]}
                numberOfLines={1}
              >
                {referenceNumber ? `Ref: ${referenceNumber}` : ''}
                {referenceNumber && date ? ' • ' : ''}
                {date || ''}
              </Text>
            ) : null}

            {/* Status & Format Pills Row */}
            <View style={styles.pillsRow}>
              {/* Format Badge */}
              <View
                style={[
                  styles.pillBadge,
                  isDarkMode ? styles.pillNeutralDark : styles.pillNeutralLight,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    isDarkMode ? styles.pillTextNeutralDark : styles.pillTextNeutralLight,
                  ]}
                >
                  {isPdf ? 'PDF' : isImage ? 'IMG' : 'DOC'}
                </Text>
              </View>

              {/* Status Badge */}
              {statusBadge ? (
                <View
                  style={[
                    styles.pillBadge,
                    isDarkMode ? styles.pillSuccessDark : styles.pillSuccessLight,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isDarkMode ? styles.pillTextSuccessDark : styles.pillTextSuccessLight,
                    ]}
                  >
                    {statusBadge}
                  </Text>
                </View>
              ) : null}

              {/* Page Indicator Chip */}
              {pageProgress && pageProgress.total > 1 ? (
                <View
                  style={[
                    styles.pillBadge,
                    isDarkMode ? styles.pillCountDark : styles.pillCountLight,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isDarkMode ? styles.pillTextCountDark : styles.pillTextCountLight,
                    ]}
                  >
                    {pageProgress.current}/{pageProgress.total} Pages
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Pinned Circular Exit Button */}
          <TouchableOpacity
            style={[
              styles.closeCircleBtn,
              isDarkMode ? styles.closeCircleBtnDark : styles.closeCircleBtnLight,
            ]}
            onPress={handleClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close document viewer"
          >
            <IconSymbol
              name="xmark"
              size={16}
              color={isDarkMode ? '#E2E8F0' : '#475569'}
            />
          </TouchableOpacity>
        </View>

        {/* POLISHED VIEWPORT CANVAS */}
        <View style={styles.viewportContainer}>
          {loadError ? (
            <View style={styles.errorBox}>
              <IconSymbol name="exclamationmark.triangle.fill" size={36} color="#EF4444" />
              <Text style={styles.errorTitle}>Preview Unavailable</Text>
              <Text style={styles.errorSubtitle}>{loadError}</Text>
              <TouchableOpacity
                style={styles.errorDownloadBtn}
                onPress={handleDownloadPress}
                activeOpacity={0.8}
              >
                <IconSymbol name="arrow.down.circle.fill" size={16} color="#FFFFFF" />
                <Text style={styles.errorDownloadBtnText}>Save File to Device</Text>
              </TouchableOpacity>
            </View>
          ) : !localUri ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text
                style={[
                  styles.loadingText,
                  isDarkMode ? styles.darkMutedText : styles.lightMutedText,
                ]}
              >
                Preparing document...
              </Text>
            </View>
          ) : isPdf ? (
            Platform.OS === 'android' ? (
              <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: renderPdfAndroidHtml() }}
                style={styles.webView}
                allowFileAccess={true}
                allowFileAccessFromFileURLs={true}
                allowUniversalAccessFromFileURLs={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
                onMessage={handleWebViewMessage}
              />
            ) : (
              <WebView
                originWhitelist={['*']}
                source={{ uri: localUri }}
                style={styles.webView}
                allowFileAccess={true}
                scalesPageToFit={true}
              />
            )
          ) : isImage ? (
            <ScrollView
              style={styles.imageScroll}
              contentContainerStyle={styles.imageContentContainer}
              maximumZoomScale={5}
              minimumZoomScale={1}
              centerContent={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <ExpoImage
                source={{ uri: localUri }}
                style={styles.fullImage}
                contentFit="contain"
                transition={200}
              />
            </ScrollView>
          ) : (
            <View style={styles.errorBox}>
              <IconSymbol name="doc.fill" size={40} color="#7C3AED" />
              <Text style={styles.errorTitle}>Unsupported Format</Text>
              <Text style={styles.errorSubtitle}>
                This file type cannot be displayed in preview. Use the button below to download the file directly.
              </Text>
              <TouchableOpacity
                style={styles.errorDownloadBtn}
                onPress={handleDownloadPress}
                activeOpacity={0.8}
              >
                <IconSymbol name="arrow.down.circle.fill" size={16} color="#FFFFFF" />
                <Text style={styles.errorDownloadBtnText}>Download Document</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* STREAMLINED FULL-WIDTH FOOTER */}
        <View
          style={[
            styles.footerContainer,
            isDarkMode ? styles.darkFooterBg : styles.lightFooterBg,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={[styles.fullDownloadBtn, isDownloading && styles.btnDisabled]}
            onPress={handleDownloadPress}
            disabled={isDownloading || !localUri}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Download Document to Device"
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <IconSymbol name="arrow.down.circle.fill" size={18} color="#FFFFFF" />
            )}
            <Text style={styles.fullDownloadBtnText}>
              {isDownloading ? 'Saving to Device...' : 'Download Document'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  darkBg: {
    backgroundColor: '#0F172A',
  },
  lightBg: {
    backgroundColor: '#FFFFFF',
  },
  darkBorder: {
    borderBottomColor: '#1E293B',
  },
  lightBorder: {
    borderBottomColor: '#E2E8F0',
  },
  darkText: {
    color: '#F8FAFC',
  },
  lightText: {
    color: '#0F172A',
  },
  darkMutedText: {
    color: '#94A3B8',
  },
  lightMutedText: {
    color: '#64748B',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerInfoCol: {
    flex: 1,
    paddingRight: 16,
  },
  documentTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  referenceMetaText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: 0.1,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillNeutralLight: {
    backgroundColor: '#F1F5F9',
  },
  pillNeutralDark: {
    backgroundColor: '#1E293B',
  },
  pillTextNeutralLight: {
    color: '#475569',
  },
  pillTextNeutralDark: {
    color: '#94A3B8',
  },
  pillSuccessLight: {
    backgroundColor: '#ECFDF5',
  },
  pillSuccessDark: {
    backgroundColor: '#064E3B',
  },
  pillTextSuccessLight: {
    color: '#047857',
  },
  pillTextSuccessDark: {
    color: '#6EE7B7',
  },
  pillCountLight: {
    backgroundColor: '#F3E8FF',
  },
  pillCountDark: {
    backgroundColor: '#3B0764',
  },
  pillTextCountLight: {
    color: '#7E22CE',
  },
  pillTextCountDark: {
    color: '#D8B4FE',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 2,
  },
  closeCircleBtnLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  closeCircleBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  viewportContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  imageScroll: {
    flex: 1,
  },
  imageContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  errorSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  errorDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  errorDownloadBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  darkFooterBg: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
  },
  lightFooterBg: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
  },
  fullDownloadBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  fullDownloadBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
