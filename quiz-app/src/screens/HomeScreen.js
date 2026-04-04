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
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import API from "../api/client";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

const CATEGORY_COLORS = [
  ["#7c3aed", "#9333ea"],
  ["#0891b2", "#0e7490"],
  ["#db2777", "#9d174d"],
  ["#d97706", "#b45309"],
  ["#059669", "#047857"],
  ["#4f46e5", "#3730a3"],
];

const QuizCard = ({ item, index, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const colors = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
        style={styles.card}
      >
        {/* Accent bar */}
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardAccent} />

        <View style={styles.cardInner}>
          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: colors[0] + "22" }]}>
            <Text style={[styles.badgeText, { color: colors[0] }]}>
              #{String(index + 1).padStart(2, "0")}
            </Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title || "Untitled Quiz"}
          </Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description || "Test your knowledge and challenge yourself"}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              {item.question_count != null && (
                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>📝 {item.question_count} Qs</Text>
                </View>
              )}
              {item.duration != null && (
                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>⏱ {item.duration} min</Text>
                </View>
              )}
            </View>

            <View style={styles.startBtn}>
              <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startGrad}>
                <Text style={styles.startText}>Start →</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { setUserToken } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await API.get("/quiz?page=1&limit=10");
      if (Array.isArray(res.data)) setQuizzes(res.data);
      else if (Array.isArray(res.data.quizzes)) setQuizzes(res.data.quizzes);
      else if (Array.isArray(res.data.data)) setQuizzes(res.data.data);
      else setQuizzes([]);
    } catch {
      setQuizzes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchQuizzes(); };

  const ListHeader = () => (
    <Animated.View style={[styles.headerBlock, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Good day 👋</Text>
          <Text style={styles.headerTitle}>Your Quizzes</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn}>
          <LinearGradient colors={["#7c3aed", "#9333ea"]} style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{quizzes.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={[styles.statCard, styles.statCardMid]}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>—</Text>
          <Text style={styles.statLabel}>Best Score</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>ALL QUIZZES</Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={["#0a0a12", "#0f0a1e"]} style={StyleSheet.absoluteFill} />
        <View style={styles.loaderOrb}>
          <LinearGradient colors={["#7c3aed", "#4f46e5"]} style={{ flex: 1, borderRadius: 999 }} />
        </View>
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={styles.loaderText}>Loading quizzes…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0a0a12", "#0f0a1e", "#0a0a12"]} style={StyleSheet.absoluteFill} />

      {/* Background accent */}
      <View style={styles.bgOrb} pointerEvents="none">
        <LinearGradient colors={["#7c3aed", "#4f46e5"]} style={{ flex: 1, borderRadius: 999 }} />
      </View>

      <FlatList
        data={quizzes}
        keyExtractor={(item, i) => item._id?.toString() || item.id || i.toString()}
        renderItem={({ item, index }) => (
          <QuizCard
            item={item}
            index={index}
            onPress={() => navigation.navigate("Quiz", { quizId: item._id?.toString() || item.id })}
          />
        )}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No quizzes yet</Text>
            <Text style={styles.emptySubtitle}>Check back soon for new challenges</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
        }
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a12" },
  bgOrb: {
    position: "absolute", width: 300, height: 300,
    top: -100, right: -80, opacity: 0.15, borderRadius: 999,
  },

  loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a12" },
  loaderOrb: {
    position: "absolute", width: 250, height: 250,
    top: -50, right: -50, opacity: 0.2, borderRadius: 999,
  },
  loaderText: { color: "#6b7280", marginTop: 14, fontSize: 14, fontWeight: "500" },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },

  headerBlock: { paddingTop: 64, marginBottom: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  greeting: { color: "#6b7280", fontSize: 14, fontWeight: "500", marginBottom: 4 },
  headerTitle: { color: "#fff", fontSize: 30, fontWeight: "800", letterSpacing: -0.5 },
  avatarBtn: { marginTop: 4 },
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  statsRow: {
    flexDirection: "row", gap: 10, marginBottom: 32,
  },
  statCard: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16, padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  statCardMid: { borderColor: "rgba(124,58,237,0.3)", backgroundColor: "rgba(124,58,237,0.06)" },
  statNumber: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 2 },
  statLabel: { color: "#6b7280", fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },

  sectionLabel: {
    color: "#4b5563", fontSize: 11, fontWeight: "700", letterSpacing: 2.5, marginBottom: 14,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20, marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  cardAccent: { height: 3, width: "100%" },
  cardInner: { padding: 18 },
  badge: {
    alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, marginBottom: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  cardTitle: { color: "#fff", fontSize: 17, fontWeight: "700", marginBottom: 6, letterSpacing: -0.2 },
  cardDesc: { color: "#6b7280", fontSize: 13, lineHeight: 20, marginBottom: 16 },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaRow: { flexDirection: "row", gap: 8 },
  metaPill: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  metaText: { color: "#9ca3af", fontSize: 12, fontWeight: "500" },

  startBtn: { borderRadius: 10, overflow: "hidden" },
  startGrad: { paddingHorizontal: 16, paddingVertical: 8 },
  startText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  emptyWrap: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 8 },
  emptySubtitle: { color: "#6b7280", fontSize: 14 },
});