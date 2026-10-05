import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../redux/actions/userActions';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import NavBar from '../components/NavBar';
import { SarvanaHeaderLogo } from '../components/SarvanaLogo';
import { getData, API_BASE_URL } from '../API';
import useFundAccount, { getDocumentUrl } from '../hooks/useFundAccount';

const { width } = Dimensions.get('window');

const DEFAULT_BBPS_SERVICES = [
  {
    _id: '678575d63fde9ce75e7eb2a0',
    name: 'Recharge',
    icon: 'cellphone',
    bgColor: '#E8F5E9',
    iconColor: '#0F8A5F',
    screenType: 'recharge',
  },
  {
    _id: '678575d63fde9ce75e7eb2a3',
    name: 'DTH',
    icon: 'satellite-variant',
    bgColor: '#E0F2FE',
    iconColor: '#0284C7',
    screenType: 'dth',
  },
  {
    _id: '678575d63fde9ce75e7eb2a1',
    name: 'Electricity',
    icon: 'lightbulb-outline',
    bgColor: '#FFF3E0',
    iconColor: '#F59E0B',
    screenType: 'electricity',
  },
  {
    _id: '678575d63fde9ce75e7eb2aa',
    name: 'LPG Gas',
    icon: 'gas-cylinder',
    bgColor: '#FFE4E6',
    iconColor: '#E11D48',
    screenType: 'gas',
  },
  {
    _id: '678575d63fde9ce75e7eb2a2',
    name: 'Postpaid',
    icon: 'cellphone-wireless',
    bgColor: '#E0F7FA',
    iconColor: '#00ACC1',
    screenType: 'postpaid',
  },
  {
    _id: '678575d63fde9ce75e7eb2ae',
    name: 'Loan EMI',
    icon: 'bank',
    bgColor: '#EDE9FE',
    iconColor: '#7C3AED',
    screenType: 'emi',
  },
  {
    _id: '678575d63fde9ce75e7eb2a9',
    name: 'FASTag',
    icon: 'car-connected',
    bgColor: '#ECFDF5',
    iconColor: '#10B981',
    screenType: 'fastag',
  },
  {
    _id: 'more_services',
    name: 'More',
    icon: 'dots-horizontal',
    bgColor: '#F1F5F9',
    iconColor: '#64748B',
    screenType: 'more',
  },
];

const getServiceVisuals = (name = '') => {
  const lower = name.toLowerCase();
  if (lower === 'recharge' || lower.includes('mobile') || lower.includes('prepaid')) {
    return { icon: 'cellphone', bgColor: '#E8F5E9', iconColor: '#0F8A5F' };
  }
  if (lower.includes('dth')) {
    return { icon: 'satellite-variant', bgColor: '#E0F2FE', iconColor: '#0284C7' };
  }
  if (lower.includes('electr') || lower.includes('bijli')) {
    return { icon: 'lightbulb-outline', bgColor: '#FFF3E0', iconColor: '#F59E0B' };
  }
  if (lower.includes('gas') || lower.includes('cylinder') || lower.includes('lpg')) {
    return { icon: 'gas-cylinder', bgColor: '#FFE4E6', iconColor: '#E11D48' };
  }
  if (lower.includes('postpaid')) {
    return { icon: 'cellphone-wireless', bgColor: '#E0F7FA', iconColor: '#00ACC1' };
  }
  if (lower.includes('loan') || lower.includes('emi')) {
    return { icon: 'bank', bgColor: '#EDE9FE', iconColor: '#7C3AED' };
  }
  if (lower.includes('fastag') || lower.includes('toll')) {
    return { icon: 'car-connected', bgColor: '#ECFDF5', iconColor: '#10B981' };
  }
  if (lower.includes('water') || lower.includes('pani')) {
    return { icon: 'water', bgColor: '#E0F7FA', iconColor: '#00ACC1' };
  }
  if (lower.includes('broadband') || lower.includes('wifi') || lower.includes('internet')) {
    return { icon: 'wifi', bgColor: '#EDE9FE', iconColor: '#7C3AED' };
  }
  if (lower.includes('landline') || lower.includes('phone')) {
    return { icon: 'phone-classic', bgColor: '#F3E8FF', iconColor: '#9333EA' };
  }
  if (lower.includes('google') || lower.includes('play')) {
    return { icon: 'google-play', bgColor: '#ECFDF5', iconColor: '#10B981' };
  }
  if (lower.includes('cable') || lower.includes('tv')) {
    return { icon: 'television-classic', bgColor: '#EDE9FE', iconColor: '#7C3AED' };
  }
  if (lower.includes('insur')) {
    return { icon: 'shield-check-outline', bgColor: '#E8F5E9', iconColor: '#0F8A5F' };
  }
  if (lower.includes('card')) {
    return { icon: 'credit-card-outline', bgColor: '#FFF3E0', iconColor: '#F59E0B' };
  }
  return { icon: 'view-grid-plus', bgColor: '#F1F5F9', iconColor: '#64748B' };
};

