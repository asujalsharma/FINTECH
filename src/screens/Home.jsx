import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
  Dimensions,
  Linking,
  RefreshControl,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData, API_BASE_URL } from '../API';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Curated high-converting banners when backend returns empty array
const DEFAULT_BANNERS = [
  {
    id: 'b1',
    title: 'Flat 2.5% Instant Cashback',
    subtitle: 'On Jio, Airtel, Vi & BSNL recharges today',
    tag: '⚡ SPECIAL OFFER',
    tagBg: '#FF7A00',
    badgeText: 'INSTANT',
    gradientBg: '#0A2568',
    icon: 'flash-on',
    code: 'RECHARGE25',
  },
  {
    id: 'b2',
    title: 'Zero Surcharge on Bill Payments',
    subtitle: 'Pay Electricity, Gas & Water with 100% BBPS safety',
    tag: '💡 BBPS ASSURED',
    tagBg: '#10B981',
    badgeText: 'SECURE',
    gradientBg: '#0D52ED',
    icon: 'receipt',
    code: 'ZEROFEE',
  },
  {
    id: 'b3',
    title: 'Earn ₹100 Guaranteed Per Friend',
    subtitle: 'Share your invite link & get instant wallet cash',
    tag: '🎁 REFER & EARN',
    tagBg: '#7C3AED',
    badgeText: 'REWARD',
    gradientBg: '#1E1B4B',
    icon: 'card-giftcard',
    code: 'INVITE100',
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();

  const [orderList, setOrderList] = useState([]);
  const [filteredOrderList, setFilteredOrderList] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [UserData, setUserData] = useState(null);
  const [Banner, setBanner] = useState(DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [POPUP, setPOPUP] = useState(null);

  const scrollRef = useRef(null);
  const bannerTimerRef = useRef(null);

  // -----------------------------------
  // AUTO-SCROLL PROMO BANNERS
  // -----------------------------------
  useEffect(() => {
    if (Banner.length > 1) {
      bannerTimerRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % Banner.length;
          scrollRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 4000);
    }

    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, [Banner]);

  // -----------------------------------
  // SHOW POPUP ONCE PER HOUR (SAFE)
  // -----------------------------------
  useEffect(() => {
    if (POPUP?.image) {
      const now = Date.now();
      AsyncStorage.getItem('lastPopupTime')
        .then(lastTime => {
          const lastShown = lastTime ? parseInt(lastTime, 10) : 0;
          const diff = now - lastShown;
          const hoursPassed = diff / (1000 * 60 * 60);

          if (hoursPassed >= 1) {
            setShowModal(true);
            AsyncStorage.setItem('lastPopupTime', now.toString());
          }
        })
        .catch(() => {});
    }
  }, [POPUP]);

  // -----------------------------------
  // POPUP IMAGE API (SAFE TRY/CATCH)
  // -----------------------------------
  const getPopUpImage = async () => {
    try {
      const res = await getData(`api/pop-image`);
      if (res?.Status && res?.Data) {
        setPOPUP(res.Data);
      }
    } catch (e) {
      // 404 or no popup is normal; ignore gracefully
    }
  };

  // -----------------------------------
  // USER PROFILE API (SAFE TRY/CATCH)
  // -----------------------------------
  const fetchUser = async () => {
    try {
      const res = await getData(`/api/user/profile`);
      if (res?.Status === true || res?.success === true) {
        setUserData(res?.Data || res?.user);
      }
    } catch (err) {
      console.log('User Fetch Error →', err?.message || err);
    }
  };

  // -----------------------------------
  // SERVICES LIST (SAFE PROMISE.ALLSETTLED)
  // -----------------------------------
  const getOrderlist = async () => {
    setLoading(true);
    try {
      const [servicesResult, affiliateResult] = await Promise.allSettled([
        getData(`api/service/list?status=true`),
        getData(`api/affiliate/list`),
      ]);

      const services =
        servicesResult.status === 'fulfilled' && servicesResult.value?.Data
          ? servicesResult.value.Data
          : [];

      const affiliates =
        affiliateResult.status === 'fulfilled' && affiliateResult.value?.Data
          ? affiliateResult.value.Data
          : [];

      const combinedData = [...services, ...affiliates];
      setOrderList(combinedData);
      separateServicesBySection(combinedData);
    } catch (err) {
      console.log('Service List Error →', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // BANNER FETCH (SAFE TRY/CATCH + FALLBACK)
  // -----------------------------------
  const fetchBanner = async () => {
    try {
      const res = await getData('api/home-banner/list');
      if (res?.Data && Array.isArray(res.Data) && res.Data.length > 0) {
        setBanner(res.Data);
      } else {
        setBanner(DEFAULT_BANNERS);
      }
    } catch (err) {
      setBanner(DEFAULT_BANNERS);
    }
  };

  // -----------------------------------
  // GROUP SERVICES BY "section"
  // -----------------------------------
  const separateServicesBySection = (services = []) => {
    const acc = services.reduce((accMap, item) => {
      if (!accMap[item.section]) accMap[item.section] = [];
      accMap[item.section].push(item);
      return accMap;
    }, {});
    setFilteredOrderList(acc);
  };

  // -----------------------------------
  // PULL TO REFRESH
  // -----------------------------------
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUser(),
      getOrderlist(),
      fetchBanner(),
      getPopUpImage(),
    ]);
    setRefreshing(false);
  }, []);

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
    useCallback(() => {
      fetchUser();
      getOrderlist();
    }, []),
  );

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

  // -----------------------------------
  // NATIVE SHARE REFERRAL
  // -----------------------------------
  const handleShareReferral = async () => {
    const referralCode = UserData?.referalId || 'RECHARGE100';
    try {
      await Share.share({
        message: `🎁 Recharge, pay bills & earn instant cashback on Recharge Hoga! Use my referral code: ${referralCode} to get ₹100 extra cashback on your first recharge.\n\nDownload now: https://rechargehoga.techember.in`,
        title: 'Recharge Hoga Invite',
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  // -----------------------------------
  // POPUP MODAL RENDER
  // -----------------------------------
  const renderPopup = () => (
    <Modal visible={showModal} transparent animationType="fade">
      <View style={styles.popupBackdrop}>
        <View style={styles.popupContainer}>
          <TouchableOpacity
            onPress={() => setShowModal(false)}
            style={styles.popupClose}
          >
            <Icon name="close" size={20} color="#0F172A" />
          </TouchableOpacity>

          <Image
            source={{
              uri: POPUP?.image?.startsWith('http')
                ? POPUP.image
                : `${API_BASE_URL}/${POPUP?.image}`,
            }}
            style={styles.popupImage}
          />
        </View>
      </View>
    </Modal>
  );

  // Formatted balance display
  const rawBalance = UserData?.wallet?.balance ?? 0;
  const formattedBalance = Number(rawBalance).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.headerBg} barStyle="light-content" translucent={false} />
      {showModal && POPUP?.image && renderPopup()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary, COLORS.accent]}
            tintColor="#FFFFFF"
          />
        }
      >
        {/* ========================================================
            TOP HEADER WITH PROFILE & NOTIFICATION
        ======================================================== */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.userProfileBtn}
              onPress={() =>
                navigation.navigate('Profile', {
                  name: `${UserData?.firstName || ''} ${UserData?.lastName || ''}`.trim() || 'User',
                  phn: UserData?.phone,
                  referralCode: UserData?.referalId,
                })
              }
            >
              <View style={styles.avatarGlow}>
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarInitials}>
                    {(UserData?.firstName?.[0] || 'S').toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    Hi, {UserData?.firstName || 'Sujal'}
                  </Text>
                  <Text style={styles.waveHand}> 👋</Text>
                </View>
                <View style={styles.kycBadge}>
                  <Icon name="verified" size={12} color="#10B981" />
                  <Text style={styles.kycBadgeText}>KYC Verified</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionIconBtn}
                onPress={() => navigation.navigate('ContactScreen')}
              >
                <Icon name="headset-mic" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.actionIconBtn, { marginLeft: 8 }]}
                onPress={() => navigation.navigate('Notification')}
              >
                <Icon name="notifications" size={20} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ========================================================
              LUXURY FINTECH WALLET CARD
          ======================================================== */}
          <View style={styles.balanceCard}>
            {/* Card Chip & Network Badge */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardChipPill}>
                <Icon name="bolt" size={14} color="#FFB703" />
                <Text style={styles.cardChipText}>Fast & Secure Pay</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowBalance(!showBalance)}
                style={styles.eyeBtn}
              >
                <Icon
                  name={showBalance ? 'visibility' : 'visibility-off'}
                  size={18}
                  color="rgba(255, 255, 255, 0.85)"
                />
              </TouchableOpacity>
            </View>

            {/* Balance Amount & Add Money */}
            <View style={styles.balanceMainRow}>
              <View>
                <Text style={styles.balanceTitle}>Available Balance</Text>
                <View style={styles.amountWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <Text style={styles.balanceValue}>
                    {showBalance ? formattedBalance : '••••••'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.addMoneyBtn}
                onPress={() => navigation.navigate('WalletTopupScreen')}
              >
                <Icon name="add" size={18} color="#0D52ED" />
                <Text style={styles.addMoneyBtnText}>Add Money</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardDivider} />

            {/* Quick Actions Bar */}
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.quickActionCol}
                onPress={() => navigation.navigate('WalletTopupScreen')}
              >
                <View style={[styles.quickActionCircle, { backgroundColor: '#0284C7' }]}>
                  <Icon name="account-balance-wallet" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.quickActionLabel}>Top Up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.quickActionCol}
                onPress={() => navigation.navigate('Report', { id: UserData?._id })}
              >
                <View style={[styles.quickActionCircle, { backgroundColor: '#059669' }]}>
                  <Icon name="receipt-long" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.quickActionLabel}>Passbook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.quickActionCol}
                onPress={() => navigation.navigate('CommissionChart')}
              >
                <View style={[styles.quickActionCircle, { backgroundColor: '#D97706' }]}>
                  <Icon name="trending-up" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.quickActionLabel}>Commission</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.quickActionCol}
                onPress={() =>
                  navigation.navigate('ReferScreen', {
                    referralCode: UserData?.referalId,
                  })
                }
              >
                <View style={[styles.quickActionCircle, { backgroundColor: '#7C3AED' }]}>
                  <Icon name="card-giftcard" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.quickActionLabel}>Rewards</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ========================================================
            PROMOTIONAL BANNER CAROUSEL
        ======================================================== */}
        <View style={styles.carouselSection}>
          <FlatList
            data={Banner}
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => {
              const isImageBanner = !!item?.image;

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.bannerCardWrapper}
                  onPress={() => {
                    if (item?.link) {
                      Linking.openURL(item.link);
                    } else if (item?.route) {
                      navigation.navigate(item.route);
                    } else {
                      navigation.navigate('Recharge');
                    }
                  }}
                >
                  {isImageBanner ? (
                    <Image
                      source={{
                        uri: item.image?.startsWith('http')
                          ? item.image
                          : `${API_BASE_URL}/${item.image}`,
                      }}
                      style={styles.bannerImage}
                    />
                  ) : (
                    <View
                      style={[
                        styles.promoBannerCard,
                        { backgroundColor: item.gradientBg || COLORS.headerBg },
                      ]}
                    >
                      <View style={styles.promoContent}>
                        <View
                          style={[
                            styles.promoTagPill,
                            { backgroundColor: item.tagBg || COLORS.accent },
                          ]}
                        >
                          <Text style={styles.promoTagText}>{item.tag}</Text>
                        </View>
                        <Text style={styles.promoTitle}>{item.title}</Text>
                        <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
                        {item.code && (
                          <View style={styles.promoCodePill}>
                            <Text style={styles.promoCodeLabel}>Use Code: </Text>
                            <Text style={styles.promoCodeVal}>{item.code}</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.promoIconContainer}>
                        <Icon name={item.icon || 'bolt'} size={42} color="#FFFFFF" />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            onMomentumScrollEnd={e => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setCurrentIndex(index);
            }}
          />

          {/* DOT INDICATORS */}
          <View style={styles.dotsRow}>
            {Banner.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  currentIndex === idx ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ========================================================
            RECHARGE SERVICES (MOBILE & DTH)
        ======================================================== */}
        <View style={styles.serviceSection}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingTitleBlock}>
              <View style={styles.headingAccentBar} />
              <Text style={styles.sectionHeadingTitle}>Recharge Services</Text>
            </View>
            <View style={styles.cashbackTagPill}>
              <Icon name="verified" size={12} color="#10B981" />
              <Text style={styles.cashbackTagText}>Instant Payout</Text>
            </View>
          </View>

          <View style={styles.rechargePairRow}>
            {/* Mobile Recharge Card */}
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.rechargeCard}
              onPress={() => {
                const item = filteredOrderList['recharge']?.find(
                  s => s.name === 'Recharge' || s.name?.toLowerCase().includes('mobile'),
                );
                navigation.navigate('Recharge', { ServiceId: item?._id });
              }}
            >
              <View style={[styles.rechargeIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Icon name="smartphone" size={28} color="#0D52ED" />
              </View>
              <View style={styles.rechargeCardInfo}>
                <Text style={styles.rechargeCardTitle}>Mobile</Text>
                <View style={styles.cashbackMiniBadge}>
                  <Text style={styles.cashbackMiniText}>⚡ Up to 4% Back</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            {/* DTH Recharge Card */}
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.rechargeCard}
              onPress={() => {
                const item = filteredOrderList['recharge']?.find(
                  s => s.name !== 'Recharge',
                );
                navigation.navigate('DTHRechargeScreen', { ServiceId: item?._id });
              }}
            >
              <View style={[styles.rechargeIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Icon name="tv" size={28} color="#10B981" />
              </View>
              <View style={styles.rechargeCardInfo}>
                <Text style={styles.rechargeCardTitle}>DTH</Text>
                <View style={[styles.cashbackMiniBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.cashbackMiniText, { color: '#059669' }]}>
                    ⚡ Up to 3.5% Back
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================
            BILLS & PAYMENTS (BBPS UTILITIES)
        ======================================================== */}
        <View style={styles.serviceSection}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingTitleBlock}>
              <View style={[styles.headingAccentBar, { backgroundColor: '#10B981' }]} />
              <Text style={styles.sectionHeadingTitle}>Bills & Payments</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.viewAllBtn}
              onPress={() =>
                navigation.navigate('BillPayments', {
                  service: filteredOrderList['finance'] || [],
                })
              }
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="arrow-forward-ios" size={11} color="#0D52ED" />
            </TouchableOpacity>
          </View>

          {/* 4-COLUMN UTILITY GRID */}
          <View style={styles.utilityGrid}>
            {(filteredOrderList['finance'] || [])
              .slice(0, 8)
              .map((item, idx) => {
                const colorsArr = [
                  { bg: '#FEF3C7', icon: '#D97706', defaultIcon: 'flash-on' },
                  { bg: '#E0F2FE', icon: '#0284C7', defaultIcon: 'directions-car' },
                  { bg: '#FFE4E6', icon: '#E11D48', defaultIcon: 'local-fire-department' },
                  { bg: '#EDE9FE', icon: '#7C3AED', defaultIcon: 'phone-android' },
                  { bg: '#CFFAFE', icon: '#0891B2', defaultIcon: 'water-drop' },
                  { bg: '#DCFCE7', icon: '#059669', defaultIcon: 'router' },
                  { bg: '#FCE7F3', icon: '#DB2777', defaultIcon: 'security' },
                  { bg: '#FEF9C3', icon: '#CA8A04', defaultIcon: 'sports-esports' },
                ];
                const palette = colorsArr[idx % colorsArr.length];

                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.75}
                    style={styles.utilityGridItem}
                    onPress={() =>
                      navigation.navigate('Provider', {
                        ServiceId: item._id,
                        name: item.name,
                      })
                    }
                  >
                    <View style={[styles.utilityIconWrapper, { backgroundColor: palette.bg }]}>
                      {item.icon ? (
                        <Image
                          source={{
                            uri: item.icon?.startsWith('http')
                              ? item.icon
                              : `${API_BASE_URL}/${item.icon}`,
                          }}
                          style={styles.utilityIconImg}
                        />
                      ) : (
                        <Icon name={palette.defaultIcon} size={26} color={palette.icon} />
                      )}
                    </View>
                    <Text style={styles.utilityLabel} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>

        {/* ========================================================
            DYNAMIC SECTIONS (AFFILIATES / OTHER)
        ======================================================== */}
        {Object.keys(filteredOrderList)
          .filter(
            sectionName =>
              sectionName !== 'recharge' &&
              sectionName !== 'finance' &&
              sectionName.trim() !== '' &&
              filteredOrderList[sectionName]?.length > 0,
          )
          .map((sectionName, index) => (
            <View key={index} style={styles.serviceSection}>
              <View style={styles.sectionHeadingRow}>
                <View style={styles.headingTitleBlock}>
                  <View style={styles.headingAccentBar} />
                  <Text style={styles.sectionHeadingTitle}>
                    {sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.utilityGrid}>
                {filteredOrderList[sectionName].slice(0, 4).map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.75}
                    style={styles.utilityGridItem}
                    onPress={() => handleServicePress(item, sectionName)}
                  >
                    <View style={styles.utilityIconWrapper}>
                      <Image
                        source={{
                          uri: item.icon?.startsWith('http')
                            ? item.icon
                            : `${API_BASE_URL}/${item.icon}`,
                        }}
                        style={styles.utilityIconImg}
                      />
                    </View>
                    <Text style={styles.utilityLabel} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

        {/* ========================================================
            REFER & EARN CASHBACK CARD
        ======================================================== */}
        <View style={styles.referCardContainer}>
          <View style={styles.referHeaderRow}>
            <View style={styles.referTagPill}>
              <Text style={styles.referTagText}>🎁 INVITE & EARN</Text>
            </View>
            <View style={styles.referBonusTag}>
              <Text style={styles.referBonusText}>₹100 Per Friend</Text>
            </View>
          </View>

          <Text style={styles.referMainHeading}>
            Earn Unlimited Cashback with Friends
          </Text>
          <Text style={styles.referSubHeading}>
            Invite your friends to Recharge Hoga. When they make their first recharge, you both get ₹100 instant wallet cash!
          </Text>

          {/* Referral Code Box */}
          <View style={styles.codeShareBox}>
            <View>
              <Text style={styles.yourCodeLabel}>YOUR REFERRAL CODE</Text>
              <Text style={styles.yourCodeValue}>
                {UserData?.referalId || 'RECHARGE100'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.shareNowBtn}
              onPress={handleShareReferral}
            >
              <Icon name="share" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.shareNowBtnText}>SHARE CODE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================
            TRUST BADGES ROW
        ======================================================== */}
        <View style={styles.trustBadgesRow}>
          <View style={styles.trustBadgeItem}>
            <Icon name="verified-user" size={16} color="#10B981" />
            <Text style={styles.trustBadgeText}>256-Bit SSL</Text>
          </View>

          <View style={styles.trustDivider} />

          <View style={styles.trustBadgeItem}>
            <Icon name="flash-on" size={16} color="#FF7A00" />
            <Text style={styles.trustBadgeText}>Instant Payouts</Text>
          </View>

          <View style={styles.trustDivider} />

          <View style={styles.trustBadgeItem}>
            <Icon name="favorite" size={16} color="#0D52ED" />
            <Text style={styles.trustBadgeText}>Made for Bharat</Text>
          </View>
        </View>

        {/* FOOTER */}
        <Footer />
      </ScrollView>

      {/* ========================================================
          FLOATING BOTTOM NAVIGATION BAR
      ======================================================== */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon name="home" size={22} color="#FFB703" />
          <Text style={[styles.navText, { color: '#FFB703', fontWeight: '800' }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.navItem}
          onPress={() => navigation.navigate('WalletTopupScreen')}
        >
          <Icon name="account-balance-wallet" size={22} color="#D9E7FF" />
          <Text style={styles.navText}>Wallet</Text>
        </TouchableOpacity>

        {/* CENTER ACTION BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.navCenterBtn}
          onPress={() =>
            navigation.navigate('ReferScreen', {
              referralCode: UserData?.referalId,
            })
          }
        >
          <View style={styles.navCenterInner}>
            <Icon name="bolt" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.navItem}
          onPress={() => navigation.navigate('CommissionChart')}
        >
          <Icon name="trending-up" size={22} color="#D9E7FF" />
          <Text style={styles.navText}>Rates</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.navItem}
          onPress={() => navigation.navigate('ContactScreen')}
        >
          <Icon name="support-agent" size={22} color="#D9E7FF" />
          <Text style={styles.navText}>Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 110,
  },

  /* ==========================================
     POPUP MODAL
  ========================================== */
  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 104, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  popupContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  popupClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupImage: {
    width: 300,
    height: undefined,
    aspectRatio: 1.4,
    resizeMode: 'cover',
    borderRadius: 20,
  },

  /* ==========================================
     TOP HEADER
  ========================================== */
  header: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 14 : 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 6,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarGlow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D52ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  waveHand: {
    fontSize: 16,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  kycBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#0A2568',
  },

  /* ==========================================
     LUXURY FINTECH WALLET CARD
  ========================================== */
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardChipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 183, 3, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cardChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFB703',
    marginLeft: 4,
  },
  eyeBtn: {
    padding: 4,
  },
  balanceMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  balanceTitle: {
    fontSize: 12,
    color: '#D9E7FF',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  addMoneyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D52ED',
    marginLeft: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickActionCol: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  /* ==========================================
     PROMOTIONAL BANNER CAROUSEL
  ========================================== */
  carouselSection: {
    marginTop: 16,
    width: '100%',
  },
  bannerCardWrapper: {
    width: SCREEN_WIDTH - 32,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  bannerImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
    borderRadius: 20,
  },
  promoBannerCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 140,
  },
  promoContent: {
    flex: 1,
    paddingRight: 12,
  },
  promoTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  promoTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  promoSubtitle: {
    fontSize: 12,
    color: '#D9E7FF',
    marginTop: 3,
    lineHeight: 16,
  },
  promoCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  promoCodeLabel: {
    fontSize: 10,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  promoCodeVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB703',
  },
  promoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 22,
    backgroundColor: '#0D52ED',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },

  /* ==========================================
     SERVICE SECTIONS
  ========================================== */
  serviceSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headingTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingAccentBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#0D52ED',
    marginRight: 10,
  },
  sectionHeadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#091838',
    letterSpacing: 0.2,
  },
  cashbackTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cashbackTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 4,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D52ED',
    marginRight: 4,
  },

  /* RECHARGE PAIR CARDS */
  rechargePairRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rechargeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  rechargeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rechargeCardInfo: {
    flex: 1,
  },
  rechargeCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#091838',
  },
  cashbackMiniBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  cashbackMiniText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0D52ED',
  },

  /* 4-COLUMN UTILITY GRID */
  utilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  utilityGridItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 14,
  },
  utilityIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  utilityIconImg: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  utilityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },

  /* ==========================================
     REFER & EARN CASHBACK CARD
  ========================================== */
  referCardContainer: {
    backgroundColor: '#061533',
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  referHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  referTagPill: {
    backgroundColor: 'rgba(255, 122, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  referTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB703',
  },
  referBonusTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  referBonusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
  },
  referMainHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  referSubHeading: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 16,
  },
  codeShareBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yourCodeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  yourCodeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFB703',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  shareNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D52ED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
  },
  shareNowBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  /* ==========================================
     TRUST BADGES
  ========================================== */
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 18,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  trustBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 6,
  },
  trustDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E2E8F0',
  },

  /* ==========================================
     FLOATING BOTTOM NAV
  ========================================== */
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 16,
    right: 16,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navCenterBtn: {
    marginTop: -28,
  },
  navCenterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D9E7FF',
    marginTop: 2,
  },
});
