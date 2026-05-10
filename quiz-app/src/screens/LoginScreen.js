import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import API from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";

const { width } = Dimensions.get("window");

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
  }, [focused]);

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

// ── LoginScreen ───────────────────────────────────────────────────────────────
const LoginScreen = ({ navigation }) => {
  const { setEmail } = useContext(AuthContext);
  const { accentOption, themeColors, settings } = useAppSettings();
  const [email, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 650, delay: 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 56, friction: 12, delay: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await API.post("/auth/login", { email: email.trim(), password: password.trim() });
      setEmail(email.trim());
      navigation.navigate("Otp");
    } catch (e) {
      alert(e.response?.data?.detail || e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: themeColors.background }]} />
      <View style={[styles.glowA, { backgroundColor: accentOption.colors[0], opacity: settings.theme === "light" ? 0.08 : 0.12 }]} />
      <View style={[styles.glowB, { backgroundColor: accentOption.colors[1], opacity: settings.theme === "light" ? 0.08 : 0.14 }]} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Logo */}
            <View style={styles.logoWrap}>
              <LinearGradient colors={["#e5354a", "#b91c2e"]} style={styles.logoGrad}>
                <Text style={styles.logoText}>A</Text>
              </LinearGradient>
            </View>

            <Text style={[styles.title, { color: themeColors.text }]}>Log In</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSubtle }]}>Welcome back — sign in to continue</Text>

            {/* Form */}
            <View style={styles.form}>
              <PillInput placeholder="Email address" value={email} onChangeText={setEmailInput} keyboardType="email-address" themeColors={themeColors} accentColor={accentOption.colors[0]} />
              <PillInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry themeColors={themeColors} accentColor={accentOption.colors[0]} />
            </View>

            {/* Remember + Forgot */}
            <View style={styles.row}>
              <TouchableOpacity style={styles.checkRow} onPress={() => setRemember(r => !r)} activeOpacity={0.8}>
                <View style={[styles.checkbox, remember && styles.checkboxOn]}>
                  {remember && <Text style={styles.tick}>✓</Text>}
                </View>
                <Text style={[styles.rememberLabel, { color: themeColors.textSubtle }]}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.forgot, { color: accentOption.colors[0] }]}>Forgot Password</Text>
              </TouchableOpacity>
            </View>

            {/* Button */}
            <Animated.View style={[styles.btnWrap, { transform: [{ scale: btnScale }] }]}>
              <TouchableOpacity
                activeOpacity={1}
                onPressIn={() => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start()}
                onPress={handleLogin}
                style={styles.btnOuter}
              >
                <LinearGradient colors={accentOption.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                  <Text style={styles.btnText}>{loading ? "Logging in…" : "Log in"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* OR divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orLabel}>OR</Text>
              <View style={styles.orLine} />
            </View>

            {/* Sign up */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: themeColors.textSubtle }]}>Do not have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text style={[styles.footerLink, { color: accentOption.colors[0] }]}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#12112b" },
  glowA: { position: "absolute", top: -90, left: width / 2 - 110, width: 220, height: 220, borderRadius: 110, backgroundColor: "#e5354a", opacity: 0.07 },
  glowB: { position: "absolute", bottom: -70, right: width / 2 - 90, width: 180, height: 180, borderRadius: 90, backgroundColor: "#3b2fc9", opacity: 0.08 },

  scroll: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 26, paddingVertical: 60 },
  card: { width: "100%", maxWidth: 400, alignItems: "center" },

  logoWrap: { marginBottom: 26 },
  logoGrad: { width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: "#e5354a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  logoText: { color: "#fff", fontSize: 25, fontWeight: "800" },

  title: { color: "#fff", fontSize: 32, fontWeight: "800", letterSpacing: -0.5, marginBottom: 8, textAlign: "center" },
  subtitle: { color: "rgba(255,255,255,0.33)", fontSize: 14, textAlign: "center", marginBottom: 38 },

  form: { width: "100%", gap: 14, marginBottom: 18 },

  pill: { width: "100%", flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 100, paddingHorizontal: 22, paddingVertical: Platform.OS === "ios" ? 15 : 13 },
  pillInput: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "500", paddingVertical: 0 },
  showBtn: { color: "rgba(255,255,255,0.38)", fontSize: 13, fontWeight: "600", paddingLeft: 8 },

  row: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30, paddingHorizontal: 2 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: "#e5354a", borderColor: "#e5354a" },
  tick: { color: "#fff", fontSize: 10, fontWeight: "800" },
  rememberLabel: { color: "rgba(255,255,255,0.42)", fontSize: 13, fontWeight: "500" },
  forgot: { color: "#e5354a", fontSize: 13, fontWeight: "600" },

  btnWrap: { width: "100%", marginBottom: 30 },
  btnOuter: { width: "100%", borderRadius: 100, overflow: "hidden", shadowColor: "#e5354a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.36, shadowRadius: 18, elevation: 10 },
  btn: { paddingVertical: 17, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 0.2 },

  orRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 22 },
  orLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  orLabel: { color: "rgba(255,255,255,0.22)", fontSize: 11, fontWeight: "700", letterSpacing: 2 },

  footer: { flexDirection: "row", alignItems: "center" },
  footerText: { color: "rgba(255,255,255,0.36)", fontSize: 14 },
  footerLink: { color: "#e5354a", fontSize: 14, fontWeight: "700" },
});
