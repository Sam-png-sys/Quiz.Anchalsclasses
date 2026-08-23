import React, { useEffect, useMemo, useState, useRef } from "react";
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
  BackHandler,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import API from "../api/client";

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
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, delay: index * 60, useNativeDriver: true }),
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

const FolderCard = ({ title, subTitle, badgeCount, completedCount, index, onPress, themeColors, iconName }) => {
  const colors = QUIZ_PALETTES[index % QUIZ_PALETTES.length];

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.folderCard,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
      ]}
    >
      <View style={[styles.folderIconWrap, { backgroundColor: colors[0] + "1A" }]}>
        <Ionicons name={iconName || "folder-open"} size={26} color={colors[0]} />
      </View>

      <View style={styles.folderInfo}>
        <Text style={[styles.folderTitle, { color: themeColors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.folderSubTitle, { color: themeColors.textSubtle }]} numberOfLines={1}>
          {subTitle}
        </Text>
      </View>

      <View style={styles.folderRight}>
        {badgeCount != null && (
          <View style={[styles.countPill, { backgroundColor: colors[0] + "18" }]}>
            <Text style={[styles.countPillText, { color: colors[0] }]}>{badgeCount}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={themeColors.textGhost || "#888"} />
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const { accentOption, themeColors, settings } = useAppSettings();
  const [quizzes, setQuizzes] = useState([]);

  // Hierarchy Navigation State: Course -> Subject -> SubSubject -> Quizzes
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSubSubject, setSelectedSubSubject] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const searchInputRef = useRef(null);

  // Hardware Back Handler for stepping back hierarchy levels
  useEffect(() => {
    const onBackPress = () => {
      if (selectedSubSubject !== null) {
        setSelectedSubSubject(null);
        return true;
      }
      if (selectedSubject !== null) {
        setSelectedSubject(null);
        return true;
      }
      if (selectedCourse !== null) {
        setSelectedCourse(null);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [selectedCourse, selectedSubject, selectedSubSubject]);

  const fetchQuizzes = async () => {
    try {
      setError("");
      // Fetch up to 1000 quizzes (all 98+ quizzes available)
      const quizRes = await API.get("/quiz/?page=1&limit=1000");
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

  // Derive Hierarchy Level Data
  const courseCards = useMemo(() => {
    const map = new Map();
    quizzes.forEach((q) => {
      const course = (q.course || "General").trim();
      if (!map.has(course)) {
        map.set(course, { title: course, totalQuizzes: 0, subjects: new Set(), completedCount: 0 });
      }
      const item = map.get(course);
      item.totalQuizzes += 1;
      if (q.subject) item.subjects.add(q.subject.trim());
      if (q.completed) item.completedCount += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [quizzes]);

  const subjectCards = useMemo(() => {
    if (!selectedCourse) return [];
    const map = new Map();
    quizzes.forEach((q) => {
      if ((q.course || "General").trim() === selectedCourse.trim()) {
        const subject = (q.subject || "General").trim();
        if (!map.has(subject)) {
          map.set(subject, { title: subject, totalQuizzes: 0, subSubjects: new Set(), completedCount: 0 });
        }
        const item = map.get(subject);
        item.totalQuizzes += 1;
        if (q.subSubject) item.subSubjects.add(q.subSubject.trim());
        if (q.completed) item.completedCount += 1;
      }
    });
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [quizzes, selectedCourse]);

  const subSubjectCards = useMemo(() => {
    if (!selectedCourse || !selectedSubject) return [];
    const map = new Map();
    quizzes.forEach((q) => {
      if (
        (q.course || "General").trim() === selectedCourse.trim() &&
        (q.subject || "General").trim() === selectedSubject.trim()
      ) {
        const sub = (q.subSubject || "General").trim();
        if (!map.has(sub)) {
          map.set(sub, { title: sub, totalQuizzes: 0, completedCount: 0 });
        }
        const item = map.get(sub);
        item.totalQuizzes += 1;
        if (q.completed) item.completedCount += 1;
      }
    });
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [quizzes, selectedCourse, selectedSubject]);

  const leafQuizzes = useMemo(() => {
    if (!selectedCourse || !selectedSubject || !selectedSubSubject) return [];
    return quizzes.filter(
      (q) =>
        (q.course || "General").trim() === selectedCourse.trim() &&
        (q.subject || "General").trim() === selectedSubject.trim() &&
        (q.subSubject || "General").trim() === selectedSubSubject.trim()
    );
  }, [quizzes, selectedCourse, selectedSubject, selectedSubSubject]);

  // Global Search Filtering across all 98+ quizzes
  const searchResults = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return null;

    const terms = query.split(/\s+/).filter(Boolean);
    return quizzes.filter((quiz) => {
      const text = [
        quiz.title,
        quiz.description,
        quiz.course,
        quiz.subject,
        quiz.subSubject,
        quiz.difficulty,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");

      return terms.every((t) => text.includes(t));
    });
  }, [quizzes, searchText]);

  // Handle Step Back in Hierarchy
  const handleStepBack = () => {
    if (selectedSubSubject) {
      setSelectedSubSubject(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    } else if (selectedCourse) {
      setSelectedCourse(null);
    }
  };

  // Determine current active level
  const isSearching = searchResults !== null;
  const currentLevel = isSearching
    ? "search"
    : selectedSubSubject
    ? "quizzes"
    : selectedSubject
    ? "subSubjects"
    : selectedCourse
    ? "subjects"
    : "courses";

  const primaryColor = accentOption?.colors?.[0] || "#7c3aed";

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <View style={styles.headerTop}>
        <View style={styles.titleWrap}>
          {currentLevel !== "courses" && currentLevel !== "search" && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleStepBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={themeColors.text} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>
              {isSearching
                ? "Search Results"
                : selectedSubSubject
                ? selectedSubSubject
                : selectedSubject
                ? selectedSubject
                : selectedCourse
                ? selectedCourse
                : "Course Catalog"}
            </Text>
            <Text style={[styles.greeting, { color: themeColors.textSubtle }]} numberOfLines={1}>
              {isSearching
                ? `Found ${searchResults.length} matching quiz${searchResults.length !== 1 ? "zes" : ""}`
                : selectedSubSubject
                ? `Select a quiz paper to begin`
                : selectedSubject
                ? `Choose a sub-subject`
                : selectedCourse
                ? `Choose a subject`
                : `Select a course to explore subjects & quizzes`}
            </Text>
          </View>
        </View>
      </View>

      {/* Breadcrumb Bar */}
      {!isSearching && (selectedCourse || selectedSubject || selectedSubSubject) && (
        <View style={[styles.breadcrumbRow, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <TouchableOpacity onPress={() => { setSelectedCourse(null); setSelectedSubject(null); setSelectedSubSubject(null); }}>
            <Text style={[styles.crumbText, { color: primaryColor }]}>Courses</Text>
          </TouchableOpacity>
          {selectedCourse && (
            <>
              <Ionicons name="chevron-forward" size={12} color={themeColors.textGhost} />
              <TouchableOpacity onPress={() => { setSelectedSubject(null); setSelectedSubSubject(null); }}>
                <Text style={[styles.crumbText, { color: selectedSubject ? primaryColor : themeColors.text }]} numberOfLines={1}>
                  {selectedCourse}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {selectedSubject && (
            <>
              <Ionicons name="chevron-forward" size={12} color={themeColors.textGhost} />
              <TouchableOpacity onPress={() => setSelectedSubSubject(null)}>
                <Text style={[styles.crumbText, { color: selectedSubSubject ? primaryColor : themeColors.text }]} numberOfLines={1}>
                  {selectedSubject}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {selectedSubSubject && (
            <>
              <Ionicons name="chevron-forward" size={12} color={themeColors.textGhost} />
              <Text style={[styles.crumbText, { color: themeColors.text }]} numberOfLines={1}>
                {selectedSubSubject}
              </Text>
            </>
          )}
        </View>
      )}

      {/* Search Input Bar */}
      <View style={[styles.searchBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Ionicons name="search-outline" size={18} color={themeColors.textGhost || "#888"} />
        <TextInput
          ref={searchInputRef}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search all 98+ quizzes by title or topic…"
          placeholderTextColor={themeColors.textGhost}
          style={[styles.searchInput, { color: themeColors.text }]}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {!!searchText && (
          <TouchableOpacity onPress={() => setSearchText("")} style={styles.clearSearchBtn}>
            <Ionicons name="close-circle" size={18} color={themeColors.textSubtle} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.sectionLabel, { color: themeColors.textGhost }]}>
        {currentLevel === "search"
          ? `MATCHING QUIZZES (${searchResults.length})`
          : currentLevel === "courses"
          ? `AVAILABLE COURSES (${courseCards.length})`
          : currentLevel === "subjects"
          ? `SUBJECTS IN ${selectedCourse.toUpperCase()} (${subjectCards.length})`
          : currentLevel === "subSubjects"
          ? `SUB-SUBJECTS IN ${selectedSubject.toUpperCase()} (${subSubjectCards.length})`
          : `QUIZZES IN ${selectedSubSubject.toUpperCase()} (${leafQuizzes.length})`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loaderWrap, { backgroundColor: themeColors.background }]}>
        <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
        <LinearGradient colors={[themeColors.background, themeColors.backgroundAlt]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.loaderText, { color: themeColors.textSubtle }]}>Loading catalog…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <LinearGradient colors={[themeColors.background, themeColors.backgroundAlt, themeColors.background]} style={StyleSheet.absoluteFill} />

      {currentLevel === "courses" && (
        <FlatList
          data={courseCards}
          keyExtractor={(item) => item.title}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <FolderCard
              title={item.title}
              subTitle={`${item.subjects.size} subjects • ${item.totalQuizzes} quizzes`}
              badgeCount={`${item.totalQuizzes} Qs`}
              completedCount={item.completedCount}
              index={index}
              iconName="school-outline"
              themeColors={themeColors}
              onPress={() => setSelectedCourse(item.title)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No courses found</Text>
              <Text style={[styles.emptySubtitle, { color: themeColors.textSubtle }]}>Check back later for new content</Text>
            </View>
          }
        />
      )}

      {currentLevel === "subjects" && (
        <FlatList
          data={subjectCards}
          keyExtractor={(item) => item.title}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <FolderCard
              title={item.title}
              subTitle={`${item.subSubjects.size || 1} sub-subjects • ${item.totalQuizzes} quizzes`}
              badgeCount={`${item.totalQuizzes} Qs`}
              completedCount={item.completedCount}
              index={index}
              iconName="book-outline"
              themeColors={themeColors}
              onPress={() => setSelectedSubject(item.title)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
        />
      )}

      {currentLevel === "subSubjects" && (
        <FlatList
          data={subSubjectCards}
          keyExtractor={(item) => item.title}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <FolderCard
              title={item.title}
              subTitle={`${item.totalQuizzes} quiz paper${item.totalQuizzes !== 1 ? "s" : ""}`}
              badgeCount={`${item.totalQuizzes}`}
              completedCount={item.completedCount}
              index={index}
              iconName="layers-outline"
              themeColors={themeColors}
              onPress={() => setSelectedSubSubject(item.title)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
        />
      )}

      {(currentLevel === "quizzes" || currentLevel === "search") && (
        <FlatList
          data={currentLevel === "search" ? searchResults : leafQuizzes}
          keyExtractor={(item, i) => item._id?.toString() || item.id || i.toString()}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <QuizCard
              item={item}
              index={index}
              themeColors={themeColors}
              onPress={() => navigation.navigate("Quiz", { quizId: item._id?.toString() || item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="documents-outline" size={48} color={themeColors.textGhost || "#888"} />
              <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
                {isSearching ? "No matching quizzes found" : "No quizzes in this section"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: themeColors.textSubtle }]}>
                {isSearching ? "Try searching with a different keyword" : "Select another subject or sub-subject"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 14, fontSize: 14, fontWeight: "500" },
  listContent: { paddingHorizontal: 18, paddingBottom: 40 },
  headerBlock: { paddingTop: 54, marginBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  titleWrap: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(150, 150, 150, 0.12)",
  },
  greeting: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  headerTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  crumbText: { fontSize: 12, fontWeight: "700" },
  searchBox: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: "600", paddingVertical: 8 },
  clearSearchBtn: { padding: 4 },
  sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.8, marginBottom: 12 },

  // Folder Level Cards
  folderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  folderIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  folderInfo: { flex: 1, marginRight: 10 },
  folderTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  folderSubTitle: { fontSize: 12, fontWeight: "500" },
  folderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  countPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  countPillText: { fontSize: 11, fontWeight: "800" },

  // Quiz Card
  card: {
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardAccent: { height: 3, width: "100%" },
  cardInner: { padding: 16 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10 },
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
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4, letterSpacing: -0.2 },
  cardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  cardTagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  cardTag: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: "100%",
  },
  cardTagText: { fontSize: 11, fontWeight: "800" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaRow: { flexDirection: "row", gap: 8 },
  metaPill: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  metaText: { fontSize: 11, fontWeight: "600" },
  startBtn: { borderRadius: 10, overflow: "hidden" },
  startGrad: { paddingHorizontal: 16, paddingVertical: 8 },
  startText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emptyWrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 12, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
});
