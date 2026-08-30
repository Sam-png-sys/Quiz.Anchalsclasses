import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import axios from "axios";

// Convert ArrayBuffer to Base64 in chunks for reliable memory handling
const arrayBufferToBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
};

const getPdfCanvasViewerHtml = (base64Data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
  <title>Protected Document</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-user-select: none; user-select: none; }
    html, body { width: 100%; height: 100%; background-color: #18181b; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow-x: hidden; }
    #viewer-container { display: flex; flex-direction: column; align-items: center; padding: 12px 8px 30px 8px; width: 100%; min-height: 100%; }
    canvas { margin-bottom: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.5); background-color: #ffffff; border-radius: 6px; max-width: 100%; height: auto !important; }
    .status-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 20px; text-align: center; }
    .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #7c3aed; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .status-text { font-size: 14px; color: #a1a1aa; font-weight: 500; }
    .error-text { font-size: 13px; color: #f87171; display: none; margin-top: 12px; }
    a, button, [id*="download"], [class*="download"], [id*="print"], [class*="print"] { display: none !important; visibility: hidden !important; pointer-events: none !important; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
  <div id="status" class="status-box">
    <div class="spinner"></div>
    <div class="status-text">Rendering document pages…</div>
    <div id="error" class="error-text">Unable to render document pages.</div>
  </div>
  <div id="viewer-container"></div>

  <script>
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    } catch(e) {}

    const base64Str = "${base64Data}";

    try {
      const rawData = atob(base64Str);
      const uint8Array = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        uint8Array[i] = rawData.charCodeAt(i);
      }

      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      loadingTask.promise.then(function(pdf) {
        document.getElementById('status').style.display = 'none';
        const container = document.getElementById('viewer-container');

        const renderPage = function(pageNum) {
          if (pageNum > pdf.numPages) return;
          pdf.getPage(pageNum).then(function(page) {
            const scale = 1.3;
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            container.appendChild(canvas);

            page.render({
              canvasContext: context,
              viewport: viewport
            }).promise.then(function() {
              renderPage(pageNum + 1);
            });
          });
        };

        renderPage(1);
      }).catch(function(err) {
        console.error("PDF.js render error:", err);
        document.getElementById('error').style.display = 'block';
      });
    } catch(err) {
      console.error("Decode error:", err);
      document.getElementById('error').style.display = 'block';
    }
  </script>
</body>
</html>
`;

const DocumentViewerModal = ({ visible, url, title, onClose, themeColors, accentOption }) => {
  const [loading, setLoading] = useState(true);
  const [base64Data, setBase64Data] = useState(null);
  const [error, setError] = useState(false);

  const primaryColor = accentOption?.colors?.[0] || "#7c3aed";

  // Clean Cloudinary / attachment URLs
  const cleanUrl = useMemo(() => {
    if (!url) return "";
    let formatted = url;
    if (formatted.includes("fl_attachment")) {
      formatted = formatted.replace(/fl_attachment,?/g, "");
    }
    return formatted;
  }, [url]);

  useEffect(() => {
    if (!visible || !cleanUrl) {
      setBase64Data(null);
      setLoading(true);
      setError(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(false);

    // Fetch raw PDF bytes programmatically via axios to avoid triggering browser/OS download
    axios
      .get(cleanUrl, { responseType: "arraybuffer" })
      .then((response) => {
        if (!isMounted) return;
        const b64 = arrayBufferToBase64(response.data);
        setBase64Data(b64);
        setLoading(false);
      })
      .catch((err) => {
        console.log("PDF fetch error:", err?.message || err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [visible, cleanUrl]);

  const pdfHtml = useMemo(() => {
    if (!base64Data) return "";
    return getPdfCanvasViewerHtml(base64Data);
  }, [base64Data]);

  if (!visible || !url) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={[styles.modalRoot, { backgroundColor: themeColors.background }]}>
        <StatusBar barStyle={themeColors.isLight ? "dark-content" : "light-content"} />

        {/* Top Navigation Header */}
        <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
          <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={themeColors.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>
              {title || "Study Material"}
            </Text>
            <View style={styles.secureBadge}>
              <Ionicons name="lock-closed-outline" size={12} color={primaryColor} />
              <Text style={[styles.secureText, { color: primaryColor }]}>In-App View Only</Text>
            </View>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Content Viewer Body */}
        <View style={styles.body}>
          {loading && (
            <View style={[styles.centerOverlay, { backgroundColor: themeColors.background }]}>
              <ActivityIndicator size="large" color={primaryColor} />
              <Text style={[styles.loadingText, { color: themeColors.textSubtle }]}>
                Opening study document securely…
              </Text>
            </View>
          )}

          {error ? (
            <View style={styles.centerOverlay}>
              <Ionicons name="alert-circle-outline" size={56} color={themeColors.danger || "#ef4444"} />
              <Text style={[styles.errorTitle, { color: themeColors.text }]}>Unable to display document</Text>
              <Text style={[styles.errorSub, { color: themeColors.textSubtle }]}>
                Please check your network connection and try again.
              </Text>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: primaryColor }]}
                onPress={() => {
                  setError(false);
                  setLoading(true);
                  axios
                    .get(cleanUrl, { responseType: "arraybuffer" })
                    .then((res) => {
                      setBase64Data(arrayBufferToBase64(res.data));
                      setLoading(false);
                    })
                    .catch(() => {
                      setError(true);
                      setLoading(false);
                    });
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            base64Data && (
              <WebView
                source={{ html: pdfHtml, baseUrl: "https://localhost" }}
                onShouldStartLoadWithRequest={(request) => {
                  const u = request.url || "";
                  if (
                    u === "about:blank" ||
                    u.startsWith("https://localhost") ||
                    u.startsWith("data:") ||
                    u.startsWith("blob:") ||
                    u.includes("cdnjs.cloudflare.com")
                  ) {
                    return true;
                  }
                  // Strict block on any external link or download request
                  return false;
                }}
                onFileDownload={() => {
                  console.log("Blocked file download attempt");
                }}
                style={styles.webview}
                allowFileAccess={false}
                allowFileAccessFromFileURLs={false}
                allowUniversalAccessFromFileURLs={false}
                incognito={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
              />
            )
          )}
        </View>

        {/* Bottom Security Footer */}
        <View style={[styles.footer, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
          <Ionicons name="shield-checkmark-outline" size={16} color={primaryColor} />
          <Text style={[styles.footerText, { color: themeColors.textMuted }]}>
            Protected material • Download and sharing disabled
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  secureText: {
    fontSize: 11,
    fontWeight: "600",
  },
  body: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 10,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "500",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
  },
  errorSub: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  retryBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  footer: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default DocumentViewerModal;
