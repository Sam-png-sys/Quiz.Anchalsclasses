import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import API from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";

const { width } = Dimensions.get("window");

const COURSE_OPTIONS = [
  "BDS 1st",
  "BDS 2nd Year",
  "BDS 3rd Year",
  "BDS 4th Year",
  "Intern",
  "Graduated",
  "PG Scholar",
  "Other",
];

// ── Pill Input ────────────────────────────────────────────────────────────────
const PillInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry: secureProp,
  keyboardType,
  autoCapitalize = "none",
  themeColors,
  accentColor,
}) => {
  const [focused, setFocused] = useState(false);
  const [showText, setShowText] = useState(false);
  const isPassword = !!secureProp;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [anim, focused]);

  const borderColor = anim.interpolate({ inputRange: [0, 1], outputRange: [themeColors.border, accentColor] });
  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: [themeColors.surface, accentColor + "12"] });

  return (
    <Animated.View style={[styles.pill, { borderColor, backgroundColor: bg }]}>
      <TextInput
        style={[styles.pillInput, { color: themeColors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textGhost}
        secureTextEntry={isPassword && !showText}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        selectionColor={accentColor}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setShowText(s => !s)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.showBtn, { color: themeColors.textSubtle }]}>{showText ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ── Strength Bar ──────────────────────────────────────────────────────────────
const StrengthBar = ({ password }) => {
  if (!password) return null;
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <View style={styles.strengthRow}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={[styles.strengthSeg, { backgroundColor: i <= s ? colors[s] : "rgba(255,255,255,0.08)" }]} />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: colors[s] }]}>{labels[s]}</Text>
    </View>
  );
};

