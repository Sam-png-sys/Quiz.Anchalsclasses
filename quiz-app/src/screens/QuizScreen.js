import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import API from "../api/client";

const { width } = Dimensions.get("window");

const PALETTES = [
  { accent: ["#7c3aed", "#9333ea"], light: "#a78bfa", glow: "#7c3aed" },
  { accent: ["#0891b2", "#0e7490"], light: "#67e8f9", glow: "#0891b2" },
  { accent: ["#db2777", "#9d174d"], light: "#f9a8d4", glow: "#db2777" },
  { accent: ["#d97706", "#b45309"], light: "#fcd34d", glow: "#d97706" },
  { accent: ["#059669", "#047857"], light: "#6ee7b7", glow: "#059669" },
];

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

// ─── Timer Ring ──────────────────────────────────────────────────────────────
const TimerRing = ({ timeLeft, totalTime }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isUrgent = timeLeft <= 10;

  useEffect(() => {
    if (isUrgent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 380, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isUrgent]);

  const color = timeLeft > 20 ? "#a78bfa" : timeLeft > 10 ? "#fcd34d" : "#f87171";

  return (
    <Animated.View style={[styles.timerWrap, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.timerRingBg} />
      <View style={[styles.timerRingFill, { borderColor: color }]} />
      <View style={styles.timerInner}>
        <Text style={[styles.timerNum, { color }]}>{timeLeft}</Text>
        <Text style={styles.timerSec}>sec</Text>
      </View>
    </Animated.View>
  );
};

// ─── Option Button ─────────────────────────────────────────────────────────
// KEY FIX: `questionIndex` is passed as a prop and included in the useEffect
// dependency array so animations re-run (and selection resets) on each new question.
const OptionBtn = ({ label, text, selected, onPress, delay, questionIndex }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Re-animate every time the question changes
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 11, delay, useNativeDriver: true }),
    ]).start();
  }, [questionIndex]); // <-- depends on question index, not just mount

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => {
          Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 0.965, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
          ]).start();
          onPress();
        }}
        style={[styles.optBtn, selected ? styles.optSelected : styles.optDefault]}
      >
        <View style={[styles.optLabelBubble, selected ? styles.optLabelSel : styles.optLabelDef]}>
          <Text style={styles.optLabelTxt}>{label}</Text>
        </View>
        <Text style={[styles.optText, selected && styles.optTextSel]} numberOfLines={3}>
          {text}
        </Text>
        {selected && (
          <View style={styles.optCheckWrap}>
            <Text style={styles.optCheck}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main QuizScreen ─────────────────────────────────────────────────────────
const QuizScreen = ({ route, navigation }) => {
  const { quizId } = route.params;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null); // null = nothing picked yet
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);

  const timerRef = useRef(null);
  const TIMER_DURATION = 30;

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(width * 0.25)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // ── Fetch ──
  useEffect(() => {
    API.get(`/quiz/${quizId}/questions`)
      .then((res) => { setQuestions(res.data); setLoading(false); })
      .catch(() => {
        setLoading(false);
        Alert.alert("Error", "Failed to load questions", [
          { text: "Back", onPress: () => navigation.goBack() },
        ]);
      });
  }, []);

  // ── Per-question reset & animations ──
  useEffect(() => {
    if (!questions.length) return;

    // ✅ CRITICAL FIX: Explicitly reset selected to null on every question change.
    // Without this, React may retain the previous selected value in closure
    // even after setCurrent fires, causing ghost selections on the new question.
    setSelected(null);

    // Card entrance
    cardFade.setValue(0);
    cardSlide.setValue(width * 0.25);
    Animated.parallel([
      Animated.timing(cardFade, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
    ]).start();

    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    Animated.timing(progressAnim, {
      toValue: (current + 1) / questions.length,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Reset & start timer
    setTimeLeft(TIMER_DURATION);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Use functional updater to avoid stale closure on `current`
          setCurrent((c) => {
            const newAnswers = { ...answers, [c]: null };
            if (c < questions.length - 1) {
              setAnswers(newAnswers);
              return c + 1;
            } else {
              navigation.navigate("Result", { answers: newAnswers, questions , quizId });
              return c;
            }
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [current, questions.length]);

  const goNext = () => {
    clearInterval(timerRef.current);
    const newAnswers = { ...answers, [current]: selected };

    if (current < questions.length - 1) {
      setAnswers(newAnswers);
      //  Reset selected BEFORE incrementing current so the new question
      // renders with a clean slate — no flicker of the old selection.
      setSelected(null);
      setCurrent((c) => c + 1);
    } else {
      navigation.navigate("Result", { answers: newAnswers, questions });
    }
  };

  const palette = PALETTES[current % PALETTES.length];
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const q = questions[current];
  const isLast = current === questions.length - 1;
  const canProceed = selected !== null;
  const options = Array.isArray(q?.options) ? q.options : [];

  if (loading || !q) {
    return (
      <View style={styles.loaderWrap}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={["#0a0a12", "#0f0a1e"]} style={StyleSheet.absoluteFill} />
        <View style={styles.loaderOrb}>
          <LinearGradient colors={["#7c3aed", "#4f46e5"]} style={{ flex: 1, borderRadius: 999 }} />
        </View>
        <Text style={styles.loaderEmoji}>🎯</Text>
        <Text style={styles.loaderTitle}>Loading Quiz</Text>
        <Text style={styles.loaderSub}>Preparing your questions…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0a0a12", "#0f0a1e", "#0a0a12"]} style={StyleSheet.absoluteFill} />
      <View style={[styles.glowOrb, { backgroundColor: palette.glow }]} pointerEvents="none" />
      <View style={[styles.glowOrb2, { backgroundColor: palette.glow }]} pointerEvents="none" />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <TouchableOpacity
          style={styles.exitBtn}
          onPress={() =>
            Alert.alert("Quit Quiz?", "Your progress will be lost.", [
              { text: "Cancel", style: "cancel" },
              { text: "Quit", style: "destructive", onPress: () => navigation.goBack() },
            ])
          }
        >
          <Text style={styles.exitIcon}>✕</Text>
        </TouchableOpacity>

        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressTrack, { width: progressWidth }]}>
              <LinearGradient
                colors={palette.accent}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.progressFill}
              />
            </Animated.View>
          </View>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>
              <Text style={styles.progressCurrent}>{current + 1}</Text>
              <Text style={styles.progressTotal}> / {questions.length}</Text>
            </Text>
            <Text style={[styles.progressPct, { color: palette.light }]}>
              {Math.round(((current + 1) / questions.length) * 100)}%
            </Text>
          </View>
        </View>

        <TimerRing timeLeft={timeLeft} totalTime={TIMER_DURATION} />
      </Animated.View>

      {/* Score pill */}
      <Animated.View style={[styles.scorePill, { opacity: headerFade }]}>
        <LinearGradient colors={palette.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scorePillGrad}>
          <Text style={styles.scorePillTxt}>
            ⭐ {Object.values(answers).filter(Boolean).length} answered
          </Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Question card */}
        <Animated.View
          style={[styles.questionCard, { opacity: cardFade, transform: [{ translateX: cardSlide }] }]}
        >
          <View style={styles.qTopRow}>
            <View style={[styles.qBadge, { backgroundColor: palette.glow + "22" }]}>
              <Text style={[styles.qBadgeTxt, { color: palette.light }]}>Question {current + 1}</Text>
            </View>
            {selected && (
              <View style={styles.selBadge}>
                <Text style={styles.selBadgeTxt}>Selected ✓</Text>
              </View>
            )}
          </View>
          <LinearGradient colors={palette.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.qLine} />
          <Text style={styles.questionTxt}>{q.question}</Text>
        </Animated.View>

        {/* Options — `key` forces full unmount/remount on question change,
            guaranteeing no stale visual state bleeds between questions */}
        <View style={styles.optionsWrap}>
          {options.map((opt, i) => (
            <OptionBtn
              key={`q${current}-opt${i}`}   // ✅ unique per question + option
              label={OPTION_LABELS[i] || String(i + 1)}
              text={opt}
              selected={selected === opt}
              delay={i * 65}
              questionIndex={current}        // ✅ triggers animation reset
              onPress={() => setSelected(opt)}
            />
          ))}
        </View>

        {/* Next / Submit */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            activeOpacity={canProceed ? 0.88 : 1}
            onPressIn={() => canProceed && Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()}
            onPress={() => canProceed && goNext()}
            style={styles.nextBtnWrap}
          >
            <LinearGradient
              colors={canProceed ? palette.accent : ["#1a1a28", "#1a1a28"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.nextBtn}
            >
              <Text style={[styles.nextBtnTxt, !canProceed && styles.nextBtnTxtDim]}>
                {isLast ? "Submit Quiz 🏆" : "Next Question →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {!canProceed && <Text style={styles.hintTxt}>Pick an option to continue</Text>}

        {/* Dot trail */}
        <View style={styles.dotRow}>
          {questions.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < current && answers[i] != null && styles.dotAnswered,
                i < current && answers[i] == null && styles.dotSkipped,
                i === current && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a12" },
  glowOrb: { position: "absolute", width: 340, height: 340, top: -130, right: -90, borderRadius: 999, opacity: 0.11 },
  glowOrb2: { position: "absolute", width: 200, height: 200, bottom: 60, left: -60, borderRadius: 999, opacity: 0.07 },
  loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a12" },
  loaderOrb: { position: "absolute", width: 260, height: 260, top: -60, right: -60, opacity: 0.18, borderRadius: 999 },
  loaderEmoji: { fontSize: 52, marginBottom: 16 },
  loaderTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 6 },
  loaderSub: { color: "#6b7280", fontSize: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  exitBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  exitIcon: { color: "#6b7280", fontSize: 13, fontWeight: "700" },
  progressWrap: { flex: 1, gap: 6 },
  progressBg: { height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" },
  progressTrack: { height: 7, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 7, borderRadius: 4, width: "100%" },
  progressMeta: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 13 },
  progressCurrent: { color: "#fff", fontWeight: "800" },
  progressTotal: { color: "#4b5563", fontWeight: "500" },
  progressPct: { fontSize: 12, fontWeight: "700" },
  timerWrap: { width: 64, height: 64, alignItems: "center", justifyContent: "center" },
  timerRingBg: { position: "absolute", width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: "rgba(255,255,255,0.07)" },
  timerRingFill: { position: "absolute", width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderTopColor: "transparent", borderRightColor: "transparent" },
  timerInner: { alignItems: "center" },
  timerNum: { fontSize: 17, fontWeight: "800", lineHeight: 19 },
  timerSec: { color: "#4b5563", fontSize: 9, fontWeight: "600" },
  scorePill: { alignSelf: "flex-end", marginRight: 20, marginBottom: 6 },
  scorePillGrad: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99 },
  scorePillTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 50 },
  questionCard: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 24, padding: 22, marginBottom: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", overflow: "hidden" },
  qTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  qBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
  qBadgeTxt: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  selBadge: { backgroundColor: "rgba(34,197,94,0.12)", borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(34,197,94,0.3)" },
  selBadgeTxt: { color: "#6ee7b7", fontSize: 11, fontWeight: "700" },
  qLine: { height: 2, borderRadius: 2, marginBottom: 18 },
  questionTxt: { color: "#f1f5f9", fontSize: 19, fontWeight: "700", lineHeight: 29, letterSpacing: -0.2 },
  optionsWrap: { gap: 11, marginBottom: 22 },
  optBtn: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, padding: 15, borderWidth: 1.5 },
  optDefault: { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" },
  optSelected: { backgroundColor: "rgba(124,58,237,0.13)", borderColor: "rgba(167,139,250,0.65)" },
  optLabelBubble: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  optLabelDef: { backgroundColor: "rgba(255,255,255,0.08)" },
  optLabelSel: { backgroundColor: "rgba(124,58,237,0.5)" },
  optLabelTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
  optText: { color: "#9ca3af", fontSize: 15, fontWeight: "500", flex: 1, lineHeight: 22 },
  optTextSel: { color: "#e9d5ff" },
  optCheckWrap: { width: 22, height: 22, borderRadius: 99, backgroundColor: "rgba(124,58,237,0.4)", alignItems: "center", justifyContent: "center" },
  optCheck: { color: "#fff", fontSize: 12, fontWeight: "800" },
  nextBtnWrap: { borderRadius: 18, overflow: "hidden", marginBottom: 10, shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10 },
  nextBtn: { paddingVertical: 18, alignItems: "center" },
  nextBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },
  nextBtnTxtDim: { color: "#374151" },
  hintTxt: { color: "#4b5563", fontSize: 13, textAlign: "center", marginBottom: 20 },
  dotRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8, flexWrap: "wrap" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)" },
  dotActive: { width: 22, borderRadius: 4, backgroundColor: "#7c3aed" },
  dotAnswered: { backgroundColor: "rgba(167,139,250,0.4)" },
  dotSkipped: { backgroundColor: "#dc2626" },
});