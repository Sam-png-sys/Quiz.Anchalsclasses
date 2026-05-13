import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import API from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";

const { width } = Dimensions.get("window");
const OTP_LENGTH = 6;

const OtpScreen = ({ navigation }) => {
  const { email, signIn } = useContext(AuthContext);
  const { accentOption, themeColors, settings } = useAppSettings();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 650, delay: 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 56, friction: 12, delay: 80, useNativeDriver: true }),
    ]).start();

    const interval = setInterval(() => {
      setResendTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text, index) => {
    if (text.length > 1) {
      const chars = text.slice(0, OTP_LENGTH).split("");
      const newOtp = [...otp];
      chars.forEach((c, i) => { if (index + i < OTP_LENGTH) newOtp[index + i] = c; });
      setOtp(newOtp);
      inputs.current[Math.min(index + chars.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");
    setLoading(true);
    try {
      const response = await API.post("/auth/verify-otp", {
        email: email.trim(),
        otp: finalOtp,
      });
      const token = response.data.access_token;
      await signIn(token, email.trim());
    } catch (error) {
      alert(error.response?.data?.detail || error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const filledCount = otp.filter(Boolean).length;
  const allFilled = filledCount === OTP_LENGTH;
  const progress = filledCount / OTP_LENGTH;

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: themeColors.background }]} />
      <View style={[styles.glowA, { backgroundColor: accentOption.colors[0], opacity: settings.theme === "light" ? 0.08 : 0.12 }]} />
      <View style={[styles.glowB, { backgroundColor: accentOption.colors[1], opacity: settings.theme === "light" ? 0.08 : 0.14 }]} />

      <Animated.View
        style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Logo mark */}
        <View style={styles.logoWrap}>
          <LinearGradient colors={accentOption.colors} style={styles.logoGrad}>
            <Text style={styles.logoText}>A</Text>
          </LinearGradient>
        </View>

        {/* Heading */}
        <Text style={[styles.title, { color: themeColors.text }]}>Verify Email</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSubtle }]}>
          We sent a {OTP_LENGTH}-digit code to{"\n"}
          <Text style={[styles.emailHL, { color: accentOption.colors[0] }]}>{email}</Text>
        </Text>

        {/* ── OTP Boxes ── */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <OtpBox
              key={i}
              digit={digit}
              index={i}
              inputRef={r => (inputs.current[i] = r)}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              filled={!!digit}
              themeColors={themeColors}
              accentColor={accentOption.colors[0]}
            />
          ))}
        </View>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{filledCount} / {OTP_LENGTH} digits entered</Text>

        {/* Verify Button */}
        <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 32 }}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => allFilled && Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start()}
            onPress={() => allFilled && handleVerify()}
            style={styles.btnOuter}
          >
            <LinearGradient
              colors={allFilled ? accentOption.colors : [themeColors.surfaceStrong, themeColors.surfaceStrong]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              <Text style={[styles.btnText, !allFilled && styles.btnTextDim]}>
                {loading ? "Verifying…" : "Verify Code"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Did not receive it?  </Text>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setResendTimer(30)}>
              <Text style={[styles.resendLink, { color: accentOption.colors[0] }]}>Resend code</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

// ── Single OTP box ─────────────────────────────────────────────────────────
const OtpBox = ({ digit, index, inputRef, onChange, onKeyPress, filled, themeColors, accentColor }) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, { toValue: focused ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [focused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      filled ? accentColor + "88" : themeColors.border,
      accentColor,
    ],
  });
  const bg = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      filled ? accentColor + "14" : themeColors.surface,
      accentColor + "18",
    ],
  });

  return (
    <Animated.View style={[styles.otpBox, { borderColor, backgroundColor: bg }]}>
      <TextInput
        ref={inputRef}
        style={[styles.otpInput, { color: themeColors.text }]}
        value={digit}
        onChangeText={t => onChange(t, index)}
        onKeyPress={e => onKeyPress(e, index)}
        keyboardType="numeric"
        maxLength={6}
        selectionColor={accentColor}
        textAlign="center"
        autoFocus={index === 0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </Animated.View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#12112b" },

  glowA: {
    position: "absolute", top: -90, left: width / 2 - 110,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "#e5354a", opacity: 0.07,
  },
  glowB: {
    position: "absolute", bottom: -70, right: width / 2 - 90,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "#3b2fc9", opacity: 0.08,
  },

  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 40,
    justifyContent: "center",
  },

  backBtn: { position: "absolute", top: 64, left: 28 },
  backText: { color: "rgba(255,255,255,0.38)", fontSize: 14, fontWeight: "600" },

  // Logo — matches Login/SignUp
  logoWrap: { alignSelf: "center", marginBottom: 28, marginTop: 40 },
  logoGrad: {
    width: 58, height: 58, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#e5354a", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  logoText: { color: "#fff", fontSize: 25, fontWeight: "800" },

  // Text
  title: {
    color: "#fff", fontSize: 32, fontWeight: "800",
    letterSpacing: -0.5, textAlign: "center", marginBottom: 10,
  },
  subtitle: {
    color: "rgba(255,255,255,0.33)", fontSize: 14,
    lineHeight: 22, textAlign: "center", marginBottom: 40,
  },
  emailHL: { color: "#e5354a", fontWeight: "600" },

  // OTP boxes
  otpRow: { flexDirection: "row", gap: 10, justifyContent: "center", marginBottom: 20 },
  otpBox: {
    width: (width - 56 - 50) / OTP_LENGTH,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  otpInput: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    width: "100%",
    textAlign: "center",
    paddingVertical: 0,
  },

  // Progress
  progressBg: {
    height: 3, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden", marginBottom: 8,
  },
  progressFill: {
    height: "100%", borderRadius: 2,
    backgroundColor: "#e5354a",
  },
  progressLabel: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 12, fontWeight: "500",
    textAlign: "center",
  },

  // Button
  btnOuter: {
    borderRadius: 100, overflow: "hidden",
    shadowColor: "#e5354a", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 18, elevation: 10,
  },
  btn: { paddingVertical: 17, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 0.2 },
  btnTextDim: { color: "rgba(255,255,255,0.25)" },

  // Resend
  resendRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 },
  resendLabel: { color: "rgba(255,255,255,0.33)", fontSize: 14 },
  resendTimer: { color: "rgba(255,255,255,0.25)", fontSize: 14, fontWeight: "600" },
  resendLink: { color: "#e5354a", fontSize: 14, fontWeight: "700" },
});