// ── SignUpScreen ──────────────────────────────────────────────────────────────
const SignUpScreen = ({ navigation }) => {
  const { setEmail: setSignupEmail } = useContext(AuthContext);
  const { accentOption, themeColors, settings } = useAppSettings();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [currentCourse, setCurrentCourse] = useState(COURSE_OPTIONS[0]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 650, delay: 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 56, friction: 12, delay: 80, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSignUp = async () => {
    if (!name.trim()) return Alert.alert("", "Please enter your name");
    if (!email.trim()) return Alert.alert("", "Please enter your email");
    if (!/^\d{10}$/.test(phone.trim())) return Alert.alert("", "Please enter a valid 10-digit phone number");
    if (!collegeName.trim()) return Alert.alert("", "Please enter your college name");
    if (!currentCourse.trim()) return Alert.alert("", "Please select your current course");
    if (password.length < 6) return Alert.alert("", "Password must be at least 6 characters");
    if (password !== confirm) return Alert.alert("", "Passwords do not match");
    if (!agreed) return Alert.alert("", "Please accept the terms to continue");

    setLoading(true);
    try {
      await API.post("/auth/signup", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        collegeName: collegeName.trim(),
        currentCourse: currentCourse.trim(),
        password: password.trim(),
        role: "student",
      });
      setSignupEmail(email.trim());
      Alert.alert("OTP sent", "Please verify your email to continue.", [
        { text: "Verify", onPress: () => navigation.navigate("Otp") },
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirm.length > 0 && password === confirm;

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: themeColors.background }]} />
      <View style={[styles.glowA, { backgroundColor: accentOption.colors[0], opacity: settings.theme === "light" ? 0.08 : 0.12 }]} />
      <View style={[styles.glowB, { backgroundColor: accentOption.colors[1], opacity: settings.theme === "light" ? 0.08 : 0.14 }]} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoWrap}>
              <LinearGradient colors={["#e5354a", "#b91c2e"]} style={styles.logoGrad}>
                <Text style={styles.logoText}>A</Text>
              </LinearGradient>
            </View>

            <Text style={[styles.title, { color: themeColors.text }]}>Sign Up</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSubtle }]}>Create your account to get started</Text>

            {/* Form */}
            <View style={styles.form}>
              <PillInput
                placeholder="Full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                themeColors={themeColors}
                accentColor={accentOption.colors[0]}
              />
              <PillInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                themeColors={themeColors}
                accentColor={accentOption.colors[0]}
              />
              <PillInput
                placeholder="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="number-pad"
                themeColors={themeColors}
                accentColor={accentOption.colors[0]}
              />
              <PillInput
                placeholder="College name"
                value={collegeName}
                onChangeText={setCollegeName}
                autoCapitalize="words"
                themeColors={themeColors}
                accentColor={accentOption.colors[0]}
              />
              <View style={[styles.selectWrap, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
                <Text style={[styles.selectLabel, { color: themeColors.textGhost }]}>Current Course</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseChipRow}>
                  {COURSE_OPTIONS.map((option) => {
                    const active = currentCourse === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.courseChip,
                          active
                            ? { backgroundColor: accentOption.colors[0], borderColor: accentOption.colors[0] }
                            : { backgroundColor: themeColors.surfaceStrong, borderColor: themeColors.border },
                        ]}
                        onPress={() => setCurrentCourse(option)}
                      >
                        <Text style={[styles.courseChipText, { color: active ? "#fff" : themeColors.textSubtle }]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              <View style={{ width: "100%", gap: 8 }}>
                <PillInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  themeColors={themeColors}
                  accentColor={accentOption.colors[0]}
                />
                <StrengthBar password={password} />
              </View>
              <View style={{ width: "100%", gap: 6 }}>
                <PillInput
                  placeholder="Confirm password"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry
                  themeColors={themeColors}
                  accentColor={accentOption.colors[0]}
                />
                {/* Match indicator */}
                {confirm.length > 0 && (
                  <View style={styles.matchRow}>
                    <View style={[styles.matchDot, { backgroundColor: passwordsMatch ? "#22c55e" : "#ef4444" }]} />
                    <Text style={[styles.matchText, { color: passwordsMatch ? "#22c55e" : "#ef4444" }]}>
                      {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Terms */}
            <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(a => !a)} activeOpacity={0.8}>
              <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                {agreed && <Text style={styles.tick}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={[styles.termsLink, { color: accentOption.colors[0] }]}>Terms of Service</Text>
                {" "}and{" "}
                <Text style={[styles.termsLink, { color: accentOption.colors[0] }]}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Button */}
            <Animated.View style={[styles.btnWrap, { transform: [{ scale: btnScale }] }]}>
              <TouchableOpacity
                activeOpacity={1}
                onPressIn={() => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start()}
                onPress={handleSignUp}
                style={styles.btnOuter}
              >
                <LinearGradient colors={accentOption.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                  <Text style={styles.btnText}>{loading ? "Creating account…" : "Create Account"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* OR divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orLabel}>OR</Text>
              <View style={styles.orLine} />
            </View>

            {/* Login */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: themeColors.textSubtle }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.footerLink, { color: accentOption.colors[0] }]}>Sign in</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#12112b" },
  glowA: { position: "absolute", top: -90, left: width / 2 - 110, width: 220, height: 220, borderRadius: 110, backgroundColor: "#e5354a", opacity: 0.07 },
  glowB: { position: "absolute", bottom: -70, right: width / 2 - 90, width: 180, height: 180, borderRadius: 90, backgroundColor: "#3b2fc9", opacity: 0.08 },

  scroll: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 26, paddingVertical: 60 },
  card: { width: "100%", maxWidth: 400, alignItems: "center" },

  backBtn: { alignSelf: "flex-start", marginBottom: 28 },
  backText: { color: "rgba(255,255,255,0.38)", fontSize: 14, fontWeight: "600" },

  logoWrap: { marginBottom: 24 },
  logoGrad: { width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: "#e5354a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  logoText: { color: "#fff", fontSize: 25, fontWeight: "800" },

  title: { color: "#fff", fontSize: 32, fontWeight: "800", letterSpacing: -0.5, marginBottom: 8, textAlign: "center" },
  subtitle: { color: "rgba(255,255,255,0.33)", fontSize: 14, textAlign: "center", marginBottom: 36 },

  form: { width: "100%", gap: 14, marginBottom: 20 },
  selectWrap: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  selectLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  courseChipRow: { gap: 8, paddingRight: 6 },
  courseChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  courseChipText: {
    fontSize: 12,
    fontWeight: "700",
  },

  pill: { width: "100%", flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 100, paddingHorizontal: 22, paddingVertical: Platform.OS === "ios" ? 15 : 13 },
  pillInput: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "500", paddingVertical: 0 },
  showBtn: { color: "rgba(255,255,255,0.38)", fontSize: 13, fontWeight: "600", paddingLeft: 8 },

  // Strength bar
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 4 },
  strengthBars: { flex: 1, flexDirection: "row", gap: 4 },
  strengthSeg: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: "700", width: 42, textAlign: "right" },

  // Match
  matchRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 },
  matchDot: { width: 6, height: 6, borderRadius: 3 },
  matchText: { fontSize: 12, fontWeight: "600" },

  // Terms
  termsRow: { width: "100%", flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 24 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  checkboxOn: { backgroundColor: "#e5354a", borderColor: "#e5354a" },
  tick: { color: "#fff", fontSize: 11, fontWeight: "800" },
  termsText: { flex: 1, color: "rgba(255,255,255,0.38)", fontSize: 13, lineHeight: 20 },
  termsLink: { color: "#e5354a", fontWeight: "600" },

  // Button
  btnWrap: { width: "100%", marginBottom: 30 },
  btnOuter: { width: "100%", borderRadius: 100, overflow: "hidden", shadowColor: "#e5354a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.36, shadowRadius: 18, elevation: 10 },
  btn: { paddingVertical: 17, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 0.2 },

  // OR
  orRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 22 },
  orLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  orLabel: { color: "rgba(255,255,255,0.22)", fontSize: 11, fontWeight: "700", letterSpacing: 2 },

  // Footer
  footer: { flexDirection: "row", alignItems: "center" },
  footerText: { color: "rgba(255,255,255,0.36)", fontSize: 14 },
  footerLink: { color: "#e5354a", fontSize: 14, fontWeight: "700" },
});
