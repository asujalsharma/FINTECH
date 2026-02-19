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
import COLORS from '../constants/colors';

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
        <Icon name="contacts" size={22} color={COLORS.primary} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

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
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  contactsHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  contactItemFull: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  contactNameFull: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },

  contactNumberFull: {
    fontSize: 14,
    color: '#666',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: '600', color: '#fff', marginTop: 6 },

  inputWrapper: {
    marginTop: 40,
    marginHorizontal: 20,
    position: 'relative',
    height: 70,
  },
  blueShadowLarge: {
    position: 'absolute',
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    opacity: 0.12,
    transform: [{ translateX: 3 }, { translateY: 3 }],
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blueShadowSmall: {
    position: 'absolute',
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    opacity: 2,
    transform: [{ translateX: 3 }, { translateY: 3 }],
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  inputContainer: {
    zIndex: 2,
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  prefix: { fontSize: 16, fontWeight: '600', marginRight: 8, color: '#000' },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#000' },

  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginHorizontal: 22,
  },
  contactBtnText: {
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },

  contactsBox: {
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    paddingVertical: 10,
  },
  contactsTitle: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },

  contactItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  contactNumber: {
    fontSize: 13,
    color: '#555',
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    margin: 10,
    marginBottom: 0,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    paddingVertical: 6,
  },

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
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  contactsHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  contactItemFull: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  contactNameFull: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },

  contactNumberFull: {
    fontSize: 14,
    color: '#666',
  },
  lastRechargeBox: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    paddingVertical: 10,
  },

  lastRechargeTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 15,
    paddingBottom: 10,
    color: '#222',
  },

  lastRechargeItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  lastRechargeNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },

  lastRechargeDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  lastRechargeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007bff',
  },
});
