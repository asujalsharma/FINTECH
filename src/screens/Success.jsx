import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const Success = ({ navigation, route }) => {
  const { res, operatorDetail, rechargeData, from, amount } =
    route.params || {};
  const status = res?.Data?.status || 'Success';

  console.log(res, operatorDetail, rechargeData, from, amount);

  // ---------- UI VARIANTS ----------
  const STATUS_UI = {
    Pending: {
      title: 'Payment Pending',
      iconLeft: (
        <MaterialIcon name="clock-time-eight" size={28} color="#f4b400" />
      ),
      iconRight: (
        <ActivityIndicator
          size="small"
          color="#f4b400"
          style={{ marginLeft: 4 }}
        />
      ),
      subText: 'Your payment is being processed…',
      cardColor: '#fff7e6',
      mainColor: '#f4b400',
    },
    Failed: {
      title: 'Payment Failed',
      iconLeft: <MaterialIcon name="alert-circle" size={28} color="#e63946" />,
      iconRight: <MaterialIcon name="close-circle" size={28} color="#e63946" />,
      subText: 'Your payment could not be completed.',
      cardColor: '#ffecec',
      mainColor: '#e63946',
    },
    Success: {
      title: 'Payment Successful',
      iconLeft: (
        <MaterialIcon name="lightning-bolt" size={28} color="#0078ff" />
      ),
      iconRight: (
        <MaterialIcon name="check-decagram" size={28} color="#28b463" />
      ),
      subText: res?.Data?.date || new Date().toLocaleString(),
      cardColor: '#e8f9f0',
      mainColor: '#28b463',
    },
  };

  const UI = STATUS_UI[status] || STATUS_UI.Success;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Payment Status</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: UI.cardColor }]}>
          <View style={styles.statusRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {UI.iconLeft}
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.statusTitle, { color: UI.mainColor }]}>
                  {UI.title}
                </Text>
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
                : rechargeData?.mobile ||
                  rechargeData?.customerID ||
                  rechargeData?.number ||
                  res?.Data?.phoneNumber ||
                  'N/A'}
            </Text>
            <Text style={styles.amountText}>
              ₹
              {from === 'wallet-topup'
                ? amount
                : rechargeData?.rs || rechargeData?.amount || '0'}
            </Text>
          </View>

          {/* Transaction ID */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>
              {res?.Data?.transactionId ||
                res?.Data?.order_id ||
                'Not Available'}
            </Text>
            <TouchableOpacity>
              <Icon name="copy-outline" size={20} color="#0078ff" />
            </TouchableOpacity>
          </View>

          {/* Operator Ref ID / Redeem Code */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>
              {operatorDetail?.name === 'Google Play'
                ? 'Redeem Code'
                : 'Operator Ref ID'}
            </Text>
            <Text style={styles.value}>
              {res?.Data?.operator_ref_id || '___________'}
            </Text>
            <TouchableOpacity>
              <Icon name="copy-outline" size={20} color="#0078ff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Note for Pending/Failed */}
        {status !== 'Success' && (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Note: If amount has been deducted but services not received,
              please wait 5–10 minutes or contact support.
            </Text>
          </View>
        )}

        {/* Buttons */}
        {status === 'Failed' ? (
          <Button
            title="Retry Payment"
            onPress={() => navigation.goBack()}
            color="#e63946"
          />
        ) : status === 'Pending' ? (
          <Button
            title="Refresh Status"
            onPress={() => navigation.goBack()}
            color="#f4b400"
          />
        ) : (
          <Button
            title="Back To Home"
            onPress={() => navigation.navigate('Home')}
            color="#0078ff"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Success;

// ---------------------  Styles  ---------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f9' },

  header: {
    backgroundColor: '#0078ff',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { color: '#fff', fontSize: 17, fontWeight: '600' },

  statusCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: { fontSize: 18, fontWeight: '700' },
  subText: { fontSize: 12, color: '#555' },

  infoCard: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 18,
    borderRadius: 12,
    elevation: 4,
  },
  infoRow: { marginBottom: 14 },
  label: { fontSize: 13, color: '#777' },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginVertical: 2,
    maxWidth: '85%',
  },
  amountText: {
    position: 'absolute',
    right: 0,
    top: 18,
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },

  noteBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#ffecec',
  },
  noteText: { fontSize: 12, color: '#555', textAlign: 'center' },
});
