import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSettings } from "../context/AppSettingsContext";

export const TASKS_STORAGE_KEY = "user_saved_tasks";
export const LOCAL_MY_TASKS_KEY = "my_task_questions";

export const getSavedTasks = async () => {
  try {
    const raw = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "object" && parsed !== null) return Object.values(parsed);
    }
    // Also check legacy key if TASKS_STORAGE_KEY is empty
    const legacyRaw = await AsyncStorage.getItem(LOCAL_MY_TASKS_KEY);
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw);
      if (Array.isArray(parsedLegacy)) return parsedLegacy;
      if (typeof parsedLegacy === "object" && parsedLegacy !== null) return Object.values(parsedLegacy);
    }
    return [];
  } catch (error) {
    console.log("Error reading saved tasks:", error.message);
    return [];
  }
};

export const saveTaskItem = async (taskItem) => {
  try {
    const taskId =
      taskItem.taskId ||
      `${taskItem.quizId || "quiz"}_${taskItem.questionId || taskItem.questionIndex || Date.now()}`;
    const normalizedItem = {
      ...taskItem,
      taskId,
      addedAt: taskItem.addedAt || new Date().toISOString(),
    };
    const existing = await getSavedTasks();
    const filtered = existing.filter((t) => (t.taskId || t.id) !== taskId);
    const updated = [normalizedItem, ...filtered];
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.log("Error saving task item:", error.message);
    return false;
  }
};

export const removeTaskItem = async (taskId) => {
  try {
    const existing = await getSavedTasks();
    const updated = existing.filter((t) => (t.taskId || t.id || t.quizId) !== taskId);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.log("Error removing task item:", error.message);
    return null;
  }
};

export const isTaskItemSaved = async (taskId) => {
  try {
    const list = await getSavedTasks();
    return list.some((t) => (t.taskId || t.id) === taskId);
  } catch {
    return false;
  }
};

// Aliases for compatibility
export const getMyTasks = getSavedTasks;
export const saveMyTaskQuestion = saveTaskItem;
export const removeMyTaskEntry = removeTaskItem;

