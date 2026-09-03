import React, { useState, useEffect } from 'react';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['VirtualizedLists should never be nested inside']);
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Share,
  Clipboard,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { getData } from '../API';
import Footer from '../components/Footer';

export default function ReferralScreen({ navigation }) {

  const route = useRoute();
  const { referralCode } = route.params;
  console.log(referralCode);
  const [modalVisible, setModalVisible] = useState(false);
  const [referralList, setReferralList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchReferralList = async () => {
    try {
      setLoadingList(true);

      const res = await getData('/api/user/refer-list'); // ⬅ Change to your API
      console.log('Referral List →', res);
      if (res?.Status || res?.success) {
        setReferralList(res?.Data || []);
      } else {
        Alert.alert('No referrals found');
      }
    } catch (err) {
      console.log('Referral fetch error:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const referralText = `Use my referral code: ${referralCode}`;

  const handleCopy = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied', 'Referral code copied!');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: referralText,
      });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#091B42" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Main Banner Heading */}
        <Text style={styles.mainHeading}>
          Refer Karo, Earn Karo - Recharge Hoga ke Sath
        </Text>
        <Text style={styles.subHeading}>
          Invite friends & family. You both earn guaranteed rewards when they complete their first recharge!
        </Text>

        {/* Illustration */}
        <Image
          source={require('../Assets/refer.jpeg')}
          style={styles.illustration}
          resizeMode="contain"
        />

        {/* Referral Card */}
        <View style={styles.refBox}>
          <Text style={styles.refLabel}>YOUR UNIQUE REFERRAL CODE</Text>
          <Text style={styles.refText}>{referralCode || '------'}</Text>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity activeOpacity={0.8} style={styles.copyBtn} onPress={handleCopy}>
              <Icon name="content-copy" size={16} color="#FFF" />
              <Text style={styles.copyBtnText}>Copy Code</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.shareBtn} onPress={handleShare}>
              <Icon name="share" size={16} color="#471d7d" />
              <Text style={styles.shareBtnText}>Share Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Step Guide Row */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsHeader}>How It Works</Text>
          <View style={styles.stepsRow}>
            <View style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Share Link</Text>
              <Text style={styles.stepDesc}>Send referral link to friends</Text>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>They Sign Up</Text>
              <Text style={styles.stepDesc}>Friend registers on the app</Text>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Earn ₹10</Text>
              <Text style={styles.stepDesc}>Instant wallet cashback</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryBtn}
          onPress={() => {
            setModalVisible(true);
            fetchReferralList();
          }}
        >
          <Icon name="people" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>View Referral History</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 24, width: '100%' }}>
          <Footer />
        </View>
      </ScrollView>

      {/* ---------------- REFERRAL LIST MODAL ---------------- */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Referrals</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={26} color="#000" />
              </TouchableOpacity>
            </View>

            {/* CONTENT */}
            {loadingList ? (
              <View style={{ padding: 20 }}>
                <Text style={{ textAlign: 'center', fontSize: 16 }}>
                  Loading...
                </Text>
              </View>
            ) : referralList.length === 0 ? (
              <View style={{ padding: 20 }}>
                <Text style={{ textAlign: 'center', color: '#555' }}>
                  No referrals found
                </Text>
              </View>
            ) : (
              referralList.map((item, index) => (
                <View key={index} style={styles.referralItem}>
                  <Text style={styles.refName}>
                    {item.name || 'Unknown User'}
                  </Text>
                  <Text style={styles.refDate}>
                    {item.date ? new Date(item.date).toDateString() : ''}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#091B42',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    alignItems: 'center',
  },
  mainHeading: {
    textAlign: 'center',
    color: '#FFF',
    fontWeight: '800',
    fontSize: 21,
    marginTop: 10,
    lineHeight: 28,
  },
  subHeading: {
    textAlign: 'center',
    fontSize: 13,
    color: '#D9E7FF',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 19,
    fontWeight: '500',
  },
  illustration: {
    width: 220,
    height: 180,
    marginVertical: 10,
    borderRadius: 16,
  },
  refBox: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  refLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  refText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#0D52ED',
    marginBottom: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D52ED',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  copyBtnText: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E8',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  shareBtnText: {
    color: '#FF7A00',
    fontSize: 13.5,
    fontWeight: '700',
  },
  stepsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepsHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D52ED',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 10.5,
    color: '#D9E7FF',
    textAlign: 'center',
    lineHeight: 14,
  },
  stepDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 8,
  },
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#FFF',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  btnText: {
    fontSize: 15,
    color: '#0D52ED',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '88%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  referralItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  refName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  refDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});

