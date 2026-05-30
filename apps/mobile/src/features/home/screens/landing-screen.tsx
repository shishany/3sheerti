import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import packageJson from "../../../../package.json";

const APP_VERSION = packageJson.version;

export function LandingScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>3sheerti</Text>
        <Text style={styles.version}>v{APP_VERSION}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f3ea"
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  title: {
    color: "#18231f",
    fontSize: 36,
    fontWeight: "700"
  },
  version: {
    color: "#5b645f",
    fontSize: 16,
    marginTop: 8
  }
});
