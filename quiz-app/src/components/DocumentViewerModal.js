import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

const DocumentViewerModal = ({ visible, url, title, onClose, themeColors, accentOption }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!visible || !url) return null;

  const primaryColor = accentOption?.colors?.[0] || "#7c3aed";

  // Standard Google Docs Viewer for PDFs to ensure consistent in-app preview on Android & iOS without forcing external downloads
  const isPdfUrl = url.toLowerCase().includes(".pdf");
  const sourceUri = isPdfUrl && Platform.OS !== "ios"
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
    : url;

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
                Loading study document securely…
              </Text>
            </View>
          )}

          {error ? (
            <View style={styles.centerOverlay}>
              <Ionicons name="alert-circle-outline" size={56} color={themeColors.danger || "#ef4444"} />
              <Text style={[styles.errorTitle, { color: themeColors.text }]}>Failed to load document</Text>
              <Text style={[styles.errorSub, { color: themeColors.textSubtle }]}>
                Please check your network connection and try again.
              </Text>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: primaryColor }]}
                onPress={() => setError(false)}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              source={{ uri: sourceUri }}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
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
