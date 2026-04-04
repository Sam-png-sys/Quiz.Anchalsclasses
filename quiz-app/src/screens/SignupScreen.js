import React, { useState, useRef, useEffect } from "react";
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

const { height } = Dimensions.get("window");

const FloatingInput = ({ label, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }) => {
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, { toValue: focused || value ? 1 : 0, duration: 200, useNativeDriver: false }).start();
    Animated.timing(borderAnim, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [focused, value]);

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, -10] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = labelAnim.interpolate({ inputRange: [0, 1], outputRange: ["#6b7280", "#c4b5fd"] });
  const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(255,255,255,0.08)", "rgba(196,181,253,0.5)"] });

  return (
    <Animated.View style={[styles.floatBox, { borderColor }]}>
      <Animated.Text style={[styles.floatLabel, { top: labelTop, fontSize: labelSize, color: labelColor }]}>
        {label}
      </Animated.Text>
      <TextInput
        style={styles.floatInput}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "none"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        selectionColor="#c4b5fd"
        placeholderTextColor="transparent"
      />
    </Animated.View>
  );
};

const StrengthBar = ({ password }) => {
  const getStrength = () => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };

  const strength = getStrength();
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  if (!password) return null;

  return (
    <View style={styles.strengthWrap}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthSegment,
              { backgroundColor: i <= strength ? colors[strength] : "rgba(255,255,255,0.08)" },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: colors[strength] }]}>{labels[strength]}</Text>
    </View>
  );
};

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const orbFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, delay: 150, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, delay: 150, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbFloat, { toValue: 1, duration: 3500, useNativeDriver: true }),
        Animated.timing(orbFloat, { toValue: 0, duration: 3500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const orbY = orbFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });

  const handleSignUp = async () => {
    if (!name.trim()) return Alert.alert("", "Please enter your name");
    if (!email.trim()) return Alert.alert("", "Please enter your email");
    if (password.length < 6) return Alert.alert("", "Password must be at least 6 characters");
    if (password !== confirm) return Alert.alert("", "Passwords do not match");
    if (!agreed) return Alert.alert("", "Please accept the terms to continue");

    setLoading(true);
    try {
      await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      Alert.alert("Account created!", "Please log in to continue.", [
        { text: "Go to Login", onPress: () => navigation.replace("Login") },
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0a0a12", "#0f0a1e", "#0a0a12"]} style={StyleSheet.absoluteFill} />

      {/* Orbs */}
      <Animated.View style={[styles.orb1, { transform: [{ translateY: orbY }] }]}>
        <LinearGradient colors={["#7c3aed", "#4f46e5"]} style={{ flex: 1, borderRadius: 999 }} />
      </Animated.View>
      <View style={styles.orb2}>
        <LinearGradient colors={["#db2777", "#9333ea"]} style={{ flex: 1, borderRadius: 999 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoWrap}>
              <LinearGradient colors={["#7c3aed", "#9333ea"]} style={styles.logoGrad}>
                <Text style={styles.logoMark}>✦</Text>
              </LinearGradient>
            </View>

            <Text style={styles.eyebrow}>GET STARTED</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of learners today</Text>

            <View style={styles.divider} />

            {/* Form */}
            <View style={styles.form}>
              <FloatingInput
                label="Full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <FloatingInput
                label="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <View>
                <FloatingInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <StrengthBar password={password} />
              </View>
              <FloatingInput
                label="Confirm password"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />
            </View>

            {/* Confirm match indicator */}
            {confirm.length > 0 && (
              <View style={styles.matchRow}>
                <View style={[styles.matchDot, { backgroundColor: password === confirm ? "#22c55e" : "#ef4444" }]} />
                <Text style={[styles.matchText, { color: password === confirm ? "#22c55e" : "#ef4444" }]}>
                  {password === confirm ? "Passwords match" : "Passwords don't match"}
                </Text>
              </View>
            )}

            {/* Terms */}
            <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {" "}and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 24 }}>
              <TouchableOpacity
                activeOpacity={1}
                onPressIn={() => Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()}
                onPress={handleSignUp}
                style={styles.buttonWrap}
              >
                <LinearGradient
                  colors={["#7c3aed", "#9333ea", "#a855f7"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{loading ? "Creating account…" : "Create Account"}</Text>
                  {!loading && <Text style={styles.buttonArrow}>→</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* OR */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            {/* Login redirect */}
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a12" },
  orb1: {
    position: "absolute", width: 280, height: 280,
    top: -70, left: -70, borderRadius: 999, opacity: 0.28,
  },
  orb2: {
    position: "absolute", width: 200, height: 200,
    bottom: 100, right: -50, borderRadius: 999, opacity: 0.2,
  },
  scroll: { flexGrow: 1 },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 50 },

  backBtn: { marginBottom: 28 },
  backText: { color: "#6b7280", fontSize: 14, fontWeight: "600" },

  logoWrap: { marginBottom: 24 },
  logoGrad: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  logoMark: { color: "#fff", fontSize: 22 },

  eyebrow: { color: "#7c3aed", fontSize: 11, fontWeight: "700", letterSpacing: 3, marginBottom: 6 },
  title: { color: "#fff", fontSize: 34, fontWeight: "800", letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { color: "#6b7280", fontSize: 14, fontWeight: "400" },

  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 28 },

  form: { gap: 18 },
  floatBox: {
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
    backgroundColor: "rgba(255,255,255,0.04)", position: "relative",
  },
  floatLabel: { position: "absolute", left: 16, fontWeight: "500" },
  floatInput: { color: "#fff", fontSize: 15, fontWeight: "500", paddingTop: 4 },

  strengthWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10, paddingHorizontal: 2 },
  strengthBars: { flexDirection: "row", gap: 4, flex: 1 },
  strengthSegment: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: "700", width: 44, textAlign: "right" },

  matchRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  matchDot: { width: 6, height: 6, borderRadius: 3 },
  matchText: { fontSize: 12, fontWeight: "600" },

  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginTop: 20 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: "#7c3aed", borderColor: "#7c3aed" },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "700" },
  termsText: { flex: 1, color: "#6b7280", fontSize: 13, lineHeight: 20 },
  termsLink: { color: "#a78bfa", fontWeight: "600" },

  buttonWrap: {
    borderRadius: 16, overflow: "hidden",
    shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },
  button: { paddingVertical: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  buttonArrow: { color: "#e9d5ff", fontSize: 18, fontWeight: "700" },

  orRow: { flexDirection: "row", alignItems: "center", marginTop: 28, marginBottom: 20, gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  orText: { color: "#4b5563", fontSize: 11, fontWeight: "700", letterSpacing: 2 },

  loginBtn: { alignItems: "center" },
  loginText: { color: "#6b7280", fontSize: 14 },
  loginLink: { color: "#a78bfa", fontWeight: "700" },
});