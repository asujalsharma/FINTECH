import React, { useEffect, useState } from 'react';
import { postData } from '../API';
import { useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

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
            'Unable to fetch bill';
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

        const normalized = normalizeBill(rawBill, res);

        // Check if amount is 0 or accept_payment is false -> bill already paid
        const amountNum = parseFloat(normalized?.amount || 0);
        if (
          normalized?.acceptPayment === false ||
          (amountNum === 0 && !res?.bill?.accept_payment)
        ) {
          setBill(normalized);
          setShowPaidModal(true);
          return;
        }

        setBill(normalized);
      } catch (err) {
        console.log('Error fetching bill:', err);
        const errMsg =
          err?.response?.data?.Remarks ||
          err?.response?.data?.message ||
          err?.response?.data?.RemarksDesc ||
          err?.message ||
          'Something went wrong';

        const lower = errMsg.toLowerCase();
        if (
          lower.includes('already paid') ||
          lower.includes('no bill') ||
          lower.includes('no due') ||
          lower.includes('bill already') ||
          lower.includes('paid')
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

  function normalizeBill(data, rawRes) {
    if (!data) return null;
    const b =
      data?.bill ||
      data?.Data?.bill ||
      data?.data?.bill ||
      data?.Data?.data ||
      data?.Data ||
      data?.data ||
      data;

    return {
      customerName:
        b.customer_name ??
        b.customerName ??
        b.userName ??
        b.ConsumerName ??
        b.name ??
        'Unknown',
      number:
        b.customer_ref_id ??
        b.cellNumber ??
        b.ConsumerNumber ??
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
        b.bill_amount ??
        b.bill_net_amount ??
        b.amount ??
        b.billAmount ??
        b.DueAmount ??
        0,
      orderId: rawRes?.orderId ?? b.orderId ?? null,
      partnerOrderId: rawRes?.partnerOrderId ?? b.partnerOrderId ?? null,
      acceptPayment: b.accept_payment ?? true,
      rawBill: b,
    };
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#122536ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{operator?.operator_name}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }} // Extra space for the button
        showsVerticalScrollIndicator={false}
      >
        {/* All top content */}
        <View>
          {/* Customer Info */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Icon name="account-circle" size={52} color="#2f66f5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{bill?.customerName || 'Unknown'}</Text>
              <Text style={styles.userNumber}>Number: {bill?.number}</Text>
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
              <Text style={[styles.detailLabel, { color: 'red' }]}>
                Due Date
              </Text>
              <Text style={[styles.detailValue, { color: 'red' }]}>
                {bill?.dueDate || '—'}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.amountSymbol}>₹</Text>
            <Text style={styles.amountValue}>{bill?.amount || '0'}</Text>
          </View>

          {/* Notice */}
          <View style={styles.noticeBox}>
            <Icon name="alert-circle-outline" size={20} color="#ff9800" />
            <Text style={styles.noticeText}>
              The service provider may occasionally take up to 72 hours to
              process your bill.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ✅ Fixed Pay Button at Bottom */}
      <TouchableOpacity
        style={[
          styles.payButton,
          { position: 'absolute', bottom: 20, left: 20, right: 20 },
        ]}
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
              style={[styles.modalButton, { backgroundColor: '#122536ff' }]}
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
                'Unable to fetch bill. Please check your connection number and try again.'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122536ff',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: { marginRight: 12, padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff' },
  headerLogo: { width: 100, height: 22, resizeMode: 'contain' },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: { marginRight: 10 },
  userName: { fontSize: 16, fontWeight: '600', color: '#000' },
  userNumber: { fontSize: 14, color: '#666' },

  detailsCard: { marginTop: 10 },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: { fontSize: 14, color: '#333' },
  detailValue: { fontSize: 14, color: '#000' },

  amountCard: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountSymbol: { fontSize: 22, color: '#000' },
  amountValue: { fontSize: 26, fontWeight: '700', color: '#000' },

  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  walletLabel: { fontSize: 15, color: '#333' },
  walletValue: { fontSize: 15, fontWeight: '600', color: '#000' },

  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  noticeText: { color: '#333', marginLeft: 6, flex: 1, fontSize: 13 },

  payButton: {
    flexDirection: 'row',
    backgroundColor: '#2f66f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 24,
    paddingVertical: 14,
  },
  payText: { color: '#fff', fontWeight: '600', fontSize: 16, marginLeft: 6 },

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
    borderRadius: 20,
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
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
