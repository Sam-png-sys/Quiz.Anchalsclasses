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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import API from "../api/client";
import { AuthContext } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

// Floating orb component
const Orb = ({ style, color, delay }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay || 0),
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 4000,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration: 4000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
    });

    return (
        <Animated.View
            style={[style, { transform: [{ translateY }], opacity: 0.35 }]}
        >
            <LinearGradient
                colors={color}
                style={{ flex: 1, borderRadius: 999 }}
            />
        </Animated.View>
    );
};

// Animated label input
const FloatingInput = ({
    label,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
}) => {
    const [focused, setFocused] = useState(false);
    const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
    const borderAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(labelAnim, {
            toValue: focused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        Animated.timing(borderAnim, {
            toValue: focused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [focused, value]);

    const labelTop = labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [16, -10],
    });
    const labelSize = labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 11],
    });
    const labelColor = labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#6b7280", "#c4b5fd"],
    });

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["rgba(255,255,255,0.08)", "rgba(196,181,253,0.5)"],
    });

    return (
        <Animated.View
            style={[
                styles.floatBox,
                { borderColor },
            ]}
        >
            <Animated.Text
                style={[
                    styles.floatLabel,
                    { top: labelTop, fontSize: labelSize, color: labelColor },
                ]}
            >
                {label}
            </Animated.Text>
            <TextInput
                style={styles.floatInput}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                selectionColor="#c4b5fd"
                placeholderTextColor="transparent"
            />
        </Animated.View>
    );
};

const LoginScreen = ({ navigation }) => {
    const { setEmail } = useContext(AuthContext);
    const [email, setEmailInput] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Entrance animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 900,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 60,
                friction: 10,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handleLogin = async () => {
        console.log("🔥 LOGIN CLICKED");
        console.log("FULL URL:", `http://192.168.1.8:8000/auth/login`);

        try {
            const response = await fetch(
                "http://192.168.1.8:8000/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password.trim(),
                    }),
                }
            );

            const data = await response.json();

            console.log("✅ FETCH RESPONSE:", data);

            if (!response.ok) {
                throw new Error(data.detail || "Login failed");
            }

            setEmail(email.trim());
            navigation.navigate("Otp");

        } catch (error) {
            console.log("❌ FETCH ERROR:", error);
            alert(error.message);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* Background */}
            <View style={StyleSheet.absoluteFill}>
                <LinearGradient
                    colors={["#0a0a12", "#0f0a1e", "#0a0a12"]}
                    style={StyleSheet.absoluteFill}
                />
                {/* Orbs */}
                <Orb
                    style={styles.orb1}
                    color={["#7c3aed", "#4f46e5"]}
                    delay={0}
                />
                <Orb
                    style={styles.orb2}
                    color={["#9333ea", "#db2777"]}
                    delay={1200}
                />
                <Orb
                    style={styles.orb3}
                    color={["#3730a3", "#7c3aed"]}
                    delay={600}
                />
            </View>

            {/* Subtle grid overlay */}
            <View style={styles.grid} pointerEvents="none" />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.kav}
            >
                <Animated.View
                    style={[
                        styles.inner,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Logo mark */}
                    <View style={styles.logoWrap}>
                        <LinearGradient
                            colors={["#7c3aed", "#9333ea"]}
                            style={styles.logoGrad}
                        >
                            <Text style={styles.logoMark}>✦</Text>
                        </LinearGradient>
                    </View>

                    {/* Heading */}
                    <Text style={styles.eyebrow}>WELCOME BACK</Text>
                    <Text style={styles.title}>Sign In</Text>
                    <Text style={styles.subtitle}>Access your account to continue</Text>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Inputs */}
                    <View style={styles.form}>
                        <FloatingInput
                            label="Email address"
                            value={email}
                            onChangeText={setEmailInput}
                            keyboardType="email-address"
                        />
                        <FloatingInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {/* Forgot */}
                    <TouchableOpacity style={styles.forgotWrap}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>

                    {/* CTA Button */}
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <TouchableOpacity
                            activeOpacity={1}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={handleLogin}
                            style={styles.buttonWrap}
                        >
                            <LinearGradient
                                colors={["#7c3aed", "#9333ea", "#a855f7"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? "Signing in…" : "Continue"}
                                </Text>
                                {!loading && <Text style={styles.buttonArrow}>→</Text>}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* OR separator */}
                    <View style={styles.orRow}>
                        <View style={styles.orLine} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.orLine} />
                    </View>

                    {/* Sign up */}
                    <TouchableOpacity
                        style={styles.signupBtn}
                        onPress={() => navigation.navigate("SignUp")}
                    >
                        <Text style={styles.signupText}>
                            Don't have an account?{" "}
                            <Text style={styles.signupLink}>Create one</Text>
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#0a0a12",
    },

    /* Background orbs */
    orb1: {
        position: "absolute",
        width: 300,
        height: 300,
        top: -80,
        left: -80,
        borderRadius: 999,
    },
    orb2: {
        position: "absolute",
        width: 220,
        height: 220,
        top: height * 0.3,
        right: -60,
        borderRadius: 999,
    },
    orb3: {
        position: "absolute",
        width: 180,
        height: 180,
        bottom: 60,
        left: 20,
        borderRadius: 999,
    },

    /* Subtle dot grid */
    grid: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.04,
        backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
        backgroundSize: "28px 28px",
    },

    kav: { flex: 1 },

    inner: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 28,
        paddingBottom: 30,
    },

    /* Logo */
    logoWrap: {
        marginBottom: 28,
    },
    logoGrad: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    logoMark: {
        color: "#fff",
        fontSize: 22,
    },

    /* Headings */
    eyebrow: {
        color: "#7c3aed",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 3,
        marginBottom: 6,
    },
    title: {
        color: "#ffffff",
        fontSize: 36,
        fontWeight: "800",
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    subtitle: {
        color: "#6b7280",
        fontSize: 14,
        fontWeight: "400",
        letterSpacing: 0.2,
    },

    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.06)",
        marginVertical: 28,
    },

    /* Form */
    form: {
        gap: 20,
        marginBottom: 12,
    },
    floatBox: {
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
        backgroundColor: "rgba(255,255,255,0.04)",
        position: "relative",
    },
    floatLabel: {
        position: "absolute",
        left: 16,
        fontWeight: "500",
    },
    floatInput: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "500",
        paddingTop: 4,
    },

    /* Forgot */
    forgotWrap: {
        alignSelf: "flex-end",
        marginBottom: 24,
        marginTop: 4,
    },
    forgotText: {
        color: "#a78bfa",
        fontSize: 13,
        fontWeight: "600",
    },

    /* Button */
    buttonWrap: {
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    button: {
        paddingVertical: 17,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    buttonArrow: {
        color: "#e9d5ff",
        fontSize: 18,
        fontWeight: "700",
    },

    /* OR row */
    orRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 30,
        marginBottom: 20,
        gap: 12,
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.07)",
    },
    orText: {
        color: "#4b5563",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2,
    },

    /* Sign up */
    signupBtn: {
        alignItems: "center",
    },
    signupText: {
        color: "#6b7280",
        fontSize: 14,
    },
    signupLink: {
        color: "#a78bfa",
        fontWeight: "700",
    },
});