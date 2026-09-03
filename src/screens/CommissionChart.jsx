import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData, API_BASE_URL } from '../API';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const CommissionChart = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getData('api/commission/list');
        if (res?.Status || res?.success) {
          setData(res?.data || {});
        }
      } catch (error) {
        console.error('Commission Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderCard = (name, valueObj) => {
    const commission = valueObj?.commission || 0;
    const icon = valueObj?.icon;
    const symbol = valueObj?.symbol || '%';

    let imageUrl = icon;
    if (icon && !icon.startsWith('http')) {
      imageUrl = `${API_BASE_URL}/${icon}`;
    }

    return (
      <View style={styles.cardWrapper} key={name}>
        <View style={styles.card}>
          <View style={styles.operatorLeft}>
            <View style={styles.logoContainer}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.logo} />
              ) : (
                <Icon name="cell-tower" size={24} color="#0D52ED" />
              )}
            </View>
            <View>
              <Text style={styles.operatorName}>{name}</Text>
              <Text style={styles.operatorCategory}>Instant Settlement</Text>
            </View>
          </View>

          <View style={styles.commissionPill}>
            <Icon name="trending-up" size={14} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.commissionText}>
              {commission} {symbol}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const hasMobile = data?.mobile && Object.keys(data.mobile).length > 0;
  const hasDth = data?.dth && Object.keys(data.dth).length > 0;
  const hasBbps = data?.bbps && Object.keys(data.bbps).length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Commission Rates</Text>
          <Text style={styles.headerSubtitle}>Real-time margin & cashback chart</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {[
          { key: 'all', label: 'All' },
          { key: 'mobile', label: 'Prepaid' },
          { key: 'dth', label: 'DTH' },
          { key: 'bbps', label: 'BBPS Bills' },
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.75}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary || '#0D52ED'} />
          <Text style={styles.loaderText}>Fetching live operator rates...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollBody}
        >
          {/* Prepaid Section */}
          {hasMobile && (activeTab === 'all' || activeTab === 'mobile') && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeadingRow}>
                <View style={[styles.headingBar, { backgroundColor: '#0D52ED' }]} />
                <Text style={styles.sectionTitle}>Mobile Prepaid Rates</Text>
              </View>
              {Object.entries(data.mobile).map(([name, value]) =>
                renderCard(name, value),
              )}
            </View>
          )}

          {/* DTH Section */}
          {hasDth && (activeTab === 'all' || activeTab === 'dth') && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeadingRow}>
                <View style={[styles.headingBar, { backgroundColor: '#10B981' }]} />
                <Text style={styles.sectionTitle}>DTH Operator Rates</Text>
              </View>
              {Object.entries(data.dth).map(([name, value]) =>
                renderCard(name, value),
              )}
            </View>
          )}

          {/* BBPS Section */}
          {hasBbps && (activeTab === 'all' || activeTab === 'bbps') && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeadingRow}>
                <View style={[styles.headingBar, { backgroundColor: '#FF7A00' }]} />
                <Text style={styles.sectionTitle}>BBPS Utility Rates</Text>
              </View>
              {Object.entries(data.bbps).map(([name, value]) =>
                renderCard(name, value),
              )}
            </View>
          )}

          {!hasMobile && !hasDth && !hasBbps && (
            <View style={styles.emptyContainer}>
              <Icon name="info-outline" size={48} color="#94A3B8" />
              <Text style={styles.noData}>No commission data available currently.</Text>
            </View>
          )}

          <View style={{ marginTop: 'auto', paddingTop: 24, marginHorizontal: -16 }}>
            <Footer />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CommissionChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: '#D9E7FF',
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '500',
  },

  /* TAB BAR */
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary || '#0D52ED',
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  /* LOADER */
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#64748B',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },

  /* BODY */
  scrollBody: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
  },
  sectionBlock: {
    marginTop: 12,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  headingBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#091838',
    letterSpacing: 0.2,
  },

  /* CARDS */
  cardWrapper: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  operatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  logo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  operatorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#091838',
  },
  operatorCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  commissionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  commissionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noData: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});
