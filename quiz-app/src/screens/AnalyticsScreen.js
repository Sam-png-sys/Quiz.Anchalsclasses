import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api/client";
import { useAppSettings } from "../context/AppSettingsContext";

const LOCAL_COMPLETIONS_KEY = "local_completed_quizzes";

const AnalyticsScreen = ({ navigation }) => {
  const { themeColors, accentOption, settings } = useAppSettings();

  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalCompleted: 0,
    averageScore: 0,
    highestScore: 0,
    passingCount: 0, // Score >= 50%
  });

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all quizzes to cross-reference titles
      const quizRes = await API.get("/quiz/?page=1&limit=50");
      const quizList = Array.isArray(quizRes.data)
        ? quizRes.data
        : Array.isArray(quizRes.data.quizzes)
          ? quizRes.data.quizzes
          : Array.isArray(quizRes.data.data)
            ? quizRes.data.data
            : [];

      // Load local completed records
      const raw = await AsyncStorage.getItem(LOCAL_COMPLETIONS_KEY);
      const localCompletions = raw ? JSON.parse(raw) : {};

      // Map completions into list
      const list = Object.entries(localCompletions).map(([quizId, details]) => {
        const quiz = quizList.find(q => q._id === quizId || q.id === quizId);
        return {
          id: quizId,
          title: quiz?.title || "Unknown Quiz",
          course: quiz?.course || "General",
          subject: quiz?.subject || "General",
          attempts: details.attempts || 1,
          bestScore: details.bestScore || 0,
          completedAt: details.completedAt ? new Date(details.completedAt) : new Date(),
        };
      });

      // Sort by newest completion date
      list.sort((a, b) => b.completedAt - a.completedAt);
      setAttempts(list);

      // Calculate Metrics
      if (list.length > 0) {
        const total = list.length;
        const totalScore = list.reduce((sum, item) => sum + item.bestScore, 0);
        const avg = Math.round(totalScore / total);
        const highest = Math.max(...list.map(item => item.bestScore));
        const passing = list.filter(item => item.bestScore >= 50).length;

        setMetrics({
          totalCompleted: total,
          averageScore: avg,
          highestScore: highest,
          passingCount: passing,
        });
      }

    } catch (err) {
      console.log("Analytics loading error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const renderItem = ({ item }) => {
    const isPassing = item.bestScore >= 50;
    return (
      <View style={[styles.attemptRow, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <View style={[styles.badge, { backgroundColor: isPassing ? "#10b9811A" : "#ef44441A" }]}>
          <Text style={[styles.badgeText, { color: isPassing ? "#10b981" : "#ef4444" }]}>
            {item.bestScore}%
          </Text>
        </View>

        <View style={styles.details}>
          <Text style={[styles.quizTitle, { color: themeColors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.metaText, { color: themeColors.textSubtle }]}>
            {item.course} • {item.subject}
          </Text>
          <Text style={[styles.dateText, { color: themeColors.textGhost }]}>
            Last attempted: {item.completedAt.toLocaleDateString()} ({item.attempts} {item.attempts === 1 ? "attempt" : "attempts"})
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.retryBtn}
          onPress={() => navigation.navigate("Quiz", { quizId: item.id })}
        >
          <Ionicons name="refresh-outline" size={18} color={accentOption.colors[0]} />
          <Text style={[styles.retryText, { color: accentOption.colors[0] }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Analytics & Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accentOption.colors[0]} />
        </View>
      ) : (
        <FlatList
          data={attempts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={
            <>
              {/* Metrics Card */}
              <LinearGradient
                colors={accentOption.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricsCard}
              >
                <View style={styles.metricGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{metrics.totalCompleted}</Text>
                    <Text style={styles.metricLbl}>Completed</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{metrics.averageScore}%</Text>
                    <Text style={styles.metricLbl}>Average Score</Text>
                  </View>
                </View>

                <View style={[styles.metricGrid, { marginTop: 20 }]}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{metrics.highestScore}%</Text>
                    <Text style={styles.metricLbl}>Highest Score</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>
                      {metrics.totalCompleted > 0 
                        ? `${Math.round((metrics.passingCount / metrics.totalCompleted) * 100)}%` 
                        : "—"}
                    </Text>
                    <Text style={styles.metricLbl}>Success Rate</Text>
                  </View>
                </View>
              </LinearGradient>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Attempt Log</Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bar-chart-outline" size={64} color={themeColors.textSubtle} />
              <Text style={[styles.emptyText, { color: themeColors.textSubtle }]}>
                No completion logs found. Take quizzes to see your report analysis!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 20 },
  metricsCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 26,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  metricGrid: { flexDirection: "row", justifyContent: "space-around" },
  metricItem: { alignItems: "center" },
  metricVal: { color: "#ffffff", fontSize: 26, fontWeight: "900" },
  metricLbl: { color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: "500", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 14 },
  attemptRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  badgeText: { fontSize: 15, fontWeight: "900" },
  details: { flex: 1, marginRight: 10 },
  quizTitle: { fontSize: 14, fontWeight: "700" },
  metaText: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  dateText: { fontSize: 10, marginTop: 4 },
  retryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  retryText: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 50 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 15, lineHeight: 22 },
});

export default AnalyticsScreen;
