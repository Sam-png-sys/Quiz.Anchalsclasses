import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// ─── Review card per question ────────────────────────────────────────────────
const ReviewCard = ({ question, userAnswer, index, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 11, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const isCorrect = userAnswer === question.correct_answer;
  const skipped = userAnswer === null || userAnswer === undefined;

  return (
    <Animated.View style={[styles.reviewCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Status stripe */}
      <View style={[
        styles.reviewStripe,
        skipped ? styles.stripeSkipped : isCorrect ? styles.stripeCorrect : styles.stripeWrong,
      ]} />

      <View style={styles.reviewBody}>
        {/* Q number + status chip */}
        <View style={styles.reviewTop}>
          <Text style={styles.reviewNum}>Q{index + 1}</Text>
          <View style={[
            styles.reviewChip,
            skipped ? styles.chipSkipped : isCorrect ? styles.chipCorrect : styles.chipWrong,
          ]}>
            <Text style={[
              styles.reviewChipTxt,
              skipped ? styles.chipTxtSkipped : isCorrect ? styles.chipTxtCorrect : styles.chipTxtWrong,
            ]}>
              {skipped ? "⏱ Skipped" : isCorrect ? "✓ Correct" : "✗ Wrong"}
            </Text>
          </View>
        </View>

        <Text style={styles.reviewQuestion} numberOfLines={3}>{question.question}</Text>

        {/* Answer rows */}
        {!skipped && !isCorrect && (
          <View style={styles.reviewAnswerRow}>
            <Text style={styles.reviewAnswerLabel}>Your answer: </Text>
            <Text style={styles.reviewAnswerWrong}>{userAnswer}</Text>
          </View>
        )}
        <View style={styles.reviewAnswerRow}>
          <Text style={styles.reviewAnswerLabel}>Correct: </Text>
          <Text style={styles.reviewAnswerCorrect}>{question.correct_answer}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── ResultScreen ────────────────────────────────────────────────────────────
const ResultScreen = ({ route, navigation }) => {
  const { answers, questions } = route.params;

  // ✅ Your exact scoring logic
  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correct_answer) score++;
  });

  const total = questions.length;
  const pct = Math.round((score / total) * 100);
  const skipped = Object.values(answers).filter((a) => a === null || a === undefined).length;
  const wrong = total - score - skipped;

  const grade = pct >= 80
    ? { label: "Excellent!", emoji: "🏆", colors: ["#059669", "#10b981"], textColor: "#6ee7b7" }
    : pct >= 60
      ? { label: "Good Job!", emoji: "⭐", colors: ["#d97706", "#f59e0b"], textColor: "#fcd34d" }
      : pct >= 40
        ? { label: "Keep Going!", emoji: "💪", colors: ["#7c3aed", "#9333ea"], textColor: "#a78bfa" }
        : { label: "Try Again!", emoji: "🔄", colors: ["#dc2626", "#ef4444"], textColor: "#fca5a5" };

  // Entrance animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(0.6)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;
  const statsSlide = useRef(new Animated.Value(30)).current;
  const statsFade = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(scoreScale, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.timing(scoreOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(statsFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(statsSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(barWidth, { toValue: pct / 100, duration: 800, useNativeDriver: false }),
      ]),
    ]).start();
  }, []);

  const animatedBarWidth = barWidth.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0a0a12", "#0f0a1e", "#0a0a12"]} style={StyleSheet.absoluteFill} />

      {/* Ambient orbs */}
      <View style={[styles.orb1, { backgroundColor: grade.colors[0] }]} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero section ── */}
        <Animated.View style={[styles.hero, { opacity: headerFade }]}>
          <Text style={styles.heroEmoji}>{grade.emoji}</Text>
          <Text style={[styles.heroLabel, { color: grade.textColor }]}>{grade.label}</Text>
          <Text style={styles.heroSub}>Quiz Complete</Text>
        </Animated.View>

        {/* ── Score circle ── */}
        <Animated.View style={[styles.scoreWrap, { opacity: scoreOpacity, transform: [{ scale: scoreScale }] }]}>
          <LinearGradient colors={grade.colors} style={styles.scoreRingOuter}>
            <View style={styles.scoreRingInner}>
              <Text style={styles.scorePct}>{pct}%</Text>
              <Text style={styles.scoreRatio}>{score} / {total}</Text>
              <Text style={styles.scoreCorrectLabel}>correct</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Score bar ── */}
        <Animated.View style={[styles.barSection, { opacity: statsFade, transform: [{ translateY: statsSlide }] }]}>
          <View style={styles.barBg}>
            <Animated.View style={[styles.barTrack, { width: animatedBarWidth }]}>
              <LinearGradient
                colors={grade.colors}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.barFill}
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* ── Stats row ── */}
        <Animated.View style={[styles.statsRow, { opacity: statsFade, transform: [{ translateY: statsSlide }] }]}>
          <View style={[styles.statCard, styles.statCardCorrect]}>
            <Text style={styles.statEmoji}>✓</Text>
            <Text style={[styles.statNum, { color: "#6ee7b7" }]}>{score}</Text>
            <Text style={styles.statLbl}>Correct</Text>
          </View>
          <View style={[styles.statCard, styles.statCardWrong]}>
            <Text style={styles.statEmoji}>✗</Text>
            <Text style={[styles.statNum, { color: "#fca5a5" }]}>{wrong}</Text>
            <Text style={styles.statLbl}>Wrong</Text>
          </View>
          <View style={[styles.statCard, styles.statCardSkipped]}>
            <Text style={styles.statEmoji}>⏱</Text>
            <Text style={[styles.statNum, { color: "#fcd34d" }]}>{skipped}</Text>
            <Text style={styles.statLbl}>Skipped</Text>
          </View>
        </Animated.View>

        {/* ── Action buttons ── */}
        <Animated.View style={[styles.btnRow, { opacity: statsFade }]}>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => navigation.replace("Home")}
          >
            <Text style={styles.btnSecTxt}>← Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnPrimaryWrap}
            onPress={() => {
              const quizId = route.params?.quizId;

              if (!quizId) {
                console.log("❌ Quiz ID missing");
                navigation.replace("Home"); // fallback
                return;
              }

              navigation.replace("Quiz", { quizId });
            }}
          >
            <LinearGradient
              colors={grade.colors}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryTxt}>Retry ↺</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Review section ── */}
        <Animated.View style={{ opacity: statsFade }}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewHeaderLine} />
            <Text style={styles.reviewHeaderTxt}>QUESTION REVIEW</Text>
            <View style={styles.reviewHeaderLine} />
          </View>

          {questions.map((q, i) => (
            <ReviewCard
              key={i}
              question={q}
              userAnswer={answers[i]}
              index={i}
              delay={i * 60}
            />
          ))}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a12" },
  orb1: { position: "absolute", width: 320, height: 320, top: -80, right: -80, borderRadius: 999, opacity: 0.12 },
  orb2: { position: "absolute", width: 200, height: 200, bottom: 100, left: -60, borderRadius: 999, backgroundColor: "#7c3aed", opacity: 0.07 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 70, paddingBottom: 30 },

  // Hero
  hero: { alignItems: "center", marginBottom: 28 },
  heroEmoji: { fontSize: 52, marginBottom: 10 },
  heroLabel: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { color: "#6b7280", fontSize: 14, fontWeight: "500" },

  // Score circle
  scoreWrap: { alignItems: "center", marginBottom: 28 },
  scoreRingOuter: {
    width: 160, height: 160, borderRadius: 80,
    padding: 4, alignItems: "center", justifyContent: "center",
    shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 12,
  },
  scoreRingInner: {
    width: 148, height: 148, borderRadius: 74,
    backgroundColor: "#0a0a12",
    alignItems: "center", justifyContent: "center",
  },
  scorePct: { color: "#fff", fontSize: 42, fontWeight: "900", letterSpacing: -2 },
  scoreRatio: { color: "#6b7280", fontSize: 15, fontWeight: "600", marginTop: 2 },
  scoreCorrectLabel: { color: "#4b5563", fontSize: 11, fontWeight: "600", letterSpacing: 1 },

  // Bar
  barSection: { marginBottom: 22 },
  barBg: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4, width: "100%" },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: 18, padding: 16,
    alignItems: "center", borderWidth: 1,
  },
  statCardCorrect: { backgroundColor: "rgba(5,150,105,0.08)", borderColor: "rgba(5,150,105,0.25)" },
  statCardWrong: { backgroundColor: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.25)" },
  statCardSkipped: { backgroundColor: "rgba(217,119,6,0.08)", borderColor: "rgba(217,119,6,0.25)" },
  statEmoji: { fontSize: 18, marginBottom: 6 },
  statNum: { fontSize: 26, fontWeight: "900" },
  statLbl: { color: "#6b7280", fontSize: 11, fontWeight: "600", marginTop: 2, letterSpacing: 0.5 },

  // Buttons
  btnRow: { flexDirection: "row", gap: 12, marginBottom: 36 },
  btnSecondary: {
    flex: 1, borderRadius: 16, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 16, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  btnSecTxt: { color: "#9ca3af", fontWeight: "700", fontSize: 15 },
  btnPrimaryWrap: { flex: 1, borderRadius: 16, overflow: "hidden" },
  btnPrimary: { paddingVertical: 16, alignItems: "center" },
  btnPrimaryTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },

  // Review
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  reviewHeaderLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  reviewHeaderTxt: { color: "#4b5563", fontSize: 11, fontWeight: "700", letterSpacing: 2.5 },

  reviewCard: {
    flexDirection: "row", borderRadius: 18, marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  reviewStripe: { width: 4, flexShrink: 0 },
  stripeCorrect: { backgroundColor: "#059669" },
  stripeWrong: { backgroundColor: "#dc2626" },
  stripeSkipped: { backgroundColor: "#d97706" },

  reviewBody: { flex: 1, padding: 14 },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  reviewNum: { color: "#6b7280", fontSize: 12, fontWeight: "700" },
  reviewChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
  chipCorrect: { backgroundColor: "rgba(5,150,105,0.12)", borderColor: "rgba(5,150,105,0.35)" },
  chipWrong: { backgroundColor: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.35)" },
  chipSkipped: { backgroundColor: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.35)" },
  reviewChipTxt: { fontSize: 11, fontWeight: "700" },
  chipTxtCorrect: { color: "#6ee7b7" },
  chipTxtWrong: { color: "#fca5a5" },
  chipTxtSkipped: { color: "#fcd34d" },

  reviewQuestion: { color: "#d1d5db", fontSize: 13, lineHeight: 20, marginBottom: 10 },
  reviewAnswerRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", marginTop: 2 },
  reviewAnswerLabel: { color: "#6b7280", fontSize: 12, fontWeight: "600" },
  reviewAnswerCorrect: { color: "#6ee7b7", fontSize: 12, fontWeight: "700", flex: 1 },
  reviewAnswerWrong: { color: "#fca5a5", fontSize: 12, fontWeight: "700", flex: 1 },
});