import { View, Text, StyleSheet, ActivityIndicator } from "react-native"

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PICH</Text>
      <ActivityIndicator size="large" color="#FFCC4D" style={styles.loader} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 24,
  },
  loader: {
    marginTop: 20,
  },
})

export default SplashScreen
