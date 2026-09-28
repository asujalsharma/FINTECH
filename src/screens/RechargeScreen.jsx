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
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import Contacts from 'react-native-contacts';
import { PermissionsAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Footer from '../components/Footer';
const BLUE = '#0A2E8A';


export default function RechargeScreen() {
  const route = useRoute();
  const { ServiceId } = route.params || {};
  const [mobile, setMobile] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [lastRecharges, setLastRecharges] = useState([]);

  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
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
  const fetchLastRecharge = async () => {
    try {
      const res = await getData('api/cyrus/last-recharge?type=Recharge');
      console.log(res);
      if (res.Status && Array.isArray(res.Data)) {
        setLastRecharges(res.Data);
      }
    } catch (error) {
      console.log(error);
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
      Alert.alert('Enter valid mobile number');
      return;
    }

    const response = await getData(
      `/api/cyrus/operator_by_phone?phone=${mobile}`,
    );
    if (response.Status) {
      navigation.navigate('PlanScreen', {
        operatorDetail: response.Data,
        ServiceId,
      });
    } else {
      Alert.alert('Operator lookup failed', response?.Remarks ?? '');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#040E2D" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Mobile Recharge</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>⚡ Instant Prepaid & Postpaid Recharge</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Input Card */}
        <View style={styles.mainCard}>
          <Text style={styles.inputLabel}>Enter Mobile Number</Text>
          <Text style={styles.inputSubLabel}>Select contact or enter 10-digit number</Text>

          <View style={styles.inputContainer}>
            <View style={styles.prefixBadge}>
              <Text style={styles.prefixText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="98765 43210"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={mobile}
              onChangeText={setMobile}
              maxLength={10}
            />
            {mobile.length > 0 && (
              <TouchableOpacity
                onPress={() => setMobile('')}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Icon name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Contact Picker Button */}
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={requestContactsPermission}
            activeOpacity={0.8}
          >
            <View style={styles.contactBtnLeft}>
              <View style={styles.contactIconCircle}>
                <Icon name="person-search" size={20} color="#0A2E8A" />
              </View>
              <View>
                <Text style={styles.contactBtnText}>Pick from Phone Contacts</Text>
                <Text style={styles.contactBtnSub}>Quick select from your phonebook</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#0A2E8A" />
          </TouchableOpacity>
        </View>

        {/* Last Recharge List */}
        {lastRecharges.length > 0 && !showContacts && (
          <View style={styles.lastRechargeBox}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Icon name="history" size={18} color="#0A2E8A" />
              </View>
              <Text style={styles.lastRechargeTitle}>Recent Recharges</Text>
            </View>

            {lastRecharges.slice(0, 5).map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.lastRechargeItem}
                activeOpacity={0.7}
                onPress={() => setMobile(item.number?.slice(-10))}
              >
                <View style={styles.rechargeLeft}>
                  <View style={styles.avatarCircle}>
                    <Icon name="phone-android" size={18} color="#0A2E8A" />
                  </View>
                  <View>
                    <Text style={styles.lastRechargeNumber}>{item.number}</Text>
                    <Text style={styles.lastRechargeDate}>{item.createdAt || 'Recent'}</Text>
                  </View>
                </View>

                <View style={styles.rechargeRight}>
                  <Text style={styles.lastRechargeAmount}>₹{item.amount}</Text>
                  <View style={styles.repeatBadge}>
                    <Text style={styles.repeatText}>Repeat</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Full Screen Contacts Modal */}
      {showContacts && (
        <View style={styles.fullScreenContacts}>
          {/* Header */}
          <View style={styles.contactsHeader}>
            <TouchableOpacity
              onPress={() => setShowContacts(false)}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.contactsHeaderText}>Select Contact</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size={20}
              color="#64748B"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or number..."
              placeholderTextColor="#93C5FD"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Contact List */}
          <FlatList
            data={filteredContacts}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 40 }}
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
                  <Text style={styles.contactAvatarText}>
                    {(item.name || 'U').charAt(0).toUpperCase()}
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

      {/* Bottom Floating Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.button, mobile.length === 10 ? styles.buttonActive : styles.buttonDisabled]}
          onPress={GetOperator}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>PROCEED TO SELECT PLAN</Text>
          <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07153A',
  },

  /* HEADER */
  header: {
    backgroundColor: '#040E2D',
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 26,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  badgeContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(75,158,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.30)',
  },
  badgeText: {
    color: '#4B9EFF',
    fontSize: 12,
    fontWeight: '600',
  },

  scrollContent: {
    paddingBottom: 110,
  },

  /* MAIN CARD */
  mainCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inputSubLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.50)',
    marginTop: 2,
    marginBottom: 16,
  },
  inputContainer: {
    height: 58,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(75,158,255,0.40)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  prefixBadge: {
    backgroundColor: 'rgba(75,158,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.30)',
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B9EFF',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  clearBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
  },

  /* CONTACT PICKER BUTTON */
  contactBtn: {
    marginTop: 18,
    backgroundColor: 'rgba(75,158,255,0.10)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.28)',
  },
  contactBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(75,158,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.30)',
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B9EFF',
  },
  contactBtnSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.80)',
    marginTop: 1,
    fontWeight: '500',
  },

  /* RECENT RECHARGES */
  lastRechargeBox: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.07)',
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(75,158,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.30)',
  },
  lastRechargeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lastRechargeItem: {
    paddingVertical: 12,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rechargeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(75,158,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.25)',
  },
  lastRechargeNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lastRechargeDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontWeight: '600',
  },
  rechargeRight: {
    alignItems: 'flex-end',
  },
  lastRechargeAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4B9EFF',
  },
  repeatBadge: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.30)',
  },
  repeatText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
  },

  /* CONTACTS MODAL */
  fullScreenContacts: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#07153A',
    zIndex: 999,
    elevation: 20,
  },
  contactsHeader: {
    backgroundColor: '#040E2D',
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactsHeaderText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    margin: 16,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.30)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contactItemFull: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4B9EFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  contactNameFull: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactNumberFull: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontWeight: '500',
  },

  /* BOTTOM BAR & BUTTON */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#040E2D',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    elevation: 10,
  },
  button: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonActive: {
    backgroundColor: '#4B9EFF',
    shadowColor: '#4B9EFF',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    shadowColor: 'transparent',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

