import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { usePreventScreenCapture } from "expo-screen-capture";
import API from "../api/client";
import { useAppSettings } from "../context/AppSettingsContext";

const { width } = Dimensions.get("window");
const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

const TimerRing = ({ timeLeft, themeColors, accentColor }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isUrgent = timeLeft <= 60;

  useEffect(() => {
    if (timeLeft == null) return undefined;
    if (isUrgent) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 380, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    return undefined;
  }, [isUrgent, pulseAnim, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const label = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const color = timeLeft > 300 ? accentColor : timeLeft > 120 ? "#f59e0b" : "#ef4444";

  return (
    <Animated.View style={[styles.timerWrap, { transform: [{ scale: pulseAnim }] }]}>
      <View style={[styles.timerRingBg, { borderColor: themeColors.border }]} />
      <View style={[styles.timerRingFill, { borderColor: color }]} />
      <View style={styles.timerInner}>
        <Text style={[styles.timerNum, { color }]}>{label}</Text>
        <Text style={[styles.timerSec, { color: themeColors.textGhost }]}>section</Text>
      </View>
    </Animated.View>
  );
};

const OptionBtn = ({ label, text, selected, onPress, delay, questionIndex, palette, themeColors }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 11, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, fadeAnim, questionIndex, slideAnim]);

  const selectedLabelBg = `${palette.glow}88`;
  const defaultLabelBg = themeColors.isLight ? `${palette.glow}12` : themeColors.surfaceStrong;
  const defaultLabelBorder = themeColors.isLight ? `${palette.glow}22` : "transparent";
  const defaultLabelText = themeColors.isLight ? palette.light : themeColors.text;

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
        style={[
          styles.optBtn,
          selected
            ? { backgroundColor: `${palette.glow}18`, borderColor: palette.light }
            : { backgroundColor: themeColors.surface, borderColor: themeColors.border },
        ]}
      >
        <View
          style={[
            styles.optLabelBubble,
            { borderColor: selected ? "transparent" : defaultLabelBorder },
            selected ? { backgroundColor: selectedLabelBg } : { backgroundColor: defaultLabelBg },
          ]}
        >
          <Text style={[styles.optLabelTxt, { color: selected ? "#fff" : defaultLabelText }]}>{label}</Text>
        </View>
        <Text style={[styles.optText, { color: selected ? themeColors.text : themeColors.textMuted }]} numberOfLines={3}>
          {text}
        </Text>
        {selected && (
          <View style={[styles.optCheckWrap, { backgroundColor: `${palette.glow}66` }]}>
            <Text style={styles.optCheck}>OK</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const buildSections = (quiz, questions) => {
  const rawSections = Array.isArray(quiz?.sections) ? quiz.sections : [];
  const validSections = rawSections
    .map((section, index) => ({
      title: section?.title?.trim() || `Section ${index + 1}`,
      questionCount: Number(section?.questionCount) || 0,
      durationMinutes: section?.durationMinutes ? Number(section.durationMinutes) : null,
    }))
    .filter((section) => section.questionCount > 0);

  if (!validSections.length) {
    return [{
      title: "Quiz",
      questionCount: questions.length,
      durationMinutes: quiz?.duration ? Number(quiz.duration) : null,
      start: 0,
      end: Math.max(questions.length - 1, 0),
    }];
  }

  let cursor = 0;
  return validSections.map((section) => {
    const start = cursor;
    const end = Math.min(cursor + section.questionCount - 1, Math.max(questions.length - 1, 0));
    cursor += section.questionCount;
    return { ...section, start, end };
  });
};

const getSectionIndexForQuestion = (sections, questionIndex) => {
  const foundIndex = sections.findIndex((section) => questionIndex >= section.start && questionIndex <= section.end);
  return foundIndex >= 0 ? foundIndex : 0;
};

const QuizScreen = ({ route, navigation }) => {
  usePreventScreenCapture();

  const { quizId } = route.params;
  const { accentOption, themeColors, settings } = useAppSettings();

  const [quizMeta, setQuizMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);

  const answersRef = useRef({});
  const timerRef = useRef(null);

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(width * 0.25)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const saveAnswers = (newAnswers) => {
    answersRef.current = newAnswers;
    setAnswers(newAnswers);
  };

  const examType = quizMeta?.examType || "no_section_no_timer";
  const requireAnswer = quizMeta?.requireAnswer ?? true;
  const sections = useMemo(() => buildSections(quizMeta, questions), [quizMeta, questions]);
  const currentSectionIndex = useMemo(
    () => getSectionIndexForQuestion(sections, current),
    [sections, current]
  );
  const currentSection = sections[currentSectionIndex];

  useEffect(() => {
    let mounted = true;

    Promise.all([
      API.get(`/quiz/${quizId}`),
      API.get(`/quiz/${quizId}/questions`),
    ])
      .then(([quizRes, questionRes]) => {
        if (!mounted) return;
        setQuizMeta(quizRes.data || {});
        setQuestions(Array.isArray(questionRes.data) ? questionRes.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Quiz load error:", err.message);
        if (!mounted) return;
        setLoading(false);
        Alert.alert("Error", "Failed to load quiz. Check your network.", [
          { text: "Back", onPress: () => navigation.goBack() },
        ]);
      });

    return () => {
      mounted = false;
      clearInterval(timerRef.current);
    };
  }, [navigation, quizId]);

  useEffect(() => {
    if (!questions.length) return;

    setSelected(answersRef.current[current] ?? null);

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
  }, [cardFade, cardSlide, current, headerFade, progressAnim, questions.length]);

  const palette = {
    accent: accentOption.colors,
    light: accentOption.colors[0],
    glow: accentOption.colors[0],
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const q = questions[current];
  const isLastQuestion = current === questions.length - 1;
  const isLastInSection = currentSection ? current === currentSection.end : isLastQuestion;
  const nextSection = currentSectionIndex < sections.length - 1 ? sections[currentSectionIndex + 1] : null;
  const canProceed = !requireAnswer || selected !== null;
  const options = Array.isArray(q?.options) ? q.options : [];

  const goToNextStep = useCallback((forcedByTimer = false) => {
    clearInterval(timerRef.current);

    const valueToSave = selected ?? null;
    const newAnswers = { ...answersRef.current, [current]: valueToSave };
    saveAnswers(newAnswers);

    if (isLastQuestion) {
      navigation.replace("Result", {
        answers: newAnswers,
        questions,
        quizId,
        quizMeta,
      });
      return;
    }

    if ((forcedByTimer || isLastInSection) && nextSection) {
      setCurrent(nextSection.start);
      setSelected(newAnswers[nextSection.start] ?? null);
      return;
    }

    setCurrent((value) => value + 1);
  }, [current, isLastInSection, isLastQuestion, navigation, nextSection, questions, quizId, quizMeta, selected]);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (!currentSection || examType !== "section_with_timer") {
      setTimeLeft(null);
      return undefined;
    }

    const durationSeconds = (Number(currentSection.durationMinutes) || 0) * 60;
    setTimeLeft(durationSeconds);

    timerRef.current = setInterval(() => {
      setTimeLeft((remaining) => {
        if (remaining == null) return remaining;
        if (remaining <= 1) {
          clearInterval(timerRef.current);
          goToNextStep(true);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentSection, examType, goToNextStep]);

  if (loading || !q) {
    return (
      <View style={[styles.loaderWrap, { backgroundColor: themeColors.background }]}>
        <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
        <LinearGradient colors={[themeColors.background, themeColors.backgroundAlt]} style={StyleSheet.absoluteFill} />
        <View style={styles.loaderOrb}>
          <LinearGradient colors={accentOption.colors} style={{ flex: 1, borderRadius: 999 }} />
        </View>
        <Text style={[styles.loaderTitle, { color: themeColors.text }]}>Loading Quiz</Text>
        <Text style={[styles.loaderSub, { color: themeColors.textSubtle }]}>Preparing your questions…</Text>
      </View>
    );
  }

  const answeredCount = Object.values(answers).filter((value) => value !== null && value !== undefined).length + (selected ? 1 : 0) - (answers[current] ? 1 : 0);

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      <LinearGradient colors={[themeColors.background, themeColors.backgroundAlt, themeColors.background]} style={StyleSheet.absoluteFill} />
      <View style={[styles.glowOrb, { backgroundColor: palette.glow }]} pointerEvents="none" />
      <View style={[styles.glowOrb2, { backgroundColor: palette.glow }]} pointerEvents="none" />

      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <TouchableOpacity
          style={[
            styles.exitBtn,
            {
              backgroundColor: themeColors.isLight ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.06)",
              borderColor: themeColors.isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.08)",
            },
          ]}
          onPress={() =>
            Alert.alert("Quit Quiz?", "Your progress will be lost.", [
              { text: "Cancel", style: "cancel" },
              { text: "Quit", style: "destructive", onPress: () => navigation.goBack() },
            ])
          }
        >
          <Text style={[styles.exitIcon, { color: themeColors.textSubtle }]}>X</Text>
        </TouchableOpacity>

        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressTrack, { width: progressWidth }]}>
              <LinearGradient colors={palette.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.progressFill} />
            </Animated.View>
          </View>
          <View style={styles.progressMeta}>
            <Text style={[styles.progressLabel, { color: themeColors.textSubtle }]}>
              <Text style={[styles.progressCurrent, { color: themeColors.text }]}>{current + 1}</Text>
              <Text style={[styles.progressTotal, { color: themeColors.textSubtle }]}> / {questions.length}</Text>
            </Text>
            <Text style={[styles.progressPct, { color: palette.light }]}>
              {Math.round(((current + 1) / questions.length) * 100)}%
            </Text>
          </View>
        </View>

        {examType === "section_with_timer" && timeLeft != null ? (
          <TimerRing timeLeft={timeLeft} themeColors={themeColors} accentColor={accentOption.colors[0]} />
        ) : (
          <View style={[styles.timerStatic, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.timerStaticText, { color: themeColors.textSubtle }]}>
              {examType === "section_no_timer" ? "No timer" : `${quizMeta?.duration || 0} min`}
            </Text>
          </View>
        )}
      </Animated.View>

      <Animated.View style={[styles.scorePill, { opacity: headerFade }]}>
        <LinearGradient colors={palette.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scorePillGrad}>
          <Text style={styles.scorePillTxt}>{answeredCount} answered</Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.questionCard,
            {
              opacity: cardFade,
              transform: [{ translateX: cardSlide }],
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.qTopRow}>
            <View style={[styles.qBadge, { backgroundColor: `${palette.glow}22` }]}>
              <Text style={[styles.qBadgeTxt, { color: palette.light }]}>{currentSection?.title || "Question Set"}</Text>
            </View>
            <View style={[styles.qMetaBadge, { backgroundColor: themeColors.surfaceStrong }]}>
              <Text style={[styles.qMetaBadgeText, { color: themeColors.textSubtle }]}>
                {currentSectionIndex + 1}/{sections.length}
              </Text>
            </View>
          </View>

          <LinearGradient colors={palette.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.qLine} />
          <Text style={[styles.questionTxt, { color: themeColors.text }]}>{q.question}</Text>

          {!!q.imageUrl && (
            <View style={[styles.imageHint, { backgroundColor: themeColors.surfaceStrong, borderColor: themeColors.border }]}>
              <Text style={[styles.imageHintText, { color: themeColors.textSubtle }]}>This question includes an image in the admin panel.</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.optionsWrap}>
          {options.map((opt, i) => (
            <OptionBtn
              key={`q${current}-opt${i}`}
              label={OPTION_LABELS[i] || String(i + 1)}
              text={opt}
              selected={selected === opt}
              delay={i * 65}
              questionIndex={current}
              palette={palette}
              themeColors={themeColors}
              onPress={() => setSelected(opt)}
            />
          ))}
        </View>

        {!requireAnswer && (
          <Text style={[styles.optionalHint, { color: themeColors.textGhost }]}>
            Answer selection is optional for this quiz. You can move ahead without choosing any option.
          </Text>
        )}

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            activeOpacity={canProceed ? 0.88 : 1}
            onPressIn={() => canProceed && Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()}
            onPress={() => canProceed && goToNextStep(false)}
            style={styles.nextBtnWrap}
          >
            <LinearGradient
              colors={canProceed ? palette.accent : [themeColors.surfaceStrong, themeColors.surfaceStrong]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtn}
            >
              <Text style={[styles.nextBtnTxt, !canProceed && { color: themeColors.textGhost }]}>
                {isLastQuestion
                  ? "Submit Quiz"
                  : isLastInSection && nextSection
                    ? `Go to ${nextSection.title}`
                    : requireAnswer
                      ? "Next Question"
                      : "Next / Skip"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {requireAnswer && !canProceed && (
          <Text style={[styles.hintTxt, { color: themeColors.textGhost }]}>Pick an option to continue</Text>
        )}

        <View style={styles.dotRow}>
          {questions.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < current && answers[i] != null && styles.dotAnswered,
                i < current && answers[i] == null && styles.dotSkipped,
                i === current && [styles.dotActive, { backgroundColor: accentOption.colors[0] }],
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
  loaderTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 6 },
  loaderSub: { color: "#6b7280", fontSize: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  exitBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  exitIcon: { fontSize: 13, fontWeight: "700" },
  progressWrap: { flex: 1, gap: 6 },
  progressBg: { height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" },
  progressTrack: { height: 7, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 7, borderRadius: 4, width: "100%" },
  progressMeta: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 13 },
  progressCurrent: { fontWeight: "800" },
  progressTotal: { fontWeight: "500" },
  progressPct: { fontSize: 12, fontWeight: "700" },
  timerWrap: { width: 84, height: 64, alignItems: "center", justifyContent: "center" },
  timerRingBg: { position: "absolute", width: 72, height: 72, borderRadius: 36, borderWidth: 3 },
  timerRingFill: { position: "absolute", width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderTopColor: "transparent", borderRightColor: "transparent" },
  timerInner: { alignItems: "center" },
  timerNum: { fontSize: 13, fontWeight: "800", lineHeight: 16 },
  timerSec: { fontSize: 9, fontWeight: "600" },
  timerStatic: { minWidth: 84, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, paddingHorizontal: 10 },
  timerStaticText: { fontSize: 11, fontWeight: "700" },
  scorePill: { alignSelf: "flex-end", marginRight: 20, marginBottom: 6 },
  scorePillGrad: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99 },
  scorePillTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 50 },
  questionCard: { borderRadius: 24, padding: 22, marginBottom: 18, borderWidth: 1, overflow: "hidden" },
  qTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 },
  qBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
  qBadgeTxt: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  qMetaBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
  qMetaBadgeText: { fontSize: 11, fontWeight: "700" },
  qLine: { height: 2, borderRadius: 2, marginBottom: 18 },
  questionTxt: { fontSize: 19, fontWeight: "700", lineHeight: 29, letterSpacing: -0.2 },
  imageHint: { marginTop: 14, borderWidth: 1, borderRadius: 14, padding: 12 },
  imageHintText: { fontSize: 12, lineHeight: 18 },
  optionsWrap: { gap: 11, marginBottom: 18 },
  optBtn: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, padding: 15, borderWidth: 1.5 },
  optLabelBubble: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  optLabelTxt: { fontWeight: "800", fontSize: 13 },
  optText: { fontSize: 15, fontWeight: "500", flex: 1, lineHeight: 22 },
  optCheckWrap: { width: 22, height: 22, borderRadius: 99, alignItems: "center", justifyContent: "center" },
  optCheck: { color: "#fff", fontSize: 12, fontWeight: "800" },
  optionalHint: { fontSize: 12, textAlign: "center", marginBottom: 10, lineHeight: 18 },
  nextBtnWrap: { borderRadius: 18, overflow: "hidden", marginBottom: 10, shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10 },
  nextBtn: { paddingVertical: 18, alignItems: "center" },
  nextBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },
  hintTxt: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  dotRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8, flexWrap: "wrap" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)" },
  dotActive: { width: 22, borderRadius: 4 },
  dotAnswered: { backgroundColor: "rgba(167,139,250,0.4)" },
  dotSkipped: { backgroundColor: "#dc2626" },
});
