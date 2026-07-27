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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Footer from '../components/Footer';

export default function Bill() {

  const navigation = useNavigation();
  const route = useRoute();
  const { UniqueId, operator } = route.params || {};
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [NoBill, setNoBill] = useState();
  console.log(operator);
  useEffect(() => {
    if (!UniqueId) return;
    async function load() {
      setLoading(true);
      try {
        const res = await postData(`/api/cyrus/bbps/new-bill-fetch`, {
          number: UniqueId,
          operator: operator?.op_id,
        });
        if (res.status === 204) {
          setNoBill(true);
          return;
        }
        console.log('Response:', res);
        const data = res?.Data?.data || res?.Data;
        setBill(normalizeBill(data));
      } catch (err) {
        console.log('Error:', err);
        Alert.alert(
          'Error',
          err?.response?.data?.Remarks || 'Something went wrong',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [UniqueId]);

  function normalizeBill(data) {
    if (!data) return null;
    return {
      customerName:
        data.customerName ?? data.customer_name ?? data.userName ?? 'Unknown',
      number: data.cellNumber ?? UniqueId,
      billDate: data.billDate ?? data.billdate ?? null,
      dueDate: data.dueDate ?? data.due ?? null,
      amount: data.amount ?? data.billAmount ?? 0,
    };
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (NoBill) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          backgroundColor: '#F5F5F5',
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#471d7d',
            marginBottom: 15,
          }}
        >
          NO BILLS DUE !
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: '#555',
            textAlign: 'center',
            marginBottom: 25,
          }}
        >
          You have no outstanding bills at the moment.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{
            backgroundColor: '#471d7d',
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }} // Extra space for the button
        showsVerticalScrollIndicator={false}
      >
        {/* All top content */}
        <View>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton}>
              <Icon name="arrow-left" size={26} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{operator?.operator_name}</Text>
          </View>

          {/* Customer Info */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Icon name="account-circle" size={52} color="#2f66f5" />
            </View>
            <View>
              <Text style={styles.userName}>{bill?.customerName}</Text>
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
              <Text style={styles.detailValue}>{bill?.amount}</Text>
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
            <Text style={styles.amountValue}>{bill?.amount}</Text>
          </View>

          {/* Notice */}
          <View style={styles.noticeBox}>
            <Icon name="alert-circle-outline" size={20} color="#ff9800" />
            <Text style={styles.noticeText}>
              The service provider may occasionally take up to 72 hours to
              process your bill.
            </Text>
          <View style={{ marginTop: 24, paddingBottom: 80 }}>
            <Footer />
          </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F4F7' },
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
    marginBottom: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatar: { marginRight: 14, backgroundColor: '#EDE7F6', padding: 8, borderRadius: 24 },
  userName: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  userNumber: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '500' },

  detailsCard: {
    marginTop: 16,
    marginHorizontal: 16,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#0F172A', fontWeight: '700' },

  amountCard: {
    flexDirection: 'row',
    marginTop: 18,
    backgroundColor: '#471d7d',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  amountSymbol: { fontSize: 24, fontWeight: '800', color: '#FFF', marginRight: 4 },
  amountValue: { fontSize: 32, fontWeight: '800', color: '#FFF' },

  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  walletLabel: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  walletValue: { fontSize: 15, fontWeight: '700', color: '#0F172A' },

  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noticeText: { color: '#92400E', marginLeft: 8, flex: 1, fontSize: 13, fontWeight: '500' },

  payButton: {
    flexDirection: 'row',
    backgroundColor: '#58007b',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    height: 54,
    elevation: 4,
    shadowColor: '#58007b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  payText: { color: '#FFF', fontWeight: '700', fontSize: 16, marginRight: 8, letterSpacing: 0.5 },
});

