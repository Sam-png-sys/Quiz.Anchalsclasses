import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_THEMES, getAccentOption } from "../constants/appTheme";

const STORAGE_KEY = "app_settings_v1";

const defaultSettings = {
  theme: "dark",
  accent: "violet",
  notifications: {
    quizReminders: true,
    resultAlerts: true,
    appUpdates: false,
  },
};

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (mounted && parsed) {
          setSettings((prev) => ({
            ...prev,
            ...parsed,
            notifications: {
              ...prev.notifications,
              ...(parsed.notifications || {}),
            },
          }));
        }
      } catch (error) {
        console.log("SETTINGS LOAD ERROR", error?.message || error);
      } finally {
        if (mounted) setReady(true);
      }
    };

    loadSettings();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch((error) => {
      console.log("SETTINGS SAVE ERROR", error?.message || error);
    });
  }, [settings, ready]);

  const value = useMemo(() => {
    const accentOption = getAccentOption(settings.accent);
    const themeColors = APP_THEMES[settings.theme] || APP_THEMES.dark;

    return {
      ready,
      settings,
      themeColors,
      accentOption,
      setTheme: (theme) => setSettings((prev) => ({ ...prev, theme })),
      setAccent: (accent) => setSettings((prev) => ({ ...prev, accent })),
      setNotification: (key, value) =>
        setSettings((prev) => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [key]: value,
          },
        })),
    };
  }, [ready, settings]);

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }
  return context;
}
