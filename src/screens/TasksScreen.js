import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ScrollView,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API from "../api/client";
import { useAppSettings } from "../context/AppSettingsContext";

const LOCAL_MY_TASKS_KEY = "my_task_questions";

// ---- Storage helpers (mirrors the ones used in ResultScreen.js) ----
const getMyTasks = async () => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_MY_TASKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.log("Reading My Tasks failed:", error?.message || error);
    return {};
  }
};

const removeMyTaskEntry = async (taskId) => {
  try {
    const tasks = await getMyTasks();
    delete tasks[taskId];
    await AsyncStorage.setItem(LOCAL_MY_TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.log("Removing from My Tasks failed:", error?.message || error);
  }
};

const TaskCard = ({ entry, index, delay, themeColors, accentOption, onRemove, onRetryQuiz }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 11, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  const status = entry.status || "wrong";
  const skipped = status === "skipped";
  const isCorrect = status === "correct";

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
      ]}
    >
      <View
        style={[
          styles.stripe,
          skipped ? styles.stripeSkipped : isCorrect ? styles.stripeCorrect : styles.stripeWrong,
        ]}
      />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.qIndex, { color: themeColors.textSubtle }]}>Q{index + 1}</Text>
          <View
            style={[
              styles.chip,
              skipped ? styles.chipSkipped : isCorrect ? styles.chipCorrect : styles.chipWrong,
            ]}
          >
            <Text
              style={[
                styles.chipTxt,
                skipped ? styles.chipTxtSkipped : isCorrect ? styles.chipTxtCorrect : styles.chipTxtWrong,
              ]}
            >
              {skipped ? "Skipped" : isCorrect ? "Correct" : "Wrong"}
            </Text>
          </View>
        </View>

        <Text style={[styles.question, { color: themeColors.textMuted }]} numberOfLines={4}>
          {entry.question}
        </Text>

        {!skipped && !isCorrect && entry.userAnswer != null && (
          <View style={styles.answerRow}>
            <Text style={[styles.answerLabel, { color: themeColors.textSubtle }]}>Your answer: </Text>
            <Text style={styles.answerWrong}>{entry.userAnswer}</Text>
          </View>
        )}
        <View style={styles.answerRow}>
          <Text style={[styles.answerLabel, { color: themeColors.textSubtle }]}>Correct: </Text>
          <Text style={styles.answerCorrect}>{entry.correctAnswer}</Text>
        </View>

        {!!entry.explanation && (
          <View
            style={[
              styles.explanationBox,
              { backgroundColor: accentOption.colors[0] + "10", borderColor: accentOption.colors[0] + "24" },
            ]}
          >
            <Text style={[styles.explanationLabel, { color: accentOption.colors[0] }]}>Explanation</Text>
            <Text style={[styles.explanationTxt, { color: themeColors.textMuted }]}>{entry.explanation}</Text>
          </View>
        )}

        <View style={styles.footerRow}>
          {!!entry.quizId && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => onRetryQuiz(entry.quizId)}
              style={[styles.footerBtn, { borderColor: themeColors.border }]}
            >
              <Ionicons name="refresh-outline" size={14} color={themeColors.textMuted} />
              <Text style={[styles.footerBtnTxt, { color: themeColors.textMuted }]}>Open Quiz</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onRemove(entry.taskId)}
            style={[styles.footerBtn, styles.removeBtn]}
          >
            <Ionicons name="trash-outline" size={14} color="#fca5a5" />
            <Text style={[styles.footerBtnTxt, { color: "#fca5a5" }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const TasksScreen = ({ navigation }) => {
  const { accentOption, themeColors, settings } = useAppSettings();

  const [tasks, setTasks] = useState({}); // { [taskId]: entry }
  const [filter, setFilter] = useState("all"); // all | correct | wrong | skipped
  const [refreshing, setRefreshing] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;

  const loadTasks = useCallback(async () => {
    const stored = await getMyTasks();
    setTasks(stored);
  }, []);

  // Reload every time this tab/screen comes into focus, since tasks are
  // added from ResultScreen and this screen won't auto-update otherwise.
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [headerFade]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const entries = useMemo(() => {
    const list = Object.values(tasks);
    list.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
    return list;
  }, [tasks]);

  const counts = useMemo(() => {
    return entries.reduce(
      (acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      },
      { correct: 0, wrong: 0, skipped: 0 }
    );
  }, [entries]);

  const visibleEntries = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.status === filter);
  }, [entries, filter]);

  const toggleFilter = (value) => {
    setFilter((current) => (current === value ? "all" : value));
  };

  const handleRemove = useCallback(async (taskId) => {
    // optimistic update
    setTasks((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    await removeMyTaskEntry(taskId);
    // best-effort backend sync, ignore failures
    API.delete(`/tasks/${taskId}`).catch(() => {});
  }, []);

  const handleRetryQuiz = useCallback(
    (quizId) => {
      navigation.navigate("Quiz", { quizId });
    },
    [navigation]
  );

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <LinearGradient
        colors={[themeColors.background, themeColors.backgroundAlt, themeColors.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.orb1, { backgroundColor: accentOption.colors[0] }]} pointerEvents="none" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentOption.colors[0]} />
        }
      >
        <Animated.View style={[styles.hero, { opacity: headerFade }]}>
          <Text style={[styles.heroTitle, { color: themeColors.text }]}>My Tasks</Text>
          <Text style={[styles.heroSub, { color: themeColors.textSubtle }]}>
            {entries.length} question{entries.length === 1 ? "" : "s"} saved for revision
          </Text>
        </Animated.View>

        <View style={styles.statsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleFilter("correct")}
            style={[styles.statCard, styles.statCardCorrect, filter === "correct" && styles.statCardActive]}
          >
            <Text style={[styles.statNum, { color: "#6ee7b7" }]}>{counts.correct}</Text>
            <Text style={[styles.statLbl, { color: themeColors.textSubtle }]}>Correct</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleFilter("wrong")}
            style={[styles.statCard, styles.statCardWrong, filter === "wrong" && styles.statCardActive]}
          >
            <Text style={[styles.statNum, { color: "#fca5a5" }]}>{counts.wrong}</Text>
            <Text style={[styles.statLbl, { color: themeColors.textSubtle }]}>Wrong</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleFilter("skipped")}
            style={[styles.statCard, styles.statCardSkipped, filter === "skipped" && styles.statCardActive]}
          >
            <Text style={[styles.statNum, { color: "#fcd34d" }]}>{counts.skipped}</Text>
            <Text style={[styles.statLbl, { color: themeColors.textSubtle }]}>Skipped</Text>
          </TouchableOpacity>
        </View>

        {filter !== "all" && (
          <TouchableOpacity onPress={() => setFilter("all")} style={styles.clearFilterBtn}>
            <Text style={[styles.clearFilterTxt, { color: accentOption.colors[0] }]}>Show all tasks</Text>
          </TouchableOpacity>
        )}

        {visibleEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={40} color={themeColors.textSubtle} />
            <Text style={[styles.emptyTitle, { color: themeColors.textMuted }]}>No tasks yet</Text>
            <Text style={[styles.emptySub, { color: themeColors.textSubtle }]}>
              Tap &quot;+ Add to My Task&quot; on any question in your quiz results to save it here for revision.
            </Text>
          </View>
        ) : (
          visibleEntries.map((entry, i) => (
            <TaskCard
              key={entry.taskId}
              entry={entry}
              index={i}
              delay={i * 50}
              themeColors={themeColors}
              accentOption={accentOption}
              onRemove={handleRemove}
              onRetryQuiz={handleRetryQuiz}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default TasksScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb1: { position: "absolute", width: 280, height: 280, top: -70, right: -70, borderRadius: 999, opacity: 0.1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 70, paddingBottom: 30 },
  hero: { marginBottom: 22 },
  heroTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { fontSize: 13, fontWeight: "500" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 18, padding: 16, alignItems: "center", borderWidth: 1 },
  statCardActive: { borderWidth: 2 },
  statCardCorrect: { backgroundColor: "rgba(5,150,105,0.08)", borderColor: "rgba(5,150,105,0.25)" },
  statCardWrong: { backgroundColor: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.25)" },
  statCardSkipped: { backgroundColor: "rgba(217,119,6,0.08)", borderColor: "rgba(217,119,6,0.25)" },
  statNum: { fontSize: 24, fontWeight: "900" },
  statLbl: { fontSize: 11, fontWeight: "600", marginTop: 2, letterSpacing: 0.5 },
  clearFilterBtn: { alignSelf: "center", marginBottom: 16 },
  clearFilterTxt: { fontSize: 13, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 6 },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  card: { flexDirection: "row", borderRadius: 18, marginBottom: 12, borderWidth: 1, overflow: "hidden" },
  stripe: { width: 4, flexShrink: 0 },
  stripeCorrect: { backgroundColor: "#059669" },
  stripeWrong: { backgroundColor: "#dc2626" },
  stripeSkipped: { backgroundColor: "#d97706" },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  qIndex: { fontSize: 12, fontWeight: "700" },
  chip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
  chipCorrect: { backgroundColor: "rgba(5,150,105,0.12)", borderColor: "rgba(5,150,105,0.35)" },
  chipWrong: { backgroundColor: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.35)" },
  chipSkipped: { backgroundColor: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.35)" },
  chipTxt: { fontSize: 11, fontWeight: "700" },
  chipTxtCorrect: { color: "#6ee7b7" },
  chipTxtWrong: { color: "#fca5a5" },
  chipTxtSkipped: { color: "#fcd34d" },
  question: { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  answerRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", marginTop: 2 },
  answerLabel: { fontSize: 12, fontWeight: "600" },
  answerCorrect: { color: "#6ee7b7", fontSize: 12, fontWeight: "700", flex: 1 },
  answerWrong: { color: "#fca5a5", fontSize: 12, fontWeight: "700", flex: 1 },
  explanationBox: { marginTop: 12, borderRadius: 12, borderWidth: 1, padding: 10 },
  explanationLabel: { fontSize: 11, fontWeight: "800", marginBottom: 6 },
  explanationTxt: { fontSize: 12, lineHeight: 18 },
  footerRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  removeBtn: { borderColor: "rgba(220,38,38,0.35)", backgroundColor: "rgba(220,38,38,0.08)" },
  footerBtnTxt: { fontSize: 11, fontWeight: "700" },
});