import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getData } from '../API';
import Footer from '../components/Footer';

const UPPCL_DISTRICTS_MASTER = [
  { id: 1, district: "Agra", discom: "DVVNL", districtDiscom: "Agra-DVVNL" },
  { id: 2, district: "Aligarh", discom: "DVVNL", districtDiscom: "Aligarh-DVVNL" },
  { id: 3, district: "Ambedkar Nagar", discom: "MVVNL", districtDiscom: "AmbedkarNagar-MVVNL" },
  { id: 4, district: "Amethi", discom: "MVVNL", districtDiscom: "Amethi-MVVNL" },
  { id: 5, district: "Amroha", discom: "PVVNL", districtDiscom: "Amroha-PVVNL" },
  { id: 6, district: "Auraiya", discom: "DVVNL", districtDiscom: "Auraiya-DVVNL" },
  { id: 7, district: "Ayodhya", discom: "MVVNL", districtDiscom: "Ayodhya-MVVNL" },
  { id: 8, district: "Azamgarh", discom: "PuVVNL", districtDiscom: "Azamgarh-PUVNL" },
  { id: 9, district: "Baghpat", discom: "PVVNL", districtDiscom: "Bagpat-PVVNL" },
  { id: 10, district: "Bahraich", discom: "MVVNL", districtDiscom: "Bahraich-MVVNL" },
  { id: 11, district: "Ballia", discom: "PuVVNL", districtDiscom: "Ballia-PUVNL" },
  { id: 12, district: "Balrampur", discom: "MVVNL", districtDiscom: "Balrampur-MVVNL" },
  { id: 13, district: "Banda", discom: "DVVNL", districtDiscom: "Banda-DVVNL" },
  { id: 14, district: "Barabanki", discom: "MVVNL", districtDiscom: "Barabanki-MVVNL" },
  { id: 15, district: "Bareilly", discom: "MVVNL", districtDiscom: "Bareilly-MVVNL" },
  { id: 16, district: "Basti", discom: "PuVVNL", districtDiscom: "Basti-PUVNL" },
  { id: 17, district: "Bijnor", discom: "PVVNL", districtDiscom: "Bijnor-PVVNL" },
  { id: 18, district: "Budaun", discom: "MVVNL", districtDiscom: "Budaun-MVVNL" },
  { id: 19, district: "Bulandshahr", discom: "PVVNL", districtDiscom: "Bulandshahr-PVVNL" },
  { id: 20, district: "Chandauli", discom: "PuVVNL", districtDiscom: "Chandauli-PUVNL" },
  { id: 21, district: "Chitrakoot", discom: "DVVNL", districtDiscom: "Chitrakoot-DVVNL" },
  { id: 22, district: "Deoria", discom: "PuVVNL", districtDiscom: "Deoria-PUVNL" },
  { id: 23, district: "Etah", discom: "DVVNL", districtDiscom: "Etah-DVVNL" },
  { id: 24, district: "Etawah", discom: "DVVNL", districtDiscom: "Etawah-DVVNL" },
  { id: 25, district: "Farrukhabad", discom: "DVVNL", districtDiscom: "Farrukhabad-DVVNL" },
  { id: 26, district: "Fatehpur", discom: "PuVVNL", districtDiscom: "Fatehpur-PUVNL" },
  { id: 27, district: "Firozabad", discom: "DVVNL", districtDiscom: "Firozabad-DVVNL" },
  { id: 28, district: "Gautam Buddha Nagar", discom: "PVVNL", districtDiscom: "GautamBuddhaNagar-PVVNL" },
  { id: 29, district: "Ghaziabad", discom: "PVVNL", districtDiscom: "Ghaziabad-PVVNL" },
  { id: 30, district: "Ghazipur", discom: "PuVVNL", districtDiscom: "Ghazipur-PUVNL" },
  { id: 31, district: "Gonda", discom: "MVVNL", districtDiscom: "Gonda-MVVNL" },
  { id: 32, district: "Gorakhpur", discom: "PuVVNL", districtDiscom: "Gorakhpur-PUVNL" },
  { id: 33, district: "Hamirpur", discom: "DVVNL", districtDiscom: "Hamirpur-DVVNL" },
  { id: 34, district: "Hapur", discom: "PVVNL", districtDiscom: "HapurDistrict-PVVNL" },
  { id: 35, district: "Hardoi", discom: "MVVNL", districtDiscom: "Hardoi-MVVNL" },
  { id: 36, district: "Hathras", discom: "DVVNL", districtDiscom: "Hathras-DVVNL" },
  { id: 37, district: "Jalaun", discom: "DVVNL", districtDiscom: "Jalaun-DVVNL" },
  { id: 38, district: "Jaunpur", discom: "PuVVNL", districtDiscom: "Jaunpur-PUVNL" },
  { id: 39, district: "Jhansi", discom: "DVVNL", districtDiscom: "Jhansi-DVVNL" },
  { id: 40, district: "Kannauj", discom: "DVVNL", districtDiscom: "Kannauj-DVVNL" },
  { id: 41, district: "Kanpur Dehat", discom: "DVVNL", districtDiscom: "KanpurDehat-DVVNL" },
  { id: 42, district: "Kanpur Nagar (DVVNL)", discom: "DVVNL", districtDiscom: "KanpurNagar-DVVNL" },
  { id: 43, district: "Kanpur Nagar (KESCO)", discom: "KESCO", districtDiscom: "KanpurNagar-KESCO" },
  { id: 44, district: "Kasganj", discom: "DVVNL", districtDiscom: "Kasganj-DVVNL" },
  { id: 45, district: "Kaushambi", discom: "PuVVNL", districtDiscom: "Kaushambi-PUVNL" },
  { id: 46, district: "Kushinagar", discom: "PuVVNL", districtDiscom: "Kushinagar-PUVNL" },
  { id: 47, district: "Lakhimpur Kheri", discom: "MVVNL", districtDiscom: "LakhimpurKheri-MVVNL" },
  { id: 48, district: "Lalitpur", discom: "DVVNL", districtDiscom: "Lalitpur-DVVNL" },
  { id: 49, district: "Lucknow", discom: "MVVNL", districtDiscom: "Lucknow-MVVNL" },
  { id: 50, district: "Maharajganj", discom: "PuVVNL", districtDiscom: "Maharajganj-PUVNL" },
  { id: 51, district: "Mahoba", discom: "DVVNL", districtDiscom: "Mahoba-DVVNL" },
  { id: 52, district: "Mainpuri", discom: "DVVNL", districtDiscom: "Mainpuri-DVVNL" },
  { id: 53, district: "Mathura", discom: "DVVNL", districtDiscom: "Mathura-DVVNL" },
  { id: 54, district: "Mau", discom: "PuVVNL", districtDiscom: "Mau-PUVNL" },
  { id: 55, district: "Meerut", discom: "PVVNL", districtDiscom: "Meerut-PVVNL" },
  { id: 56, district: "Mirzapur", discom: "PuVVNL", districtDiscom: "Mirzapur-PUVNL" },
  { id: 57, district: "Moradabad", discom: "PVVNL", districtDiscom: "Moradabad-PVVNL" },
  { id: 58, district: "Muzaffarnagar", discom: "PVVNL", districtDiscom: "Muzaffarnagar-PVVNL" },
  { id: 59, district: "Pilibhit", discom: "MVVNL", districtDiscom: "Pilibhit-MVVNL" },
  { id: 60, district: "Pratapgarh", discom: "PuVVNL", districtDiscom: "Pratapgarh-PUVNL" },
  { id: 61, district: "Prayagraj", discom: "PuVVNL", districtDiscom: "PrayagRaj-PUVNL" },
  { id: 62, district: "Raebareli", discom: "MVVNL", districtDiscom: "Raebareli-MVVNL" },
  { id: 63, district: "Rampur", discom: "PVVNL", districtDiscom: "Rampur-PVVNL" },
  { id: 64, district: "Saharanpur", discom: "PVVNL", districtDiscom: "Saharanpur-PVVNL" },
  { id: 65, district: "Sambhal", discom: "PVVNL", districtDiscom: "Sambhal-PVVNL" },
  { id: 66, district: "Sant Kabir Nagar", discom: "PuVVNL", districtDiscom: "SantKabirNagar-PUVNL" },
  { id: 67, district: "Sant Ravidas Nagar (Bhadohi)", discom: "PuVVNL", districtDiscom: "SantRavidasNagar-Bhadohi-PUVNL" },
  { id: 68, district: "Shahjahanpur", discom: "MVVNL", districtDiscom: "Shahjahanpur-MVVNL" },
  { id: 69, district: "Shamli", discom: "PVVNL", districtDiscom: "Shamli-PVVNL" },
  { id: 70, district: "Shravasti", discom: "MVVNL", districtDiscom: "Shravasti-MVVNL" },
  { id: 71, district: "Siddharthnagar", discom: "PuVVNL", districtDiscom: "Siddharthnagar-PUVNL" },
  { id: 72, district: "Sitapur", discom: "MVVNL", districtDiscom: "Sitapur-MVVNL" },
  { id: 73, district: "Sonbhadra", discom: "PuVVNL", districtDiscom: "Sonbhadra-PUVNL" },
  { id: 74, district: "Sultanpur", discom: "MVVNL", districtDiscom: "Sultanpur-MVVNL" },
  { id: 75, district: "Unnao", discom: "MVVNL", districtDiscom: "Unnao-MVVNL" },
  { id: 76, district: "Varanasi", discom: "PuVVNL", districtDiscom: "Varanasi-PUVNL" },
];