const getFundStatusConfig = status => {
  switch ((status || '').toLowerCase()) {
    case 'approved':
      return {
        label: 'स्वीकृत • सक्रिय',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        color: '#0F8A5F',
        icon: 'check-decagram',
      };
    case 'rejected':
      return {
        label: 'अस्वीकृत (Rejected)',
        bg: '#FEF2F2',
        border: '#FECACA',
        color: '#DC2626',
        icon: 'close-circle',
      };
    case 'pending':
    default:
      return {
        label: 'समीक्षाधीन (Pending)',
        bg: '#FFF7ED',
        border: '#FED7AA',
        color: '#D97706',
        icon: 'clock-outline',
      };
  }
};

export default function Home() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const reduxUser = useSelector(state => state.user);

  const getUserDisplayName = u => {
    if (!u) return 'उपयोगकर्ता';
    const directName = u.name || u.userName || u.fullName;
    if (directName && typeof directName === 'string' && directName !== 'Rohit Sharma') return directName;
    const dataName = u.Data?.name || u.Data?.userName || u.Data?.fullName;
    if (dataName && typeof dataName === 'string') return dataName;
    const innerName = u.user?.name || u.user?.userName || u.user?.fullName;
    if (innerName && typeof innerName === 'string') return innerName;

    const fName = u.firstName || u.Data?.firstName || u.user?.firstName || '';
    const lName = u.lastName || u.Data?.lastName || u.user?.lastName || '';
    const combined = `${fName} ${lName}`.trim();
    if (combined) return combined;

    const phone = u.phone || u.mobile || u.Data?.phone || u.Data?.mobile || u.user?.phone || u.user?.mobile;
    if (phone) return `+91 ${phone}`;

    return 'उपयोगकर्ता';
  };

  const userName = getUserDisplayName(reduxUser);
  const userPhone =
    reduxUser?.phone ||
    reduxUser?.mobile ||
    reduxUser?.Data?.phone ||
    reduxUser?.Data?.mobile ||
    reduxUser?.user?.phone ||
    reduxUser?.user?.mobile ||
    '';
  const userRole = reduxUser?.role || reduxUser?.Data?.role || reduxUser?.user?.role || 'सदस्य';

  const [services, setServices] = useState(DEFAULT_BBPS_SERVICES);
  const [allServicesList, setAllServicesList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const {
    profile: fundProfile,
    loading: fundLoading,
    fetchProfile: fetchFundProfile,
  } = useFundAccount();

  const fetchWalletBalance = useCallback(async () => {
    try {
      setWalletLoading(true);
      const res = await getData('api/wallet/info');
      if (res?.Status || res?.success) {
        const data = res?.Data || res?.data;
        setWalletBalance(data?.balance ?? 0);
      }
    } catch (e) {
      console.log('Wallet fetch error:', e);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const fetchBBPServices = useCallback(async () => {
    try {
      const [servicesResult, affiliateResult] = await Promise.allSettled([
        getData('api/service/list?status=true'),
        getData('api/affiliate/list'),
      ]);

      const apiServices =
        servicesResult.status === 'fulfilled' && servicesResult.value?.Data
          ? servicesResult.value.Data
          : [];

      const affiliates =
        affiliateResult.status === 'fulfilled' && affiliateResult.value?.Data
          ? affiliateResult.value.Data
          : [];

      const combined = [...apiServices, ...affiliates];
      if (combined.length > 0) {
        setAllServicesList(combined);

        // Enrich the 8 curated home services with matching backend IDs and backend icons
        const enrichedServices = DEFAULT_BBPS_SERVICES.map(baseItem => {
          if (baseItem.screenType === 'more') return baseItem;

          const match = apiServices.find(apiItem => {
            const apiName = (apiItem.name || '').toLowerCase();
            const baseName = baseItem.name.toLowerCase();
            if (baseName === 'recharge' && (apiName.includes('recharge') || apiName.includes('mobile') || apiName.includes('prepaid'))) return true;
            if (baseName === 'dth' && apiName.includes('dth')) return true;
            if (baseName === 'electricity' && (apiName.includes('electr') || apiName.includes('bijli'))) return true;
            if (baseName === 'lpg' && (apiName.includes('gas') || apiName.includes('cylinder') || apiName.includes('lpg'))) return true;
            if (baseName === 'postpaid' && apiName.includes('postpaid')) return true;
            if (baseName === 'emi' && (apiName.includes('loan') || apiName.includes('emi'))) return true;
            if (baseName === 'fastag' && apiName.includes('fastag')) return true;
            return false;
          });

          return {
            ...baseItem,
            _id: match?._id || baseItem._id,
            icon: match?.icon || baseItem.icon,
          };
        });

        setServices(enrichedServices);
      }
    } catch (error) {
      console.log('Error fetching BBPS services on Home:', error);
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await getData('/api/user/profile');
      if (res?.Status === true && res?.Data) {
        dispatch(setUser(res.Data));
      }
    } catch (e) {
      console.log('User profile fetch error on Home:', e);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchBBPServices();
      fetchWalletBalance();
      fetchFundProfile();
    }, [fetchUserProfile, fetchBBPServices, fetchWalletBalance, fetchFundProfile])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      fetchUserProfile(),
      fetchBBPServices(),
      fetchWalletBalance(),
      fetchFundProfile(),
    ]);
    setRefreshing(false);
  };

  const handleServiceClick = item => {
    const itemName = item?.name || '';
    const lowerName = itemName.toLowerCase();

    // 1. More Services -> Open All BBPS Catalog
    if (item.screenType === 'more' || lowerName === 'more' || lowerName.includes('more')) {
      navigation.navigate('BillPayments', {
        service: allServicesList.length > 0 ? allServicesList : undefined,
      });
      return;
    }

    // 2. Mobile Top Up / Recharge
    if (
      item.screenType === 'recharge' ||
      lowerName === 'recharge' ||
      lowerName.includes('mobile') ||
      lowerName.includes('prepaid') ||
      (lowerName.includes('recharge') && !lowerName.includes('dth'))
    ) {
      navigation.navigate('Recharge', { ServiceId: item?._id || '678575d63fde9ce75e7eb2a0' });
      return;
    }

    // 3. DTH Recharge
    if (lowerName.includes('dth')) {
      navigation.navigate('DTHRechargeScreen', { ServiceId: item?._id || '678575d63fde9ce75e7eb2a3', name: itemName });
      return;
    }

    // 4. FASTag (Open Provider selection first so user selects their bank)
    if (lowerName.includes('fastag') || lowerName.includes('toll')) {
      navigation.navigate('Provider', {
        ServiceId: item?._id || '678575d63fde9ce75e7eb2a9',
        name: 'FASTag',
      });
      return;
    }

    // 5. Google Play
    if (lowerName.includes('google play') || lowerName.includes('googleplay')) {
      navigation.navigate('GooglePlayPayment', { ServiceId: item?._id || '678575d63fde9ce75e7eb2a6' });
      return;
    }

    // 6. Electricity, LPG, Postpaid, EMI, Water, Broadband, etc. -> Provider Selection
    let targetServiceId = item?._id;
    if (!targetServiceId || targetServiceId.startsWith('default_')) {
      if (lowerName.includes('electr') || lowerName.includes('bijli')) targetServiceId = '678575d63fde9ce75e7eb2a1';
      else if (lowerName.includes('postpaid')) targetServiceId = '678575d63fde9ce75e7eb2a2';
      else if (lowerName.includes('lpg') || lowerName.includes('cylinder') || lowerName.includes('gas')) targetServiceId = '678575d63fde9ce75e7eb2aa';
      else if (lowerName.includes('water')) targetServiceId = '678575d63fde9ce75e7eb2a5';
      else if (lowerName.includes('broadband')) targetServiceId = '678575d63fde9ce75e7eb2a7';
      else if (lowerName.includes('landline')) targetServiceId = '678575d63fde9ce75e7eb2a8';
      else if (lowerName.includes('loan') || lowerName.includes('emi')) targetServiceId = '678575d63fde9ce75e7eb2ae';
      else if (lowerName.includes('insur')) targetServiceId = '678575d63fde9ce75e7eb2ad';
      else if (lowerName.includes('card')) targetServiceId = '678575d63fde9ce75e7eb2ac';
    }

    navigation.navigate('Provider', {
      ServiceId: targetServiceId,
      name: itemName,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.headerBar}>
        <SarvanaHeaderLogo size={36} subtitle="ALL IN ONE" />

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Notification')}
            activeOpacity={0.7}
          >
            <FeatherIcon name="bell" size={22} color="#1E293B" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              }}
              style={styles.avatarImg}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── User Overview & Account Status Banner ── */}
      <View style={styles.userStatusBar}>
        <View style={styles.userStatusLeft}>
          <Text style={styles.userGreetingText}>
            नमस्ते, <Text style={styles.userNameHighlight}>{userName}</Text>
          </Text>
          <Text style={styles.userAccountMeta}>
            {userPhone ? `मोबाइल: +91 ${userPhone}` : 'खाता: सक्रिय'} • {userRole}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.statusBadge}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.statusDot} />
          <Text style={styles.statusBadgeText}>स्थिति: सक्रिय</Text>
        </TouchableOpacity>
      </View>

      {/* ── Wallet Balance & Account Details Card ── */}
      {(() => {
        const bal = walletBalance ?? 0;
        const isLow = bal < 500;
        const formatted = Number(bal).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return (
          <View style={styles.walletCard}>
            {/* Left: balance info */}
            <View style={styles.walletLeft}>
              <View style={styles.walletIconCircle}>
                <MaterialIcon name="wallet-outline" size={20} color="#D81B60" />
              </View>
              <View>
                <View style={styles.walletHeaderRow}>
                  <Text style={styles.walletLabel}>My Wallet</Text>
                  <Text style={styles.walletAccountTag}>
                    {userPhone ? `+91 ${userPhone}` : userName}
                  </Text>
                </View>
                {walletLoading ? (
                  <ActivityIndicator size="small" color="#D81B60" style={styles.walletLoadingIndicator} />
                ) : (
                  <Text style={[styles.walletAmount, isLow && styles.walletAmountLow]}>
                    ₹ {formatted}
                  </Text>
                )}
                <View style={styles.walletStatusRow}>
                  <MaterialIcon name="check-circle" size={10} color="#0F8A5F" />
                  <Text style={styles.walletStatusText}>स्थिति: भुगतान सक्रिय • सुरक्षित SARVANA वॉलेट</Text>
                </View>
              </View>
            </View>

            {/* Right: quick actions */}
            <View style={styles.walletActions}>
              <TouchableOpacity
                style={styles.walletActionBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('WalletTopupScreen')}
              >
                <MaterialIcon name="plus-circle-outline" size={14} color="#FFFFFF" />
                <Text style={styles.walletActionText}>Add Money</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                style={[styles.walletActionBtn, styles.walletActionBtnOutline]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Wallet')}
              >
                <MaterialIcon name="history" size={14} color="#D81B60" />
                <Text style={[styles.walletActionText, styles.walletActionTextOutline]}>History</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        );
      })()}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D81B60']}
            tintColor="#D81B60"
          />
        }
      >
        {/* ── Scheme Fund Account Details Section ── */}
        {fundLoading && !fundProfile ? (
          <View style={styles.schemeLoadingCard}>
            <ActivityIndicator size="small" color="#D81B60" />
            <Text style={styles.schemeLoadingText}>योजना फंड खाता लोड हो रहा है...</Text>
          </View>
        ) : fundProfile ? (
          <View style={styles.schemeFundCard}>
            {/* Header: Scheme Brand & Status Badge */}
            <View style={styles.schemeFundHeader}>
              <TouchableOpacity
                style={styles.schemeFundHeaderLeft}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('SchemeDetails', { schemeId: 'vivah' })}
              >
                <Image
                  source={require('../Assets/vivah_sahayog_logo.png')}
                  style={styles.schemeFundLogo}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.schemeFundTag}>SARVANA YOJNA</Text>
                  <Text style={styles.schemeFundTitle}>विवाह सहयोग फंड खाता</Text>
                </View>
              </TouchableOpacity>

              {(() => {
                const statusCfg = getFundStatusConfig(
                  fundProfile.approvalStatus || fundProfile.status
                );
                return (
                  <View
                    style={[
                      styles.schemeStatusBadge,
                      { backgroundColor: statusCfg.bg, borderColor: statusCfg.border },
                    ]}
                  >
                    <MaterialIcon name={statusCfg.icon} size={12} color={statusCfg.color} />
                    <Text style={[styles.schemeStatusText, { color: statusCfg.color }]}>
                      {statusCfg.label}
                    </Text>
                  </View>
                );
              })()}
            </View>

            {/* Beneficiary Details Row */}
            <TouchableOpacity
              style={styles.schemeBeneficiaryBox}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('FundAccountProfile')}
            >
              {(() => {
                const photoPath =
                  fundProfile.documents?.balikaPhoto || fundProfile.balikaPhoto;
                const photoUri = photoPath ? getDocumentUrl(photoPath) : null;
                return photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.schemeAvatar} />
                ) : (
                  <View style={styles.schemeAvatarFallback}>
                    <FontAwesome5 name="female" size={24} color="#D81B60" />
                  </View>
                );
              })()}

              <View style={styles.schemeBeneficiaryDetails}>
                <View style={styles.schemeBeneficiaryNameRow}>
                  <Text style={styles.schemeBeneficiaryName} numberOfLines={1}>
                    {fundProfile.balikaName || 'बालिका लाभार्थी'}
                  </Text>
                  {fundProfile.fundAccountId ? (
                    <View style={styles.schemeAccountIdPill}>
                      <Text style={styles.schemeAccountIdText}>
                        VSA-{String(fundProfile.fundAccountId).slice(-6).toUpperCase()}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.schemeBeneficiaryMeta}>
                  आयु: {fundProfile.currentAge || '—'}
                  {fundProfile.dob ? ` • जन्म: ${fundProfile.dob}` : ''}
                </Text>

                <View style={styles.schemeLocationRow}>
                  <MaterialIcon name="map-marker-outline" size={13} color="#64748B" />
                  <Text style={styles.schemeLocationText} numberOfLines={1}>
                    {[fundProfile.district, fundProfile.state].filter(Boolean).join(', ') || 'भारत'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Scheme Account Metrics Strip */}
            <View style={styles.schemeMetricsStrip}>
              <View style={styles.schemeMetricCol}>
                <Text style={styles.schemeMetricLabel}>दस्तावेज़ स्थिति</Text>
                <View style={styles.schemeMetricValueRow}>
                  <MaterialIcon name="file-check-outline" size={14} color="#0F8A5F" />
                  <Text style={styles.schemeMetricValue}>
                    {Object.values(fundProfile.documents || {}).filter(Boolean).length || 3} संलग्न
                  </Text>
                </View>
              </View>

              <View style={styles.schemeMetricDivider} />

              <View style={styles.schemeMetricCol}>
                <Text style={styles.schemeMetricLabel}>योजना फंड शेष</Text>
                <Text
                  style={[
                    styles.schemeMetricValue,
                    fundProfile.fundWallet?.balance !== undefined && styles.schemeMetricValueActive,
                  ]}
                  numberOfLines={1}
                >
                  {fundProfile.fundWallet?.balance !== undefined &&
                  fundProfile.fundWallet?.balance !== null
                    ? `₹ ${Number(fundProfile.fundWallet.balance).toLocaleString('en-IN')}`
                    : 'सत्यापन प्रक्रियाधीन'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.schemeActionsRow}>
              <TouchableOpacity
                style={styles.schemeActionBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('FundAccountProfile')}
              >
                <MaterialIcon name="file-document-outline" size={15} color="#D81B60" />
                <Text style={styles.schemeActionText}>प्रोफ़ाइल व दस्तावेज़</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.schemeActionBtn, styles.schemeActionBtnPrimary]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('SahayogAccount')}
              >
                <MaterialIcon name="book-account-outline" size={15} color="#FFFFFF" />
                <Text style={styles.schemeActionTextPrimary}>सहयोग पासबुक</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* When no fund profile: Show Hero banner inviting to apply */
          <View style={styles.heroBannerCard}>
            <View style={styles.heroImageCol}>
              <Image
                source={require('../Assets/vivah_sahayog_logo.png')}
                style={styles.heroBabyImg}
              />
            </View>
            <View style={styles.heroContentCol}>
              <Text style={styles.heroTagline}>बेटी का भविष्य,{"\n"}हमारा संकल्प</Text>
              <Text style={styles.heroTitle}>SARVANA</Text>
              <Text style={styles.heroSubtitle}>VIVAH SAHYOG YOJNA</Text>

              <TouchableOpacity
                style={styles.heroCtaBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('VivahSahayogEntry')}
              >
                <Text style={styles.heroCtaText}>खाता खोलें →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Services Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Quick Services</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('BillPayments', {
                  service: allServicesList.length > 0 ? allServicesList : undefined,
                })
              }
            >
              <Text style={styles.seeAllText}>View All &gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.servicesGrid}>
            {services.map((item, index) => {
              const visuals = getServiceVisuals(item.name);
              const iconSource = item?.icon || visuals.icon;
              const isImage =
                iconSource &&
                typeof iconSource === 'string' &&
                (iconSource.startsWith('http') ||
                  iconSource.startsWith('uploads/') ||
                  iconSource.includes('/') ||
                  iconSource.endsWith('.png') ||
                  iconSource.endsWith('.jpg') ||
                  iconSource.endsWith('.jpeg') ||
                  iconSource.endsWith('.webp'));

              return (
                <TouchableOpacity
                  key={item._id ? `${item._id}-${index}` : String(index)}
                  style={styles.serviceItem}
                  activeOpacity={0.7}
                  onPress={() => handleServiceClick(item)}
                >
                  <View
                    style={[
                      styles.serviceIconCircle,
                      { backgroundColor: item.bgColor || visuals.bgColor },
                    ]}
                  >
                    {isImage ? (
                      <Image
                        source={{
                          uri: iconSource.startsWith('http')
                            ? iconSource
                            : `${API_BASE_URL}/${iconSource.replace(/^\/+/, '')}`,
                        }}
                        style={styles.serviceImgIcon}
                      />
                    ) : (
                      <MaterialIcon
                        name={iconSource}
                        size={25}
                        color={item.iconColor || visuals.iconColor}
                      />
                    )}
                  </View>
                  <Text style={styles.serviceItemTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sarvana Sahayog Promotion Card */}
        <TouchableOpacity
          style={styles.sahayogCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SahayogHome')}
        >
          <View style={styles.sahayogHeartIconCircle}>
            <FontAwesome5 name="heart" size={24} color="#D81B60" />
          </View>
          <View style={styles.sahayogTextCol}>
            <Text style={styles.sahayogCardBadge}>SARVANA SAHAYOG</Text>
            <Text style={styles.sahayogCardHeading}>
              आज एक छोटी मदद,{"\n"}कल किसी बेटी की बड़ी खुशियाँ
            </Text>
            <View style={styles.sahayogActionPill}>
              <Text style={styles.sahayogActionPillText}>सहयोग करें →</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bottom spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 5-Item Bottom Navigation Bar */}
      <NavBar navigation={navigation} data={reduxUser} activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D81B60',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  /* User status bar */
  userStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userStatusLeft: {
    flex: 1,
  },
  userGreetingText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  userNameHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  userAccountMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F8A5F',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F8A5F',
  },

  /* Wallet card */
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0F5',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    elevation: 2,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  walletLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  walletAccountTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D81B60',
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  walletAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  walletStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  walletStatusText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#0F8A5F',
  },
  walletAmountLow: {
    color: '#D97706',
  },
  walletLowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  walletLowText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
  },
  walletActions: {
    flexDirection: 'row',
    gap: 8,
  },
  walletActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D81B60',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },
  walletActionBtnOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#D81B60',
  },
  walletActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  heroBannerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    elevation: 2,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 20,
  },
  heroImageCol: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 14,
  },
  heroBabyImg: {
    width: '100%',
    height: '100%',
  },
  heroContentCol: {
    flex: 1,
  },
  heroTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D81B60',
    lineHeight: 18,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0A2568',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F8A5F',
    letterSpacing: 0.8,
  },
  heroCtaBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#D81B60',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 6,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D81B60',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  serviceItem: {
    width: (width - 64) / 4,
    alignItems: 'center',
  },
  serviceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  serviceImgIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  serviceItemTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
  },
  sahayogCard: {
    flexDirection: 'row',
    backgroundColor: '#D81B60',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    marginBottom: 16,
  },
  sahayogHeartIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sahayogTextCol: {
    flex: 1,
  },
  sahayogCardBadge: {
    color: '#FCE7F3',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sahayogCardHeading: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 19,
  },
  sahayogActionPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  sahayogActionPillText: {
    color: '#D81B60',
    fontSize: 11.5,
    fontWeight: '700',
  },
  /* ── Scheme Fund Account Card Styles ── */
  schemeLoadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    gap: 10,
  },
  schemeLoadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  schemeFundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginTop: 0,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  schemeFundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  schemeFundHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  schemeFundLogo: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 8,
  },
  schemeFundTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D81B60',
    letterSpacing: 0.8,
  },
  schemeFundTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 1,
  },
  schemeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  schemeStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  schemeBeneficiaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  schemeAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FCE7F3',
  },
  schemeAvatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FDF2F8',
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schemeBeneficiaryDetails: {
    flex: 1,
    marginLeft: 12,
  },
  schemeBeneficiaryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  schemeBeneficiaryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  schemeAccountIdPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  schemeAccountIdText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  schemeBeneficiaryMeta: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  schemeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 3,
  },
  schemeLocationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  schemeMetricsStrip: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  schemeMetricCol: {
    flex: 1,
  },
  schemeMetricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  schemeMetricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  schemeMetricValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  schemeMetricDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  schemeActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  schemeActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#D81B60',
    backgroundColor: '#FFFFFF',
    gap: 5,
  },
  schemeActionBtnPrimary: {
    backgroundColor: '#D81B60',
    borderColor: '#D81B60',
  },
  schemeActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D81B60',
  },
  schemeActionTextPrimary: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  schemeMetricValueActive: {
    color: '#0F8A5F',
  },
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletLoadingIndicator: {
    marginTop: 2,
  },
  walletActionTextOutline: {
    color: '#D81B60',
  },
  bottomSpacer: {
    height: 90,
  },
});
