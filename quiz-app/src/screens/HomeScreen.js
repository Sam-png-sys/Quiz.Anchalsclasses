import React, { useEffect, useMemo, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  StatusBar,
  RefreshControl,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import API from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";

const QUIZ_PALETTES = [
  ["#7c3aed", "#9333ea"],
  ["#0891b2", "#0e7490"],
  ["#db2777", "#9d174d"],
  ["#d97706", "#b45309"],
  ["#059669", "#047857"],
  ["#4f46e5", "#3730a3"],
];

const LOCAL_COMPLETIONS_KEY = "local_completed_quizzes";

const getLocalAttemptSummary = async () => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_COMPLETIONS_KEY);
    const completions = raw ? JSON.parse(raw) : {};
    const items = Object.values(completions);
    const bestScore = items.reduce((best, item) => {
      if (typeof item.bestScore !== "number") return best;
      return best == null ? item.bestScore : Math.max(best, item.bestScore);
    }, null);

    return {
      completedCount: Object.keys(completions).length,
      completedQuizIds: Object.keys(completions),
      totalAttempts: items.reduce((total, item) => total + (item.attempts || 1), 0),
      bestScore,
    };
  } catch (error) {
    console.log("Local attempt summary unavailable:", error?.message || error);
    return {
      completedCount: 0,
      completedQuizIds: [],
      totalAttempts: 0,
      bestScore: null,
    };
  }
};

const mergeAttemptSummaries = (serverSummary, localSummary) => {
  const completedIds = new Set([
    ...(serverSummary.completedQuizIds || []),
    ...(localSummary.completedQuizIds || []),
  ]);
  const bestScores = [serverSummary.bestScore, localSummary.bestScore].filter((score) => typeof score === "number");

  return {
    completedCount: completedIds.size,
    completedQuizIds: Array.from(completedIds),
    totalAttempts: (serverSummary.totalAttempts || 0) + (localSummary.totalAttempts || 0),
    bestScore: bestScores.length ? Math.max(...bestScores) : null,
  };
};

