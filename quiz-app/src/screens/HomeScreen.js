import React, { useEffect, useState, useRef, useContext } from "react";
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
} from "react-native";
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
          <View style={[styles.badge, { backgroundColor: colors[0] + "22" }]}>
            <Text style={[styles.badgeText, { color: colors[0] }]}>#{String(index + 1).padStart(2, "0")}</Text>
          </View>

          <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={2}>
            {item.title || "Untitled Quiz"}
          </Text>
          <Text style={[styles.cardDesc, { color: themeColors.textSubtle }]} numberOfLines={2}>
            {item.description || "Test your knowledge and challenge yourself"}
          </Text>

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
                <Text style={styles.startText}>Start</Text>
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [headerFade, headerSlide]);

  const fetchQuizzes = async () => {
    try {
      setError("");
      const res = await API.get("/quiz/?page=1&limit=10");
      if (Array.isArray(res.data)) setQuizzes(res.data);
      else if (Array.isArray(res.data.quizzes)) setQuizzes(res.data.quizzes);
      else if (Array.isArray(res.data.data)) setQuizzes(res.data.data);
      else setQuizzes([]);
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

  const ListHeader = () => (
    <Animated.View style={[styles.headerBlock, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.greeting, { color: themeColors.textSubtle }]}>Good day</Text>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>Your Quizzes</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate("Settings")}>
          <LinearGradient colors={accentOption.colors} style={styles.avatar}>
            <Text style={styles.avatarText}>{(email || "User").charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.statNumber, { color: themeColors.text }]}>{quizzes.length}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSubtle }]}>Available</Text>
        </View>
        <View
          style={[
            styles.statCard,
            {
              borderColor: accentOption.colors[0] + "55",
              backgroundColor: accentOption.colors[0] + (settings.theme === "light" ? "12" : "14"),
            },
          ]}
        >
          <Text style={[styles.statNumber, { color: themeColors.text }]}>0</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSubtle }]}>Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.statNumber, { color: themeColors.text }]}>—</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSubtle }]}>Best Score</Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: themeColors.textGhost }]}>ALL QUIZZES</Text>
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
        data={quizzes}
        keyExtractor={(item, i) => item._id?.toString() || item.id || i.toString()}
        renderItem={({ item, index }) => (
          <QuizCard
            item={item}
            index={index}
            themeColors={themeColors}
            onPress={() => navigation.navigate("Quiz", { quizId: item._id?.toString() || item.id })}
          />
        )}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyEyebrow, { color: accentOption.colors[0] }]}>Quiz Feed</Text>
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>{error ? "Unable to load quizzes" : "No quizzes yet"}</Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textSubtle }]}>
              {error || "Check back soon for new challenges"}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 2.5, marginBottom: 14 },
  card: {
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardAccent: { height: 3, width: "100%" },
  cardInner: { padding: 18 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6, letterSpacing: -0.2 },
  cardDesc: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
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
