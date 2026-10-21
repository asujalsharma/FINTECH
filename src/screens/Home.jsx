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
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getData, API_BASE_URL } from '../API';
import { Dimensions, Linking } from 'react-native';
import Footer from '../components/Footer';


const SCREEN_WIDTH = Dimensions.get('window').width;
const BLUE = '#85daff';

const DUMMY_BANNERS = [
  {
    id: '1',
    badge: '⚡ SPECIAL OFFER',
    badgeColor: '#FDE047',
    badgeBg: 'rgba(253, 224, 71, 0.15)',
    title: 'Up to ₹50 Cashback',
    subtitle: 'On your first Mobile or DTH recharge this month',
    ctaText: 'Recharge Now →',
    icon: 'bolt',
    bgColor: '#85daff',
    accentColor: '#85daff',
    route: 'Recharge',
  },
  {
    id: '2',
    badge: '💡 UTILITY BILLS',
    badgeColor: '#6EE7B7',
    badgeBg: 'rgba(110, 231, 183, 0.15)',
    title: 'Pay Electricity & Water Bills',
    subtitle: 'Zero extra fees & instant payment receipt via BBPS',
    ctaText: 'Pay Bills →',
    icon: 'receipt-long',
    bgColor: '#85daff',
    accentColor: '#85daff',
    route: 'BillPayments',
  },
  {
    id: '3',
    badge: '🎁 REFER & EARN',
    badgeColor: '#C4B5FD',
    badgeBg: 'rgba(196, 181, 253, 0.15)',
    title: 'Invite Friends & Win Rewards',
    subtitle: 'Earn instant bonus directly in your wallet on every join',
    ctaText: 'Invite Friends →',
    icon: 'card-giftcard',
    bgColor: '#85daff',
    accentColor: '#85daff',
    route: 'ReferScreen',
  },
  {
    id: '4',
    badge: '🛡️ 100% SECURE',
    badgeColor: '#93C5FD',
    badgeBg: 'rgba(147, 197, 253, 0.15)',
    title: 'Instant Wallet Top-up',
    subtitle: 'Zero delay UPI transfer with 24/7 payment support',
    ctaText: 'Add Balance →',
    icon: 'account-balance-wallet',
    bgColor: '#85daff',
    accentColor: '#85daff',
    route: 'WalletTopupScreen',
  },
];

const DUMMY_POPUP = {
  badge: '🎉 SPECIAL FESTIVE OFFER',
  title: 'Flat 10% Cashback on All Recharges',
  subtitle: 'Recharge mobile, DTH, or pay utility bills today to unlock instant reward balance directly in your wallet!',
  code: 'ONLINEADDA10',
  ctaText: 'Recharge & Claim Now →',
  route: 'Recharge',
};

