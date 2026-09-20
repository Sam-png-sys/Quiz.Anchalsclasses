import React, { useEffect, useState, useCallback } from "react";
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

export const getSavedTasks = async () => {
  try {
    const raw = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.log("Error reading saved tasks:", error.message);
    return [];
  }
};

export const saveTaskItem = async (taskItem) => {
  try {
    const existing = await getSavedTasks();
    // Check if task already exists
    const exists = existing.some((t) => t.quizId === taskItem.quizId);
    let updated;
    if (exists) {
      updated = existing.map((t) => (t.quizId === taskItem.quizId ? { ...t, ...taskItem } : t));
    } else {
      updated = [{ ...taskItem, addedAt: new Date().toISOString() }, ...existing];
    }
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.log("Error saving task item:", error.message);
    return false;
  }
};

export const removeTaskItem = async (quizId) => {
  try {
    const existing = await getSavedTasks();
    const updated = existing.filter((t) => t.quizId !== quizId);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.log("Error removing task item:", error.message);
    return null;
  }
};

const TaskScreen = ({ navigation }) => {
  const { themeColors, accentOption, settings } = useAppSettings();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRemove = (quizId, title) => {
    Alert.alert(
      "Remove Task",
      `Are you sure you want to remove "${title}" from your tasks?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const updated = await removeTaskItem(quizId);
            if (updated !== null) {
              setTasks(updated);
            }
          },
        },
      ]
    );
  };

  const renderTaskCard = ({ item }) => {
    const formattedDate = item.addedAt
      ? new Date(item.addedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Saved Task";

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
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: accentOption.colors[0] + "1A" }]}>
            <Ionicons name="checkbox-outline" size={22} color={accentOption.colors[0]} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={[styles.taskTitle, { color: themeColors.text }]} numberOfLines={2}>
              {item.title || "Quiz Task"}
            </Text>
            <Text style={[styles.taskMeta, { color: themeColors.textSubtle }]}>
              {item.course || "General"} • {item.subject || "Subject"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleRemove(item.quizId, item.title)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            {item.score != null && item.total != null && (
              <View style={[styles.badgePill, { backgroundColor: accentOption.colors[0] + "18" }]}>
                <Text style={[styles.badgeText, { color: accentOption.colors[0] }]}>
                  Last Score: {item.score}/{item.total} ({item.pct || 0}%)
                </Text>
              </View>
            )}
            <Text style={[styles.dateText, { color: themeColors.textGhost }]}>
              Added: {formattedDate}
            </Text>
          </View>

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
              <Ionicons name="play" size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnTxt}>Practice Quiz</Text>
            </LinearGradient>
          </TouchableOpacity>
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
          <Ionicons name="bookmark-outline" size={24} color={accentOption.colors[0]} style={{ marginRight: 10 }} />
          <View>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>My Saved Tasks</Text>
            <Text style={[styles.headerSub, { color: themeColors.textSubtle }]}>
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} for revision
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={accentOption.colors[0]} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.quizId}
          renderItem={renderTaskCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentOption.colors[0]} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIconWrap, { backgroundColor: accentOption.colors[0] + "15" }]}>
                <Ionicons name="clipboard-outline" size={54} color={accentOption.colors[0]} />
              </View>
              <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No Tasks Saved Yet</Text>
              <Text style={[styles.emptySub, { color: themeColors.textSubtle }]}>
                You can add quizzes to your task list from the result screen after completing any quiz!
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
  headerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 18, paddingBottom: 40 },
  taskCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleWrap: { flex: 1, marginRight: 8 },
  taskTitle: { fontSize: 15, fontWeight: "800", lineHeight: 20 },
  taskMeta: { fontSize: 12, fontWeight: "600", marginTop: 3 },
  deleteBtn: { padding: 8 },
  divider: { height: 1, marginVertical: 14 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
  infoRow: { flex: 1 },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  dateText: { fontSize: 11, fontWeight: "500" },
  actionBtnWrap: { borderRadius: 14, overflow: "hidden" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  actionBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "800" },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingTop: 80, paddingHorizontal: 30 },
  emptyIconWrap: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  emptySub: { fontSize: 14, lineHeight: 22, textAlign: "center", marginBottom: 24 },
  exploreBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 99, borderWidth: 1.5 },
  exploreBtnTxt: { fontSize: 14, fontWeight: "800" },
});
