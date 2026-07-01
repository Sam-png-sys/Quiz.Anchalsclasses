import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";

const LOCAL_COMPLETIONS_KEY = "local_completed_quizzes";

const DashboardScreen = ({ navigation }) => {
  const { name, email, currentCourse, collegeName } = useContext(AuthContext);
  const { themeColors, accentOption, settings } = useAppSettings();

  const [quizzesCount, setQuizzesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    completedCount: 0,
    bestScore: null,
    totalAttempts: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchData = async () => {
    try {
      // 1. Fetch quizzes
      const quizRes = await API.get("/quiz/?page=1&limit=50");
      const quizData = Array.isArray(quizRes.data)
        ? quizRes.data
        : Array.isArray(quizRes.data.quizzes)
          ? quizRes.data.quizzes
          : Array.isArray(quizRes.data.data)
            ? quizRes.data.data
            : [];
      setQuizzesCount(quizData.length);

      // 2. Fetch server stats
      let serverSummary = {};
      try {
        const summaryRes = await API.get("/attempt/summary");
        serverSummary = summaryRes.data || {};
      } catch (err) {
        console.log("Server stats unavailable:", err.message);
      }

      // 3. Fetch local completions
      let localCompletions = {};
      try {
        const raw = await AsyncStorage.getItem(LOCAL_COMPLETIONS_KEY);
        localCompletions = raw ? JSON.parse(raw) : {};
      } catch (err) {
        console.log("Local completions unavailable:", err.message);
      }

      // 4. Combine completions
      const completedQuizIds = new Set([
        ...(serverSummary.completedQuizIds || []),
        ...Object.keys(localCompletions),
      ]);

      const bestScores = [
        serverSummary.bestScore,
        ...Object.values(localCompletions).map(c => c.bestScore)
      ].filter(score => typeof score === "number");

      const finalStats = {
        completedCount: completedQuizIds.size,
        totalAttempts: (serverSummary.totalAttempts || 0) + 
          Object.values(localCompletions).reduce((sum, item) => sum + (item.attempts || 1), 0),
        bestScore: bestScores.length ? Math.max(...bestScores) : null,
      };
      setStats(finalStats);

      // 5. Build recent activity list
      const activities = [];
      Object.entries(localCompletions).forEach(([qId, completion]) => {
        const quizObj = quizData.find(q => q._id === qId || q.id === qId);
        activities.push({
          id: qId,
          title: quizObj?.title || "Quiz Completed",
          course: quizObj?.course || "General",
          completedAt: completion.completedAt ? new Date(completion.completedAt) : new Date(),
          score: completion.bestScore,
        });
      });

      // Sort by newest completion date
      activities.sort((a, b) => b.completedAt - a.completedAt);
      setRecentActivity(activities.slice(0, 3));

    } catch (error) {
      console.log("Dashboard data load failed:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const displayName = name?.trim() || email.split("@")[0] || "Student";

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={accentOption.colors[0]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <LinearGradient
        colors={[themeColors.background, themeColors.backgroundAlt || themeColors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentOption.colors[0]} />
        }
      >
        {/* Header / Student Profile PFP */}
        <View style={styles.header}>
          <View style={styles.welcomeCol}>
            <Text style={[styles.greeting, { color: themeColors.textSubtle }]}>Welcome back,</Text>
            <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
          
          <View style={[styles.logoPfpContainer, { borderColor: accentOption.colors[0] }]}>
            <Image
              source={require("../assets/images/dranchal_logo.png")}
              style={styles.logoPfp}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Student Details Card */}
        <LinearGradient
          colors={accentOption.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoCard}
        >
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color="#ffffff" />
            <Text style={styles.infoText} numberOfLines={1}>
              {currentCourse || "No active course"}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 10 }]}>
            <Ionicons name="business-outline" size={20} color="#ffffff" />
            <Text style={styles.infoText} numberOfLines={1}>
              {collegeName || "Dr. Anchal's Classes Student"}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 10 }]}>
            <Ionicons name="mail-outline" size={20} color="#ffffff" />
            <Text style={styles.infoText} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: themeColors.text }]}>{quizzesCount}</Text>
            <Text style={[styles.statLbl, { color: themeColors.textSubtle }]}>Quizzes</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: themeColors.text }]}>{stats.completedCount}</Text>
            <Text style={[styles.statLbl, { color: themeColors.textSubtle }]}>Completed</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: themeColors.text }]}>
              {stats.bestScore != null ? `${stats.bestScore}%` : "—"}
            </Text>
            <Text style={[styles.statLbl, { color: themeColors.textSubtle }]}>Best Score</Text>
          </View>
        </View>

        {/* Navigation Grid (Quick Actions) */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate("Quizzes")}
          >
            <View style={[styles.iconRound, { backgroundColor: accentOption.colors[0] + "1A" }]}>
              <Ionicons name="book" size={24} color={accentOption.colors[0]} />
            </View>
            <Text style={[styles.actionTitle, { color: themeColors.text }]}>Quizzes</Text>
            <Text style={[styles.actionSub, { color: themeColors.textSubtle }]}>Practice papers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate("StudyNotes")}
          >
            <View style={[styles.iconRound, { backgroundColor: "#10b9811A" }]}>
              <Ionicons name="document-text" size={24} color="#10b981" />
            </View>
            <Text style={[styles.actionTitle, { color: themeColors.text }]}>Study Notes</Text>
            <Text style={[styles.actionSub, { color: themeColors.textSubtle }]}>View materials</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.actionGrid, { marginTop: 12 }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate("Analytics")}
          >
            <View style={[styles.iconRound, { backgroundColor: "#3b82f61A" }]}>
              <Ionicons name="analytics" size={24} color="#3b82f6" />
            </View>
            <Text style={[styles.actionTitle, { color: themeColors.text }]}>Analytics</Text>
            <Text style={[styles.actionSub, { color: themeColors.textSubtle }]}>Your score reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate("Settings")}
          >
            <View style={[styles.iconRound, { backgroundColor: "#8b5cf61A" }]}>
              <Ionicons name="settings" size={24} color="#8b5cf6" />
            </View>
            <Text style={[styles.actionTitle, { color: themeColors.text }]}>Settings</Text>
            <Text style={[styles.actionSub, { color: themeColors.textSubtle }]}>App preferences</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 24 }]}>Recent Activity</Text>
        {recentActivity.length === 0 ? (
          <View style={[styles.emptyActivity, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Ionicons name="calendar-outline" size={32} color={themeColors.textGhost || themeColors.textSubtle} />
            <Text style={[styles.emptyActivityTxt, { color: themeColors.textSubtle }]}>
              No recent attempts. Go ahead and start a quiz!
            </Text>
          </View>
        ) : (
          <View style={styles.activityList}>
            {recentActivity.map((activity, idx) => (
              <View
                key={activity.id + idx}
                style={[
                  styles.activityRow,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={[styles.activityIcon, { backgroundColor: accentOption.colors[0] + "1A" }]}>
                  <Ionicons name="checkmark-done-circle" size={22} color={accentOption.colors[0]} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityTitle, { color: themeColors.text }]} numberOfLines={1}>
                    {activity.title}
                  </Text>
                  <Text style={[styles.activityDate, { color: themeColors.textSubtle }]}>
                    {activity.course} • {activity.completedAt.toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.activityScore, { backgroundColor: activity.score >= 50 ? "#10b9811A" : "#ef44441A" }]}>
                  <Text style={[styles.activityScoreText, { color: activity.score >= 50 ? "#10b981" : "#ef4444" }]}>
                    {activity.score}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  welcomeCol: { flex: 1, marginRight: 10 },
  greeting: { fontSize: 14, fontWeight: "500" },
  name: { fontSize: 24, fontWeight: "800", marginTop: 2 },
  logoPfpContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoPfp: { width: 44, height: 44, borderRadius: 22 },
  infoCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoText: { color: "#ffffff", fontSize: 14, fontWeight: "600", marginLeft: 10, flex: 1 },
  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statNum: { fontSize: 20, fontWeight: "800" },
  statLbl: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  actionGrid: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  iconRound: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionTitle: { fontSize: 14, fontWeight: "700" },
  actionSub: { fontSize: 10, fontWeight: "400", marginTop: 2 },
  emptyActivity: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyActivityTxt: { fontSize: 13, textAlign: "center", marginTop: 10, lineHeight: 18 },
  activityList: { gap: 10 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: { flex: 1, marginRight: 8 },
  activityTitle: { fontSize: 14, fontWeight: "600" },
  activityDate: { fontSize: 11, marginTop: 2 },
  activityScore: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  activityScoreText: { fontSize: 12, fontWeight: "700" },
});

export default DashboardScreen;