const TaskScreen = ({ navigation }) => {
  const { themeColors, accentOption, settings } = useAppSettings();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "wrong" | "skipped" | "correct"

  const loadTasks = useCallback(async () => {
    try {
      const list = await getSavedTasks();
      setTasks(list);
    } catch (error) {
      console.log("Task load failed:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadTasks();
    });
    loadTasks();
    return unsubscribe;
  }, [navigation, loadTasks]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleRemove = (taskId, questionText) => {
    const shortLabel =
      questionText && questionText.length > 50
        ? questionText.slice(0, 50) + "..."
        : questionText || "this task";

    Alert.alert(
      "Remove Task",
      `Remove "${shortLabel}" from your revision tasks?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const updated = await removeTaskItem(taskId);
            if (updated !== null) {
              setTasks(updated);
            }
          },
        },
      ]
    );
  };

  const counts = useMemo(() => {
    return tasks.reduce(
      (acc, item) => {
        const status = item.status || "wrong";
        if (status === "correct") acc.correct++;
        else if (status === "skipped") acc.skipped++;
        else acc.wrong++;
        return acc;
      },
      { all: tasks.length, wrong: 0, skipped: 0, correct: 0 }
    );
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((item) => (item.status || "wrong") === filter);
  }, [tasks, filter]);

  const renderTaskCard = ({ item }) => {
    const formattedDate = item.addedAt
      ? new Date(item.addedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Saved Task";

    const status = item.status || "wrong";
    const isCorrect = status === "correct";
    const isSkipped = status === "skipped";
    const isWrong = !isCorrect && !isSkipped;

    const statusLabel = isSkipped ? "Skipped" : isCorrect ? "Correct" : "Wrong";
    const statusBg = isSkipped
      ? "rgba(217,119,6,0.12)"
      : isCorrect
      ? "rgba(5,150,105,0.12)"
      : "rgba(220,38,38,0.12)";
    const statusBorder = isSkipped
      ? "rgba(217,119,6,0.35)"
      : isCorrect
      ? "rgba(5,150,105,0.35)"
      : "rgba(220,38,38,0.35)";
    const statusColor = isSkipped ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444";
    const stripeColor = isSkipped ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444";

    const questionText = item.question || item.title || "Question";
    const quizTitle = item.quizTitle || item.title || "Quiz";
    const identifier = item.taskId || item.id || item.quizId;

    return (
      <View
        style={[
          styles.taskCard,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
        ]}
      >
        <View style={[styles.cardStripe, { backgroundColor: stripeColor }]} />

        <View style={styles.cardContent}>
          {/* Card Top Row */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeftWrap}>
              <View style={[styles.statusChip, { backgroundColor: statusBg, borderColor: statusBorder }]}>
                <Text style={[styles.statusChipTxt, { color: statusColor }]}>{statusLabel}</Text>
              </View>
              <Text style={[styles.quizMetaTxt, { color: themeColors.textSubtle }]} numberOfLines={1}>
                {quizTitle}
                {item.subject ? ` • ${item.subject}` : ""}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleRemove(identifier, questionText)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={17} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* Question Text */}
          <Text style={[styles.taskQuestion, { color: themeColors.text }]}>
            {questionText}
          </Text>

          {/* User & Correct Answer */}
          {item.userAnswer != null && isWrong && (
            <View style={styles.answerRow}>
              <Text style={[styles.answerLabel, { color: themeColors.textSubtle }]}>Your answer: </Text>
              <Text style={styles.answerWrong}>{item.userAnswer}</Text>
            </View>
          )}

          {item.correctAnswer ? (
            <View style={styles.answerRow}>
              <Text style={[styles.answerLabel, { color: themeColors.textSubtle }]}>Correct answer: </Text>
              <Text style={styles.answerCorrect}>{item.correctAnswer}</Text>
            </View>
          ) : null}

          {/* Explanation Box */}
          {!!item.explanation && (
            <View
              style={[
                styles.explanationBox,
                {
                  backgroundColor: accentOption.colors[0] + "0F",
                  borderColor: accentOption.colors[0] + "28",
                },
              ]}
            >
              <View style={styles.explanationHeader}>
                <Ionicons name="bulb-outline" size={14} color={accentOption.colors[0]} style={{ marginRight: 5 }} />
                <Text style={[styles.explanationLabel, { color: accentOption.colors[0] }]}>Explanation</Text>
              </View>
              <Text style={[styles.explanationTxt, { color: themeColors.textMuted }]}>
                {item.explanation}
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <Text style={[styles.dateText, { color: themeColors.textGhost }]}>
              Added: {formattedDate}
            </Text>

            {item.quizId ? (
              <TouchableOpacity
                style={styles.actionBtnWrap}
                onPress={() => navigation.navigate("Quiz", { quizId: item.quizId })}
              >
                <LinearGradient
                  colors={accentOption.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionBtn}
                >
                  <Ionicons name="play" size={13} color="#fff" style={{ marginRight: 5 }} />
                  <Text style={styles.actionBtnTxt}>Practice Quiz</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <LinearGradient
        colors={[themeColors.background, themeColors.backgroundAlt || themeColors.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: accentOption.colors[0] + "1A" }]}>
            <Ionicons name="bookmark-outline" size={22} color={accentOption.colors[0]} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>My Saved Tasks</Text>
            <Text style={[styles.headerSub, { color: themeColors.textSubtle }]}>
              {tasks.length} question{tasks.length === 1 ? "" : "s"} saved for revision
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterBar, { borderBottomColor: themeColors.border }]}>
        {[
          { key: "all", label: "All", count: counts.all, color: accentOption.colors[0] },
          { key: "wrong", label: "Wrong", count: counts.wrong, color: "#ef4444" },
          { key: "skipped", label: "Skipped", count: counts.skipped, color: "#f59e0b" },
          { key: "correct", label: "Correct", count: counts.correct, color: "#10b981" },
        ].map((tab) => {
          const isActive = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                isActive && {
                  borderBottomColor: tab.color,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterTabTxt,
                  { color: isActive ? tab.color : themeColors.textSubtle },
                  isActive && { fontWeight: "800" },
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  {
                    backgroundColor: isActive ? tab.color + "20" : themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeTxt,
                    { color: isActive ? tab.color : themeColors.textGhost },
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={accentOption.colors[0]} />
        </View>
      ) : (
        <FlatList
          data={visibleTasks}
          keyExtractor={(item, index) => item.taskId || item.id || item.quizId || String(index)}
          renderItem={renderTaskCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentOption.colors[0]} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIconWrap, { backgroundColor: accentOption.colors[0] + "15" }]}>
                <Ionicons name="clipboard-outline" size={50} color={accentOption.colors[0]} />
              </View>
              <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No Tasks Saved Yet</Text>
              <Text style={[styles.emptySub, { color: themeColors.textSubtle }]}>
                Tap "+ Add to Task" on any question in your quiz results to save it here for targeted revision!
              </Text>
              <TouchableOpacity
                style={[styles.exploreBtn, { borderColor: accentOption.colors[0] }]}
                onPress={() => navigation.navigate("Quizzes")}
              >
                <Text style={[styles.exploreBtnTxt, { color: accentOption.colors[0] }]}>Explore Quizzes</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

export default TaskScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  filterBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  filterTabTxt: { fontSize: 13, fontWeight: "600", marginRight: 6 },
  filterBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterBadgeTxt: { fontSize: 11, fontWeight: "700" },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 18, paddingBottom: 40 },
  taskCard: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardStripe: { width: 5, flexShrink: 0 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerLeftWrap: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  statusChipTxt: { fontSize: 11, fontWeight: "800" },
  quizMetaTxt: { fontSize: 12, fontWeight: "600", flex: 1 },
  deleteBtn: { padding: 4 },
  taskQuestion: { fontSize: 14, fontWeight: "700", lineHeight: 21, marginBottom: 10 },
  answerRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", marginTop: 3 },
  answerLabel: { fontSize: 12, fontWeight: "600" },
  answerWrong: { color: "#fca5a5", fontSize: 12, fontWeight: "700", flex: 1 },
  answerCorrect: { color: "#6ee7b7", fontSize: 12, fontWeight: "700", flex: 1 },
  explanationBox: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  explanationHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  explanationLabel: { fontSize: 11, fontWeight: "800" },
  explanationTxt: { fontSize: 12, lineHeight: 18 },
  divider: { height: 1, marginVertical: 12 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateText: { fontSize: 11, fontWeight: "500" },
  actionBtnWrap: { borderRadius: 12, overflow: "hidden" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  actionBtnTxt: { color: "#fff", fontSize: 12, fontWeight: "800" },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingTop: 80, paddingHorizontal: 30 },
  emptyIconWrap: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  emptyTitle: { fontSize: 19, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  emptySub: { fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 22 },
  exploreBtn: { paddingHorizontal: 22, paddingVertical: 11, borderRadius: 99, borderWidth: 1.5 },
  exploreBtnTxt: { fontSize: 13, fontWeight: "800" },
});
