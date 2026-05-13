import React, { useContext } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import QuizScreen from "../screens/QuizScreen";
import ResultScreen from "../screens/ResultsScreen";
import SignUpScreen from "../screens/SignupScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { AuthContext } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { authLoading, userToken } = useContext(AuthContext);
    const { accentOption, themeColors, settings } = useAppSettings();

    if (authLoading) {
        return (
            <View style={[styles.loader, { backgroundColor: themeColors.background }]}>
                <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
                <ActivityIndicator size="large" color={accentOption.colors[0]} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken ? (
                <>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="Quiz" component={QuizScreen} />
                    <Stack.Screen name="Result" component={ResultScreen} />
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
    },
});
