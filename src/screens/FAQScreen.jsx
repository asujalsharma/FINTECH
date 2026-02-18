import LinearGradient from 'react-native-linear-gradient';
import { THEME_COLORS, GRADIENTS } from '../constants/theme';
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

const FAQScreen = ({ navigation }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = index => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: 'What is 99 Recharce?',
      answer:
        '99 Recharce is a modern digital payment app that allows you to recharge, pay bills, book travel, and buy insurance — all in one secure platform.',
    },
    {
      question: 'Is 99 Recharce safe to use?',
      answer:
        'Absolutely! 99 Recharce uses bank-grade encryption and secure payment gateways to ensure your transactions and data remain safe.',
    },
    {
      question: 'Do I get rewards on payments?',
      answer:
        'Yes! 99 Recharce offers cashback, rewards, and exclusive discounts on recharges, bill payments, and bookings.',
    },
    {
      question: 'How do I get started?',
      answer:
        'Simply download the 99 Recharce app, sign up with your mobile number, and start recharging or paying bills instantly.',
    },
    {
      question: 'Does 99 Recharce support all operators?',
      answer:
        'Yes, 99 Recharce supports all major mobile operators, DTH providers, and utility billers registered under BBPS.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0004fb" />

      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>FAQ</Text>
        <View style={{ width: 22 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {faqData.map((item, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity
              style={styles.questionRow}
              onPress={() => toggle(index)}
            >
              <Text style={styles.question}>{item.question}</Text>
              <Icon
                name={
                  openIndex === index
                    ? 'keyboard-arrow-up'
                    : 'keyboard-arrow-down'
                }
                size={24}
                color="#0004fb"
              />
            </TouchableOpacity>

            {openIndex === index && (
              <Text style={styles.answer}>{item.answer}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    elevation: 2,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  answer: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
});
