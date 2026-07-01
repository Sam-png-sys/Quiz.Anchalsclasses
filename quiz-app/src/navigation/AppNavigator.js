import React, { useContext, useEffect, useRef } from "react";
import { Animated, StatusBar, StyleSheet, Text, View, Image } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import QuizScreen from "../screens/QuizScreen";
import ResultScreen from "../screens/ResultsScreen";
import SignUpScreen from "../screens/SignupScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StudyMaterialsScreen from "../screens/StudyMaterialsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import { AuthContext } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { themeColors, accentOption } = useAppSettings();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Quizzes") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "StudyNotes") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "Analytics") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else if (route.name === "SettingsTab") {
            iconName = focused ? "settings" : "settings-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: accentOption.colors[0],
        tabBarInactiveTintColor: themeColors.textGhost || themeColors.textSubtle,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Quizzes" component={HomeScreen} />
      <Tab.Screen name="StudyNotes" component={StudyMaterialsScreen} options={{ title: "Study Notes" }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: "Settings" }} />
    </Tab.Navigator>
  );
}

function StartupBuffer({ accentOption, themeColors, settings }) {
    const progress = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const progressLoop = Animated.loop(
            Animated.timing(progress, {
                toValue: 1,
                duration: 1150,
                useNativeDriver: true,
            })
        );
        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.06, duration: 650, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
            ])
        );

        progressLoop.start();
        pulseLoop.start();

        return () => {
            progressLoop.stop();
            pulseLoop.stop();
        };
    }, [progress, pulse]);

    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-96, 220],
    });

    return (
        <View style={[styles.loader, { backgroundColor: themeColors.background }]}>
            <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
            <View style={[styles.loaderOrb, { backgroundColor: accentOption.colors[0], opacity: settings.theme === "light" ? 0.08 : 0.14 }]} />
            <Animated.View style={[styles.loaderMarkWrap, { transform: [{ scale: pulse }] }]}>
                <View style={[styles.loaderMark, { backgroundColor: "#ffffff" }]}>
                    <Image
                        source={require("../assets/images/dranchal_logo.png")}
                        style={{ width: 72, height: 72, borderRadius: 22 }}
                        resizeMode="contain"
                    />
                </View>
            </Animated.View>
            <Text style={[styles.loaderTitle, { color: themeColors.text }]}>Dr. Anchal&apos;s Classes</Text>
            <Text style={[styles.loaderSubtitle, { color: themeColors.textSubtle }]}>Preparing your quizzes</Text>
            <View style={[styles.bufferTrack, { backgroundColor: themeColors.surfaceStrong }]}>
                <Animated.View style={[styles.bufferFill, { transform: [{ translateX }] }]}>
                    <LinearGradient colors={accentOption.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bufferGradient} />
                </Animated.View>
            </View>
        </View>
    );
}

const AppNavigator = () => {
    const { authLoading, userToken } = useContext(AuthContext);
    const { accentOption, themeColors, settings } = useAppSettings();

    if (authLoading) {
        return <StartupBuffer accentOption={accentOption} themeColors={themeColors} settings={settings} />;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken ? (
                <>
                    <Stack.Screen name="Home" component={TabNavigator} />
                    <Stack.Screen name="Quiz" component={QuizScreen} />
                    <Stack.Screen name="Result" component={ResultScreen} />
                    <Stack.Screen name="StudyMaterials" component={StudyMaterialsScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Otp" component={OtpScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingHorizontal: 28,
    },
    loaderOrb: {
        position: "absolute",
        width: 360,
        height: 360,
        top: -120,
        right: -120,
        borderRadius: 180,
    },
    loaderMarkWrap: {
        width: 82,
        height: 82,
        borderRadius: 26,
        overflow: "hidden",
        marginBottom: 22,
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.32,
        shadowRadius: 24,
        elevation: 10,
    },
    loaderMark: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loaderMarkText: {
        color: "#fff",
        fontSize: 34,
        fontWeight: "900",
    },
    loaderTitle: {
        fontSize: 22,
        fontWeight: "900",
        textAlign: "center",
        marginBottom: 6,
    },
    loaderSubtitle: {
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 26,
    },
    bufferTrack: {
        width: 220,
        height: 7,
        borderRadius: 99,
        overflow: "hidden",
    },
    bufferFill: {
        width: 96,
        height: 7,
        borderRadius: 99,
    },
    bufferGradient: {
        flex: 1,
        borderRadius: 99,
    },
});
