import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const ResultScreen = ({ route }) => {
  const { answers, questions } = route.params;

  let score = 0;

  questions.forEach((q, i) => {
    if (answers[i] === q.correct_answer) score++;
  });

  return (
    <View>
      <Text>Score: {score}/{questions.length}</Text>
    </View>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  text: {
    color: "#fff",
    fontSize: 24,
  },
});