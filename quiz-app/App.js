import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import { AppSettingsProvider } from "./src/context/AppSettingsContext";
import AppNavigator from "./src/navigation/AppNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppSettingsProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AppSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
