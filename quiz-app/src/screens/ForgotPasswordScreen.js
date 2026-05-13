import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import API from "../api/client";
import { useAppSettings } from "../context/AppSettingsContext";

export default function ForgotPasswordScreen({ navigation }) {
  const { accentOption, themeColors, settings } = useAppSettings();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRef = useRef(null);

  const sendOtp = async () => {
    const value = identifier.trim();
    if (!value) {
      alert("Enter your email or username");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/forgot-password", { identifier: value });
      setResolvedEmail(res.data?.email || value);
      setStep(2);
      setTimeout(() => otpRef.current?.focus(), 120);
    } catch (error) {
      alert(error.response?.data?.detail || error.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (otp.trim().length < 4) {
      alert("Enter the OTP sent to your email");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/reset-password", {
        email: resolvedEmail || identifier.trim(),
        otp: otp.trim(),
        password,
      });
      alert("Password reset successful. Please log in.");
      navigation.replace("Login");
    } catch (error) {
      alert(error.response?.data?.detail || error.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <LinearGradient colors={[themeColors.background, themeColors.backgroundAlt, themeColors.background]} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: themeColors.border, backgroundColor: themeColors.surface }]}>
            <Text style={[styles.backText, { color: themeColors.textMuted }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.logoWrap}>
            <LinearGradient colors={accentOption.colors} style={styles.logo}>
              <Text style={styles.logoText}>A</Text>
            </LinearGradient>
          </View>

          <Text style={[styles.title, { color: themeColors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSubtle }]}>
            {step === 1 ? "We will send an OTP to your registered email" : `Enter the OTP sent to ${resolvedEmail || identifier}`}
          </Text>

          {step === 1 ? (
            <View style={styles.form}>
              <Field
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="Email or username"
                keyboardType="email-address"
                themeColors={themeColors}
                accentColor={accentOption.colors[0]}
              />

              <PrimaryButton
                label={loading ? "Sending OTP..." : "Send OTP"}
                loading={loading}
                onPress={sendOtp}
                colors={accentOption.colors}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Field
                inputRef={otpRef}
                value={otp}
                onChangeText={setOtp}
                placeholder="OTP"
                keyboardType="number-pad"
                themeColors={themeColors}
                accentColor={accentOption.colors[0]}
              />
              <Field
                value={password}
                onChangeText={setPassword}
                placeholder="New password"
                secureTextEntry
                themeColors={themeColors}
                accentColor={accentOption.colors[0]}
              />
              <Field
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
                themeColors={themeColors}
                accentColor={accentOption.colors[0]}
              />

              <PrimaryButton
                label={loading ? "Resetting..." : "Reset Password"}
                loading={loading}
                onPress={resetPassword}
                colors={accentOption.colors}
              />

              <TouchableOpacity
                onPress={() => {
                  setStep(1);
                  setOtp("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                style={styles.secondaryBtn}
              >
                <Text style={[styles.secondaryText, { color: themeColors.textSubtle }]}>Use a different email</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeColors.textSubtle }]}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text style={[styles.footerLink, { color: accentOption.colors[0] }]}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ inputRef, value, onChangeText, placeholder, keyboardType, secureTextEntry, themeColors, accentColor }) {
  return (
    <View style={[styles.field, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textGhost}
        keyboardType={keyboardType || "default"}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        selectionColor={accentColor}
        style={[styles.input, { color: themeColors.text }]}
      />
    </View>
  );
}

function PrimaryButton({ label, loading, onPress, colors }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.9} style={styles.primaryWrap}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primary}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{label}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 56,
  },
  backBtn: {
    position: "absolute",
    top: 56,
    left: 26,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backText: { fontSize: 13, fontWeight: "700" },
  logoWrap: { alignItems: "center", marginBottom: 24 },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#fff", fontSize: 25, fontWeight: "800" },
  title: { fontSize: 31, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 21, textAlign: "center", marginBottom: 34 },
  form: { gap: 14 },
  field: {
    borderWidth: 1.5,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "ios" ? 15 : 12,
  },
  input: { fontSize: 15, fontWeight: "600", paddingVertical: 0 },
  primaryWrap: {
    borderRadius: 100,
    overflow: "hidden",
    marginTop: 6,
  },
  primary: { paddingVertical: 17, alignItems: "center", justifyContent: "center", minHeight: 56 },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  secondaryBtn: { alignItems: "center", paddingVertical: 10 },
  secondaryText: { fontSize: 13, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "800" },
});
