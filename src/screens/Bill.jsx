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
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

export default function Bill() {
  const navigation = useNavigation();
  const route = useRoute();
  const { UniqueId, operator } = route.params || {};
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noBill, setNoBill] = useState(false);

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
        const data = res?.Data?.data || res?.Data;
        setBill(normalizeBill(data));
      } catch (err) {
        Alert.alert(
          'Bill Fetch Notice',
          err?.response?.data?.Remarks || 'Unable to fetch bill at this moment.',
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
        data.customerName ?? data.customer_name ?? data.userName ?? 'Customer',
      number: data.cellNumber ?? UniqueId,
      billDate: data.billDate ?? data.billdate ?? null,
      dueDate: data.dueDate ?? data.due ?? null,
      amount: data.amount ?? data.billAmount ?? 0,
    };
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary || '#0D52ED'} />
        <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Fetching bill details...</Text>
      </View>
    );
  }

  if (noBill) {
    return (
      <View style={styles.noBillContainer}>
        <Icon name="check-circle" size={64} color="#10B981" />
        <Text style={styles.noBillTitle}>NO BILLS DUE!</Text>
        <Text style={styles.noBillSubtitle}>
          You have no outstanding bills pending for this account right now.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.backHomeBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.backHomeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{operator?.operator_name || 'Bill Summary'}</Text>
          <Text style={styles.headerSubtitle}>Verified BBPS Invoice</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Icon name="account-circle" size={44} color={COLORS.primary || '#0D52ED'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{bill?.customerName}</Text>
            <Text style={styles.userNumber}>Consumer ID: {bill?.number}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>BBPS Verified</Text>
          </View>
        </View>

        {/* Bill Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Outstanding Due</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountSymbol}>₹</Text>
            <Text style={styles.amountValue}>{bill?.amount || '0'}</Text>
          </View>
        </View>

        {/* Bill Details Breakdown */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Bill Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bill Issue Date</Text>
            <Text style={styles.detailValue}>{bill?.billDate || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Consumer Number</Text>
            <Text style={styles.detailValue}>{bill?.number}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: '#DC2626', fontWeight: '700' }]}>
              Due Date
            </Text>
            <Text style={[styles.detailValue, { color: '#DC2626', fontWeight: '800' }]}>
              {bill?.dueDate || 'Pay Immediate'}
            </Text>
          </View>
        </View>

        {/* Notice */}
        <View style={styles.noticeBox}>
          <Icon name="info" size={20} color="#D97706" />
          <Text style={styles.noticeText}>
            Payments are settled immediately on BBPS gateway. Provider updates may take up to 24-48 hours.
          </Text>
        </View>

        <View style={{ marginTop: 24, paddingBottom: 60 }}>
          <Footer />
        </View>
      </ScrollView>

      {/* Pay Button */}
      <TouchableOpacity
        style={styles.payButton}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('PaymentConfirmation', {
            operatorDetail: operator,
            rechargeData: bill,
            isPrePaid: false,
          })
        }
      >
        <Text style={styles.payText}>PROCEED TO PAY ₹{bill?.amount || '0'}</Text>
        <Icon name="arrow-forward" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 5,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#D9E7FF',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#EFF6FF',
    padding: 6,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#091838',
  },
  userNumber: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },

  amountCard: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: COLORS.headerBg || '#0A2568',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  amountLabel: {
    color: '#D9E7FF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountSymbol: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    marginRight: 4,
  },
  amountValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },

  detailsCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    color: '#091838',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailLabel: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13.5,
    color: '#091838',
    fontWeight: '700',
  },

  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noticeText: {
    color: '#92400E',
    marginLeft: 10,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },

  payButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: COLORS.primary || '#0D52ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    height: 54,
    elevation: 4,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  payText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
    marginRight: 8,
    letterSpacing: 0.5,
  },

  noBillContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  noBillTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#091838',
    marginTop: 16,
    marginBottom: 8,
  },
  noBillSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  backHomeBtn: {
    backgroundColor: COLORS.primary || '#0D52ED',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  backHomeText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
