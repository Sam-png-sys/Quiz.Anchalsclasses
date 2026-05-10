import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import { AppSettingsProvider } from "./src/context/AppSettingsContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <AppSettingsProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AppSettingsProvider>
    </AuthProvider>
  );
}
