import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';

const Success = ({ navigation, route }) => {
  const { res, operatorDetail, rechargeData, from, amount } = route.params || {};
  const status = res?.Data?.status || 'Success';

  // ---------- UI VARIANTS ----------
  const STATUS_UI = {
    Pending: {
      title: 'Payment Pending',
      iconLeft: <MaterialIcon name="clock-time-eight" size={32} color={COLORS.statusPending} />,
      iconRight: <ActivityIndicator size="small" color={COLORS.statusPending} />,
      subText: 'Your payment is being processed...',
      cardColor: '#FFFbeb',
      mainColor: COLORS.statusPending,
    },
    Failed: {
      title: 'Payment Failed',
      iconLeft: <MaterialIcon name="alert-circle" size={32} color={COLORS.statusFailed} />,
      iconRight: <MaterialIcon name="close-circle" size={32} color={COLORS.statusFailed} />,
      subText: 'Your payment could not be completed.',
      cardColor: '#FEF2F2',
      mainColor: COLORS.statusFailed,
    },
    Success: {
      title: 'Payment Successful',
      iconLeft: <MaterialIcon name="check-decagram" size={32} color={COLORS.statusSuccess} />,
      iconRight: <MaterialIcon name="check-circle" size={32} color={COLORS.statusSuccess} />,
      subText: res?.Data?.date || new Date().toLocaleString(),
      cardColor: '#ECFDF5',
      mainColor: COLORS.statusSuccess,
    },
  };

  const UI = STATUS_UI[status] || STATUS_UI.Success;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Curved Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Payment Status</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: UI.cardColor, borderColor: UI.mainColor + '40' }]}>
          <View style={styles.statusRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {UI.iconLeft}
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.statusTitle, { color: UI.mainColor }]}>{UI.title}</Text>
                <Text style={styles.subText}>{UI.subText}</Text>
              </View>
            </View>
            {UI.iconRight}
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoCard}>
          {/* Paid For */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Paid For</Text>
            <Text style={styles.value}>
              {from === 'wallet-topup'
                ? 'Wallet Top-up'
                : rechargeData?.mobile || rechargeData?.customerID || rechargeData?.number || res?.Data?.phoneNumber || 'N/A'}
            </Text>
            <Text style={styles.amountText}>
              ₹{from === 'wallet-topup' ? amount : rechargeData?.rs || rechargeData?.amount || '0'}
            </Text>
          </View>
          <View style={styles.divider} />

          {/* Transaction ID */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Transaction ID</Text>
            <View style={styles.copyRow}>
              <Text style={styles.value}>
                {res?.Data?.transactionId || res?.Data?.orderId || res?.Data?.order_id || 'Not Available'}
              </Text>
              <TouchableOpacity style={styles.copyBtn}>
                <MaterialIcon name="content-copy" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Operator Ref ID / Redeem Code */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>
              {from === 'wallet-topup'
                ? 'Order ID'
                : operatorDetail?.name === 'Google Play'
                ? 'Redeem Code'
                : 'Operator Ref ID'}
            </Text>
            <View style={styles.copyRow}>
              <Text style={styles.value}>
                {from === 'wallet-topup'
                  ? res?.Data?.orderId || res?.Data?.order_id
                  : res?.Data?.operator_ref_id || '___________'}
              </Text>
              <TouchableOpacity style={styles.copyBtn}>
                <MaterialIcon name="content-copy" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Note for Pending/Failed */}
        {status !== 'Success' && (
          <View style={styles.noteBox}>
            <MaterialIcon name="information-outline" size={20} color={UI.mainColor} style={{ marginRight: 8 }} />
            <Text style={[styles.noteText, { color: UI.mainColor }]}>
              {status === 'Pending'
                ? 'If amount has been deducted but services not received, please wait 5–10 minutes.'
                : 'Please contact support if the amount was deducted.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.stickyBar}>
        {status === 'Failed' ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.statusFailed }]}
            activeOpacity={0.88}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.actionBtnText}>Retry Payment</Text>
            <MaterialIcon name="refresh" size={22} color="#FFF" />
          </TouchableOpacity>
        ) : status === 'Pending' ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.statusPending }]}
            activeOpacity={0.88}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.actionBtnText}>Refresh Status</Text>
            <MaterialIcon name="update" size={22} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.actionBtnText}>Back To Home</Text>
            <MaterialIcon name="home" size={22} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Success;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },

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

  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: -22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
  subText: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500' },

  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: { marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  label: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 4 },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyBtn: {
    padding: 6,
    backgroundColor: '#FFF5F8',
    borderRadius: 8,
  },
  amountText: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },

  noteBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  noteText: { fontSize: 12.5, fontWeight: '600', flex: 1, lineHeight: 18 },

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
  actionBtn: {
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