const QuizCard = ({ item, index, onPress, themeColors }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);

  const colors = QUIZ_PALETTES[index % QUIZ_PALETTES.length];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
        ]}
      >
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardAccent} />

        <View style={styles.cardInner}>
          <View style={styles.cardTopRow}>
            <View style={[styles.badge, { backgroundColor: colors[0] + "22" }]}>
              <Text style={[styles.badgeText, { color: colors[0] }]}>#{String(index + 1).padStart(2, "0")}</Text>
            </View>
            {item.completed && (
              <View style={[styles.completedBadge, { backgroundColor: "#05966922", borderColor: "#05966944" }]}>
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            )}
          </View>

          <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={2}>
            {item.title || "Untitled Quiz"}
          </Text>
          <Text style={[styles.cardDesc, { color: themeColors.textSubtle }]} numberOfLines={2}>
            {item.description || "Test your knowledge and challenge yourself"}
          </Text>

          <View style={styles.cardTagRow}>
            {!!item.course && (
              <View style={[styles.cardTag, { backgroundColor: colors[0] + "18", borderColor: colors[0] + "33" }]}>
                <Text style={[styles.cardTagText, { color: colors[0] }]} numberOfLines={1}>{item.course}</Text>
              </View>
            )}
            {!!item.subject && (
              <View style={[styles.cardTag, { backgroundColor: "#05966918", borderColor: "#05966933" }]}>
                <Text style={[styles.cardTagText, { color: "#059669" }]} numberOfLines={1}>{item.subject}</Text>
              </View>
            )}
            {!!item.subSubject && (
              <View style={[styles.cardTag, { backgroundColor: "#7c3aed18", borderColor: "#7c3aed33" }]}>
                <Text style={[styles.cardTagText, { color: "#7c3aed" }]} numberOfLines={1}>{item.subSubject}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              {item.question_count != null && (
                <View style={[styles.metaPill, { backgroundColor: themeColors.surfaceStrong }]}>
                  <Text style={[styles.metaText, { color: themeColors.textMuted }]}>{item.question_count} Qs</Text>
                </View>
              )}
              {item.duration != null && (
                <View style={[styles.metaPill, { backgroundColor: themeColors.surfaceStrong }]}>
                  <Text style={[styles.metaText, { color: themeColors.textMuted }]}>{item.duration} min</Text>
                </View>
              )}
            </View>

            <View style={styles.startBtn}>
              <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startGrad}>
                <Text style={styles.startText}>{item.completed ? "Retry" : "Start"}</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { email } = useContext(AuthContext);
  const { accentOption, themeColors, settings } = useAppSettings();
  const [quizzes, setQuizzes] = useState([]);
  const [attemptSummary, setAttemptSummary] = useState({
    completedCount: 0,
    completedQuizIds: [],
    bestScore: null,
  });
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [sortMode, setSortMode] = useState("title");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const searchInputRef = useRef(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [headerFade, headerSlide]);

  const fetchQuizzes = async () => {
    try {
      setError("");
      const quizRes = await API.get("/quiz/?page=1&limit=50");
      let serverSummary = {};
      try {
        const summaryRes = await API.get("/attempt/summary");
        serverSummary = summaryRes.data || {};
      } catch (summaryError) {
        console.log("Attempt summary unavailable:", summaryError.response?.status || summaryError.message);
      }
      const localSummary = await getLocalAttemptSummary();
      const summary = mergeAttemptSummaries(serverSummary, localSummary);
      const quizData = Array.isArray(quizRes.data)
        ? quizRes.data
        : Array.isArray(quizRes.data.quizzes)
          ? quizRes.data.quizzes
          : Array.isArray(quizRes.data.data)
            ? quizRes.data.data
            : [];
      const completedIds = new Set(summary.completedQuizIds || []);
      setAttemptSummary({
        completedCount: summary.completedCount || 0,
        completedQuizIds: summary.completedQuizIds || [],
        bestScore: summary.bestScore ?? null,
      });
      setQuizzes(quizData.map((quiz) => ({
        ...quiz,
        completed: completedIds.has(quiz._id?.toString() || quiz.id?.toString()),
      })));
    } catch (fetchError) {
      setQuizzes([]);
      const detail = fetchError.response?.data?.detail;
      setError(detail || "Could not load quizzes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuizzes();
  };

  const normalizedSearch = searchText.trim().toLowerCase();
  const availableCourses = useMemo(() => {
    const courses = Array.from(new Set(quizzes.map((quiz) => (quiz.course || "").trim()).filter(Boolean)));
    return ["all", ...courses.sort((a, b) => a.localeCompare(b))];
  }, [quizzes]);

  const availableSubjects = useMemo(() => {
    const subjects = Array.from(new Set(
      quizzes
        .filter((quiz) => courseFilter === "all" || (quiz.course || "").trim() === courseFilter)
        .map((quiz) => (quiz.subject || "").trim())
        .filter(Boolean)
    ));
    return ["all", ...subjects.sort((a, b) => a.localeCompare(b))];
  }, [courseFilter, quizzes]);

  useEffect(() => {
    if (!availableSubjects.includes(subjectFilter)) {
      setSubjectFilter("all");
    }
  }, [availableSubjects, subjectFilter]);

  const filteredQuizzes = useMemo(() => {
    const searchTerms = normalizedSearch.split(/\s+/).filter(Boolean);

    const filtered = quizzes.filter((quiz) => {
      const matchesFilter =
        filter === "all"
        || (filter === "completed" && quiz.completed)
        || (filter === "available" && !quiz.completed);
      const matchesCourse = courseFilter === "all" || (quiz.course || "").trim() === courseFilter;
      const matchesSubject = subjectFilter === "all" || (quiz.subject || "").trim() === subjectFilter;

      if (!matchesFilter || !matchesCourse || !matchesSubject) return false;
      if (!searchTerms.length) return true;

      const searchableText = [
        quiz.title,
        quiz.description,
        quiz.difficulty,
        quiz.course,
        quiz.subject,
        quiz.question_count != null ? `${quiz.question_count} questions` : "",
        quiz.duration != null ? `${quiz.duration} minutes` : "",
        quiz.id,
        quiz._id,
      ].map((value) => String(value || "").toLowerCase()).join(" ");

      return searchTerms.every((term) => searchableText.includes(term));
    });

    return filtered.sort((a, b) => {
      if (sortMode === "course") {
        const courseCompare = (a.course || "").localeCompare(b.course || "");
        if (courseCompare !== 0) return courseCompare;
      }
      if (sortMode === "subject") {
        const subjectCompare = (a.subject || "").localeCompare(b.subject || "");
        if (subjectCompare !== 0) return subjectCompare;
      }
      if (sortMode === "duration") {
        return (Number(a.duration) || 0) - (Number(b.duration) || 0);
      }
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [courseFilter, filter, normalizedSearch, quizzes, sortMode, subjectFilter]);

  const activeFilterCount = [
    filter !== "all",
    courseFilter !== "all",
    subjectFilter !== "all",
    sortMode !== "title",
  ].filter(Boolean).length;

  const listHeader = (
    <Animated.View style={[styles.headerBlock, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
      <View style={[styles.headerTop, { marginBottom: 16, marginTop: 15 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: themeColors.text, fontSize: 24 }]}>Quiz Papers</Text>
          <Text style={[styles.greeting, { color: themeColors.textSubtle }]}>Select a quiz to test your knowledge</Text>
        </View>
      </View>

      <View style={styles.searchAndMenuRow}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => searchInputRef.current?.focus()}
          style={[styles.searchBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
        >
          <Text style={[styles.searchIcon, { color: themeColors.textGhost }]}>Search</Text>
          <TextInput
            ref={searchInputRef}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search quizzes"
            placeholderTextColor={themeColors.textGhost}
            style={[styles.searchInput, { color: themeColors.text }]}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {!!searchText && (
            <TouchableOpacity onPress={() => setSearchText("")} style={styles.clearSearchBtn}>
              <Text style={[styles.clearSearchText, { color: themeColors.textSubtle }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setFiltersOpen((value) => !value)}
          style={[
            styles.menuButton,
            filtersOpen || activeFilterCount
              ? { backgroundColor: accentOption.colors[0], borderColor: accentOption.colors[0] }
              : { backgroundColor: themeColors.surface, borderColor: themeColors.border },
          ]}
        >
          <View style={[styles.menuLine, { backgroundColor: filtersOpen || activeFilterCount ? "#fff" : themeColors.textSubtle }]} />
          <View style={[styles.menuLine, { backgroundColor: filtersOpen || activeFilterCount ? "#fff" : themeColors.textSubtle }]} />
          <View style={[styles.menuLine, { backgroundColor: filtersOpen || activeFilterCount ? "#fff" : themeColors.textSubtle }]} />
          {activeFilterCount > 0 && (
            <View style={styles.menuBadge}>
              <Text style={styles.menuBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {filtersOpen && (
        <View style={[styles.organizePanel, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.organizeHeader}>
            <Text style={[styles.sortLabel, { color: themeColors.textGhost }]}>VIEW</Text>
            {activeFilterCount > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setFilter("all");
                  setCourseFilter("all");
                  setSubjectFilter("all");
                  setSortMode("title");
                }}
              >
                <Text style={[styles.clearFiltersText, { color: accentOption.colors[0] }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterRow}>
            {[
              { key: "all", label: "All" },
              { key: "available", label: "New" },
              { key: "completed", label: "Completed" },
            ].map((item) => {
              const active = filter === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.filterChip,
                    active
                      ? { backgroundColor: accentOption.colors[0], borderColor: accentOption.colors[0] }
                      : { backgroundColor: themeColors.surfaceStrong, borderColor: themeColors.border },
                  ]}
                  onPress={() => setFilter(item.key)}
                >
                  <Text style={[styles.filterChipText, { color: active ? "#fff" : themeColors.textSubtle }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.filterSectionTitle, { color: themeColors.textGhost }]}>SORT</Text>
          <View style={styles.sortRow}>
            {[
              { key: "title", label: "Title" },
              { key: "course", label: "Course" },
              { key: "subject", label: "Subject" },
              { key: "duration", label: "Duration" },
            ].map((item) => {
              const active = sortMode === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.sortChip,
                    active
                      ? { backgroundColor: accentOption.colors[0], borderColor: accentOption.colors[0] }
                      : { backgroundColor: themeColors.surfaceStrong, borderColor: themeColors.border },
                  ]}
                  onPress={() => setSortMode(item.key)}
                >
                  <Text style={[styles.sortChipText, { color: active ? "#fff" : themeColors.textSubtle }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.filterSectionTitle, { color: themeColors.textGhost }]}>COURSES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseChipRow}>
            {availableCourses.map((course) => {
              const active = courseFilter === course;
              const label = course === "all" ? "All Courses" : course;
              return (
                <TouchableOpacity
                  key={course}
                  style={[
                    styles.courseChip,
                    active
                      ? { backgroundColor: accentOption.colors[0], borderColor: accentOption.colors[0] }
                      : { backgroundColor: themeColors.surfaceStrong, borderColor: themeColors.border },
                  ]}
                  onPress={() => setCourseFilter(course)}
                >
                  <Text style={[styles.courseChipText, { color: active ? "#fff" : themeColors.textSubtle }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.filterSectionTitle, { color: themeColors.textGhost }]}>SUBJECTS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseChipRow}>
            {availableSubjects.map((subject) => {
              const active = subjectFilter === subject;
              const label = subject === "all" ? "All Subjects" : subject;
              return (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.courseChip,
                    active
                      ? { backgroundColor: accentOption.colors[0], borderColor: accentOption.colors[0] }
                      : { backgroundColor: themeColors.surfaceStrong, borderColor: themeColors.border },
                  ]}
                  onPress={() => setSubjectFilter(subject)}
                >
                  <Text style={[styles.courseChipText, { color: active ? "#fff" : themeColors.textSubtle }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <Text style={[styles.sectionLabel, { color: themeColors.textGhost }]}>
        {filter === "completed" ? "COMPLETED QUIZZES" : filter === "available" ? "NEW QUIZZES" : "ALL QUIZZES"} ({filteredQuizzes.length})
      </Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.loaderWrap, { backgroundColor: themeColors.background }]}>
        <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
        <LinearGradient colors={[themeColors.background, themeColors.backgroundAlt]} style={StyleSheet.absoluteFill} />
        <View style={styles.loaderOrb}>
          <LinearGradient colors={accentOption.colors} style={{ flex: 1, borderRadius: 999 }} />
        </View>
        <ActivityIndicator size="large" color={accentOption.colors[0]} />
        <Text style={[styles.loaderText, { color: themeColors.textSubtle }]}>Loading quizzes…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <LinearGradient colors={[themeColors.background, themeColors.backgroundAlt, themeColors.background]} style={StyleSheet.absoluteFill} />

      <View style={[styles.bgOrb, { opacity: settings.theme === "light" ? 0.08 : 0.15 }]} pointerEvents="none">
        <LinearGradient colors={accentOption.colors} style={{ flex: 1, borderRadius: 999 }} />
      </View>

      <FlatList
        data={filteredQuizzes}
        keyExtractor={(item, i) => item._id?.toString() || item.id || i.toString()}
        renderItem={({ item, index }) => (
          <QuizCard
            item={item}
            index={index}
            themeColors={themeColors}
            onPress={() => navigation.navigate("Quiz", { quizId: item._id?.toString() || item.id })}
          />
        )}
        ListHeaderComponent={listHeader}
        extraData={{ searchText, filter, attemptSummary, courseFilter, subjectFilter, sortMode }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyEyebrow, { color: accentOption.colors[0] }]}>Quiz Feed</Text>
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
              {error ? "Unable to load quizzes" : quizzes.length ? "No matching quizzes" : "No quizzes yet"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textSubtle }]}>
              {error || (quizzes.length ? "Try a different search or filter" : "Check back soon for new challenges")}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentOption.colors[0]} />
        }
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgOrb: {
    position: "absolute",
    width: 300,
    height: 300,
    top: -100,
    right: -80,
    borderRadius: 999,
  },
  loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderOrb: {
    position: "absolute",
    width: 250,
    height: 250,
    top: -50,
    right: -50,
    opacity: 0.2,
    borderRadius: 999,
  },
  loaderText: { marginTop: 14, fontSize: 14, fontWeight: "500" },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  headerBlock: { paddingTop: 64, marginBottom: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  greeting: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
  headerTitle: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5 },
  avatarBtn: { marginTop: 4 },
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 32 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statNumber: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  searchAndMenuRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  searchBox: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  menuLine: { width: 20, height: 2, borderRadius: 2 },
  menuBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  menuBadgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  searchIcon: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "600", paddingVertical: 10 },
  clearSearchBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  clearSearchText: { fontSize: 12, fontWeight: "800" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  organizePanel: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 18,
  },
  organizeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10 },
  organizeHint: { fontSize: 11, fontWeight: "700", flexShrink: 1, textAlign: "right" },
  clearFiltersText: { fontSize: 12, fontWeight: "900" },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  sortLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1.4, marginRight: 4 },
  sortChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortChipText: { fontSize: 12, fontWeight: "800" },
  filterSectionTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 1.8, marginBottom: 9, marginTop: 4 },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  filterChipText: { fontSize: 12, fontWeight: "800" },
  courseChipRow: { gap: 8, paddingBottom: 14 },
  courseChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  courseChipText: { fontSize: 12, fontWeight: "700" },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 2.5, marginBottom: 14 },
  card: {
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardAccent: { height: 3, width: "100%" },
  cardInner: { padding: 18 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  completedBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  completedBadgeText: { color: "#6ee7b7", fontSize: 11, fontWeight: "700" },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6, letterSpacing: -0.2 },
  cardDesc: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  cardTagRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 16 },
  cardTag: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    maxWidth: "100%",
  },
  cardTagText: { fontSize: 11, fontWeight: "800" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaRow: { flexDirection: "row", gap: 8 },
  metaPill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaText: { fontSize: 12, fontWeight: "500" },
  startBtn: { borderRadius: 10, overflow: "hidden" },
  startGrad: { paddingHorizontal: 16, paddingVertical: 8 },
  startText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emptyWrap: { alignItems: "center", paddingTop: 80 },
  emptyEyebrow: { fontSize: 12, fontWeight: "700", marginBottom: 10, letterSpacing: 1.4 },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
});
