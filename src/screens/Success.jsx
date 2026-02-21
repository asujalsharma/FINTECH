import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const Success = ({ navigation, route }) => {
  const { res, operatorDetail, rechargeData, from, amount } = route.params || {};
  const status = res?.Data?.status || 'Success';

  const displayAmount =
    from === 'wallet-topup'
      ? amount
      : rechargeData?.rs || rechargeData?.amount || '399';

  const displayPhone =
    rechargeData?.mobile ||
    rechargeData?.customerID ||
    rechargeData?.number ||
    res?.Data?.phoneNumber ||
    '98712 34567';

  const commission = res?.Data?.commission || 'JO';
  const operatorName = operatorDetail?.name || '';
  const transactionId = res?.Data?.transactionId || res?.Data?.order_id || '';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1A6FE0" />

      {/* ── COLORFUL CONFETTI GRADIENT BACKGROUND ── */}
      <LinearGradient
        colors={['#1246C0', '#1A6FE0', '#4A90D9', '#00BFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Confetti dots - decorative circles */}
      <View style={[styles.confetti, { top: 40, left: 30, backgroundColor: '#FFD700', width: 12, height: 12, borderRadius: 6 }]} />
      <View style={[styles.confetti, { top: 80, left: 60, backgroundColor: '#FF6B6B', width: 8, height: 8, borderRadius: 4 }]} />
      <View style={[styles.confetti, { top: 55, right: 40, backgroundColor: '#2DB84B', width: 14, height: 14, borderRadius: 7 }]} />
      <View style={[styles.confetti, { top: 100, right: 70, backgroundColor: '#FF9500', width: 9, height: 9, borderRadius: 4 }]} />
      <View style={[styles.confetti, { top: 150, left: 20, backgroundColor: '#FF6B6B', width: 10, height: 10, borderRadius: 5 }]} />
      <View style={[styles.confetti, { top: 160, right: 25, backgroundColor: '#FFD700', width: 11, height: 11, borderRadius: 5 }]} />
      <View style={[styles.confetti, { top: 200, left: 50, backgroundColor: '#C5D800', width: 8, height: 8, borderRadius: 4 }]} />
      <View style={[styles.confetti, { top: 220, right: 50, backgroundColor: '#FF6B6B', width: 12, height: 12, borderRadius: 6 }]} />
      <View style={[styles.starDot, { top: 70, left: width * 0.4 }]} />
      <View style={[styles.starDot, { top: 130, right: 100 }]} />
      <View style={[styles.starDot, { top: 180, left: 80 }]} />

      <SafeAreaView style={styles.safe}>

        {/* ── CHECKMARK CIRCLE ── */}
        <View style={styles.checkOuter}>
          <LinearGradient
            colors={['#2DB84B', '#1A9E3F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.checkInner}
          >
            <Icon name="check" size={64} color="#fff" />
          </LinearGradient>
        </View>

        {/* ── CONTENT CARD ── */}
        <View style={styles.card}>

          <Text style={styles.successTitle}>Recharge Successful:</Text>

          <View style={styles.amountRow}>
            <Text style={styles.rupeeAmount}>₹{displayAmount}</Text>
            <Text style={styles.commissionText}>  Commission {commission}</Text>
          </View>

          <Text style={styles.phoneText}>{displayPhone}</Text>

          {operatorName ? (
            <Text style={styles.operatorText}>{operatorName}</Text>
          ) : null}

          {transactionId ? (
            <Text style={styles.txText}>Txn: {transactionId}</Text>
          ) : null}

          {/* Dots separator */}
          <View style={styles.dotsRow}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>

          {/* Download Receipt button */}
          <LinearGradient
            colors={['#1246C0', '#4A90D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.downloadBtn}
          >
            <TouchableOpacity
              style={styles.downloadBtnInner}
              onPress={() => { }}
            >
              <Icon name="download" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.downloadBtnText}>
                Download Receted  ₹ {commission === 'JO' ? '4.0' : commission}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

        </View>

        {/* ── BOTTOM ACTIONS ── */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );
};

export default Success;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  /* Confetti decorations */
  confetti: {
    position: 'absolute',
    opacity: 0.85,
  },
  starDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    opacity: 0.6,
  },

  /* ── CHECKMARK ── */
  checkOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#2DB84B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  checkInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── CARD ── */
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },

  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 10,
    textAlign: 'center',
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  rupeeAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111',
  },
  commissionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },

  phoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
    marginBottom: 4,
  },
  operatorText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  txText: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 8,
  },

  /* Dots separator */
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D8FF',
  },

  /* Download button */
  downloadBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  downloadBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Home button */
  homeBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  homeBtnText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
