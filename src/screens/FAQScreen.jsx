import LinearGradient from 'react-native-linear-gradient';
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
    <LinearGradient
      colors={['#0A237A', '#1756C5', '#4285F4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A237A" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.whiteSheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
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
                    color="#1756C5"
                  />
                </TouchableOpacity>

                {openIndex === index && (
                  <Text style={styles.answer}>{item.answer}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    marginTop: 10,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
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
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
});
