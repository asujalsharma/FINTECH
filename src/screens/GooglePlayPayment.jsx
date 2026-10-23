import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getData } from '../API';
import Footer from '../components/Footer';

const BLUE = '#5f259f';
const QUICK_AMOUNTS = [100, 250, 500, 800, 1000, 1500, 2000];

const GooglePlayPayment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ServiceId } = route.params || {};

  const [amount, setAmount] = useState('500');
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await getData(`/api/user/profile`);
      if (res?.Status === true || res?.success === true) {
        const u = res?.Data || res?.user;
        setUserData(u);
        if (u?.phone) {
          setPhone(u.phone);
        }
      }
    } catch (err) {
      console.log('User Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSelectQuickAmount = amt => {
    setAmount(String(amt));
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Minimum Google Play recharge amount is ₹10.',
      });
      return;
    }

    if (numAmount > 5000) {
      Toast.show({
        type: 'error',
        text1: 'Amount Exceeded',
        text2: 'Maximum single recharge limit is ₹5,000.',
      });
      return;
    }

    const targetPhone = phone?.trim() || userData?.phone || '';
    if (!targetPhone || targetPhone.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Mobile Number Required',
        text2: 'Please enter a valid 10-digit mobile number for code delivery.',
      });
      return;
    }

    navigation.navigate('PaymentConfirmation', {
      rechargeData: {
        amount: numAmount,
        rs: numAmount,
        userDetails: userData,
        number: targetPhone,
      },
      operatorDetail: {
        amount: numAmount,
        ServiceId: ServiceId || 'googleplay',
        name: 'Google Play',
        Operator: 'Google Play Recharge Code',
        OperatorName: 'Google Play Recharge Code',
        Logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Google_Play_Arrow_logo.svg/512px-Google_Play_Arrow_logo.svg.png',
      },
      from: 'googleplay',
      isPrePaid: false,
      category: 'Google Play',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <MaterialIcon name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.playBadge}>
            <Icon name="google-play" size={14} color="#FFF" />
            <Text style={styles.playBadgeText}>Google Play Gift Card</Text>
          </View>
        </View>

        <Text style={styles.headerTitle}>Google Play Recharge</Text>
        <Text style={styles.headerSubtitle}>
          Get instant 16-digit redeem code delivered directly
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Card */}
          <View style={styles.card}>
            {/* Play Brand Visual Info */}
            <View style={styles.brandHero}>
              <View style={styles.playLogoCircle}>
                <Icon name="google-play" size={32} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.brandTitle}>Play Store Recharge Code</Text>
                <Text style={styles.brandDesc}>
                  Use for apps, games, movies, books, and in-game items
                </Text>
              </View>
            </View>

            {/* Mobile Number for SMS */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Mobile Number </Text>
              <View style={styles.phoneInputWrap}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType={Platform.OS === 'android' ? 'numeric' : 'number-pad'}
                  maxLength={10}
                />
              </View>
            </View>

            {/* Amount Field */}
            <View style={styles.inputSection}>
              <View style={styles.amountLabelRow}>
                <Text style={styles.inputLabel}>Recharge Amount</Text>
                <Text style={styles.limitText}>Min ₹10 - Max ₹5,000</Text>
              </View>

              <View style={styles.amountInputWrap}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor="#CBD5E1"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType={Platform.OS === 'android' ? 'numeric' : 'number-pad'}
                  maxLength={5}
                />
              </View>
            </View>

            {/* Quick Amount Chips */}
            <Text style={styles.quickTitle}>Popular Amounts</Text>
            <View style={styles.chipsWrap}>
              {QUICK_AMOUNTS.map(val => {
                const isSelected = amount === String(val);
                return (
                  <TouchableOpacity
                    key={val}
                    activeOpacity={0.75}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}
                    onPress={() => handleSelectQuickAmount(val)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      ₹{val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Features Info Box */}
            <View style={styles.trustBox}>
              <View style={styles.trustItem}>
                <MaterialIcon name="bolt" size={18} color="#D97706" />
                <Text style={styles.trustText}>Instant 16-Digit Code</Text>
              </View>
              <View style={styles.trustDot} />
              <View style={styles.trustItem}>
                <MaterialIcon name="verified-user" size={16} color="#059669" />
                <Text style={styles.trustText}>Official Code</Text>
              </View>
              <View style={styles.trustDot} />
              <View style={styles.trustItem}>
                <MaterialIcon name="content-copy" size={16} color="#5f259f" />
                <Text style={styles.trustText}>1-Tap Copy</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <Footer />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarLabel}>Recharge Amount</Text>
          <Text style={styles.bottomBarAmount}>
            ₹{parseFloat(amount) ? parseFloat(amount).toFixed(2) : '0.00'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          <Text style={styles.payBtnText}>CONTINUE TO PAY</Text>
          <MaterialIcon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GooglePlayPayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },

  /* HEADER */
  header: {
    backgroundColor: BLUE,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 28,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  playBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#BFDBFE',
    marginTop: 4,
    fontWeight: '500',
  },

  /* CONTENT */
  scrollContent: {
    paddingBottom: 110,
  },

  /* FORM CARD */
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 22,
    padding: 18,
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },

  brandHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  playLogoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },

  inputSection: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  amountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  limitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 12,
  },
  countryCodeBadge: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 0,
  },

  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 58,
    paddingHorizontal: 16,
  },
  rupeeSymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: BLUE,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    paddingVertical: 0,
  },

  quickTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: BLUE,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextSelected: {
    color: BLUE,
    fontWeight: '800',
  },

  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 5,
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
  },

  /* BOTTOM FLOATING BAR */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 12,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bottomBarLeft: {
    flex: 1,
  },
  bottomBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  bottomBarAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: BLUE,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