const isExcludedService = item => {
  const normalized = (item?.name || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '');
  return (
    normalized === 'addmoney' ||
    normalized === 'signup' ||
    normalized === 'login' ||
    normalized === 'merchant'
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();

  const [orderList, setOrderList] = useState([]);
  const [filteredOrderList, setFilteredOrderList] = useState({});
  const [loading, setLoading] = useState(false);
  const [UserData, setUserData] = useState(null);
  const [Banner, setBanner] = useState(DUMMY_BANNERS);
  const scrollRef = React.useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCashback, setShowCashback] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [POPUP, setPOPUP] = useState(DUMMY_POPUP);

  // Keep the dashboard focused on the user's tasks; promotional content is
  // available in the banner carousel and should not block the first visit.

  const handleClosePopup = () => {
    setShowModal(false);
    AsyncStorage.setItem('lastPopupTime', Date.now().toString());
  };

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

  const allServices = Object.entries(filteredOrderList)
    .flatMap(([sectionName, items]) =>
      (items || []).map(item => ({ ...item, homeSection: sectionName })),
    )
    .filter(item => !isExcludedService(item));
  const rechargeServices = allServices.filter(
    item => item.homeSection === 'recharge',
  );
  const findService = matcher =>
    allServices.find(item => matcher(item.name?.toLowerCase() || ''));

  const rechargeBillServices = [
    {
      id: 'mobile',
      label: 'Mobile\nRecharge',
      icon: 'phone-android',
      iconColor: '#E66A55',
      bgColor: '#FFF5F5',
      borderColor: '#FEE2E2',
      item:
        findService(name => name.includes('mobile')) ||
        rechargeServices.find(item => item.name?.toLowerCase() === 'recharge') ||
        rechargeServices[0],
      defaultRoute: 'Recharge',
    },
    {
      id: 'dth',
      label: 'DTH\nRecharge',
      icon: 'settings-input-antenna',
      iconColor: '#85daff',
      bgColor: '#EFF6FF',
      borderColor: '#DBEAFE',
      item:
        findService(name => name.includes('dth')) ||
        rechargeServices.find(item => item.name?.toLowerCase() !== 'recharge') ||
        rechargeServices[1],
      defaultRoute: 'DTHRechargeScreen',
    },
    {
      id: 'electricity',
      label: 'Electricity\nBill',
      icon: 'lightbulb-outline',
      iconColor: '#D97706',
      bgColor: '#FFFBEB',
      borderColor: '#FEF3C7',
      item: findService(name => name.includes('electric') || name.includes('power') || name.includes('bijli')),
      defaultRoute: 'Provider',
    },
    {
      id: 'fastag',
      label: 'FasTag\nRecharge',
      icon: 'toll',
      iconColor: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#D1FAE5',
      item: findService(name => name.includes('fastag') || name.includes('toll') || name.includes('tag')),
      defaultRoute: 'FastagScreen',
    },
  ];

  const handleRechargeBillPress = service => {
    if (service.item) {
      openService(service.item, service.item.homeSection);
    } else if (service.defaultRoute === 'Recharge') {
      navigation.navigate('Recharge');
    } else if (service.defaultRoute === 'DTHRechargeScreen') {
      navigation.navigate('DTHRechargeScreen');
    } else if (service.defaultRoute === 'FastagScreen') {
      navigation.navigate('FastagScreen');
    } else if (service.defaultRoute === 'Provider') {
      const electric = findService(name => name.includes('electric'));
      if (electric) {
        navigation.navigate('Provider', {
          ServiceId: electric._id,
          name: electric.name,
        });
      } else {
        navigation.navigate('BillPayments');
      }
    }
  };

  const remainingServices = allServices.filter(
    item =>
      !rechargeBillServices.some(
        qs =>
          qs.item === item ||
          (qs.item?._id && item?._id && qs.item._id === item._id),
      ),
  );

  const displayedRemainingServices = searchQuery
    ? remainingServices.filter(s =>
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : remainingServices;

  const openService = (item, sectionName) => {
    const itemName = (item?.name || '').toLowerCase();
    if (itemName.includes('google') || itemName.includes('play')) {
      navigation.navigate('GooglePlayPayment', {
        ServiceId: item._id,
        item,
      });
      return;
    }

    if (sectionName === 'recharge') {
      const isMobile =
        item.name?.toLowerCase().includes('mobile') ||
        item.name?.toLowerCase() === 'recharge';
      navigation.navigate(isMobile ? 'Recharge' : 'DTHRechargeScreen', {
        ServiceId: item._id,
      });
    } else if (sectionName === 'finance') {
      navigation.navigate('Provider', {
        ServiceId: item._id,
        name: item.name,
      });
    } else {
      handleServicePress(item, sectionName);
    }
  };

  const renderServiceTile = (item, label, key) => (
    <TouchableOpacity
      key={key}
      activeOpacity={0.75}
      style={styles.gridCardItem}
      onPress={() => openService(item, item.homeSection)}
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
        {label || item.name}
      </Text>
    </TouchableOpacity>
  );

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
    const combinedData = [...(res?.Data || []), ...(res1?.Data || [])].filter(
      item => !isExcludedService(item),
    );
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
    // fetchBanner(); // Server banner disabled - using dummy banners instead
    // getPopUpImage(); // Server popup disabled - using dummy popup instead
  }, []);

  // Auto-scroll banner carousel
  useEffect(() => {
    if (!Banner || Banner.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % Banner.length;
        scrollRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [Banner]);

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
            onPress={handleClosePopup}
            style={styles.popupClose}
            activeOpacity={0.8}
          >
            <Icon name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {POPUP?.image ? (
            <Image
              source={
                typeof POPUP.image === 'string'
                  ? {
                      uri: POPUP.image.startsWith('http')
                        ? POPUP.image
                        : `${API_BASE_URL}/${POPUP.image}`,
                    }
                  : POPUP.image
              }
              style={styles.popupImage}
            />
          ) : (
            <View style={styles.dummyPopupBody}>
              <View style={styles.popupIconCircle}>
                <Icon name="card-giftcard" size={38} color="#85daff" />
              </View>

              <View style={styles.popupBadge}>
                <Text style={styles.popupBadgeText}>{POPUP?.badge || '🎉 SPECIAL OFFER'}</Text>
              </View>

              <Text style={styles.popupTitle}>{POPUP?.title}</Text>
              <Text style={styles.popupSubtitle}>{POPUP?.subtitle}</Text>

              {POPUP?.code ? (
                <View style={styles.promoCodeBox}>
                  <Text style={styles.promoCodeLabel}>Use Coupon Code: </Text>
                  <Text style={styles.promoCodeText}>{POPUP.code}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.popupCtaBtn}
                onPress={() => {
                  handleClosePopup();
                  if (POPUP?.route) {
                    navigation.navigate(POPUP.route);
                  }
                }}
              >
                <Text style={styles.popupCtaText}>{POPUP?.ctaText || 'Claim Now'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleClosePopup}
                style={styles.popupDismissBtn}
              >
                <Text style={styles.popupDismissText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  // ---------------------------
  // MAIN RENDER
  // ---------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FF" />
      {showModal && renderPopup()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* TOP HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {/* BRAND LOGO & TITLE ON LEFT */}
            <View style={styles.brandRow}>
              <View style={styles.brandLogoCircle}>
                <Image
                  source={require('../Assets/Logo.png')}
                  style={styles.brandLogoImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.brandTextCol}>
                <Text style={styles.brandTitle}>ONLINE ADDA</Text>
                <Text style={styles.brandSubtitle}>HAR GHAR DIGITAL</Text>
              </View>
            </View>

            {/* ACTION ICONS ON RIGHT */}
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.headerCircleBtn}
                onPress={() => setSearchOpen(prev => !prev)}
              >
                <Icon name={searchOpen ? 'close' : 'search'} size={21} color="#18264D" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.headerCircleBtn}
                onPress={() => navigation.navigate('Notification')}
              >
                <Icon name="notifications-none" size={21} color="#18264D" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>1</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.avatarContainer}
                onPress={() =>
                  navigation.navigate('Profile', {
                    name: UserData?.firstName + ' ' + UserData?.lastName,
                    phn: UserData?.phone,
                    referralCode: UserData?.referalId,
                    userData: UserData,
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
            </View>
          </View>

          {/* SEARCH BAR (WHEN TOGGLED) */}
          {searchOpen && (
            <View style={styles.searchBarRow}>
              <Icon name="search" size={20} color="#7582A0" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search mobile, DTH, electricity, fastag..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close" size={18} color="#7582A0" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* TOP CASHBACK & WALLET CARD */}
          <View style={styles.cashbackCard}>
            <View style={styles.cashbackLeft}>
              <View style={styles.cashbackTitleRow}>
                <View style={styles.giftIconCircle}>
                  <Icon name="card-giftcard" size={20} color="#85daff" />
                </View>
                <Text style={styles.cashbackLabel}>Your Cashback</Text>
              </View>
              <Text style={styles.cashbackValue}>
                {showCashback
                  ? `₹ ${UserData?.wallet?.balance !== undefined ? UserData?.wallet?.balance : '0.00'}`
                  : '******'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.viewCashbackBtn}
                onPress={() => setShowCashback(prev => !prev)}
              >
                <Text style={styles.viewCashbackText}>
                  {showCashback ? 'Hide Cashback' : 'View Cashback'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CIRCULAR WALLET TOPUP BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.walletCircleBtn}
              onPress={() => navigation.navigate('WalletTopupScreen')}
            >
              <View style={styles.walletIconContainer}>
                <Icon name="account-balance-wallet" size={32} color="#E66A55" />
                <View style={styles.walletPlusBadge}>
                  <Icon name="add" size={12} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECHARGE / BILL PAYMENTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recharge / Bill Payments</Text>
          </View>
          <View style={styles.rechargeBillRow}>
            {rechargeBillServices.map(service => (
              <TouchableOpacity
                key={service.id}
                activeOpacity={0.75}
                style={styles.rechargeBillItem}
                onPress={() => handleRechargeBillPress(service)}
              >
                <View
                  style={[
                    styles.rechargeBillIconCircle,
                    { backgroundColor: service.bgColor, borderColor: service.borderColor },
                  ]}
                >
                  <Icon name={service.icon} size={28} color={service.iconColor} />
                </View>
                <Text style={styles.rechargeBillLabel}>{service.label}</Text>
              </TouchableOpacity>
            ))}
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
            keyExtractor={item => item?.id ? String(item.id) : String(Math.random())}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  if (item.route) {
                    navigation.navigate(item.route, item.routeParams || {});
                  } else if (item.link) {
                    Linking.openURL(item.link);
                  }
                }}
                style={{ width: SCREEN_WIDTH }}
              >
                {item.image ? (
                  <Image
                    source={
                      typeof item.image === 'string'
                        ? {
                            uri: item.image.startsWith('http')
                              ? item.image
                              : `${API_BASE_URL}/${item.image}`,
                          }
                        : item.image
                    }
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.dummyBannerCard,
                      { backgroundColor: item.bgColor },
                    ]}
                  >
                    <View
                      style={[
                        styles.bannerGlowCircle,
                        { backgroundColor: item.accentColor },
                      ]}
                    />

                    <View style={styles.bannerContentLeft}>
                      <View
                        style={[
                          styles.bannerBadge,
                          { backgroundColor: item.badgeBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.bannerBadgeText,
                            { color: item.badgeColor },
                          ]}
                        >
                          {item.badge}
                        </Text>
                      </View>
                      <Text style={styles.bannerTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.bannerSubtitle} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                      <View style={styles.bannerCtaBtn}>
                        <Text style={styles.bannerCtaText}>{item.ctaText}</Text>
                      </View>
                    </View>

                    <View style={styles.bannerIconWrapper}>
                      <View
                        style={[
                          styles.bannerIconBg,
                          { borderColor: item.accentColor },
                        ]}
                      >
                        <Icon name={item.icon} size={36} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                )}
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
                      currentIndex === idx ? '#85daff' : 'rgba(255,255,255,0.25)',
                    width: currentIndex === idx ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* ALL SERVICES GRID */}
        {displayedRemainingServices.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {searchQuery ? 'Search Results' : 'All Services'}
              </Text>
              <View style={styles.quickServicesCount}>
                <Text style={styles.quickServicesCountText}>
                  {String(displayedRemainingServices.length).padStart(2, '0')}
                </Text>
              </View>
            </View>
            <View style={styles.grid4Column}>
              {displayedRemainingServices.map((item, index) =>
                renderServiceTile(
                  item,
                  item.homeSection === 'recharge' &&
                    item.name?.toLowerCase() === 'recharge'
                    ? 'Mobile'
                    : item.name,
                  `all-${item._id || index}`,
                ),
              )}
            </View>
          </View>
        )}

        {/* REFER & CASHBACK CARD */}
        <View style={styles.referContainer}>
          <View style={styles.referBadge}>
            <Text style={styles.referBadgeText}>🎁 INVITE & EARN</Text>
          </View>
          <Text style={styles.referTitle}>Share the experience with friends</Text>
          <Text style={styles.referSubtitle}>
            Earn up to ₹100 guaranteed cashback on every successful referral!
          </Text>

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
          onPress={() => {
            scrollRef.current?.scrollToOffset?.({ offset: 0, animated: true });
          }}
        >
          <Icon name="home" size={24} color="#85daff" />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Report', { id: UserData?._id })}
        >
          <Icon name="bar-chart" size={22} color="#657298" />
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
          <Icon name="stars" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ContactScreen')}
        >
          <Icon name="support-agent" size={22} color="#657298" />
          <Text style={styles.navText}>Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('Profile', {
              name: UserData?.firstName + ' ' + UserData?.lastName,
              phn: UserData?.phone,
              referralCode: UserData?.referalId,
              userData: UserData,
            })
          }
        >
          <Icon name="person-outline" size={22} color="#657298" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;


const baseStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#85daff' },

  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 14, 45, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  popupContainer: {
    backgroundColor: '#85daff',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(133, 218, 255, 0.35)',
    shadowColor: '#85daff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  popupClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  dummyPopupBody: {
    paddingHorizontal: 22,
    paddingTop: 32,
    paddingBottom: 22,
    alignItems: 'center',
    width: '100%',
  },
  popupIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(133, 218, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(133, 218, 255, 0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  popupBadge: {
    backgroundColor: 'rgba(253, 224, 71, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.40)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  popupBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FDE047',
    letterSpacing: 0.6,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  popupSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    fontWeight: '500',
  },
  promoCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(133, 218, 255, 0.30)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
  },
  promoCodeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.70)',
    fontWeight: '600',
  },
  promoCodeText: {
    fontSize: 14,
    color: '#85daff',
    fontWeight: '800',
    letterSpacing: 1,
  },
  popupCtaBtn: {
    backgroundColor: '#85daff',
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#85daff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  popupCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  popupDismissBtn: {
    marginTop: 12,
    paddingVertical: 6,
  },
  popupDismissText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
  },
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
    borderColor: '#85daff',
    borderRadius: 28,
    marginRight: 12,
    elevation: 6,
    shadowColor: '#85daff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  userTagRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 19, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 },
  userSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.80)', marginTop: 2, fontWeight: '600' },
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
  balanceLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.80)', letterSpacing: 0.8, textTransform: 'uppercase' },
  balanceAmount: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginTop: 4, letterSpacing: 0.5 },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#85daff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    elevation: 4,
    shadowColor: '#85daff',
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
    backgroundColor: 'rgba(133, 218, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(133, 218, 255,0.30)',
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
  dummyBannerCard: {
    width: SCREEN_WIDTH - 32,
    height: 160,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  bannerGlowCircle: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    opacity: 0.18,
  },
  bannerContentLeft: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    marginBottom: 10,
  },
  bannerCtaBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  bannerCtaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  bannerIconWrapper: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIconBg: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#85daff',
    marginRight: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { fontSize: 12, fontWeight: '700', color: '#85daff', marginRight: 2 },

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
    borderColor: 'rgba(133, 218, 255,0.22)',
    borderRadius: 18,
    backgroundColor: 'rgba(133, 218, 255, 0.08)',
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
  cardSubtitle: { fontSize: 10.5, color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: '600' },
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
    marginBottom: 16,
  },
  gridIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 0,
  },
  gridIconImage: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  gridCardLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#18264D',
    textAlign: 'center',
    lineHeight: 16,
  },

  /* REFER & CASHBACK CONTAINER */
  referContainer: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(133, 218, 255, 0.10)',
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(133, 218, 255,0.25)',
  },
  referBadge: {
    backgroundColor: 'rgba(133, 218, 255,0.20)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(133, 218, 255,0.35)',
  },
  referBadgeText: { fontSize: 11, fontWeight: '800', color: '#85daff', letterSpacing: 0.5 },
  referTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  referSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.80)',
    marginTop: 4,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 17,
    fontWeight: '500',
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
    backgroundColor: '#85daff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#85daff',
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
    borderColor: 'rgba(133, 218, 255,0.25)',
    shadowColor: '#85daff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  navItem: { alignItems: 'center', flex: 1 },
  navCenter: {
    backgroundColor: '#85daff',
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    elevation: 8,
    shadowColor: '#85daff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  navText: { fontSize: 10.5, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 3 },

});

