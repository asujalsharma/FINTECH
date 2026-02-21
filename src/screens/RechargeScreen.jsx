import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import Contacts from 'react-native-contacts';
import { PermissionsAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME_COLORS, GRADIENTS } from '../constants/theme';

export default function RechargeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { ServiceId } = route.params || {};

  const [mobile, setMobile] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [lastRecharges, setLastRecharges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingOperator, setFetchingOperator] = useState(false);

  const filteredContacts = contacts.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number.includes(searchQuery),
  );

  const requestContactsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        loadContacts();
      } else {
        Alert.alert('Permission Denied', 'Cannot access contacts.');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // last-recharge API not available on server, skip fetch
  // Recent recharges will remain empty

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

  const GetOperator = async (phoneNumber) => {
    const num = phoneNumber || mobile;
    if (!num || num.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setFetchingOperator(true);
    try {
      const response = await getData(
        `/api/cyrus/operator_by_phone?phone=${num}`,
      );
      if (response?.Status && response?.Data) {
        navigation.navigate('PlanScreen', {
          operatorDetail: response.Data,
          ServiceId,
        });
      } else {
        Alert.alert('Failed', response?.Remarks || 'Could not find operator for this number.');
      }
    } catch (err) {
      console.log('Operator fetch error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setFetchingOperator(false);
    }
  };

  const handleMobileChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    setMobile(cleaned);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ── */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mobile Recharge</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* ── CONTENT ── */}
      <View style={styles.contentContainer}>
        {/* ── PHONE INPUT CARD ── */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>MOBILE NUMBER</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputBox}>
              <Text style={styles.flagEmoji}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                value={mobile}
                onChangeText={handleMobileChange}
                maxLength={10}
              />
            </View>
            <TouchableOpacity onPress={requestContactsPermission} style={styles.contactIconBtn}>
              <MaterialIcon name="contacts" size={24} color={THEME_COLORS.primary} />
            </TouchableOpacity>
          </View>

          {fetchingOperator && (
            <View style={styles.fetchingRow}>
              <ActivityIndicator size="small" color={THEME_COLORS.primary} />
              <Text style={styles.fetchingText}>Fetching plans...</Text>
            </View>
          )}
        </View>

        {/* ── LAST RECHARGES ── */}
        {lastRecharges.length > 0 && (
          <View style={styles.lastRechargeCard}>
            <Text style={styles.lastRechargeTitle}>Recent Recharges</Text>
            {lastRecharges.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.lastRechargeItem}
                onPress={() => {
                  const num = item.number?.slice(-10);
                  setMobile(num);
                  GetOperator(num);
                }}
              >
                <View style={styles.rechargeIconWrap}>
                  <Icon name="phone" size={18} color={THEME_COLORS.primary} />
                </View>
                <View style={styles.rechargeInfo}>
                  <Text style={styles.lastRechargeNumber}>{item.number}</Text>
                  {item.createdAt && (
                    <Text style={styles.lastRechargeDate}>
                      {item.createdAt.slice(0, 10)}
                    </Text>
                  )}
                </View>
                <Text style={styles.lastRechargeAmount}>₹{item.amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── RECHARGE BUTTON ── */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            onPress={() => GetOperator()}
            disabled={fetchingOperator || mobile.length < 10}
          >
            <LinearGradient
              colors={mobile.length === 10 ? GRADIENTS.header : ['#94A3B8', '#94A3B8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.rechargeBtn}
            >
              <Text style={styles.rechargeBtnText}>
                {fetchingOperator ? 'Fetching Plans...' : 'Fetch Plans & Recharge'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CONTACTS OVERLAY ── */}
      {showContacts && (
        <View style={styles.fullScreenContacts}>
          <LinearGradient
            colors={GRADIENTS.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.contactsHeader}
          >
            <TouchableOpacity onPress={() => setShowContacts(false)}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.contactsHeaderText}>Select Contact</Text>
            <View style={{ width: 24 }} />
          </LinearGradient>

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name or number..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredContacts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.contactItemFull}
                onPress={() => {
                  const num = item.number.slice(-10);
                  setMobile(num);
                  setShowContacts(false);
                  GetOperator(num);
                }}
              >
                <View style={styles.contactAvatarWrap}>
                  <Text style={styles.contactAvatar}>
                    {item.name?.charAt(0)?.toUpperCase() || '#'}
                  </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  /* ── HEADER ── */
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },

  /* ── CONTENT ── */
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  /* ── PHONE INPUT CARD ── */
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
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: 1.5,
  },
  contactIconBtn: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#D1E8FF',
  },
  fetchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 10,
  },
  fetchingText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },

  /* ── LAST RECHARGES ── */
  lastRechargeCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginTop: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  lastRechargeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  lastRechargeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rechargeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rechargeInfo: {
    flex: 1,
  },
  lastRechargeNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  lastRechargeDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    fontWeight: '600',
  },
  lastRechargeAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME_COLORS.primary,
  },

  /* ── BOTTOM BUTTON ── */
  bottomSection: {
    marginTop: 30,
  },
  rechargeBtn: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rechargeBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* ── CONTACTS OVERLAY ── */
  fullScreenContacts: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 100,
    elevation: 10,
  },
  contactsHeader: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactsHeaderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    margin: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  contactItemFull: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactAvatar: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME_COLORS.primary,
  },
  contactNameFull: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  contactNumberFull: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
});
