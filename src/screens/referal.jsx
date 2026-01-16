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
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#471d7d',
    padding: 16,
    alignItems: 'center',
  },
  mainHeading: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    marginTop: 10,
  },
  illustration: {
    width: 240,
    height: 240,
    marginVertical: 12,
  },
  subHeading: {
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
    marginBottom: 18,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  refBox: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  refText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#035FFF',
  },
  refBtns: {
    flexDirection: 'row',
    gap: 14,
  },
  earnText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 18,
  },
  primaryBtn: {
    width: '90%',
    backgroundColor: '#58007b',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  referralItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  refName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  refDate: {
    fontSize: 12,
    color: '#777',
  },
});
