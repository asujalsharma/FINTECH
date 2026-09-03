import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import COLORS from '../constants/colors';
import cardFront from '../Assets/cardFront.png';

import { useNavigation, useRoute } from '@react-navigation/native';
import { URL } from '../constants/URL';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import fetchData from '../constants/fetchData';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Wallet = () => {

  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [other, setOther] = useState(null);
  const [imagePath, setImagePath] = useState('');
  const [addCredit, setAddCredit] = useState(false);
  const navigation = useNavigation();

  const route = useRoute();
  const { userData } = route.params;
  // In the screen where you navigate to
  console.log(userData);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.post(`${URL}/api/carddetails`, {
          id: userData._id,
        });
        if (response) {
          const formattedNumer = response?.data.cardNumber;
          setCardNumber('**** **** **** ' + formattedNumer);

          const expiryDateFromAPI = response?.data.expireData;
          const [month, year] = expiryDateFromAPI.split('/');
          const formattedExpiry = `${month}/${year.slice(-2)}`;
          setExpiryDate(formattedExpiry);
          setHolderName(response?.data.holderName);
          setAddCredit(true);
        }
      } catch (error) {
        console.log(error);
        return null;
      }
    };
    fetchDetails();

    const fetchData = async () => {
      try {
        const response = await axios.post(`${URL}/api/adduserdetails`, {
          id: userData._id,
        });
        if (response.data.success === true) {
          setOther(response.data.data);
          try {
            const res = await axios.get(
              `${URL}/api/display/${response.data.data.users[0].userId}`,
            );
            setImagePath(res.data.imagePath.replace(/\\/g, '/'));
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  //Use the retrieved data as needed

  const addCard = async () => {
    try {
      const response = await axios.post(`${URL}/api/createuser`, {
        id: userData._id,
      });
      if (response.data.success === true) {
        navigation.navigate('AddCard', {
          id: userData._id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddCredit = () => {
    if (addCredit) {
      navigation.navigate('AddCredit', { userData });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Card Not Added',
        text2: 'Please add a card to add credit',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.headerAddCardBtn}
          onPress={addCard}
        >
          <Icon name="plus" size={13} color="#FFF" style={{ marginRight: 5 }} />
          <Text style={styles.addCardbtn}>Add Card</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Virtual Card */}
        <View style={styles.cardContainer}>
          <ImageBackground
            source={cardFront}
            style={styles.cardFrontImg}
            imageStyle={{ borderRadius: 18 }}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.cardChipText}>DIGITAL WALLET</Text>
              <Icon name="credit-card" size={22} color="rgba(255,255,255,0.7)" />
            </View>

            <Text style={styles.cardNumber}>
              {cardNumber || '•••• •••• •••• ••••'}
            </Text>

            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                <Text style={styles.holderName}>
                  {holderName || 'Recharge Hoga User'}
                </Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>EXPIRES</Text>
                <Text style={styles.expiry}>{expiryDate || 'MM/YY'}</Text>
              </View>
            </View>
          </ImageBackground>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.addCreditBtn}
            onPress={handleAddCredit}
          >
            <Icon name="plus" size={13} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.addCreditText}>Add Money to Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Transfers Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Transfers</Text>
          <View style={styles.quickUsersRow}>
            {other && (
              <View style={styles.userBox}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.avatarBox}
                  onPress={() => {
                    navigation.navigate('QuickTopUp', {
                      id: other?.users[0]?.userId,
                      data: userData,
                    });
                  }}
                >
                  <Image
                    source={{ uri: `${URL}/${imagePath}` }}
                    style={styles.otherImg}
                  />
                </TouchableOpacity>
                <Text style={styles.userBoxName} numberOfLines={1}>
                  {other?.users[0]?.name}
                </Text>
              </View>
            )}

            <View style={styles.userBox}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.addBox}
                onPress={() => {
                  navigation.navigate('QuickUser', { id: userData._id });
                }}
              >
                <Icon name="plus" size={18} color="#471d7d" />
              </TouchableOpacity>
              <Text style={styles.userBoxName}>Add User</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Footer />
        </View>
      </ScrollView>
      <NavBar />
    </SafeAreaView>
  );
};


export default Wallet;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  headerAddCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addCardbtn: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  scrollContainer: {
    padding: 18,
    paddingBottom: 90,
  },
  cardContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  cardFrontImg: {
    width: '100%',
    height: 200,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChipText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
    marginVertical: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  holderName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  expiry: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  addCreditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 25,
    marginTop: -18,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  addCreditText: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  quickUsersRow: {
    flexDirection: 'row',
    gap: 14,
  },
  userBox: {
    alignItems: 'center',
    width: 68,
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  otherImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  addBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  userBoxName: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
  },
});
