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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import Contacts from 'react-native-contacts';
import { PermissionsAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Footer from '../components/Footer';
const BLUE = '#471d7d';


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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Mobile Recharge</Text>
        <Text> </Text>
      </View>

      {/* Input with Glow */}
      <View style={styles.inputWrapper}>
        <View style={styles.blueShadowLarge} />
        <View style={styles.blueShadowSmall} />

        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={mobile}
            onChangeText={setMobile}
            maxLength={10}
          />
        </View>
      </View>

      {/* Contact Picker */}
      <TouchableOpacity
        style={styles.contactBtn}
        onPress={requestContactsPermission}
      >
        <Icon name="contacts" size={22} color="#0B1C6D" />
        <Text style={styles.contactBtnText}>Pick from Contacts</Text>
      </TouchableOpacity>

      {showContacts && (
        <View style={styles.fullScreenContacts}>
          {/* Header */}
          <View style={styles.contactsHeader}>
            <TouchableOpacity onPress={() => setShowContacts(false)}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.contactsHeaderText}>Select Contact</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size={20}
              color="#666"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Contact List */}
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
                <Text style={styles.contactNameFull}>{item.name}</Text>
                <Text style={styles.contactNumberFull}>{item.number}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Last Recharge List */}
      {lastRecharges.length > 0 && !showContacts && (
        <View style={styles.lastRechargeBox}>
          <Text style={styles.lastRechargeTitle}>Last Recharges</Text>

          <FlatList
            data={lastRecharges}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.lastRechargeItem}
                onPress={() => setMobile(item.number?.slice(-10))}
              >
                <View>
                  <Text style={styles.lastRechargeNumber}>{item.number}</Text>
                  <Text style={styles.lastRechargeDate}>{item.createdAt}</Text>
                </View>

                <Text style={styles.lastRechargeAmount}>₹ {item.amount}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Bottom button */}
      <TouchableOpacity style={styles.button} onPress={GetOperator}>
        <Text style={styles.buttonText}>PROCEED</Text>
      </TouchableOpacity>
      <Footer />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },

  header: {
    backgroundColor: '#471d7d',
    paddingVertical: 18,
    paddingHorizontal: 20,
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
  title: { fontSize: 18, fontWeight: '800', color: '#FFF' },

  inputWrapper: {
    marginTop: 24,
    marginHorizontal: 16,
    height: 56,
  },
  inputContainer: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#471d7d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  prefix: { fontSize: 16, fontWeight: '700', marginRight: 8, color: '#471d7d' },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0F172A' },
  contactIconBtn: { padding: 6, backgroundColor: '#EDE7F6', borderRadius: 10 },

  contactItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  contactNumber: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  button: {
    backgroundColor: '#58007b',
    height: 54,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    elevation: 4,
    shadowColor: '#58007b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 14,
    marginBottom: 6,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 6,
    fontWeight: '500',
  },

  fullScreenContacts: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F2F4F7',
    zIndex: 100,
    elevation: 10,
  },
  contactsHeader: {
    backgroundColor: '#471d7d',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactsHeaderText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },

  contactItemFull: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  contactNameFull: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  contactNumberFull: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },

  lastRechargeBox: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  lastRechargeTitle: {
    fontSize: 16,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingBottom: 12,
    color: '#0F172A',
  },
  lastRechargeItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastRechargeNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  lastRechargeDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  lastRechargeAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#471d7d',
  },
});


