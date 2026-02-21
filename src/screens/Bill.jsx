import { THEME_COLORS, GRADIENTS } from '../constants/theme';
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

import LinearGradient from 'react-native-linear-gradient';

export default function Bill() {
  const navigation = useNavigation();
  const route = useRoute();
  const { UniqueId, operator } = route.params || {};
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [NoBill, setNoBill] = useState();
  console.log(operator);
  useEffect(() => {
    // ... code truncated, assume unchanged ...
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
        <ActivityIndicator size="large" color={THEME_COLORS.orange} />
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
            color: THEME_COLORS.orange,
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

        <LinearGradient
          colors={GRADIENTS.orangeBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 30,
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
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{operator?.operator_name}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Customer Info */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Icon name="account" size={32} color={THEME_COLORS.primary} />
            </View>
            <View>
              <Text style={styles.userName}>{bill?.customerName}</Text>
              <Text style={styles.userNumber}>ID: {bill?.number}</Text>
            </View>
          </View>

          {/* Bill Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Bill Breakdown</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bill Date</Text>
              <Text style={styles.detailValue}>{bill?.billDate || '—'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{UniqueId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: '#E53E3E' }]}>Due Date</Text>
              <Text style={[styles.detailValue, { color: '#E53E3E' }]}>
                {bill?.dueDate || '—'}
              </Text>
            </View>
          </View>

          {/* Amount Display */}
          <View style={styles.amountCard}>
            <Text style={styles.amountSymbol}>Total Amount</Text>
            <Text style={styles.amountValue}>₹{bill?.amount}</Text>
          </View>

          {/* Notice */}
          <View style={styles.noticeBox}>
            <Icon name="information-outline" size={20} color="#CA8A04" />
            <Text style={styles.noticeText}>
              The service provider may take up to 2-3 business days to update your payment status on their portal.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ✅ Fixed Pay Button at Bottom */}
      <LinearGradient
        colors={GRADIENTS.orangeBtn}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.payButton,
          { position: 'absolute', bottom: 20, left: 20, right: 20 },
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('PaymentConfirmation', {
              operatorDetail: operator,
              rechargeData: bill,
              isPrePaid: false,
            })
          }
          style={{ flexDirection: 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={styles.payText}>Pay Now</Text>
          <Icon name="chevron-double-right" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    flex: 1,
  },
  contentScroll: {
    flex: 1,
    marginTop: -40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 22,
    elevation: 8,
    shadowColor: '#1756C5',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: '#F0F4FF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  userNumber: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A2E',
    fontWeight: '700',
  },
  amountCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  amountSymbol: {
    fontSize: 24,
    color: '#1A1A2E',
    fontWeight: '800',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A1A2E',
    letterSpacing: -1,
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    marginHorizontal: 25,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFECB3',
  },
  noticeText: {
    color: '#795548',
    marginLeft: 10,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  payButton: {
    marginHorizontal: 20,
    borderRadius: 18,
    height: 60,
    elevation: 8,
    shadowColor: '#FF9500',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    marginBottom: 20,
  },
  payText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    marginRight: 8,
    letterSpacing: 1,
  },
});
