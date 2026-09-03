import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import Contacts from 'react-native-contacts';
import { PermissionsAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

export default function RechargeScreen() {
  const route = useRoute();
  const { ServiceId } = route.params || {};
  const [mobile, setMobile] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [lastRecharges, setLastRecharges] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const filteredContacts = contacts.filter(
    c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number?.includes(searchQuery),
  );

  const requestContactsPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          loadContacts();
        } else {
          Alert.alert('Permission Denied', 'Cannot access contacts.');
        }
      } else {
        loadContacts();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchLastRecharge = async () => {
    try {
      const res = await getData('api/cyrus/last-recharge?type=Recharge');
      if (res?.Status && Array.isArray(res.Data)) {
        setLastRecharges(res.Data);
      }
    } catch (error) {
      console.log('Last recharges error:', error);
    }
  };

  useEffect(() => {
    fetchLastRecharge();
  }, []);

  const loadContacts = () => {
    Contacts.getAll()
      .then(list => {
        const formatted = list
          .map(c => ({
            name: c.displayName,
            number: c.phoneNumbers?.[0]?.number?.replace(/\D/g, ''),
          }))
          .filter(c => c.number?.length >= 10);

        setContacts(formatted);
        setShowContacts(true);
      })
      .catch(e => console.log(e));
  };

  const GetOperator = async () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const response = await getData(
        `/api/cyrus/operator_by_phone?phone=${mobile}`,
      );
      if (response?.Status) {
        navigation.navigate('PlanScreen', {
          operatorDetail: response.Data,
          ServiceId,
        });
      } else {
        Alert.alert('Operator lookup failed', response?.Remarks || 'Unable to identify operator.');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Could not verify operator. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Mobile Recharge</Text>
          <Text style={styles.subtitle}>Prepaid • Instant Cashback</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.mainCard}>
        <Text style={styles.inputLabel}>Mobile Number</Text>
        <View style={styles.inputContainer}>
          <View style={styles.prefixPill}>
            <Text style={styles.prefix}>+91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit number"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={mobile}
            onChangeText={setMobile}
            maxLength={10}
          />
          {mobile.length > 0 && (
            <TouchableOpacity onPress={() => setMobile('')} style={{ padding: 4 }}>
              <Icon name="cancel" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Picker Button */}
        <TouchableOpacity
          style={styles.contactBtn}
          activeOpacity={0.75}
          onPress={requestContactsPermission}
        >
          <Icon name="contacts" size={20} color={COLORS.primary || '#0D52ED'} />
          <Text style={styles.contactBtnText}>Choose from Contacts</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Picker Modal/Overlay */}
      {showContacts && (
        <View style={styles.fullScreenContacts}>
          <View style={styles.contactsHeader}>
            <TouchableOpacity onPress={() => setShowContacts(false)} style={styles.backBtn}>
              <Icon name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.contactsHeaderText}>Select Contact</Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or number..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Contact List */}
          <FlatList
            data={filteredContacts}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.contactItemFull}
                activeOpacity={0.7}
                onPress={() => {
                  setMobile(item.number.slice(-10));
                  setShowContacts(false);
                }}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.avatarLetter}>{(item.name?.[0] || 'C').toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactNameFull}>{item.name}</Text>
                  <Text style={styles.contactNumberFull}>{item.number}</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Last Recharges List */}
      {lastRecharges.length > 0 && !showContacts && (
        <View style={styles.lastRechargeBox}>
          <View style={styles.recentHeaderRow}>
            <Icon name="history" size={18} color="#64748B" />
            <Text style={styles.lastRechargeTitle}>Recent Recharges</Text>
          </View>

          <FlatList
            data={lastRecharges.slice(0, 5)}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.lastRechargeItem}
                activeOpacity={0.75}
                onPress={() => setMobile(item.number?.slice(-10))}
              >
                <View style={styles.recentIconBox}>
                  <Icon name="phone-android" size={20} color={COLORS.primary || '#0D52ED'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lastRechargeNumber}>{item.number}</Text>
                  <Text style={styles.lastRechargeDate}>{item.createdAt || 'Recent'}</Text>
                </View>
                <View style={styles.recentAmountPill}>
                  <Text style={styles.lastRechargeAmount}>₹ {item.amount}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Bottom Proceed button */}
      <TouchableOpacity
        style={[styles.button, (loading || mobile.length < 10) && { opacity: 0.75 }]}
        onPress={GetOperator}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <View style={styles.btnContent}>
            <Text style={styles.buttonText}>FETCH PLANS</Text>
            <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
          </View>
        )}
      </TouchableOpacity>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 5,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#D9E7FF',
    fontWeight: '500',
    marginTop: 2,
  },

  /* MAIN CARD */
  mainCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  inputContainer: {
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.8,
    borderColor: COLORS.primary || '#0D52ED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  prefixPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  prefix: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary || '#0D52ED',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#091838',
    letterSpacing: 1,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary || '#0D52ED',
    marginLeft: 8,
  },

  /* CONTACTS MODAL */
  fullScreenContacts: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    zIndex: 999,
  },
  contactsHeader: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactsHeaderText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#091838',
  },
  contactItemFull: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary || '#0D52ED',
  },
  contactNameFull: {
    fontSize: 15,
    fontWeight: '700',
    color: '#091838',
  },
  contactNumberFull: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },

  /* RECENT RECHARGES */
  lastRechargeBox: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastRechargeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#091838',
    marginLeft: 6,
  },
  lastRechargeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
  },
  recentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  lastRechargeNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#091838',
  },
  lastRechargeDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  recentAmountPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  lastRechargeAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },

  /* BUTTON */
  button: {
    backgroundColor: COLORS.primary || '#0D52ED',
    height: 54,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 20 : 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    elevation: 4,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
