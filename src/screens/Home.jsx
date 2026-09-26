import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  FlatList,
  Modal,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getData, API_BASE_URL } from '../API';
import { Dimensions, Linking } from 'react-native';
import Footer from '../components/Footer';


const SCREEN_WIDTH = Dimensions.get('window').width;
const BLUE = '#0A2E8A';

const HomeScreen = () => {
  const navigation = useNavigation();

  const [orderList, setOrderList] = useState([]);
  const [filteredOrderList, setFilteredOrderList] = useState({});
  const [loading, setLoading] = useState(false);
  const [UserData, setUserData] = useState(null);
  const [Banner, setBanner] = useState([]);
  const scrollRef = React.useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [POPUP, setPOPUP] = useState();

  // ---------------------------
  // SHOW POPUP ONCE PER HOUR
  // ---------------------------
  useEffect(() => {
    if (POPUP?.image) {
      const now = Date.now();
      AsyncStorage.getItem('lastPopupTime').then(lastTime => {
        const lastShown = lastTime ? parseInt(lastTime) : 0;
        const diff = now - lastShown;
        const hoursPassed = diff / (1000 * 60 * 60);

        if (hoursPassed >= 1) {
          setShowModal(true);
          AsyncStorage.setItem('lastPopupTime', now.toString());
        }
      });
    }
  }, [POPUP]);

  // ---------------------------
  // POPUP IMAGE API
  // ---------------------------
  const getPopUpImage = async () => {
    setLoading(true);
    const res = await getData(`api/pop-image`);
    setPOPUP(res.Data);
    setLoading(false);
  };

  const handleServicePress = (item, sectionName) => {
    if (item.route && item.route !== '') {
      navigation.navigate('RedirectScreen', {
        data: item,
        type: sectionName,
      });
    } else {
      navigation.navigate('Provider', {
        ServiceId: item._id,
        name: item.name,
      });
    }
  };

  // ---------------------------
  // USER PROFILE API
  // ---------------------------
  const fetchUser = async () => {
    try {
      const res = await getData(`/api/user/profile`);
      if (res?.Status === true || res?.success === true) {
        setUserData(res?.Data || res?.user);
      }
    } catch (err) {
      console.log('User Fetch Error →', err);
    }
  };

  // ---------------------------
  // SERVICES LIST
  // ---------------------------
  const getOrderlist = async () => {
    setLoading(true);
    const res = await getData(`api/service/list?status=true`);
    const res1 = await getData(`api/affiliate/list`);
    // console.log('Service List →', res);
    console.log('Affiliate List →', res1);
    const combinedData = [...(res?.Data || []), ...(res1?.Data || [])];
    setOrderList(combinedData);
    separateServicesBySection(combinedData);

    setLoading(false);
  };

  // ---------------------------
  // BANNER FETCH
  // ---------------------------
  const fetchBanner = async () => {
    try {
      const res = await getData('api/home-banner/list');
      setBanner(res?.Data);
    } catch (err) {
      console.log('Banner Fetch Error', err);
    }
  };

  // -----------------------------------
  // GROUP SERVICES BY "section" FIELD
  // -----------------------------------
  const separateServicesBySection = (services = []) => {
    const acc = services.reduce((acc, item) => {
      if (!acc[item.section]) acc[item.section] = [];
      acc[item.section].push(item);
      return acc;
    }, {});
    console.log('Separated Services →', acc);
    setFilteredOrderList(acc);
  };

  // -----------------------------------
  // INITIAL LOAD
  // -----------------------------------
  useEffect(() => {
    fetchUser();
    getOrderlist();
    fetchBanner();
    getPopUpImage();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getOrderlist();
      fetchUser();
    }, []),
  );

  const memoBanner = React.useMemo(() => Banner, [Banner]);

  // ---------------------------
  // POPUP MODAL RENDER
  // ---------------------------
  const renderPopup = () => (
    <Modal visible={showModal} transparent animationType="fade">
      <View style={styles.popupBackdrop}>
        <View style={styles.popupContainer}>
          <TouchableOpacity
            onPress={() => setShowModal(false)}
            style={styles.popupClose}
          >
            <Text style={styles.popupCloseText}>X</Text>
          </TouchableOpacity>

          <Image
            source={{ uri: `${API_BASE_URL}/${POPUP.image}` }}
            style={styles.popupImage}
          />
        </View>
      </View>
    </Modal>
  );

  // ---------------------------
  // MAIN RENDER
  // ---------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#040E2D" />
      {showModal && POPUP?.image && renderPopup()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* TOP HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.userRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.avatarContainer}
                onPress={() =>
                  navigation.navigate('Profile', {
                    name: UserData?.firstName + ' ' + UserData?.lastName,
                    phn: UserData?.phone,
                    referralCode: UserData?.referalId,
                  })
                }
              >
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIf4R5qPKHPNMyAqV-FjS_OTBB8pfUV29Phg&s',
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>

              <View>
                <View style={styles.userTagRow}>
                  <Text style={styles.userName}>Hi, {UserData?.firstName || 'User'} 👋</Text>
                </View>
                <Text style={styles.userSubtitle}>Welcome to Online Adda</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.iconBadgeBtn}
                onPress={() => navigation.navigate('Notification')}
              >
                <Icon name="notifications-none" size={22} color="#FFF" />
                <View style={styles.activeNotificationDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* WALLET BALANCE CARD INSIDE HEADER */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceCardTop}>
              <View>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>
                  ₹ {UserData?.wallet?.balance !== undefined ? UserData?.wallet?.balance : '0.00'}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.addMoneyBtn}
                onPress={() => navigation.navigate('WalletTopupScreen')}
              >
                <Icon name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addMoneyText}>Add Money</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.balanceDivider} />

            {/* QUICK ACTIONS BAR */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('WalletTopupScreen')}
              >
                <View style={styles.quickActionIconBg}>
                  <Icon name="account-balance-wallet" size={20} color="#FFF" />
                </View>
                <Text style={styles.quickActionText}>Top Up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('Report', { id: UserData?._id })}
              >
                <View style={styles.quickActionIconBg}>
                  <Icon name="receipt-long" size={20} color="#FFF" />
                </View>
                <Text style={styles.quickActionText}>Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('CommissionChart')}
              >
                <View style={styles.quickActionIconBg}>
                  <Icon name="trending-up" size={20} color="#FFF" />
                </View>
                <Text style={styles.quickActionText}>Commission</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.quickActionItem}
                onPress={() =>
                  navigation.navigate('ReferScreen', {
                    referralCode: UserData?.referalId,
                  })
                }
              >
                <View style={styles.quickActionIconBg}>
                  <Icon name="card-giftcard" size={20} color="#FFF" />
                </View>
                <Text style={styles.quickActionText}>Rewards</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* BANNER CAROUSEL */}
        <View style={styles.bannerContainer}>
          <FlatList
            data={memoBanner}
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => item?.link && Linking.openURL(item.link)}
              >
                <Image
                  source={{
                    uri: item.image?.startsWith('http')
                      ? item.image
                      : `${API_BASE_URL}/${item.image}`,
                  }}
                  style={styles.bannerImage}
                />
              </TouchableOpacity>
            )}
            onScroll={e => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setCurrentIndex(index);
            }}
            scrollEventThrottle={16}
          />

          {/* DOT INDICATOR */}
          <View style={styles.dotsContainer}>
            {Banner?.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      currentIndex === idx ? '#4B9EFF' : 'rgba(255,255,255,0.25)',
                    width: currentIndex === idx ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* ============================
           SPECIAL SECTION → RECHARGE
        ============================ */}
        {filteredOrderList['recharge'] && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionBadge} />
                <Text style={styles.sectionTitle}>Recharge Services</Text>
              </View>
              {/* <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() =>
                  navigation.navigate('Recharge', {
                    ServiceId: filteredOrderList['recharge'][0]?._id,
                  })
                }
              >
                <Text style={styles.seeAllText}>Explore</Text>
                <Icon name="chevron-right" size={18} color="#0A2E8A" />
              </TouchableOpacity> */}
            </View>

            <View style={styles.row}>
              {filteredOrderList['recharge'].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.cardWrapper}
                  onPress={() =>
                    navigation.navigate(
                      item.name === 'Recharge'
                        ? 'Recharge'
                        : 'DTHRechargeScreen',
                      { ServiceId: item._id },
                    )
                  }
                >
                  <View style={styles.serviceCard}>
                    <View style={styles.serviceIconContainer}>
                      <Image
                        source={{
                          uri: item.icon?.startsWith('http')
                            ? item.icon
                            : `${API_BASE_URL}/${item.icon}`,
                        }}
                        style={styles.image}
                      />
                    </View>
                    <View style={styles.serviceTextContainer}>
                      <Text style={styles.cardTitle}>
                        {item.name === 'Recharge' ? 'Mobile' : 'DTH'}
                      </Text>
                      <Text style={styles.cardSubtitle}>Instant Cashback</Text>
                    </View>
                    {/* <View style={styles.arrowIconBg}>
                      <Icon name="arrow-forward" size={16} color="#0A2E8A" />
                    </View> */}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ============================
           SPECIAL SECTION → FINANCE
        ============================ */}
        {filteredOrderList['finance'] && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionBadge} />
                <Text style={styles.sectionTitle}>Bills & Payments</Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() =>
                  navigation.navigate('BillPayments', {
                    service: filteredOrderList['finance'],
                  })
                }
              >
                <Text style={styles.seeAllText}>View All</Text>
                <Icon name="chevron-right" size={18} color="#0A2E8A" />
              </TouchableOpacity>
            </View>

            <View style={styles.grid4Column}>
              {filteredOrderList['finance'].slice(0, 4).map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.75}
                  style={styles.gridCardItem}
                  onPress={() =>
                    navigation.navigate('Provider', {
                      ServiceId: item._id,
                      name: item.name,
                    })
                  }
                >
                  <View style={styles.gridIconCircle}>
                    <Image
                      source={{
                        uri: item.icon?.startsWith('http')
                          ? item.icon
                          : `${API_BASE_URL}/${item.icon}`,
                      }}
                      style={styles.gridIconImage}
                    />
                  </View>
                  <Text style={styles.gridCardLabel} numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ============================
          DYNAMIC SECTIONS (SMALL SQUARE)
        ============================ */}
        {Object.keys(filteredOrderList)
          .filter(
            sectionName =>
              sectionName !== 'recharge' &&
              sectionName !== 'finance' &&
              sectionName.trim() !== '' &&
              filteredOrderList[sectionName]?.length > 0,
          )
          .map((sectionName, index) => (
            <View key={index} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionBadge} />
                  <Text style={styles.sectionTitle}>
                    {sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.grid4Column}>
                {filteredOrderList[sectionName].slice(0, 4).map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.75}
                    style={styles.gridCardItem}
                    onPress={() => handleServicePress(item, sectionName)}
                  >
                    <View style={styles.gridIconCircle}>
                      <Image
                        source={{
                          uri: item.icon?.startsWith('http')
                            ? item.icon
                            : `${API_BASE_URL}/${item.icon}`,
                        }}
                        style={styles.gridIconImage}
                      />
                    </View>
                    <Text style={styles.gridCardLabel} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

        {/* REFER & CASHBACK CARD */}
        <View style={styles.referContainer}>
          <View style={styles.referBadge}>
            <Text style={styles.referBadgeText}>🎁 INVITE & EARN</Text>
          </View>
          <Text style={styles.referTitle}>Share Online Adda with Friends</Text>
          <Text style={styles.referSubtitle}>
            Earn up to ₹100 guaranteed cashback on every successful referral!
          </Text>

          <Image
            source={require('../Assets/referalImage.jpeg')}
            style={styles.referImage}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.claimBtn}
            onPress={() =>
              navigation.navigate('ReferScreen', {
                referralCode: UserData?.referalId,
              })
            }
          >
            <Text style={styles.claimText}>INVITE FRIENDS NOW →</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <Footer />
      </ScrollView>


      {/* FLOATING BOTTOM NAV BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('WalletTopupScreen')}
        >
          <Icon name="account-balance-wallet" size={22} color="#FFF" />
          <Text style={styles.navText}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Report', { id: UserData?._id })}
        >
          <Icon name="bar-chart" size={22} color="#FFF" />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.navCenter}
          onPress={() =>
            navigation.navigate('ReferScreen', {
              referralCode: UserData?.referalId,
            })
          }
        >
          <Icon name="star" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('CommissionChart')}
        >
          <Icon name="currency-rupee" size={22} color="#FFF" />
          <Text style={styles.navText}>Commission</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ContactScreen')}
        >
          <Icon name="support-agent" size={22} color="#FFF" />
          <Text style={styles.navText}>Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07153A' },

  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 14, 45, 0.80)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  popupContainer: {
    backgroundColor: '#0D2055',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#4B9EFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  popupClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCloseText: { fontSize: 20, fontWeight: '700', color: '#FFF', lineHeight: 22 },
  popupImage: {
    width: 290,
    height: undefined,
    aspectRatio: 1.5,
    resizeMode: 'cover',
    borderRadius: 20,
  },

  /* HEADER */
  header: {
    backgroundColor: '#040E2D',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 52 : 22,
    paddingBottom: 28,
    elevation: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    borderWidth: 2.5,
    borderColor: '#4B9EFF',
    borderRadius: 28,
    marginRight: 12,
    elevation: 6,
    shadowColor: '#4B9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  userTagRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 19, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 },
  userSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2, fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBadgeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeNotificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#040E2D',
  },

  /* WALLET BALANCE CARD INSIDE HEADER — glassmorphism */
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  balanceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, textTransform: 'uppercase' },
  balanceAmount: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginTop: 4, letterSpacing: 0.5 },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B9EFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    elevation: 4,
    shadowColor: '#4B9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  addMoneyText: { marginLeft: 5, fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginVertical: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(75, 158, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  quickActionText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  /* BANNER CAROUSEL */
  bannerContainer: { marginTop: 20, width: '100%' },
  bannerImage: {
    width: SCREEN_WIDTH - 32,
    height: 160,
    resizeMode: 'cover',
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
  },

  /* SECTION */
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 14,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    elevation: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionBadge: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#4B9EFF',
    marginRight: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { fontSize: 12, fontWeight: '700', color: '#4B9EFF', marginRight: 2 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  /* LARGE CARD (RECHARGE) */
  cardWrapper: {
    width: '48%',
    marginBottom: 6,
  },
  serviceCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.22)',
    borderRadius: 18,
    backgroundColor: 'rgba(75, 158, 255, 0.08)',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 13,
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  image: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  serviceTextContainer: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  cardSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2, fontWeight: '500' },
  arrowIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 4 COLUMN GRID CARDS */
  grid4Column: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCardItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 14,
  },
  gridIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.25)',
  },
  gridIconImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  gridCardLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    lineHeight: 14,
  },

  /* REFER & CASHBACK CONTAINER */
  referContainer: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(75, 158, 255, 0.10)',
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.25)',
  },
  referBadge: {
    backgroundColor: 'rgba(75,158,255,0.20)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.35)',
  },
  referBadgeText: { fontSize: 11, fontWeight: '800', color: '#4B9EFF', letterSpacing: 0.5 },
  referTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  referSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.60)',
    marginTop: 4,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  referImage: {
    width: '92%',
    height: 160,
    resizeMode: 'contain',
    marginVertical: 10,
    borderRadius: 14,
    opacity: 0.92,
  },
  claimBtn: {
    backgroundColor: '#4B9EFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#4B9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    marginTop: 4,
  },
  claimText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  /* BOTTOM NAV */
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 32, 85, 0.96)',
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 16,
    right: 16,
    borderRadius: 32,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.25)',
    shadowColor: '#4B9EFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  navItem: { alignItems: 'center', flex: 1 },
  navCenter: {
    backgroundColor: '#4B9EFF',
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    elevation: 8,
    shadowColor: '#4B9EFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  navText: { fontSize: 10.5, fontWeight: '600', color: 'rgba(255,255,255,0.75)', marginTop: 3 },
});
