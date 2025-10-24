import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const ContactScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#007bff" />
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contact us</Text>
          <Text style={styles.headerTime}>Timing : 11AM to 07PM</Text>
        </View>

        {/* Illustration */}
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/5205/5205730.png" }}
          style={styles.image}
        />

        {/* Title */}
        <Text style={styles.sectionTitle}>How can i Help You</Text>

        {/* Buttons */}
        <View style={styles.row}>
          <ContactButton icon="call" text="Call Us" />
          <ContactButton icon="whatsapp" text="Whatsapp" type="fa" />
        </View>
        <View style={styles.card1}>

        <ContactButton icon="email" text="Email Us" />
        </View>
        <View style={styles.card1}>

        <ContactButton icon="chat" text="Live Chat with Us" />
        </View>

        <View style={styles.card}>
          <ContactButton icon="help-outline" text="Frequently Asked Question's" />
          <ContactButton icon="feedback" text="Feedback" />
          <ContactButton icon="star" text="Rate us on Playstore" />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Zapnity Services OPC PVT LTD</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Button Component
const ContactButton = ({
  icon,
  text,
  type = "material",
}: {
  icon: string;
  text: string;
  type?: "material" | "fa";
}) => {
  const IconComponent = type === "fa" ? FontAwesome : Icon;
  return (
    <TouchableOpacity style={styles.button}>
      <View style={styles.buttonLeft}>
        <IconComponent name={icon} size={22} color="#007bff" />
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={22} color="#007bff" />
    </TouchableOpacity>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },
  scrollContainer: {
    // padding: 16,
    alignItems: "center",
  },
  header: {
    width: "100%",
    backgroundColor: "#007bff",
    padding: 16,
    // borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTime: {
    color: "#fff",
    fontSize: 12,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
    alignSelf: "flex-start",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginVertical: 2,
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  buttonLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  card: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 14,
    paddingVertical: 2,
    // elevation: 2,
  },
    card1: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 14,
    // paddingVertical: 6,
    // elevation: 2,
  },
  footer: {
    marginTop: 20,
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
});
