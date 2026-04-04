import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import HomeScreen from "../screens/HomeScreen";
import QuizScreen from "../screens/QuizScreen";
import ResultScreen from "../screens/ResultScreen";
import SignUpScreen from "../screens/SignupScreen";


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;