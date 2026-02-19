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
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useRoute } from '@react-navigation/native';
import { getData } from '../API';
import LinearGradient from 'react-native-linear-gradient';
import COLORS from '../constants/colors';

const { width } = Dimensions.get('window');

// THEME CONSTANTS
const PRIMARY = COLORS.primary || '#0B66FF';
const SECONDARY = COLORS.secondary || '#53A4FF';

export default function ReferralScreen({ navigation }) {
  const route = useRoute();
  const { referralCode } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [referralList, setReferralList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchReferralList = async () => {
    try {
      setLoadingList(true);
      const res = await getData('/api/user/refer-list');
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
          <Icon name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
      </View>

      {/* Main Content */}
      <View style={styles.bodyContainer}>
        <Text style={styles.mainHeading}>
          Refer Karo, Earn Karo - ClubTYL ke Sath
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
          <Text style={styles.refCodeLabel}>Your Referral Code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.refText}>{referralCode}</Text>
            <View style={styles.iconRow}>
                 <TouchableOpacity onPress={handleCopy} style={styles.iconBtn}>
                  <Icon name="content-copy" size={20} color={PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                  <Icon name="share" size={20} color={PRIMARY} />
                </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reward Text */}
        <Text style={styles.earnText}>Earn ₹10 for every referral</Text>

        {/* Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setModalVisible(true);
            fetchReferralList();
          }}
        >
          <LinearGradient
            colors={[PRIMARY, SECONDARY]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.primaryBtn}
          >
            <Text style={styles.btnText}>Check Referral List</Text>
          </LinearGradient>
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
                   <View style={styles.userIconInfo}>
                        <View style={styles.userIcon}>
                             <FontAwesome5 name="user" size={14} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.refName}>
                                {item.name || item.firstName || 'Unknown User'}
                            </Text>
                            <Text style={styles.refPhone}>
                                {item.phone}
                            </Text>
                        </View>
                   </View>
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
    backgroundColor: '#F5F7FA', // Matches app background
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  bodyContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  mainHeading: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '700',
    fontSize: 20,
    marginTop: 10,
    marginBottom: 20
  },
  illustration: {
    width: width * 0.7,
    height: width * 0.6,
    marginBottom: 20,
  },
  subHeading: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  refBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee'
  },
  refCodeLabel: {
      fontSize: 12,
      color: '#888',
      marginBottom: 5,
      textAlign: 'center'
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F5FF',
    padding: 10,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: PRIMARY
  },
  refText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    color: PRIMARY,
    flex: 1,
    textAlign: 'center'
  },
  iconRow: {
      flexDirection: 'row',
      gap: 10
  },
  iconBtn: {
      padding: 5
  },
  earnText: {
    color: COLORS.green,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  primaryBtn: {
    width: width * 0.9,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3
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
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  referralItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userIconInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10
  },
  userIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#ddd',
      justifyContent: 'center',
      alignItems: 'center'
  },
  refName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  refPhone: {
      fontSize: 12,
      color: '#888'
  },
  refDate: {
    fontSize: 12,
    color: '#999',
  },
});
