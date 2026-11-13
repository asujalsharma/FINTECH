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
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import Contacts from 'react-native-contacts';
import { PermissionsAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Footer from '../components/Footer';
import CustomAlertModal from '../components/CustomAlertModal';

const BLUE = '#471d7d';

export default function RechargeScreen() {
  const route = useRoute();
  const { ServiceId } = route.params || {};
  const [mobile, setMobile] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [lastRecharges, setLastRecharges] = useState([]);

  // Custom Alert / Notice modal state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'notice',
  });

  const showAlert = (title, message, type = 'notice') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

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
        showAlert('Permission Denied', 'Contacts permission is required to select from contacts.', 'warning');
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
      console.log('fetchLastRecharge error:', error);
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
      showAlert('Invalid Number', 'Please enter a valid 10-digit mobile number', 'warning');
      return;
    }

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
        showAlert(
          'Operator Lookup Failed',
          response?.Remarks ?? 'Could not find operator for this number.',
          'notice',
        );
      }
    } catch (err) {
      showAlert('Error', 'Failed to fetch operator. Please try again.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#471d7d" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Mobile Recharge</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Input Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>Enter Mobile Number</Text>
          <Text style={styles.cardSublabel}>
            Select or enter 10-digit prepaid/postpaid number
          </Text>

          {/* Input Box */}
          <View style={styles.inputContainer}>
            <View style={styles.prefixBadge}>
              <Text style={styles.prefix}>+91</Text>
              <View style={styles.prefixDivider} />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={mobile}
              onChangeText={setMobile}
              maxLength={10}
            />

            {mobile.length > 0 && (
              <TouchableOpacity
                onPress={() => setMobile('')}
                style={styles.clearBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.contactIconBtn}
              onPress={requestContactsPermission}
              activeOpacity={0.7}
            >
              <Icon name="contacts" size={20} color="#471d7d" />
            </TouchableOpacity>
          </View>

          {/* Pick from Contacts Row */}
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={requestContactsPermission}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconCircle}>
              <Icon name="person-search" size={18} color="#471d7d" />
            </View>
            <Text style={styles.contactBtnText}>Pick from Contacts</Text>
            <Icon
              name="chevron-right"
              size={20}
              color="#64748B"
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
        </View>

        {/* Last Recharge List or Features Showcase */}
        {lastRecharges.length > 0 && !showContacts ? (
          <View style={styles.lastRechargeBox}>
            <View style={styles.lastRechargeHeader}>
              <Icon name="history" size={20} color="#471d7d" />
              <Text style={styles.lastRechargeTitle}>Recent Recharges</Text>
            </View>

            {lastRecharges.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.lastRechargeItem}
                onPress={() => setMobile(item.number?.slice(-10))}
                activeOpacity={0.7}
              >
                <View style={styles.avatarCircle}>
                  <Icon name="smartphone" size={18} color="#471d7d" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.lastRechargeNumber}>{item.number}</Text>
                  <Text style={styles.lastRechargeDate}>
                    {item.createdAt || 'Recent'}
                  </Text>
                </View>

                <View style={styles.amountBadge}>
                  <Text style={styles.lastRechargeAmount}>₹{item.amount}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.featuresCard}>
            <View style={styles.featureRow}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#EDE9FE' }]}>
                <Icon name="bolt" size={20} color="#471d7d" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.featureTitle}>Instant Recharge</Text>
                <Text style={styles.featureSub}>Fast & automated recharge in seconds</Text>
              </View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureRow}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Icon name="card-giftcard" size={20} color="#16A34A" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.featureTitle}>Guaranteed Cashback</Text>
                <Text style={styles.featureSub}>Earn rewards on every transaction</Text>
              </View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureRow}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Icon name="verified-user" size={20} color="#0284C7" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.featureTitle}>100% Safe & Secure</Text>
                <Text style={styles.featureSub}>Government regulated & encrypted</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Full Screen Contacts Selector */}
      {showContacts && (
        <View style={styles.fullScreenContacts}>
          <View style={styles.contactsHeader}>
            <TouchableOpacity
              onPress={() => setShowContacts(false)}
              style={styles.backBtn}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.contactsHeaderText}>Select Contact</Text>
            <View style={{ width: 40 }} />
          </View>

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
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredContacts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.contactItemFull}
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
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.contactNameFull}>{item.name}</Text>
                  <Text style={styles.contactNumberFull}>{item.number}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.button, mobile.length < 10 && styles.buttonDisabled]}
          onPress={GetOperator}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>PROCEED</Text>
          <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
      <Footer />

      {/* Custom Alert / Notice Popup Modal */}
      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#471d7d',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  mainCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSublabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  inputContainer: {
    height: 54,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  prefixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  prefix: {
    fontSize: 15,
    fontWeight: '700',
    color: '#471d7d',
    marginRight: 8,
  },
  prefixDivider: {
    width: 1.5,
    height: 20,
    backgroundColor: '#CBD5E1',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 1,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
    marginRight: 4,
  },
  contactIconBtn: {
    padding: 8,
    backgroundColor: '#F3E8FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#471d7d',
  },
  lastRechargeBox: {
    marginTop: 18,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lastRechargeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastRechargeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  lastRechargeItem: {
    paddingVertical: 12,
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastRechargeNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  lastRechargeDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  amountBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  lastRechargeAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#471d7d',
  },
  featuresCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  featureSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  featureDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    backgroundColor: '#F8FAFC',
  },
  button: {
    backgroundColor: '#471d7d',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fullScreenContacts: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8FAFC',
    zIndex: 100,
    elevation: 10,
  },
  contactsHeader: {
    backgroundColor: '#471d7d',
    paddingVertical: 16,
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
    backgroundColor: '#FFF',
    margin: 14,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  contactItemFull: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#471d7d',
  },
  contactNameFull: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  contactNumberFull: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});
