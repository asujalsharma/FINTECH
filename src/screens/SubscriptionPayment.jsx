import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import Button from '../components/Button';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const SubscriptionPayment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider, ServiceId } = route.params;
  const [ConnNo, setConnNo] = useState('');

  const handleSubmit = () => {
    if (ConnNo === '') {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Customer ID is required',
      });
    } else {
      navigation.navigate('Bill', {
        UniqueId: ConnNo,
        operator: { ...provider, ServiceId: ServiceId },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{provider.operator_name}</Text>
      </LinearGradient>

      {/* Input Section */}
      <View style={styles.Content}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>{provider.displayname || 'Customer ID'}</Text>
          <View style={styles.inputWrapper}>
            <Icon name="user" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Enter ID here"
              style={styles.textInput}
              placeholderTextColor="#94A3B8"
              onChangeText={text => setConnNo(text)}
              value={ConnNo}
              autoCapitalize="characters"
            />
          </View>

          <Button
            style={styles.payBtn}
            title="FETCH BILL"
            filled
            onpress={handleSubmit}
          />
        </View>

        <View style={styles.infoBox}>
          <Icon name="info" size={20} color={THEME_COLORS.primary} />
          <Text style={styles.infoText}>
            Ensure your Customer ID is correct to avoid payment failure.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionPayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  Content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -40,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#1756C5',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  label: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  payBtn: {
    marginTop: 30,
    borderRadius: 18,
    height: 56,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    marginTop: 25,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1E8FF',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
    lineHeight: 18,
  },
});
