import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { getData, postData } from '../API';
import { THEME_COLORS, GRADIENTS } from '../constants/theme';

const WalletTopupScreen = () => {
  const navigation = useNavigation();
  const [wallet, setWallet] = useState(null);
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getData('api/user/profile');
        if (res?.Status || res?.success) {
          const userData = res?.Data || res?.user;
          setWallet(userData?.wallet);

          // Fetch transaction history using working endpoint
          if (userData?._id) {
            try {
              const txRes = await getData(`api/txn/list/${userData._id}`);
              if ((txRes?.Status || txRes?.success) && txRes?.Data && Array.isArray(txRes.Data)) {
                setRechargeHistory(txRes.Data.slice(0, 20));
              } else {
                setRechargeHistory([]);
              }
            } catch (txErr) {
              console.log('Transaction history fetch skipped:', txErr.message);
              setRechargeHistory([]);
            }
          }
        }
      } catch (e) {
        console.log('Wallet fetch error:', e.message);
        setRechargeHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateOrderId = () =>
    'ORDUPI_' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleTopup = async () => {
    try {
      const orderId = generateOrderId();
      const res = await postData('api/payment/upi/create-order', {
        amount: 500,
        orderId,
        redirectUrl: 'https://recharge99.com/payment-receipt',
        note: 'Add money to wallet',
      });
      if (res?.Data?.payment_url) {
        navigation.navigate('PaymentWebview', {
          paymentUrl: res.Data.payment_url,
          orderId,
          amount: 500,
          from: 'wallet-topup',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#94A3B8';
    const s = status.toLowerCase();
    if (s === 'success' || s === 'done' || s === 'completed') return '#16A34A';
    if (s === 'pending' || s === 'processing') return '#F59E0B';
    if (s === 'failed' || s === 'error') return '#EF4444';
    return '#94A3B8';
  };

  const getStatusBg = (status) => {
    if (!status) return '#F1F5F9';
    const s = status.toLowerCase();
    if (s === 'success' || s === 'done' || s === 'completed') return '#DCFCE7';
    if (s === 'pending' || s === 'processing') return '#FEF3C7';
    if (s === 'failed' || s === 'error') return '#FEE2E2';
    return '#F1F5F9';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr?.slice(0, 10) || '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Wallet</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.whiteSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceTopRow}>
              <View>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>
                  ₹ {wallet?.balance?.toLocaleString('en-IN') || '0'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleTopup}>
                <LinearGradient
                  colors={['#FF9500', '#E07000']}
                  style={styles.addBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name="plus" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recharge History */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recharge History</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color={THEME_COLORS.primary} />
                <Text style={styles.loaderText}>Loading history...</Text>
              </View>
            ) : rechargeHistory.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Icon name="inbox" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Recharges Yet</Text>
                <Text style={styles.emptyDesc}>Your recharge history will appear here</Text>
              </View>
            ) : (
              rechargeHistory.map((tx, idx) => (
                <View key={tx._id || idx} style={styles.txCard}>
                  <View style={styles.txIconWrap}>
                    <Icon
                      name={tx.type === 'BBPS' ? 'file-text' : 'smartphone'}
                      size={18}
                      color={THEME_COLORS.primary}
                    />
                  </View>

                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle} numberOfLines={1}>
                      {tx.operator || tx.type || 'Recharge'}
                    </Text>
                    <Text style={styles.txNumber} numberOfLines={1}>
                      {tx.number || tx.mobile || '—'}
                    </Text>
                    <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
                  </View>

                  <View style={styles.txRight}>
                    <Text style={styles.txAmount}>₹ {tx.amount || 0}</Text>
                    <View style={[styles.txBadge, { backgroundColor: getStatusBg(tx.status) }]}>
                      <Text style={[styles.txBadgeText, { color: getStatusColor(tx.status) }]}>
                        {tx.status || 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default WalletTopupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.primary,
  },

  /* ── HEADER ── */
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },

  /* ── WHITE SHEET ── */
  whiteSheet: {
    backgroundColor: '#F5F7FA',
    marginTop: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    flex: 1,
  },

  /* ── BALANCE CARD ── */
  balanceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#1756C5',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1A1A2E',
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── ACTION BUTTONS ── */
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sendBtn: {
    flex: 1,
  },
  upiBtn: {
    flex: 1,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },

  /* ── HISTORY SECTION ── */
  historySection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: 0.3,
  },
  seeAll: {
    fontSize: 13,
    color: THEME_COLORS.primary,
    fontWeight: '700',
  },

  /* ── LOADER / EMPTY ── */
  loaderWrap: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 14,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
  },

  /* ── TRANSACTION CARD ── */
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  txIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  txInfo: {
    flex: 1,
    paddingRight: 8,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  txNumber: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  txDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  txRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  txBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  txBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
