import React, { useState, useContext, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated,
    StatusBar,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import API from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");
const OTP_LENGTH = 6;

const OtpScreen = ({ navigation }) => {
    const { email, setUserToken } = useContext(AuthContext);
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const inputs = useRef([]);

    // Entrance animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    // Orb pulse
    const orbPulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, delay: 100, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, delay: 100, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(orbPulse, { toValue: 1.15, duration: 2500, useNativeDriver: true }),
                Animated.timing(orbPulse, { toValue: 1, duration: 2500, useNativeDriver: true }),
            ])
        ).start();

        // Resend countdown
        const interval = setInterval(() => {
            setResendTimer((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (text, index) => {
        if (text.length > 1) {
            // Handle paste
            const chars = text.slice(0, OTP_LENGTH).split("");
            const newOtp = [...otp];
            chars.forEach((c, i) => { if (index + i < OTP_LENGTH) newOtp[index + i] = c; });
            setOtp(newOtp);
            const nextIndex = Math.min(index + chars.length, OTP_LENGTH - 1);
            inputs.current[nextIndex]?.focus();
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
        console.log("🔥 VERIFY CLICKED");

        const finalOtp = otp.join(""); // ✅ FIX

        //console.log("OTP:", finalOtp);

        try {
            const response = await fetch(
                "http://192.168.1.6:8000/auth/verify-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        otp: finalOtp,
                    }),
                }
            );

            const data = await response.json();

            //console.log("✅ VERIFY RESPONSE:", data);

            if (!response.ok) {
                throw new Error(data.detail || "Invalid OTP");
            }

            const token = data.access_token;

            await AsyncStorage.setItem("token", token);
            setUserToken(token);

            navigation.replace("Home");

        } catch (error) {
            console.log("❌ VERIFY ERROR:", error);
            alert(error.message);
        }
    };

    const handlePressIn = () => Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

    const filledCount = otp.filter(Boolean).length;
    const progress = filledCount / OTP_LENGTH;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <View style={StyleSheet.absoluteFill}>
                <LinearGradient colors={["#0a0a12", "#0f0a1e", "#0a0a12"]} style={StyleSheet.absoluteFill} />
            </View>

            {/* Ambient orb */}
            <Animated.View style={[styles.orb, { transform: [{ scale: orbPulse }] }]}>
                <LinearGradient colors={["#7c3aed", "#4f46e5"]} style={{ flex: 1, borderRadius: 999 }} />
            </Animated.View>
            <View style={[styles.orb2]}>
                <LinearGradient colors={["#9333ea", "#db2777"]} style={{ flex: 1, borderRadius: 999 }} />
            </View>

            <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                {/* Back */}
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                {/* Icon */}
                <View style={styles.iconWrap}>
                    <LinearGradient colors={["#7c3aed", "#9333ea"]} style={styles.iconGrad}>
                        <Text style={styles.iconEmoji}>✉️</Text>
                    </LinearGradient>
                </View>

                <Text style={styles.eyebrow}>VERIFICATION</Text>
                <Text style={styles.title}>Check your email</Text>
                <Text style={styles.subtitle}>
                    We sent a {OTP_LENGTH}-digit code to{"\n"}
                    <Text style={styles.emailHighlight}>{email}</Text>
                </Text>

                {/* OTP Boxes */}
                <View style={styles.otpRow}>
                    {otp.map((digit, i) => (
                        <View key={i} style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}>
                            <TextInput
                                ref={(r) => (inputs.current[i] = r)}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={(t) => handleChange(t, i)}
                                onKeyPress={(e) => handleKeyPress(e, i)}
                                keyboardType="numeric"
                                maxLength={6}
                                selectionColor="#c4b5fd"
                                textAlign="center"
                                autoFocus={i === 0}
                            />
                            {digit ? (
                                <View style={styles.otpUnderlineFilled} />
                            ) : (
                                <View style={styles.otpUnderline} />
                            )}
                        </View>
                    ))}
                </View>

                {/* Progress bar */}
                <View style={styles.progressBg}>
                    <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressLabel}>{filledCount}/{OTP_LENGTH} digits entered</Text>

                {/* Verify Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 32 }}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={handleVerify}
                        style={styles.buttonWrap}
                    >
                        <LinearGradient
                            colors={filledCount === OTP_LENGTH ? ["#7c3aed", "#9333ea", "#a855f7"] : ["#1e1e2e", "#1e1e2e"]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            <Text style={[styles.buttonText, filledCount < OTP_LENGTH && { color: "#4b5563" }]}>
                                {loading ? "Verifying…" : "Verify Code"}
                            </Text>
                            {!loading && filledCount === OTP_LENGTH && <Text style={styles.buttonArrow}>→</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Resend */}
                <View style={styles.resendRow}>
                    <Text style={styles.resendLabel}>Didn't receive it? </Text>
                    {resendTimer > 0 ? (
                        <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
                    ) : (
                        <TouchableOpacity onPress={() => setResendTimer(30)}>
                            <Text style={styles.resendLink}>Resend code</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

export default OtpScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0a0a12" },
    orb: {
        position: "absolute", width: 280, height: 280,
        top: -60, right: -60, borderRadius: 999, opacity: 0.3,
    },
    orb2: {
        position: "absolute", width: 180, height: 180,
        bottom: 80, left: -40, borderRadius: 999, opacity: 0.2,
    },
    inner: { flex: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },
    backBtn: { marginBottom: 32 },
    backText: { color: "#6b7280", fontSize: 14, fontWeight: "600" },
    iconWrap: { marginBottom: 24 },
    iconGrad: {
        width: 56, height: 56, borderRadius: 18,
        alignItems: "center", justifyContent: "center",
        shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
    },
    iconEmoji: { fontSize: 24 },
    eyebrow: { color: "#7c3aed", fontSize: 11, fontWeight: "700", letterSpacing: 3, marginBottom: 6 },
    title: { color: "#fff", fontSize: 32, fontWeight: "800", letterSpacing: -0.5, marginBottom: 10 },
    subtitle: { color: "#6b7280", fontSize: 15, lineHeight: 22 },
    emailHighlight: { color: "#a78bfa", fontWeight: "600" },

    otpRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 40, gap: 8 },
    otpBox: {
        flex: 1, height: 60,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    otpBoxFilled: {
        borderColor: "rgba(167,139,250,0.5)",
        backgroundColor: "rgba(124,58,237,0.08)",
    },
    otpInput: { color: "#fff", fontSize: 22, fontWeight: "700", width: "100%", textAlign: "center" },
    otpUnderline: {
        position: "absolute", bottom: 8, left: "20%", right: "20%",
        height: 2, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)",
    },
    otpUnderlineFilled: {
        position: "absolute", bottom: 8, left: "20%", right: "20%",
        height: 2, borderRadius: 2, backgroundColor: "#7c3aed",
    },

    progressBg: {
        height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.06)",
        marginTop: 20, overflow: "hidden",
    },
    progressFill: { height: "100%", borderRadius: 2, backgroundColor: "#7c3aed" },
    progressLabel: { color: "#4b5563", fontSize: 12, marginTop: 8, fontWeight: "500" },

    buttonWrap: {
        borderRadius: 16, overflow: "hidden",
        shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
    },
    button: { paddingVertical: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
    buttonArrow: { color: "#e9d5ff", fontSize: 18, fontWeight: "700" },

    resendRow: { flexDirection: "row", justifyContent: "center", marginTop: 28, alignItems: "center" },
    resendLabel: { color: "#6b7280", fontSize: 14 },
    resendTimer: { color: "#4b5563", fontSize: 14, fontWeight: "600" },
    resendLink: { color: "#a78bfa", fontSize: 14, fontWeight: "700" },
});