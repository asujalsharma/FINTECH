import React, { useEffect, useState } from 'react';
import { postData } from '../API';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Footer from '../components/Footer';

export default function Bill() {
  const navigation = useNavigation();
  const route = useRoute();
  const { UniqueId, operator } = route.params || {};
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [paidMessage, setPaidMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  console.log('Operator:', operator);

  useEffect(() => {
    if (!UniqueId) return;
    async function load() {
      setLoading(true);
      try {
        const res = await postData(`/api/cyrus/bbps/new-bill-fetch`, {
          number: UniqueId,
          operator: operator?.op_id,
        });
        console.log('BBPS Bill Fetch Response:', res);

        // 1. Status 204 or explicit no bill
        if (res?.status === 204 || res?.Status === 204) {
          setShowPaidModal(true);
          return;
        }

        // 2. Check if success is false
        if (res?.success === false || res?.Status === false) {
          const msg =
            res?.message ||
            res?.Remarks ||
            res?.RemarksDesc ||
            'Not able to fetch bill. Try after some time';
          const lower = msg.toLowerCase();
          if (
            lower.includes('already paid') ||
            lower.includes('no bill') ||
            lower.includes('no due') ||
            lower.includes('bill already') ||
            lower.includes('paid')
          ) {
            setPaidMessage(msg);
            setShowPaidModal(true);
          } else {
            setErrorMessage(msg);
            setShowErrorModal(true);
          }
          return;
        }

        // 3. Extract and normalize
        const rawBill =
          res?.bill ||
          res?.Data?.bill ||
          res?.data?.bill ||
          res?.Data?.data ||
          res?.Data ||
          res?.data ||
          res;

        // Check if raw bill data is valid
        const rawAmount =
          rawBill?.bill_amount ??
          rawBill?.bill_net_amount ??
          rawBill?.amount ??
          rawBill?.billAmount ??
          rawBill?.DueAmount;

        const rawAmountStr =
          rawAmount !== undefined && rawAmount !== null
            ? String(rawAmount).trim()
            : '';

        // If bill data is empty or amount is blank / invalid, cannot fetch bill
        if (
          !rawBill ||
          typeof rawBill !== 'object' ||
          rawAmountStr === '' ||
          isNaN(Number(rawAmountStr)) ||
          (!rawBill?.customer_name && !rawBill?.bill_date && !rawBill?.due_date && Number(rawAmountStr) === 0)
        ) {
          setErrorMessage('Not able to fetch bill. Try after some time');
          setShowErrorModal(true);
          return;
        }

        const normalized = normalizeBill(rawBill, res);

        // Check if amount is 0 or accept_payment is explicitly false -> bill already paid
        const amountNum = parseFloat(normalized?.amount || 0);
        const isAcceptPaymentFalse =
          normalized?.acceptPayment === false ||
          rawBill?.accept_payment === false ||
          rawBill?.accept_payment === 'false';

        if (isAcceptPaymentFalse || amountNum === 0) {
          setBill(normalized);
          setShowPaidModal(true);
          return;
        }

        setBill(normalized);
      } catch (err) {
        console.log('Error fetching bill:', err);
        const errMsg =
          err?.response?.data?.message ||
          err?.response?.data?.Remarks ||
          err?.message ||
          'Not able to fetch bill. Try after some time';
        const lower = errMsg.toLowerCase();
        if (
          lower.includes('already paid') ||
          lower.includes('no bill') ||
          lower.includes('no due')
        ) {
          setPaidMessage(errMsg);
          setShowPaidModal(true);
        } else {
          setErrorMessage(errMsg);
          setShowErrorModal(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [UniqueId]);

  function normalizeBill(b, rawRes) {
    if (!b) return null;
    const rawAmt =
      b.bill_amount ??
      b.bill_net_amount ??
      b.amount ??
      b.billAmount ??
      b.DueAmount;

    return {
      customerName:
        (b.customer_name && String(b.customer_name).trim()) ||
        (b.customerName && String(b.customerName).trim()) ||
        (b.userName && String(b.userName).trim()) ||
        'Unknown',
      number:
        b.customer_ref_id ??
        b.ConsumerNumber ??
        b.cellNumber ??
        b.number ??
        UniqueId,
      billDate:
        b.bill_date ??
        b.billDate ??
        b.billdate ??
        null,
      dueDate:
        b.due_date ??
        b.dueDate ??
        b.due ??
        null,
      amount:
        rawAmt !== undefined && rawAmt !== null && String(rawAmt).trim() !== ''
          ? String(rawAmt).trim()
          : 0,
      orderId: rawRes?.orderId ?? b.orderId ?? null,
      partnerOrderId: rawRes?.partnerOrderId ?? b.partnerOrderId ?? null,
      acceptPayment:
        b.accept_payment === false || b.accept_payment === 'false'
          ? false
          : b.accept_payment === true || b.accept_payment === 'true'
          ? true
          : b.accept_payment ?? true,
      rawBill: b,
    };
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#471d7d" />
        <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '500' }}>
          Fetching bill details...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🟣 Fixed Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <FontAwesome name="chevron-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headertitle} numberOfLines={1}>
          {operator?.operator_name || 'Bill Details'}
        </Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Icon name="account-circle" size={48} color="#471d7d" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{bill?.customerName || 'Unknown'}</Text>
            <Text style={styles.userNumber}>Number: {bill?.number || UniqueId}</Text>
          </View>
        </View>

        {/* Bill Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Bill Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bill Date</Text>
            <Text style={styles.detailValue}>{bill?.billDate || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bill Amount</Text>
            <Text style={styles.detailValue}>₹{bill?.amount || '0'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: '#dc2626' }]}>
              Due Date
            </Text>
            <Text style={[styles.detailValue, { color: '#dc2626' }]}>
              {bill?.dueDate || '—'}
            </Text>
          </View>
        </View>

        {/* Amount Big Display */}
        <View style={styles.amountCard}>
          <Text style={styles.amountSymbol}>₹</Text>
          <Text style={styles.amountValue}>{bill?.amount || '0'}</Text>
        </View>

        {/* Notice */}
        <View style={styles.noticeBox}>
          <Icon name="alert-circle-outline" size={20} color="#d97706" />
          <Text style={styles.noticeText}>
            The service provider may occasionally take up to 72 hours to
            process your bill.
          </Text>
        </View>

        <View style={{ marginTop: 24, paddingBottom: 60 }}>
          <Footer />
        </View>
      </ScrollView>

      {/* ✅ Fixed Pay Button at Bottom */}
      <TouchableOpacity
        style={styles.payButton}
        onPress={() =>
          navigation.navigate('PaymentConfirmation', {
            operatorDetail: operator,
            rechargeData: bill,
            isPrePaid: false,
          })
        }
      >
        <Text style={styles.payText}>Pay Now</Text>
        <Icon name="chevron-double-right" size={22} color="#fff" />
      </TouchableOpacity>

      {/* 🟢 Bill Already Paid Modal */}
      <Modal
        visible={showPaidModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPaidModal(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrap, { backgroundColor: '#dcfce7' }]}>
              <Icon name="check-circle" size={44} color="#16a34a" />
            </View>
            <Text style={styles.modalTitle}>Bill Already Paid</Text>
            <Text style={styles.modalSubtitle}>
              {paidMessage ||
                'You have no outstanding bills at the moment. Your bill has already been paid.'}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#471d7d' }]}
              onPress={() => {
                setShowPaidModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🔴 Bill Fetch Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowErrorModal(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrap, { backgroundColor: '#fee2e2' }]}>
              <Icon name="alert-circle" size={44} color="#dc2626" />
            </View>
            <Text style={styles.modalTitle}>Bill Fetch Error</Text>
            <Text style={styles.modalSubtitle}>
              {errorMessage ||
                'Not able to fetch bill. Try after some time'}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#dc2626' }]}
              onPress={() => {
                setShowErrorModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#471d7d',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headertitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatar: {
    marginRight: 14,
    backgroundColor: '#EDE7F6',
    padding: 8,
    borderRadius: 24,
  },
  userName: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  userNumber: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '500' },

  detailsCard: {
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    color: '#0F172A',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#0F172A' },

  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  amountSymbol: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginRight: 4 },
  amountValue: { fontSize: 32, fontWeight: '900', color: '#0F172A' },

  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 16,
  },
  noticeText: {
    color: '#92400E',
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },

  payButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#471d7d',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    elevation: 6,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  payText: { color: '#fff', fontWeight: '700', fontSize: 17, marginRight: 6 },

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
});
