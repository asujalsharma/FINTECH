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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
      </View>

      {/* Main Content */}
      <View style={styles.bodyContainer}>
        <Text style={styles.mainHeading}>
          Refer Karo, Earn Karo - Yara Pay ke Sath
        </Text>

        {/* Illustration */}
        <Image
          source={require('../Assets/refer.jpeg')}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.subHeading}>
          Share your referral code and get exciting benefits when friends join!
        </Text>

        {/* Referral Card */}
        <View style={styles.refBox}>
          <Text style={styles.refText}>{referralCode}</Text>

          <View style={styles.refBtns}>
            <TouchableOpacity onPress={handleCopy}>
              <Icon name="content-copy" size={22} color="#035FFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare}>
              <Icon name="share" size={22} color="#035FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reward Text */}
        <Text style={styles.earnText}>Earn ₹10 for every referral,</Text>

        {/* Button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            setModalVisible(true);
            fetchReferralList();
          }}
        >
          <Text style={styles.btnText}>Check Referral List</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 'auto', paddingTop: 20, width: '100%' }}>
          <Footer />
        </View>
      </View>

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
    backgroundColor: '#471d7d',
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  // headerTitle: {
  headerTitle: {
    color: '#FFF',
    fontSize: 19,
    fontWeight: '800',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#471d7d',
    padding: 20,
    alignItems: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -10,
  },
  mainHeading: {
    textAlign: 'center',
    color: '#FFF',
    fontWeight: '800',
    fontSize: 20,
    marginTop: 8,
    lineHeight: 26,
  },
  illustration: {
    width: 220,
    height: 200,
    marginVertical: 14,
    borderRadius: 16,
  },
  subHeading: {
    textAlign: 'center',
    fontSize: 13,
    color: '#D9E7FF',
    marginBottom: 20,
    paddingHorizontal: 16,
    lineHeight: 19,
    fontWeight: '500',
  },
  refBox: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  refText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#471d7d',
  },
  refBtns: {
    flexDirection: 'row',
    gap: 16,
  },
  earnText: {
    color: '#E8F1FF',
    fontSize: 15,
    marginBottom: 20,
    fontWeight: '600',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#58007b',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#58007b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
    letterSpacing: 0.5,
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

