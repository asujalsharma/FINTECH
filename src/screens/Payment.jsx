import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';
import Button from '../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';

const Payment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider, ServiceId } = route.params || {};
  const [ConnNo, setConnNo] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  console.log('Provider:', provider);

  const handleSubmit = () => {
    const val = (ConnNo || '').trim();

    if (!val) {
      setErrorMessage(`Please enter ${provider?.displayname || 'Connection / Consumer Number'}`);
      setErrorModalVisible(true);
      return;
    }

    if (provider?.regex) {
      try {
        const pattern = new RegExp(provider.regex);
        if (!pattern.test(val)) {
          console.log('Invalid connection number format.');
          setErrorMessage(
            `Invalid ${provider?.displayname || 'Connection Number'}. Please enter a valid number format.`
          );
          setErrorModalVisible(true);
          return;
        }
      } catch (err) {
        console.log('Regex validation skipped due to syntax:', err);
      }
    }

    navigation.navigate('Bill', {
      UniqueId: val,
      operator: { ...provider, ServiceId: ServiceId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headertitle} numberOfLines={2}>
          {provider?.operator_name}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{provider?.displayname || 'Account Number'}</Text>
          <View style={styles.input}>
            <TextInput
              placeholder="e.g. CX09AB1234"
              placeholderTextColor="#888"
              style={styles.textInput}
              onChangeText={text => setConnNo(text)}
              value={ConnNo}
              autoCapitalize="characters"
            />
          </View>
        </View>
      </View>

      {/* Fetch Bill Button */}
      <Button
        style={styles.loginBtn}
        title="Fetch Bill"
        filled
        onpress={handleSubmit}
      />

      {/* 🔴 Invalid Input Error Modal */}
      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <MaterialIcon name="alert-circle-outline" size={44} color="#dc2626" />
            </View>
            <Text style={styles.modalTitle}>Invalid Input</Text>
            <Text style={styles.modalSubtitle}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122536ff',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 4,
  },
  headertitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inputContainer: {
    marginTop: 20,
  },
  label: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderColor: COLORS.primary || '#122536ff',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  textInput: {
    width: '100%',
    color: '#000',
    fontSize: 16,
    paddingVertical: 12,
  },
  loginBtn: {
    width: '100%',
    marginBottom: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
