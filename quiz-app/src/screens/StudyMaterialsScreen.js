import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "../api/client";
import { useAppSettings } from "../context/AppSettingsContext";

const StudyMaterialsScreen = ({ navigation }) => {
  const { themeColors, settings } = useAppSettings();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await API.get("/quiz/");
      const data = res.data;
      
      const materials = data.filter(q => q.studyMaterialUrl);
      setQuizzes(materials);
    } catch (err) {
      setError("Could not load study materials.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const grouped = {};
  quizzes.forEach(q => {
    const course = q.course || "General Course";
    const subject = q.subject || "General Subject";

    if (!grouped[course]) grouped[course] = {};
    if (!grouped[course][subject]) grouped[course][subject] = [];
    
    grouped[course][subject].push(q);
  });

  const handleOpenPdf = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        console.log("Failed to open URL:", err);
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Study Materials</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
        </View>
      ) : quizzes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="book-outline" size={64} color={themeColors.textSubtle} />
          <Text style={[styles.emptyText, { color: themeColors.textSubtle }]}>
            No study materials available
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {Object.entries(grouped).map(([courseName, subjects]) => {
            const hasItems = Object.values(subjects).some(list => list.length > 0);
            if (!hasItems) return null;

            return (
              <View key={courseName} style={[styles.courseSection, { borderColor: themeColors.border }]}>
                <View style={[styles.courseHeader, { backgroundColor: themeColors.surface }]}>
                  <Text style={[styles.courseTitle, { color: themeColors.text }]}>{courseName}</Text>
                </View>
                <View style={styles.subjectsContainer}>
                  {Object.entries(subjects).map(([subjectName, items]) => {
                    if (items.length === 0) return null;
                    return (
                      <View key={subjectName} style={styles.subjectSection}>
                        <Text style={[styles.subjectTitle, { color: themeColors.textSubtle }]}>
                          {subjectName}
                        </Text>
                        <View style={styles.itemsGrid}>
                          {items.map((quiz) => (
                            <TouchableOpacity
                              key={quiz._id}
                              style={[styles.materialCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
                              onPress={() => handleOpenPdf(quiz.studyMaterialUrl)}
                            >
                              <View style={[styles.iconContainer, { backgroundColor: themeColors.primary + "1A" }]}>
                                <Ionicons name="document-text" size={20} color={themeColors.primary} />
                              </View>
                              <View style={styles.materialInfo}>
                                <Text style={[styles.materialName, { color: themeColors.text }]} numberOfLines={2}>
                                  {quiz.studyMaterialName || "Document"}
                                </Text>
                                <Text style={[styles.quizTitle, { color: themeColors.textSubtle }]} numberOfLines={1}>
                                  Quiz: {quiz.title}
                                </Text>
                              </View>
                              <Ionicons name="download-outline" size={20} color={themeColors.primary} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
  scrollContent: {
    padding: 15,
  },
  courseSection: {
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  courseHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.1)",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subjectsContainer: {
    padding: 15,
  },
  subjectSection: {
    marginBottom: 15,
  },
  subjectTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  itemsGrid: {
    gap: 10,
  },
  materialCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
    marginRight: 10,
  },
  materialName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  quizTitle: {
    fontSize: 12,
  },
});

export default StudyMaterialsScreen;
