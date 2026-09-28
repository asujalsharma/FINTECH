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
  StatusBar,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const BLUE = "#0A2E8A";

const PersonalInfoScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState("");
  const navigation = useNavigation();  

  const HandleRegister = () => {
    navigation.navigate('Home');
  };

  const InputBox = ({ icon, placeholder, value, onChangeText, keyboardType = 'default' }) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{placeholder}</Text>
      <View style={styles.inputContainer}>
        <View style={styles.iconCircle}>
          <Icon name={icon} size={20} color={BLUE} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={`Enter ${placeholder.toLowerCase()}`}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#64748B"
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2E8A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.subtitle}>Complete your profile to get started</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Form Card */}
        <View style={styles.formCard}>
          <InputBox
            icon="person"
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
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
            keyboardType="email-address"
          />
          <InputBox
            icon="share"
            placeholder="Referral Code (Optional)"
            value={referral}
            onChangeText={setReferral}
          />

          {/* Terms Note */}
          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Termsandcondition')}
            >
              Terms & Conditions
            </Text>{' '}
            and{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Privacypolicy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.button}
          onPress={HandleRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
          <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PersonalInfoScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FC" },

  header: {
    backgroundColor: BLUE,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 36,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#FFF", letterSpacing: 0.3 },
  subtitle: { fontSize: 13, color: "#BFDBFE", marginTop: 4, fontWeight: '500' },

  scrollContent: {
    paddingBottom: 110,
  },

  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 24,
    padding: 20,
    elevation: 6,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },

  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    height: 52,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },

  terms: {
    fontSize: 12,
    color: "#475569",
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  link: { color: BLUE, fontWeight: '700' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 10,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  button: {
    height: 54,
    backgroundColor: BLUE,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonText: { color: "#FFF", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
});
