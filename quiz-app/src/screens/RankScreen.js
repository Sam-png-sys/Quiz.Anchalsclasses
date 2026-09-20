import React, { useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import API from "../api/client";
import { useAppSettings } from "../context/AppSettingsContext";
import { AuthContext } from "../context/AuthContext";

// Pull whatever the backend calls the score out of a leaderboard row.
const getEntryMarks = (entry) =>
  entry?.marks ?? entry?.achievedMarks ?? entry?.score ?? entry?.totalMarks ?? 0;

const getEntryName = (entry) =>
  entry?.name || entry?.fullName || entry?.username || entry?.email || "Student";

const getEntryEmail = (entry) => entry?.email || entry?.userEmail || null;

const medalForRank = (rank) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
};

const RankRow = ({ entry, rank, isMe, delay, themeColors, accentColor }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  const medal = medalForRank(rank);

  return (
    <Animated.View
      style={[
        styles.row,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: isMe ? `${accentColor}18` : themeColors.surface,
          borderColor: isMe ? accentColor : themeColors.border,
        },
      ]}
    >
      <View style={[styles.rankBadge, medal && styles.rankBadgeMedal]}>
        {medal ? (
          <Text style={styles.medalTxt}>{medal}</Text>
        ) : (
          <Text style={[styles.rankNum, { color: themeColors.textSubtle }]}>{rank}</Text>
        )}
      </View>

      <View style={styles.nameCol}>
        <Text style={[styles.nameTxt, { color: themeColors.text }]} numberOfLines={1}>
          {getEntryName(entry)}
          {isMe ? "  (You)" : ""}
        </Text>
        {!!getEntryEmail(entry) && (
          <Text style={[styles.emailTxt, { color: themeColors.textGhost }]} numberOfLines={1}>
            {getEntryEmail(entry)}
          </Text>
        )}
      </View>

      <View style={[styles.marksPill, { backgroundColor: isMe ? accentColor : themeColors.surfaceStrong }]}>
        <Text style={[styles.marksTxt, { color: isMe ? "#fff" : themeColors.text }]}>
          {getEntryMarks(entry)}
        </Text>
      </View>
    </Animated.View>
  );
};

const RankScreen = ({ route, navigation }) => {
  const { quizId, quizTitle, initialLeaderboard, currentEmail, currentMarks } = route.params || {};
  const { accentOption, themeColors, settings } = useAppSettings();
  const { email: contextEmail } = useContext(AuthContext);
  const myEmail = currentEmail || contextEmail;

  const [leaderboard, setLeaderboard] = useState(
    Array.isArray(initialLeaderboard) ? initialLeaderboard : null
  );
  const [loading, setLoading] = useState(!Array.isArray(initialLeaderboard));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [headerFade]);

  const fetchLeaderboard = useCallback(
    async ({ silent } = {}) => {
      if (!quizId) {
        setLoading(false);
        return;
      }
      try {
        if (!silent) setLoading(true);
        const res = await API.get(`/attempt/leaderboard/${quizId}`);
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.leaderboard)
          ? res.data.leaderboard
          : [];
        setLeaderboard(list);
        setError(null);
      } catch (err) {
        console.log("Leaderboard fetch failed:", err.response?.data?.detail || err.message);
        setError("Couldn't load rankings. Pull down to try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [quizId]
  );

  useEffect(() => {
    // If the Result screen's prefetch hadn't landed yet, fetch now.
    // If it had, quietly refresh in the background so the list is fresh.
    fetchLeaderboard({ silent: Array.isArray(initialLeaderboard) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaderboard({ silent: true });
  }, [fetchLeaderboard]);

  const sortedEntries = useMemo(() => {
    const list = Array.isArray(leaderboard) ? [...leaderboard] : [];
    if (myEmail && currentMarks != null) {
      const exists = list.some(
        (entry) => (getEntryEmail(entry) || "").toLowerCase() === myEmail.toLowerCase()
      );
      if (!exists) {
        list.push({
          email: myEmail,
          name: "You",
          marks: currentMarks,
          score: currentMarks,
        });
      }
    }
    list.sort((a, b) => getEntryMarks(b) - getEntryMarks(a));
    return list;
  }, [leaderboard, myEmail, currentMarks]);

  const myRankInfo = useMemo(() => {
    if (!myEmail) return null;
    const idx = sortedEntries.findIndex((entry) => getEntryEmail(entry) === myEmail);
    if (idx === -1) return null;
    return { rank: idx + 1, marks: getEntryMarks(sortedEntries[idx]) };
  }, [sortedEntries, myEmail]);

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <LinearGradient
        colors={[themeColors.background, themeColors.backgroundAlt, themeColors.background]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orb, { backgroundColor: accentOption.colors[0] }]} pointerEvents="none" />

      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
        >
          <Ionicons name="arrow-back" size={18} color={themeColors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>
            Rankings
          </Text>
          <Text style={[styles.headerSub, { color: themeColors.textSubtle }]} numberOfLines={1}>
            {quizTitle || "Quiz leaderboard"}
          </Text>
        </View>
      </Animated.View>

      {myRankInfo && (
        <Animated.View style={[styles.myRankBar, { opacity: headerFade }]}>
          <LinearGradient colors={accentOption.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.myRankGrad}>
            <Text style={styles.myRankTxt}>
              You are ranked #{myRankInfo.rank} · {currentMarks ?? myRankInfo.marks} marks
            </Text>
          </LinearGradient>
        </Animated.View>
      )}

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={accentOption.colors[0]} />
          <Text style={[styles.loadingTxt, { color: themeColors.textSubtle }]}>Loading rankings…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentOption.colors[0]} />
          }
        >
          {error && (
            <Text style={[styles.errorTxt, { color: "#fca5a5" }]}>{error}</Text>
          )}

          {!error && sortedEntries.length === 0 && (
            <View style={styles.centerWrap}>
              <Text style={[styles.emptyTxt, { color: themeColors.textSubtle }]}>
                No attempts yet. Be the first to appear here!
              </Text>
            </View>
          )}

          {sortedEntries.map((entry, i) => (
            <RankRow
              key={getEntryEmail(entry) || i}
              entry={entry}
              rank={i + 1}
              isMe={!!myEmail && getEntryEmail(entry) === myEmail}
              delay={Math.min(i, 12) * 45}
              themeColors={themeColors}
              accentColor={accentOption.colors[0]}
            />
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
};

export default RankScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb: { position: "absolute", width: 260, height: 260, top: -80, right: -70, borderRadius: 999, opacity: 0.1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  headerSub: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  myRankBar: { paddingHorizontal: 20, marginBottom: 14 },
  myRankGrad: { borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  myRankTxt: { color: "#fff", fontWeight: "800", fontSize: 13, letterSpacing: 0.2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 10 },
  loadingTxt: { fontSize: 13, fontWeight: "600" },
  emptyTxt: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  errorTxt: { fontSize: 13, fontWeight: "600", textAlign: "center", marginBottom: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 10,
  },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124,58,237,0.12)",
  },
  rankBadgeMedal: { backgroundColor: "transparent" },
  medalTxt: { fontSize: 20 },
  rankNum: { fontSize: 14, fontWeight: "800" },
  nameCol: { flex: 1 },
  nameTxt: { fontSize: 14, fontWeight: "700" },
  emailTxt: { fontSize: 11, fontWeight: "500", marginTop: 1 },
  marksPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, minWidth: 48, alignItems: "center" },
  marksTxt: { fontSize: 13, fontWeight: "800" },
});