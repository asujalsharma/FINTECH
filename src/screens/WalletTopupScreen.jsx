import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { postData, getData } from '../API';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constants/colors';

const { width } = Dimensions.get('window');

const QUICK_AMOUNTS = ['50', '100', '200', '500', '1000', '2000'];

const WalletTopupScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount]       = useState('100');
  const [wallet, setWallet]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Subtle pulse on the balance
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      try {
        const res = await getData('api/wallet/info');
        if (res?.Status || res?.success) {
          setWallet(res?.Data || res?.data);
        }
      } catch (error) {
        console.error('Wallet fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const generateOrderId = () =>
    'ORDUPI_' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleContinue = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to add.');
      return;
    }
    setSubmitting(true);
    try {
      const orderId = generateOrderId();
      const res = await postData('api/payment/upi/create-order', {
        amount: numericAmount,
        orderId,
        redirectUrl: 'https://rechargehoga.techember.in/payment-receipt',
        note: 'Add money to wallet via UPI',
      });
      if (res?.Data?.payment_url) {
        navigation.navigate('PaymentWebview', {
          paymentUrl: res.Data.payment_url,
          orderId,
          amount,
          from: 'wallet-topup',
        });
      } else {
        Alert.alert('Payment Error', 'Payment gateway could not be reached. Please try again.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Payment Error', 'Unable to initiate top up. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const rawBalance    = wallet?.balance ?? 0;
  const isLowBalance  = rawBalance < 500;
  const formattedBal  = Number(rawBalance).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Curved Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add Money</Text>
          <Text style={styles.headerSub}>Instant Wallet Top Up</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardTop}>
            {/* Icon */}
            <View style={styles.balanceIconRing}>
              <MaterialIcon name="wallet" size={22} color={COLORS.primary} />
            </View>

            {/* Balance info */}
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceCardLabel}>Available Balance</Text>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 6 }} />
              ) : (
                <Animated.Text
                  style={[
                    styles.balanceCardAmount,
                    isLowBalance && styles.balanceCardAmountLow,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  ₹ {formattedBal}
                </Animated.Text>
              )}
              <View style={styles.secureInline}>
                <MaterialIcon name="lock-outline" size={11} color="#94A3B8" />
                <Text style={styles.secureInlineText}>Secure UPI Top Up</Text>
              </View>
            </View>
          </View>

          {isLowBalance && !loading && (
            <View style={styles.lowBalanceBanner}>
              <MaterialIcon name="alert-circle-outline" size={14} color="#D97706" />
              <Text style={styles.lowBalanceBannerText}>
                Keep balance above ₹500 for uninterrupted recharges
              </Text>
            </View>
          )}
        </View>

        {/* ── Amount Input Card ── */}
        <View style={styles.inputCard}>
          <Text style={styles.inputCardTitle}>Enter Amount to Add</Text>

          <View style={styles.amountInputRow}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="#CBD5E1"
            />
            {amount ? (
              <TouchableOpacity onPress={() => setAmount('')} style={styles.clearBtn}>
                <MaterialIcon name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* Quick amount chips */}
          <Text style={styles.quickLabel}>Quick Select</Text>
          <View style={styles.chipsWrap}>
            {QUICK_AMOUNTS.map(amt => {
              const active = amount === amt;
              return (
                <TouchableOpacity
                  key={amt}
                  activeOpacity={0.8}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setAmount(amt)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    + ₹{amt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Security note */}
          <View style={styles.secureRow}>
            <MaterialIcon name="lock-outline" size={13} color="#94A3B8" />
            <Text style={styles.secureText}>256-bit Encrypted • Direct Wallet Credit</Text>
          </View>
        </View>

        {/* ── Perks ── */}
        <View style={styles.perksRow}>
          {[
            { icon: 'lightning-bolt', label: 'Instant Credit', color: '#F59E0B' },
            { icon: 'shield-check-outline', label: '100% Secure', color: '#10B981' },
            { icon: 'cash-multiple', label: 'No Hidden Fees', color: '#D81B60' },
          ].map(p => (
            <View key={p.label} style={styles.perkItem}>
              <View style={[styles.perkIcon, { backgroundColor: `${p.color}18` }]}>
                <MaterialIcon name={p.icon} size={18} color={p.color} />
              </View>
              <Text style={styles.perkLabel}>{p.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Sticky Pay Button ── */}
      <View style={styles.stickyBar}>
        <TouchableOpacity
          style={[styles.payBtn, submitting && { opacity: 0.75 }]}
          activeOpacity={0.88}
          onPress={handleContinue}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.payBtnText}>Proceed to Pay  ₹{amount || '0'}</Text>
              <MaterialIcon name="arrow-right-circle" size={22} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WalletTopupScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* Header */
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 14,
    paddingBottom: 36,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '500',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  /* Balance card */
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: -22,
    padding: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  balanceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceIconRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
  },
  balanceCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  balanceCardAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  balanceCardAmountLow: { color: '#D97706' },
  secureInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  secureInlineText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  lowBalanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
  },
  lowBalanceBannerText: {
    fontSize: 11.5,
    color: '#B45309',
    fontWeight: '600',
    flex: 1,
  },

  /* Input card */
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  inputCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: '#FFF5F8',
    marginBottom: 4,
  },
  rupeeSymbol: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
  },
  clearBtn: { padding: 4 },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  quickLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1.3,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF0F5',
    borderWidth: 1.8,
  },
  chipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 4,
  },
  secureText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  /* Perks row */
  perksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  perkItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  perkIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  perkLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },

  /* Sticky pay button */
  stickyBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
