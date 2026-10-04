import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Footer from '../components/Footer';

const FAQScreen = ({ navigation }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = index => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: 'What is Online Adda?',
      answer:
        'Online Adda is an all-in-one digital recharge and payment app that allows you to recharge mobile, DTH, pay electricity, and utility bills instantly with guaranteed rewards.',
    },
    {
      question: 'Is Online Adda safe and secure?',
      answer:
        'Absolutely! Online Adda uses bank-grade encryption and standard security gateways to ensure your wallet funds and transactions are completely protected.',
    },
    {
      question: 'Do I get cashback and commission on payments?',
      answer:
        'Yes! Online Adda offers high commissions, instant cashback, and referral rewards on mobile recharges and bill payments.',
    },
    {
      question: 'How do I get started with Online Adda?',
      answer:
        'Simply sign in with your mobile number, verify with OTP, add money to your wallet, and start recharging instantly.',
    },
    {
      question: 'Does Online Adda support all operators?',
      answer:
        'Yes, Online Adda supports all major mobile operators (Jio, Airtel, Vi, BSNL), DTH providers, and utility billers across India.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#092B88" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>FAQ & Help</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {faqData.map((item, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity
              style={styles.questionRow}
              onPress={() => toggle(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.question}>{item.question}</Text>
              <Icon
                name={
                  openIndex === index
                    ? 'keyboard-arrow-up'
                    : 'keyboard-arrow-down'
                }
                size={24}
                color="#092B88"
              />
            </TouchableOpacity>

            {openIndex === index && (
              <Text style={styles.answer}>{item.answer}</Text>
            )}
          </View>
        ))}

        <View style={{ marginTop: 24 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#092B88',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#092B88',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  answer: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
});

