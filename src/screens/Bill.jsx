import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { postData } from '../API';
import Footer from '../components/Footer';

const BLUE = '#5f259f';

export default function Bill() {
  const navigation = useNavigation();
  const route = useRoute();
  const { UniqueId, operator, fetchedBill } = route.params || {};

  const [bill, setBill] = useState(() =>
    fetchedBill ? normalizeBill(fetchedBill, UniqueId) : null,
  );
  const [loading, setLoading] = useState(() => {
    if (fetchedBill) {
      return !normalizeBill(fetchedBill, UniqueId);
    }
    return true;
  });
  const [noBill, setNoBill] = useState(false);

  useEffect(() => {
    if (fetchedBill) {
      const normalized = normalizeBill(fetchedBill, UniqueId);
      if (!normalized) {
        const raw = fetchedBill?.Data?.data || fetchedBill?.Data || fetchedBill?.data || fetchedBill;
        const msg =
          raw?.message ||
          raw?.Remarks ||
          raw?.Message ||
          fetchedBill?.message ||
          fetchedBill?.Remarks ||
          'Unable to get bill details from biller.';
        Alert.alert('Unable to Fetch Bill', msg, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
      return;
    }

    if (!UniqueId) return;

    let isMounted = true;
    async function load() {
      setLoading(true);
      setNoBill(false);

      try {
        const res = await postData(`/api/cyrus/bbps/new-bill-fetch`, {
          number: UniqueId,
          operator: operator?.op_id,
        });

        console.log('BBPS Bill Fetch Raw Response:', res);

        if (res?.status === 204 || res?.ResponseStatus === 204) {
          if (isMounted) setNoBill(true);
          return;
        }

        const normalized = normalizeBill(res, UniqueId);
        console.log('BBPS Normalized Bill Data:', normalized);

        if (isMounted) {
          if (!normalized) {
            const raw = res?.Data?.data || res?.Data || res?.data || res;
            const msg =
              raw?.message ||
              raw?.Remarks ||
              raw?.Message ||
              res?.Remarks ||
              res?.Message ||
              res?.message ||
              'Unable to get bill details from biller.';
            Alert.alert('Unable to Fetch Bill', msg, [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
            return;
          }
          setBill(normalized);
        }
      } catch (err) {
        console.error('BBPS Bill Fetch Error:', err);
        const errMsg =
          err?.response?.data?.Remarks ||
          err?.response?.data?.Message ||
          err?.response?.data?.message ||
          'Failed to fetch bill. Please verify the consumer number.';
        Alert.alert('Error', errMsg, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [UniqueId, operator]);

  // Comprehensive extractor for different BBPS backend response shapes
  function normalizeBill(res, defaultNumber) {
    if (!res) return null;

    const raw = res?.Data?.data || res?.Data || res?.data || res;
    if (
      res?.success === false ||
      raw?.success === false ||
      res?.Status === false ||
      raw?.Status === false
    ) {
      return null;
    }

    let billObj = null;
    let orderId = res?.orderId || res?.Data?.orderId || res?.data?.orderId || '';
    let partnerOrderId =
      res?.partnerOrderId || res?.Data?.partnerOrderId || res?.data?.partnerOrderId || '';

    if (res?.bill && typeof res.bill === 'object') {
      billObj = res.bill;
    } else if (res?.Data?.bill && typeof res.Data.bill === 'object') {
      billObj = res.Data.bill;
      orderId = res.Data.orderId || orderId;
      partnerOrderId = res.Data.partnerOrderId || partnerOrderId;
    } else if (res?.data?.bill && typeof res.data.bill === 'object') {
      billObj = res.data.bill;
      orderId = res.data.orderId || orderId;
      partnerOrderId = res.data.partnerOrderId || partnerOrderId;
    } else if (res?.Data?.data?.bill && typeof res.Data.data.bill === 'object') {
      billObj = res.Data.data.bill;
      orderId = res.Data.data.orderId || orderId;
      partnerOrderId = res.Data.data.partnerOrderId || partnerOrderId;
    } else if (raw?.bill_amount !== undefined || raw?.amount !== undefined) {
      billObj = raw;
    }

    if (!billObj) return null;

    const customerName =
      billObj.customer_name ??
      billObj.customerName ??
      billObj.userName ??
      billObj.name ??
      billObj.account_name ??
      'Consumer';

    const number =
      billObj.customer_ref_id ??
      billObj.customerRefId ??
      billObj.cellNumber ??
      billObj.consumer_number ??
      billObj.number ??
      defaultNumber;

    const billDate =
      billObj.bill_date ??
      billObj.billDate ??
      billObj.billdate ??
      null;

    const dueDate =
      billObj.due_date ??
      billObj.dueDate ??
      billObj.due ??
      null;

    const rawAmount =
      billObj.bill_amount ??
      billObj.bill_net_amount ??
      billObj.amount ??
      billObj.billAmount ??
      billObj.net_amount ??
      0;

    const amount = parseFloat(rawAmount) || 0;
    const netAmount = parseFloat(billObj.bill_net_amount || rawAmount) || amount;

    return {
      ...billObj,
      customerName,
      number,
      billDate,
      dueDate,
      amount,
      netAmount,
      orderId: billObj.orderId || orderId,
      partnerOrderId: billObj.partnerOrderId || partnerOrderId,
      acceptPayment: billObj.accept_payment ?? true,
      acceptPartPay: billObj.accept_part_pay ?? false,
      minBillAmount: billObj.min_bill_amount || '',
    };
  }

  const formatCurrency = num => {
    const val = parseFloat(num) || 0;
    return (
      '₹' +
      val.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  // -------------------------
  // LOADING STATE
  // -------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar barStyle="light-content" backgroundColor={BLUE} />
        <View style={styles.loaderCard}>
          <View style={styles.loaderIconWrap}>
            <MaterialIcon name="flash-on" size={36} color={BLUE} />
          </View>
          <ActivityIndicator size="large" color={BLUE} style={{ marginVertical: 14 }} />
          <Text style={styles.loaderTitle}>Fetching Bill Details</Text>
          <Text style={styles.loaderSubtitle}>
            Connecting to Bharat BillPay (BBPS) servers...
          </Text>
          <View style={styles.bbpsBadge}>
            <MaterialIcon name="verified-user" size={16} color="#059669" />
            <Text style={styles.bbpsBadgeText}>BBPS Secure Fetch</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------
  // NO BILLS DUE STATE
  // -------------------------
  if (noBill) {
    return (
      <SafeAreaView style={styles.noBillContainer}>
        <StatusBar barStyle="light-content" backgroundColor={BLUE} />
        <View style={styles.noBillCard}>
          <View style={styles.noBillIconWrap}>
            <MaterialIcon name="check-circle" size={64} color="#10B981" />
          </View>
          <Text style={styles.noBillTitle}>NO BILLS DUE</Text>
          <Text style={styles.noBillSubtitle}>
            There are no pending dues for Consumer ID{' '}
            <Text style={{ fontWeight: '700', color: '#0F172A' }}>{UniqueId}</Text>.
          </Text>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      {/* Header Banner - Compact & Shifted Up */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialIcon name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.bbpsPill}>
            <MaterialIcon name="verified-user" size={13} color="#FBBF24" />
            <Text style={styles.bbpsPillText}>Bharat BillPay (BBPS)</Text>
          </View>
        </View>

        <Text style={styles.operatorTitle} numberOfLines={2}>
          {operator?.operator_name || operator?.Operator || 'Electricity Bill'}
        </Text>
        <Text style={styles.operatorSub}>Instant Verified Bill Payment</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Customer Identity Card */}
        <View style={styles.customerCard}>
          <View style={styles.avatarWrap}>
            <MaterialIcon name="person" size={28} color={BLUE} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.verifiedRow}>
              <Text style={styles.customerName} numberOfLines={1}>
                {bill?.customerName || 'Consumer'}
              </Text>
              <MaterialIcon name="verified" size={18} color="#059669" style={{ marginLeft: 6 }} />
            </View>
            <View style={styles.numberBadge}>
              <Text style={styles.numberBadgeLabel}>Consumer No:</Text>
              <Text style={styles.numberBadgeValue}>{bill?.number || UniqueId}</Text>
            </View>
          </View>
        </View>

        {/* Hero Bill Amount Card */}
        <View style={styles.amountHeroCard}>
          <View style={styles.amountHeroHeader}>
            <Text style={styles.amountHeroLabel}>TOTAL BILL DUE</Text>
            {bill?.dueDate && (
              <View style={styles.dueBadge}>
                <MaterialIcon name="schedule" size={13} color="#DC2626" />
                <Text style={styles.dueBadgeText}>Due: {bill.dueDate}</Text>
              </View>
            )}
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountHeroVal}>{formatCurrency(bill?.amount)}</Text>
          </View>

          {bill?.billDate ? (
            <Text style={styles.billDateInfo}>
              Bill Generated On: <Text style={{ fontWeight: '700', color: '#5f259f' }}>{bill.billDate}</Text>
            </Text>
          ) : null}
        </View>

        {/* Detailed Bill Information Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeadingRow}>
            {/* Fixed question mark glyph by using standard MaterialIcon receipt */}
            <MaterialIcon name="receipt" size={20} color={BLUE} />
            <Text style={styles.cardHeading}>Bill Breakdown</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Consumer Name</Text>
            <Text style={styles.detailValueBold}>{bill?.customerName || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Consumer / Account No</Text>
            <Text style={styles.detailValueBold}>{bill?.number || UniqueId || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bill Date</Text>
            <Text style={styles.detailValue}>{bill?.billDate || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Due Date</Text>
            <Text
              style={[
                styles.detailValue,
                { color: '#DC2626', fontWeight: '800' },
              ]}
            >
              {bill?.dueDate || '—'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bill Amount</Text>
            <Text style={styles.detailValue}>{formatCurrency(bill?.amount)}</Text>
          </View>

          <View style={[styles.detailRow, styles.netRow]}>
            <Text style={styles.netLabel}>Net Payable Amount</Text>
            <Text style={styles.netValue}>{formatCurrency(bill?.netAmount || bill?.amount)}</Text>
          </View>

          {bill?.orderId ? (
            <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.detailLabel}>BBPS Order ID</Text>
              <Text style={styles.refValue}>{bill.orderId}</Text>
            </View>
          ) : null}
        </View>

        {/* Security / Processing Advisory Box */}
        <View style={styles.advisoryCard}>
          <MaterialIcon name="info-outline" size={20} color="#D97706" style={{ marginRight: 10, marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.advisoryTitle}>BBPS Processing Note</Text>
            <Text style={styles.advisoryText}>
              The service provider may occasionally take up to 24–72 hours to reflect the payment in their consumer records. Your payment receipt is instant and 100% BBPS verified.
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Footer />
        </View>
      </ScrollView>

      {/* Floating Bottom Pay Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarLabel}>Payable Amount</Text>
          <Text style={styles.bottomBarAmount}>{formatCurrency(bill?.amount)}</Text>
        </View>

        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('PaymentConfirmation', {
              operatorDetail: operator,
              rechargeData: {
                ...bill,
                rs: bill?.amount,
                amount: bill?.amount,
                number: bill?.number || UniqueId,
                customerID: bill?.number || UniqueId,
                customerName: bill?.customerName,
              },
              isPrePaid: false,
              from: operator?.operator_name || 'Electricity',
              category: 'Electricity Bill',
            })
          }
        >
          <Text style={styles.payBtnText}>PROCEED TO PAY</Text>
          <MaterialIcon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },

  /* HEADER - Compact & Shifted Up */
  header: {
    backgroundColor: BLUE,
    paddingTop: Platform.OS === 'ios' ? 6 : 4,
    paddingBottom: 22,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 5,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bbpsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  bbpsPillText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
    letterSpacing: 0.2,
  },
  operatorTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 23,
    letterSpacing: 0.2,
  },
  operatorSub: {
    fontSize: 12,
    color: '#BFDBFE',
    marginTop: 2,
    fontWeight: '500',
  },

  /* SCROLL CONTENT */
  scrollContent: {
    paddingBottom: 100,
  },

  /* CUSTOMER IDENTITY CARD */
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#DCE5FF',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  numberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  numberBadgeLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  numberBadgeValue: {
    fontSize: 13,
    color: BLUE,
    fontWeight: '800',
    marginLeft: 4,
  },

  /* AMOUNT HERO CARD */
  amountHeroCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    elevation: 2,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  amountHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountHeroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5f259f',
    letterSpacing: 0.5,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 4,
  },
  amountRow: {
    marginTop: 6,
    marginBottom: 2,
  },
  amountHeroVal: {
    fontSize: 30,
    fontWeight: '900',
    color: BLUE,
    letterSpacing: 0.5,
  },
  billDateInfo: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },

  /* DETAILS CARD */
  detailsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    elevation: 3,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  cardHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  detailValueBold: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '800',
    maxWidth: '60%',
    textAlign: 'right',
  },
  netRow: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 4,
    borderBottomWidth: 0,
  },
  netLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  netValue: {
    fontSize: 15,
    fontWeight: '900',
    color: BLUE,
  },
  refValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },

  /* ADVISORY CARD */
  advisoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  advisoryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  advisoryText: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 16,
    fontWeight: '500',
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
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
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
    fontSize: 21,
    fontWeight: '900',
    color: BLUE,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* LOADER STATE */
  loaderContainer: {
    flex: 1,
    backgroundColor: '#F4F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '90%',
    elevation: 6,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loaderIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  loaderSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  bbpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bbpsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 6,
  },

  /* NO BILL STATE */
  noBillContainer: {
    flex: 1,
    backgroundColor: '#F4F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noBillCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '90%',
    elevation: 6,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noBillIconWrap: {
    marginBottom: 16,
  },
  noBillTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  noBillSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  homeBtn: {
    backgroundColor: BLUE,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 24,
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  homeBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