const Payment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider, ServiceId, name } = route.params;
  const [ConnNo, setConnNo] = useState('');
  const [lastRecharges, setLastRecharges] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // UPPCL District Dropdown States
  const isUppcl =
    provider?.op_code === 'UPPCL' ||
    provider?.opcode === 'UPPCL' ||
    provider?.op_id === 'UPPCL' ||
    /uppcl/i.test(provider?.operator_name || '') ||
    /uttar pradesh/i.test(provider?.operator_name || '');

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [districts, setDistricts] = useState(UPPCL_DISTRICTS_MASTER);

  const fetchLastRecharge = async () => {
    try {
      const res = await getData(
        `api/cyrus/last-recharge?type=BBPS&subType=${name}`,
      );
      if (res.Status && Array.isArray(res.Data)) {
        setLastRecharges(res.Data);
      } else {
        setLastRecharges([]);
      }
    } catch (err) {
      console.log(err);
      setLastRecharges([]);
    }
  };

  const fetchDistricts = async () => {
    if (!isUppcl) return;
    try {
      const res = await getData('api/cyrus/bbps/uppcl-districts');
      if (res?.status && Array.isArray(res?.data) && res.data.length > 0) {
        setDistricts(res.data);
      }
    } catch (err) {
      console.log('Using static UPPCL districts list:', err);
    }
  };

  useEffect(() => {
    fetchLastRecharge();
    if (isUppcl) {
      fetchDistricts();
    }
  }, []);

  const filteredDistricts = districts.filter(d => {
    if (!districtSearch.trim()) return true;
    const q = districtSearch.toLowerCase();
    return (
      d.district?.toLowerCase().includes(q) ||
      d.districtDiscom?.toLowerCase().includes(q) ||
      d.discom?.toLowerCase().includes(q)
    );
  });

  const handleSubmit = () => {
    if (!ConnNo || !ConnNo.trim()) {
      setErrorMessage(`Please enter your ${provider.displayname || 'Connection Number'}`);
      setShowErrorModal(true);
      return;
    }

    if (isUppcl && !selectedDistrict) {
      setErrorMessage('Please select your District / DISCOM from the dropdown to fetch your UPPCL bill.');
      setShowErrorModal(true);
      return;
    }

    try {
      if (provider.regex) {
        const pattern = new RegExp(provider.regex);
        if (!pattern.test(ConnNo.trim())) {
          setErrorMessage(
            `Invalid ${provider.displayname || 'number'} format. Please enter a valid number according to provider rules.`
          );
          setShowErrorModal(true);
          return;
        }
      }

      const opcodeValue = isUppcl
        ? 'UPPCL'
        : (provider.op_code || provider.opcode || provider.op_id);

      navigation.navigate('Bill', {
        UniqueId: ConnNo.trim(),
        operator: {
          ...provider,
          ServiceId: ServiceId,
          op_code: opcodeValue,
          opcode: opcodeValue,
          value1: selectedDistrict?.districtDiscom || '',
        },
        value1: selectedDistrict?.districtDiscom || '',
      });
    } catch (error) {
      console.log('Error submitting connection number:', error);
      setErrorMessage('Please check the entered number and try again.');
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headertitle} numberOfLines={1}>{provider.operator_name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.Content}>
        {/* Connection Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{provider.displayname || 'Connection / Consumer Number'}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="e.g. 127000021790"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              onChangeText={text => setConnNo(text)}
              value={ConnNo}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* UPPCL District Dropdown Selector */}
        {isUppcl && (
          <View style={[styles.inputContainer, { marginTop: 16 }]}>
            <Text style={styles.label}>Select District / DISCOM</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.dropdownSelector}
              onPress={() => setDistrictModalVisible(true)}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={
                    selectedDistrict
                      ? styles.dropdownSelectedText
                      : styles.dropdownPlaceholderText
                  }
                  numberOfLines={1}
                >
                  {selectedDistrict
                    ? `${selectedDistrict.district} (${selectedDistrict.districtDiscom})`
                    : 'Tap to Select District / DISCOM'}
                </Text>
                {selectedDistrict && (
                  <Text style={styles.dropdownSubtext}>
                    DISCOM: {selectedDistrict.discom} ({selectedDistrict.districtDiscom})
                  </Text>
                )}
              </View>
              <Icon name="chevron-down" size={16} color="#471d7d" />
            </TouchableOpacity>
          </View>
        )}

        {/* ---------------- LAST BILL PAYMENTS ---------------- */}
        {lastRecharges.length > 0 && (
          <View style={styles.lastRechargeBox}>
            <Text style={styles.lastRechargeTitle}>Recent Bill Payments</Text>

            {lastRecharges.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.lastRechargeItem}
                onPress={() => {
                  setConnNo(item.uniqueId);
                }}
              >
                <View>
                  <Text style={styles.lastRechargeNumber}>{item.uniqueId}</Text>
                  <Text style={styles.lastRechargeDate}>{item.date}</Text>
                </View>
                <Text style={styles.lastRechargeAmount}>₹{item.amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.loginBtn}>
          <Button title="FETCH BILL" onPress={handleSubmit} />
        </View>
        <View style={{ marginTop: 'auto', paddingTop: 16 }}>
          <Footer />
        </View>
      </View>

      {/* 🔴 Invalid Input / Fetch Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrap, { backgroundColor: '#fee2e2' }]}>
              <MaterialIcon name="alert-circle" size={44} color="#dc2626" />
            </View>
            <Text style={styles.modalTitle}>Invalid Input</Text>
            <Text style={styles.modalSubtitle}>{errorMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#dc2626' }]}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 📍 UPPCL District Selection Bottom Sheet / Modal */}
      <Modal
        visible={districtModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDistrictModalVisible(false)}
      >
        <View style={styles.districtModalOverlay}>
          <View style={styles.districtModalContent}>
            {/* Header */}
            <View style={styles.districtModalHeader}>
              <View>
                <Text style={styles.districtModalTitle}>Select District / DISCOM</Text>
                <Text style={styles.districtModalSubtitle}>
                  Choose your district for UPPCL bill fetch
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setDistrictModalVisible(false)}
              >
                <Icon name="times" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBox}>
              <Icon name="search" size={16} color="#94A3B8" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Search District (e.g. Lucknow, Agra, KESCO)..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                value={districtSearch}
                onChangeText={setDistrictSearch}
                autoCorrect={false}
              />
              {districtSearch.length > 0 && (
                <TouchableOpacity onPress={() => setDistrictSearch('')}>
                  <Icon name="times-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Districts List */}
            <FlatList
              data={filteredDistricts}
              keyExtractor={item => String(item.id || item.districtDiscom)}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected = selectedDistrict?.districtDiscom === item.districtDiscom;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles.districtItem,
                      isSelected && styles.districtItemActive,
                    ]}
                    onPress={() => {
                      setSelectedDistrict(item);
                      setDistrictModalVisible(false);
                      setDistrictSearch('');
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.districtName,
                          isSelected && styles.districtNameActive,
                        ]}
                      >
                        {item.district}
                      </Text>
                      <View style={styles.badgeRow}>
                        <View style={styles.discomBadge}>
                          <Text style={styles.discomBadgeText}>{item.discom}</Text>
                        </View>
                        <Text style={styles.districtDiscomCode}>{item.districtDiscom}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleActive,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerCircle} />}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={{ padding: 30, alignItems: 'center' }}>
                  <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                    No matching districts found
                  </Text>
                </View>
              }
            />
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
    backgroundColor: '#F2F4F7',
  },
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
  backBtn: { padding: 4 },
  headertitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  Content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  inputContainer: {
    marginTop: 10,
  },
  label: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#471d7d',
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Dropdown Selector Styles
  dropdownSelector: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#471d7d',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  dropdownSelectedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownPlaceholderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  dropdownSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#471d7d',
    marginTop: 2,
  },

  loginBtn: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  lastRechargeBox: {
    marginTop: 24,
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
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
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
    borderRadius: 24,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // District Modal Styles
  districtModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  districtModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  districtModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  districtModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  districtModalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  districtItemActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#C084FC',
  },
  districtName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  districtNameActive: {
    color: '#471d7d',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  discomBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discomBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6D28D9',
  },
  districtDiscomCode: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
    color: '#64748B',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#471d7d',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#471d7d',
  },
});
