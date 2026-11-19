import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import COLORS from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { URL } from '../constants/URL';
import axios from 'axios';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];

const QRPayment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { data, id, name: routeName, amount: routeAmount } = route.params || {};

  const [imagePath, setImagePath] = useState(null);
  const [payer, setPayer] = useState(null);
  const [amount, setAmount] = useState(routeAmount ? String(routeAmount) : '');
  const [note, setNote] = useState('');

  const displayName =
    routeName ||
    (payer ? `${payer.firstName || ''} ${payer.lastName || ''}`.trim() : '') ||
    'RightPay Merchant';

  const displayInitial = (displayName.charAt(0) || 'R').toUpperCase();

  const fetchImg = async () => {
    if (!id || id.includes('@') || id.startsWith('upi://') || id.startsWith('rightpay://')) return;
    try {
      const response = await axios.get(`${URL}/api/display/${id}`);
      if (response.data?.imagePath) {
        setImagePath(response.data.imagePath.replace(/\\/g, '/'));
      }
    } catch (error) {
      // Non-critical for wallet payee
    }
  };

  const fetchAccountDetails = async () => {
    if (!id || id.includes('@') || id.startsWith('upi://') || id.startsWith('rightpay://')) return;
    try {
      const response = await axios.post(`${URL}/api/details/account`, { id });
      if (response?.data) {
        setPayer(response.data);
      }
    } catch (error) {
      // Non-critical for wallet payee
    }
  };

  useEffect(() => {
    fetchImg();
    fetchAccountDetails();
  }, [id]);

  const handleAddAmount = (addVal) => {
    const current = Number(amount) || 0;
    setAmount(String(current + addVal));
  };

  const handleProceed = () => {
    const finalAmount = Number(amount);
    if (!finalAmount || finalAmount <= 0) {
      return;
    }

    navigation.navigate('QRVerify', {
      data: data,
      amount: String(finalAmount),
      id: id,
      name: displayName,
      note: note,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* RightPay Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#002E6E" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Paying RightPay Merchant</Text>
            <Text style={styles.headerSubtitle}>RightPay Wallet Instant Transfer</Text>
          </View>
          <View style={styles.trustShieldWrap}>
            <MaterialIcon name="verified-user" size={22} color="#00BAF2" />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Merchant / Payee Profile Card */}
          <View style={styles.merchantCard}>
            <View style={styles.avatarWrap}>
              {imagePath ? (
                <Image
                  source={{ uri: `${URL}/${imagePath}` }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>{displayInitial}</Text>
                </View>
              )}
              <View style={styles.verifiedBadge}>
                <MaterialIcon name="check" size={12} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.merchantInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.merchantName} numberOfLines={1}>
                  {displayName}
                </Text>
                <MaterialIcon name="verified" size={18} color="#00BAF2" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.merchantVpa} numberOfLines={1}>
                {id ? `Wallet ID: ${id}` : 'RightPay Wallet Payee'}
              </Text>
              <View style={styles.bankingBadge}>
                <MaterialCommunityIcons name="shield-check" size={13} color="#00B374" />
                <Text style={styles.bankingBadgeText}>RightPay Verified Merchant</Text>
              </View>
            </View>
          </View>

          {/* Amount Input Card */}
          <View style={styles.amountCard}>
            <Text style={styles.enterAmountLabel}>Enter Amount</Text>

            <View style={styles.amountRow}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#CBD5E1"
                value={amount}
                autoFocus={!amount}
                onChangeText={setAmount}
                maxLength={7}
              />
            </View>

            {/* Quick Amount Suggestion Chips */}
            <View style={styles.chipsRow}>
              {QUICK_AMOUNTS.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={styles.chip}
                  activeOpacity={0.7}
                  onPress={() => handleAddAmount(val)}
                >
                  <Text style={styles.chipText}>+₹{val}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note input */}
            <View style={styles.noteWrap}>
              <Icon name="chatbubble-ellipses-outline" size={18} color="#64748B" />
              <TextInput
                style={styles.noteInput}
                placeholder="Add a message (optional)"
                placeholderTextColor="#94A3B8"
                value={note}
                onChangeText={setNote}
                maxLength={40}
              />
            </View>
          </View>

          {/* Payment Method / Debiting From RightPay Wallet */}
          <View style={styles.sourceCard}>
            <View style={styles.sourceHeader}>
              <MaterialCommunityIcons name="wallet-outline" size={20} color="#002E6E" />
              <Text style={styles.sourceTitle}>Pay From RightPay Wallet</Text>
            </View>
            <View style={styles.sourceDetailsRow}>
              <View style={styles.bankDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bankName}>RightPay Wallet</Text>
                <Text style={styles.bankSub}>Available Wallet Balance • Instant Payment</Text>
              </View>
              <View style={styles.upiShield}>
                <MaterialIcon name="shield" size={13} color="#00BAF2" />
                <Text style={styles.upiShieldText}>WALLET</Text>
              </View>
            </View>
          </View>

          {/* Trust Security Strip */}
          <View style={styles.trustBanner}>
            <MaterialIcon name="security" size={16} color="#00BAF2" />
            <Text style={styles.trustBannerText}>
              256-Bit Encrypted & 100% Secure RightPay Wallet
            </Text>
          </View>
        </ScrollView>

        {/* RightPay Proceed Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.payBtn,
              !(Number(amount) > 0) && styles.payBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={!(Number(amount) > 0)}
            onPress={handleProceed}
          >
            <Text style={styles.payBtnText}>
              {Number(amount) > 0
                ? `Proceed to Pay ₹${Number(amount).toLocaleString('en-IN')}`
                : 'Enter Amount to Pay'}
            </Text>
            <Icon name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default QRPayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#002E6E',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  trustShieldWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F8FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    padding: 16,
  },

  /* Merchant Card */
  merchantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#002E6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#002E6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#00B374',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  merchantInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  merchantName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  merchantVpa: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  bankingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bankingBadgeText: {
    fontSize: 11,
    color: '#00B374',
    fontWeight: '600',
    marginLeft: 4,
  },

  /* Amount Card */
  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#002E6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  enterAmountLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#00BAF2',
    paddingBottom: 8,
  },
  rupeeSymbol: {
    fontSize: 38,
    fontWeight: '800',
    color: '#002E6E',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 38,
    fontWeight: '800',
    color: '#002E6E',
    padding: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#002E6E',
  },
  noteWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#0F172A',
  },

  /* Source Card */
  sourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#002E6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002E6E',
    marginLeft: 6,
  },
  sourceDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  bankDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00BAF2',
    marginRight: 10,
  },
  bankName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  bankSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  upiShield: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  upiShieldText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#002E6E',
    marginLeft: 3,
  },

  /* Trust Banner */
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  trustBannerText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 6,
  },

  /* Bottom Bar */
  bottomBar: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#002E6E',
    borderRadius: 12,
    paddingVertical: 14,
  },
  payBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
