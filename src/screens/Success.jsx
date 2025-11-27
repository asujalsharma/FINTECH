import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const Success = ({ navigation, route }) => {
  const { res, operatorDetail, rechargeData } = route.params || {};
  useEffect(() => {
    console.log(res, operatorDetail, rechargeData);
  });
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
        {/* Success Card */}
        <View style={styles.successCard}>
          <View style={styles.successRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcon name="lightning-bolt" size={26} color="#0078ff" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.successTitle}>Payment Successful</Text>
                <Text style={styles.subText}>
                  {res?.Data.date ||
                    new Date().toLocaleString() ||
                    'May 17th 2025, 4:49 PM'}
                </Text>
              </View>
            </View>
            <MaterialIcon name="check-decagram" size={28} color="#28b463" />
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoCard}>
          {/* Mobile */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Paid For</Text>
            <Text style={styles.value}>
              {rechargeData?.mobile ||
                rechargeData.customerID ||
                rechargeData.number ||
                res?.Data?.phoneNumber ||
                'VI | 9874563215'}
            </Text>
            <Text style={styles.amountText}>
              ₹{rechargeData?.rs || rechargeData.amount || '10'}
            </Text>
          </View>

          {/* Transaction ID */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>
              {res?.Data.transactionId ||
                res?.Data?.order_id ||
                'YPG1O9DOF7R0N51Y'}
            </Text>
            <TouchableOpacity>
              <Icon name="copy-outline" size={20} color="#0078ff" />
            </TouchableOpacity>
          </View>

          {/* Operator Ref */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>
              {operatorDetail.name === 'Google Play'
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

          {/* Wallet */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Debited from</Text>
            <Text style={[styles.value, { color: '#000' }]}>Wallet</Text>
          </View>
        </View>

        {/* Note Box */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            Note: If you have not received the recharge on your number, please
            contact us within 2 days of the transaction.
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={{
            marginTop: 40,
            borderRadius: 10,
            paddingVertical: 6,
            backgroundColor: '#0078ff',
            elevation: 3,
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 0.5,
          }}
          title="Back To Home"
        >
          Back To Home
        </Button>
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

  successCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },

  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  successTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  subText: { fontSize: 12, color: '#777' },

  infoCard: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 18,
    borderRadius: 12,
    elevation: 5,
  },

  infoRow: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    color: '#777',
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginVertical: 2,
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
    backgroundColor: '#eaf4ff',
  },
  noteText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
});
