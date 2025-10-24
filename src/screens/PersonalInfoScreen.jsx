import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // npm i react-native-vector-icons

const BLUE = "#007bff";

const PersonalInfoScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState("");
       const navigation = useNavigation();  
       const HandleRegister = () => {
         navigation.navigate('Home')
       }

  const InputBox = ({ icon, placeholder, value, onChangeText }) => (
    <View style={styles.inputWrapper}>
      {/* Blue glow shadow layers */}
      <View style={styles.blueShadowLarge} />
      <View style={styles.blueShadowSmall} />

      {/* Actual input box */}
      <View style={styles.inputContainer}>
        <Icon name={icon} size={20} color={BLUE} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={"#888"}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.subtitle}>Create Your Account</Text>
      </View>

      {/* Input Fields */}
      <View style={styles.form}>
        <InputBox
          icon="person"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#111"
          color="#111"
        />
        <InputBox
          icon="person-outline"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <InputBox
          icon="email"
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
        />
        <InputBox
          icon="share"
          placeholder="Referral Code (Optional)"
          value={referral}
          onChangeText={setReferral}
        />
      </View>

      {/* Terms */}
      <Text style={styles.terms}>
        Signup to Agree <Text style={styles.link}>Terms and Conditions</Text>
      </Text>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} 
      onPress={HandleRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PersonalInfoScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    backgroundColor: BLUE,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 14, color: "#d9e7ff", marginTop: 6 },

  form: { marginTop: 20, marginHorizontal: 20 },

  /* Wrapper adds glow */
  inputWrapper: {
    position: "relative",
    height: 55,
    marginBottom: 18,
  },
  blueShadowLarge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: BLUE,
    opacity: 2,
    transform: [{ translateX: 2.5 }, { translateY: 2.5 }],
  },
  blueShadowSmall: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: BLUE,
    opacity: 2,
    transform: [{ translateX: 2.5 }, { translateY: 2.5 }],
  },

  /* Actual input */
  inputContainer: {
    position: "relative",
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: BLUE,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    height: "100%",
    ...Platform.select({
      ios: {
        shadowColor: BLUE,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 0, // Android glow simulated by layers
      },
    }),
  },
  icon: { marginRight: 6 },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },

  terms: {
    fontSize: 13,
    color: "#444",
    marginHorizontal: 20,
    marginTop: 8,
  },
  link: { color: BLUE, textDecorationLine: "underline" },

  button: {
    backgroundColor: BLUE,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
