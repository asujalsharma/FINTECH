import React, { useState } from 'react';
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
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

export default function ReferralScreen({ navigation }) {
  const route = useRoute();
  const { referralCode } = route.params || { referralCode: 'CODE123' }; // Fallback for testing if param missing
  console.log(referralCode);
  const [modalVisible, setModalVisible] = useState(false);
  const [referralList, setReferralList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Mock API call or replace with actual
  const getData = async (url) => {
    // Implement your API call here
    return { success: true, Data: [] };
  };

  const fetchReferralList = async () => {
    try {
      setLoadingList(true);
      // Replace with your actual API call
      // const res = await getData('/api/user/refer-list');
      const res = { success: true, Data: [] }; // Mock response

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
    } catch (e) { }
  };

  return (
    <LinearGradient
      colors={['#0A237A', '#1756C5', '#4285F4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A237A" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer & Earn</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Main Content */}
        <View style={styles.whiteSheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <Text style={styles.mainHeading}>
              Refer Karo, Earn Karo - 99 Recharce ke Sath
            </Text>

            {/* Illustration */}
            <View style={styles.imageContainer}>
              <Image
                source={require('../Assets/refer.jpeg')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>


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
            <Text style={styles.earnText}>Earn ₹10 for every referral</Text>

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
          </ScrollView>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    marginTop: 10,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  mainHeading: {
    textAlign: 'center',
    color: '#0A237A',
    fontWeight: '700',
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  illustration: {
    width: 220,
    height: 220,
  },
  subHeading: {
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  refBox: {
    width: '100%',
    backgroundColor: '#F5F7FA', // Light grey to stand out on white
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  refText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#035FFF',
  },
  refBtns: {
    flexDirection: 'row',
    gap: 15,
  },
  earnText: {
    color: '#1756C5',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#1756C5',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#1756C5',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  btnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
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
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  referralItem: {
    paddingVertical: 12,
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
    marginTop: 2,
  },
});


