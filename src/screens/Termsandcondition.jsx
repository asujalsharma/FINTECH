import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const Termsandcondition = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007bff" />
        {/* Header */}
       <View style={styles.header}>
               <Icon name="arrow-back" size={22} color="#fff" />
               <Text style={styles.headerText}>T & C</Text>
               <View style={{}} />
             </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Profile Button
const ProfileButton = ({ icon, text }: { icon: string; text: string }) => {
  return (
    <TouchableOpacity style={styles.button}>
      <View style={styles.buttonLeft}>
        <Icon name={icon} size={22} color="#007bff" />
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={22} color="#007bff" />
    </TouchableOpacity>
  );
};

export default Termsandcondition;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },
  scrollContainer: {
    padding: 16,
    alignItems: "center",
  },

    header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    justifyContent:"space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    // paddingTop: 35,
    // marginTop: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 0,
  },
});