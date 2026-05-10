import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { ACCENT_OPTIONS } from "../constants/appTheme";

function SectionCard({ title, subtitle, children, colors, themeColors }) {
  return (
    <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: colors[0] }]} />
        <View style={styles.sectionHeaderText}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.sectionSubtitle, { color: themeColors.textSubtle }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function SettingRow({ label, subtitle, themeColors, right }) {
  return (
    <View style={[styles.settingRow, { borderBottomColor: themeColors.borderSoft }]}>
      <View style={styles.settingTextWrap}>
        <Text style={[styles.settingLabel, { color: themeColors.text }]}>{label}</Text>
        {subtitle ? <Text style={[styles.settingSubtext, { color: themeColors.textSubtle }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const { email, setEmail, setUserToken } = useContext(AuthContext);
  const { settings, themeColors, accentOption, setTheme, setAccent, setNotification } = useAppSettings();

  const profile = useMemo(() => {
    const profileEmail = email || "student@dranchalclasses.in";
    const nameSeed = profileEmail.split("@")[0] || "student";
    const name = nameSeed
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Student";
    const phone = "Not added";
    return { name, profileEmail, phone };
  }, [email]);

  const handleLogout = () => {
    Alert.alert("Sign out", "Do you want to sign out from this device?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          setUserToken(null);
          setEmail("");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />

      <LinearGradient
        colors={[
          settings.theme === "light" ? themeColors.backgroundAlt : themeColors.background,
          settings.theme === "light" ? "#eef4ff" : themeColors.backgroundAlt,
          themeColors.background,
        ]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.bgOrb, { backgroundColor: accentOption.colors[0], opacity: settings.theme === "light" ? 0.08 : 0.16 }]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
          >
            <Text style={[styles.backButtonText, { color: themeColors.text }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient colors={accentOption.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Settings</Text>
              <Text style={styles.heroSubtitle}>Manage account, appearance and app preferences</Text>
            </View>
          </View>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaPill}>
              <Text style={styles.heroMetaLabel}>Student</Text>
            </View>
            <View style={styles.heroMetaPill}>
              <Text style={styles.heroMetaLabel}>{settings.theme === "light" ? "Light mode" : "Dark mode"}</Text>
            </View>
          </View>
        </LinearGradient>

        <SectionCard
          title="Profile"
          subtitle="Your current account information"
          colors={accentOption.colors}
          themeColors={themeColors}
        >
          <SettingRow
            label={profile.name}
            subtitle={profile.profileEmail}
            themeColors={themeColors}
            right={<Text style={[styles.rowTag, { color: accentOption.colors[0] }]}>Active</Text>}
          />
          <SettingRow
            label="Phone"
            subtitle={profile.phone}
            themeColors={themeColors}
            right={<Text style={[styles.rowValue, { color: themeColors.textMuted }]}>Profile</Text>}
          />
        </SectionCard>

        <SectionCard
          title="Appearance"
          subtitle="Switch the app mood and accent"
          colors={accentOption.colors}
          themeColors={themeColors}
        >
          <View style={styles.modeRow}>
            {[
              { id: "dark", label: "Dark" },
              { id: "light", label: "Light" },
            ].map((option) => {
              const active = settings.theme === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setTheme(option.id)}
                  style={[
                    styles.modeButton,
                    {
                      backgroundColor: active ? accentOption.colors[0] : themeColors.surfaceStrong,
                      borderColor: active ? accentOption.colors[0] : themeColors.border,
                    },
                  ]}
                >
                  <Text style={[styles.modeButtonText, { color: active ? "#ffffff" : themeColors.text }]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.swatchLabel, { color: themeColors.textSubtle }]}>Accent Color</Text>
          <View style={styles.swatchRow}>
            {ACCENT_OPTIONS.map((option) => {
              const active = settings.accent === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setAccent(option.id)}
                  style={[
                    styles.swatchWrap,
                    { borderColor: active ? themeColors.text : "transparent" },
                  ]}
                >
                  <LinearGradient colors={option.colors} style={styles.swatch} />
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        <SectionCard
          title="Notifications"
          subtitle="Control the nudges you receive"
          colors={accentOption.colors}
          themeColors={themeColors}
        >
          <SettingRow
            label="Quiz reminders"
            subtitle="Remind me about available quizzes"
            themeColors={themeColors}
            right={
              <Switch
                value={settings.notifications.quizReminders}
                onValueChange={(value) => setNotification("quizReminders", value)}
                thumbColor="#ffffff"
                trackColor={{ false: themeColors.border, true: accentOption.colors[0] }}
              />
            }
          />
          <SettingRow
            label="Result alerts"
            subtitle="Notify me when new scores are ready"
            themeColors={themeColors}
            right={
              <Switch
                value={settings.notifications.resultAlerts}
                onValueChange={(value) => setNotification("resultAlerts", value)}
                thumbColor="#ffffff"
                trackColor={{ false: themeColors.border, true: accentOption.colors[0] }}
              />
            }
          />
          <View style={styles.settingRowLast}>
            <View style={styles.settingTextWrap}>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>App updates</Text>
              <Text style={[styles.settingSubtext, { color: themeColors.textSubtle }]}>Let me know when something important changes</Text>
            </View>
            <Switch
              value={settings.notifications.appUpdates}
              onValueChange={(value) => setNotification("appUpdates", value)}
              thumbColor="#ffffff"
              trackColor={{ false: themeColors.border, true: accentOption.colors[0] }}
            />
          </View>
        </SectionCard>

        <SectionCard
          title="Account"
          subtitle="Session and support actions"
          colors={accentOption.colors}
          themeColors={themeColors}
        >
          <SettingRow
            label="Live API"
            subtitle="Connected to dranchalclasses.in"
            themeColors={themeColors}
            right={<Text style={[styles.rowValue, { color: themeColors.success }]}>Online</Text>}
          />
          <View style={styles.actionWrap}>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.logoutButton, { backgroundColor: themeColors.surfaceStrong, borderColor: themeColors.border }]}
            >
              <Text style={[styles.logoutText, { color: themeColors.danger }]}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgOrb: {
    position: "absolute",
    width: 240,
    height: 240,
    top: -80,
    right: -70,
    borderRadius: 999,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 36,
    gap: 16,
  },
  topBar: {
    marginBottom: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 4,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  heroAvatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroAvatarText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 18,
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroMetaPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  heroMetaLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  settingRowLast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    gap: 12,
  },
  settingTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  settingSubtext: {
    fontSize: 12,
    lineHeight: 18,
  },
  rowTag: {
    fontSize: 12,
    fontWeight: "700",
  },
  rowValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  swatchLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  swatchWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    padding: 3,
    borderWidth: 2,
  },
  swatch: {
    flex: 1,
    borderRadius: 999,
  },
  actionWrap: {
    paddingTop: 14,
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