const styles = {
  ...baseStyles,
  ...StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FF' },
  header: {
    backgroundColor: '#F4F7FF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 18 : 20,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#85daff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandLogoImg: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#101F49',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#E66A55',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E66A55',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 2,
  },
  notificationBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarContainer: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCE6FF',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9F7',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#101F49',
    paddingVertical: 4,
  },
  cashbackCard: {
    backgroundColor: '#EBF2FF',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D4E2FA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cashbackLeft: {
    flex: 1,
    marginRight: 12,
  },
  cashbackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  giftIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cashbackLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101F49',
  },
  cashbackValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#101F49',
    marginVertical: 4,
    letterSpacing: 2,
  },
  viewCashbackBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  viewCashbackText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#18264D',
  },
  walletCircleBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DDE7F8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#85daff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  walletIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletPlusBadge: {
    position: 'absolute',
    bottom: -3,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rechargeBillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  rechargeBillItem: {
    width: '23%',
    alignItems: 'center',
  },
  rechargeBillIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rechargeBillLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#18264D',
    textAlign: 'center',
    lineHeight: 15,
  },
  bannerContainer: { marginTop: 14, width: '100%' },
  dummyBannerCard: {
    width: SCREEN_WIDTH - 32,
    height: 150,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0,
    elevation: 0,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0, marginBottom: 4 },
  bannerBadge: { borderRadius: 10, marginBottom: 6 },
  bannerCtaBtn: { backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 0, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 10 },
  bannerCtaText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0 },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 14,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7ECF8',
    elevation: 0,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#18264D', letterSpacing: -0.2 },
  quickServicesCount: {
    minWidth: 32,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickServicesCountText: { fontSize: 11, fontWeight: '800', color: '#85daff' },
  grid4Column: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCardItem: { width: '23%', alignItems: 'center', marginBottom: 16 },
  gridIconCircle: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 0 },
  gridIconImage: { width: 34, height: 34, resizeMode: 'contain' },
  gridCardLabel: { fontSize: 11.5, fontWeight: '700', color: '#18264D', textAlign: 'center', lineHeight: 15 },
  referContainer: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: '#EAF0FF',
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DAE3FF',
  },
  referBadge: { backgroundColor: '#D8E2FF', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, marginBottom: 10, borderWidth: 0 },
  referBadgeText: { fontSize: 10, fontWeight: '700', color: '#85daff', letterSpacing: 0.4 },
  referTitle: { fontSize: 17, fontWeight: '700', color: '#1D2F69', textAlign: 'center' },
  referSubtitle: { fontSize: 12, color: '#5F6F9B', marginTop: 5, marginBottom: 10, textAlign: 'center', lineHeight: 17, fontWeight: '400' },
  referImage: { width: '92%', height: 145, resizeMode: 'contain', marginVertical: 7, borderRadius: 14 },
  claimBtn: { backgroundColor: '#85daff', paddingVertical: 13, paddingHorizontal: 25, borderRadius: 13, elevation: 0, marginTop: 4 },
  claimText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 22 : 12,
    left: 16,
    right: 16,
    borderRadius: 22,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#E3E9F7',
    shadowColor: '#172A61',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 48 },
  navCenter: {
    backgroundColor: '#85daff',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    elevation: 6,
    shadowColor: '#85daff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  navText: { fontSize: 10, fontWeight: '600', color: '#657298', marginTop: 3 },
  navTextActive: { color: '#85daff', fontWeight: '700' },
  }),
};
