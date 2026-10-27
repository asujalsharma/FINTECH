import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSingleFundScheme } from '../services/fundSchemeService';

const VIVAH_LOGO = require('../Assets/vivah_sahayog_logo.png');
const TABS = ['योजना', 'पात्रता', 'दस्तावेज', 'FAQ'];

/**
 * Maps backend icon string to MaterialCommunityIcons name safely.
 */
const mapRuleIcon = iconName => {
  if (!iconName) return 'check-circle';
  const clean = String(iconName).toLowerCase().replace(/_/g, '-');
  const iconMap = {
    'calendar-month': 'calendar-month',
    'calendar-clock': 'calendar-clock',
    'description': 'file-document-outline',
    'history': 'history',
    'verified-user': 'shield-check-outline',
    'account-balance-wallet': 'wallet-outline',
    'account-balance': 'bank',
    'favorite': 'heart',
    'verified': 'check-decagram',
    'lock-clock': 'lock-clock',
    'info': 'information-outline',
    'security': 'shield-outline',
    'school': 'school-outline',
    'medical-services': 'hospital-box-outline',
  };
  return iconMap[clean] || clean || 'check-circle';
};

export default function SchemeDetails() {
  const navigation = useNavigation();
  const route = useRoute();

  const passedScheme = route.params?.scheme || null;
  const initialCode =
    route.params?.schemeCode ||
    route.params?.schemeId ||
    passedScheme?.code ||
    'VIVAH_SAHAYOG';

  const [scheme, setScheme] = useState(passedScheme);
  const [loading, setLoading] = useState(!passedScheme || !passedScheme.paymentRules);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('योजना');
  const isFetchingRef = useRef(false);

  const loadDetails = useCallback(async (isRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isRefresh) setRefreshing(true);
    setError(null);

    try {
      const data = await fetchSingleFundScheme(initialCode);
      if (data) {
        setScheme(data);
      } else {
        setScheme(prev => {
          if (!prev) setError('योजना का विवरण लोड करने में असमर्थ।');
          return prev;
        });
      }
    } catch (err) {
      console.log('Error fetching scheme details:', err);
      setScheme(prev => {
        if (!prev) setError('योजना का विवरण प्राप्त नहीं किया जा सका।');
        return prev;
      });
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [initialCode]);

  useEffect(() => {
    loadDetails(false);
  }, [loadDetails]);

  const handleApply = () => {
    navigation.navigate('SchemeRegistrationEntry', {
      schemeCode: scheme?.code || initialCode,
      scheme,
    });
  };

  const themeColor = scheme?.themeColor || '#D81B60';
  const displayTitle = scheme?.name || scheme?.nameEn || route.params?.schemeTitle || 'सहयोग योजना';
  const superTitle = scheme?.nameEn?.toUpperCase() || scheme?.code?.replace(/_/g, ' ') || 'SARVANA SAHAYOG';
  const tagline = scheme?.tagline || scheme?.description || 'सामाजिक सहयोग व कल्याणकारी योजना';

  const schemeCodeUpper = (scheme?.code || initialCode || '').toUpperCase();
  const isVivahScheme = schemeCodeUpper === 'VIVAH_SAHAYOG' || schemeCodeUpper.includes('VIVAH') || schemeCodeUpper.startsWith('VSA');

  // Normalized payment rules ensuring updated Hindi & English Fund Withdrawal rules
  const paymentRulesList = useMemo(() => {
    const withdrawalRuleItem = {
      title: 'फंड निकासी नियम (Fund Withdrawal Rule)',
      icon: 'account-balance-wallet',
      rule: isVivahScheme
        ? 'फंड राशि निकासी नियम: आवेदक/बालिका की आयु 20 वर्ष से अधिक होने पर ही खाते में लॉक-इन राशि (Lock-in Amount) बनाए रखते हुए फंड खाते से राशि निकाली जा सकेगी।'
        : 'फंड राशि निकासी नियम: खाते में लॉक-इन राशि (Lock-in Amount) बनाए रखते हुए शेष राशि निकाली जा सकेगी।',
      ruleEn: isVivahScheme
        ? 'Fund withdrawal rule: Fund amount above the lock-in amount can only be withdrawn once the applicant/girl child reaches over 20 years of age.'
        : 'Fund withdrawal rule: Any amount above the required lock-in amount can be withdrawn.',
      isWithdrawalRule: true,
    };

    let list = Array.isArray(scheme?.paymentRules) && scheme.paymentRules.length > 0
      ? scheme.paymentRules.map(r => ({
          ...r,
          title: String(r.title || '')
            .replace(/न्यूनतम\s*₹?\s*(\d+)?\s*(शेष\s*राशि|शेष|राशि|बैलेंस)?/gi, (m, n) => n ? `₹${n} लॉक-इन राशि` : 'लॉक-इन राशि')
            .replace(/न्यूनतम/g, 'लॉक-इन')
            .replace(/minimum\s*(balance|amount)?/gi, 'lock-in amount')
            .replace(/minimum/gi, 'lock-in'),
          rule: String(r.rule || '')
            .replace(/न्यूनतम\s*₹?\s*(\d+)?\s*(शेष\s*राशि|शेष|राशि|बैलेंस)?/gi, (m, n) => n ? `₹${n} लॉक-इन राशि` : 'लॉक-इन राशि')
            .replace(/न्यूनतम/g, 'लॉक-इन')
            .replace(/minimum\s*(balance|amount)?/gi, 'lock-in amount')
            .replace(/minimum/gi, 'lock-in'),
          ruleEn: String(r.ruleEn || '')
            .replace(/minimum\s*(balance|amount)?/gi, 'lock-in amount')
            .replace(/minimum/gi, 'lock-in'),
        }))
      : [
          {
            title: 'खाता लॉक-इन राशि (Lock-in Amount)',
            icon: 'lock-clock',
            rule: 'खाते में लॉक-इन राशि ₹500 (Lock-in Amount) बनाए रखना अनिवार्य है ताकि खाता सक्रिय बना रहे।',
            ruleEn: 'Mandatory lock-in amount of ₹500 must be maintained to keep the fund account active.',
          },
          {
            title: 'मासिक कल्याणकारी अनुदान',
            icon: 'calendar-month',
            rule: 'सहयोगियों द्वारा प्राप्त दान व अनुदान सीधे आपके फंड खाते के वॉलेट में जमा होता है।',
            ruleEn: 'Welfare grants and donations are credited directly to your fund wallet.',
          },
        ];

    // Find any existing withdrawal rule in the list
    const existingIndex = list.findIndex((r) => {
      const text = typeof r === 'string' ? r : `${r.title || ''} ${r.rule || ''} ${r.ruleEn || ''}`;
      return text.includes('निकासी') || text.toLowerCase().includes('withdraw');
    });

    if (existingIndex !== -1) {
      list[existingIndex] = {
        ...(typeof list[existingIndex] === 'object' ? list[existingIndex] : {}),
        ...withdrawalRuleItem,
      };
    } else {
      list.push(withdrawalRuleItem);
    }

    return list;
  }, [scheme?.paymentRules, isVivahScheme]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayTitle}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {loading && !scheme ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeColor} />
          <Text style={styles.loadingText}>योजना का विवरण लोड हो रहा है...</Text>
        </View>
      ) : error && !scheme ? (
        <View style={styles.centerContainer}>
          <MaterialIcon name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: themeColor }]}
            onPress={() => loadDetails(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.retryBtnText}>पुनः प्रयास करें</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadDetails(true)}
                colors={[themeColor]}
                tintColor={themeColor}
              />
            }
          >
            {/* Hero Banner */}
            <View
              style={[
                styles.heroBanner,
                { backgroundColor: themeColor + '12', borderColor: themeColor + '28' },
              ]}
            >
              {scheme?.code === 'VIVAH_SAHAYOG' || (!scheme?.badgeSymbol && !scheme?.image) ? (
                <Image
                  source={scheme?.image ? { uri: scheme.image } : VIVAH_LOGO}
                  style={styles.heroAvatar}
                />
              ) : scheme?.image ? (
                <Image source={{ uri: scheme.image }} style={styles.heroAvatar} />
              ) : (
                <View
                  style={[
                    styles.heroBadgeBox,
                    { backgroundColor: themeColor + '20', borderColor: themeColor + '40' },
                  ]}
                >
                  <Text style={styles.heroBadgeSymbol}>
                    {scheme?.badgeSymbol || '🤝'}
                  </Text>
                </View>
              )}

              <View style={styles.quoteTextContainer}>
                <Text style={styles.headerTitlere}>{superTitle}</Text>
                <Text style={[styles.quoteText, { color: themeColor }]}>
                  {tagline}
                </Text>
                {scheme?.category && (
                  <View style={[styles.categoryPill, { backgroundColor: themeColor + '18' }]}>
                    <Text style={[styles.categoryPillText, { color: themeColor }]}>
                      {scheme.category}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 4 Tabs */}
            <View style={styles.tabsContainer}>
              {TABS.map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabItem,
                    activeTab === tab && [styles.activeTabItem, { borderBottomColor: themeColor }],
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === tab && [styles.activeTabLabel, { color: themeColor }],
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ─── Tab 1: योजना ─── */}
            {activeTab === 'योजना' && (
              <View style={styles.tabContentSection}>
                {/* About Scheme */}
                {(scheme?.about || scheme?.aboutEn || scheme?.description) && (
                  <View style={styles.infoBlock}>
                    <Text style={styles.sectionHeading}>योजना के बारे में</Text>
                    <Text style={styles.descriptionText}>
                      {scheme.about || scheme.aboutEn || scheme.description}
                    </Text>
                  </View>
                )}

                {/* Payment & Amount Rules */}
                <View style={styles.infoBlock}>
                  <Text style={styles.sectionHeading}>भुगतान एवं राशि संबंधी नियम</Text>
                  {paymentRulesList.map((ruleItem, index) => {
                    const isWithdrawal = ruleItem.isWithdrawalRule ||
                      String(ruleItem.title || '').includes('निकासी') ||
                      String(ruleItem.rule || '').includes('निकासी') ||
                      String(ruleItem.ruleEn || '').toLowerCase().includes('withdrawal');

                    return (
                      <View
                        key={index}
                        style={[
                          styles.checkListItem,
                          isWithdrawal && {
                            backgroundColor: isVivahScheme ? '#FFF1F2' : '#F0FDF4',
                            borderColor: isVivahScheme ? '#FECDD3' : '#BBF7D0',
                            borderWidth: 1.5,
                            borderRadius: 12,
                            padding: 12,
                            marginTop: 8,
                            marginBottom: 4,
                          },
                        ]}
                      >
                        <MaterialIcon
                          name={mapRuleIcon(ruleItem.icon)}
                          size={22}
                          color={isWithdrawal ? (isVivahScheme ? '#E11D48' : '#0F8A5F') : '#0F8A5F'}
                          style={{ marginTop: 2 }}
                        />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          {ruleItem.title ? (
                            <Text style={[styles.ruleTitleText, isWithdrawal && { color: isVivahScheme ? '#9F1239' : '#14532D', fontWeight: '800', fontSize: 13.5 }]}>
                              {ruleItem.title}
                            </Text>
                          ) : null}
                          <Text style={[styles.checkListText, isWithdrawal && { color: '#0F172A', fontWeight: '600', lineHeight: 18 }]}>
                            {ruleItem.rule || (typeof ruleItem === 'string' ? ruleItem : '')}
                          </Text>
                          {Boolean(ruleItem.ruleEn && ruleItem.ruleEn !== ruleItem.rule) && (
                            <Text style={{ fontSize: 11.5, color: isWithdrawal ? (isVivahScheme ? '#9F1239' : '#15803D') : '#64748B', fontStyle: 'italic', marginTop: 4, lineHeight: 16 }}>
                              {ruleItem.ruleEn}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Disclaimer Card */}
                {(scheme?.disclaimer || scheme?.disclaimerEn) && (
                  <View style={styles.disclaimerCard}>
                    <Text style={styles.disclaimerText}>
                      {scheme.disclaimer || scheme.disclaimerEn}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* ─── Tab 2: पात्रता ─── */}
            {activeTab === 'पात्रता' && (
              <View style={styles.tabContentSection}>
                <View style={styles.infoBlock}>
                  <Text style={styles.sectionHeading}>पात्रता के नियम</Text>
                  {Array.isArray(scheme?.eligibilityRules) && scheme.eligibilityRules.length > 0 ? (
                    scheme.eligibilityRules.map((ruleText, index) => (
                      <View key={index} style={styles.checkListItem}>
                        <MaterialIcon name="check-circle" size={20} color="#0F8A5F" style={{ marginTop: 2 }} />
                        <Text style={styles.checkListText}>{ruleText}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>पात्रता नियम जल्द उपलब्ध होंगे।</Text>
                  )}
                </View>
              </View>
            )}

            {/* ─── Tab 3: दस्तावेज एवं खाता प्रक्रिया ─── */}
            {activeTab === 'दस्तावेज' && (
              <View style={styles.tabContentSection}>
                {/* Required Documents */}
                <View style={styles.infoBlock}>
                  <Text style={styles.sectionHeading}>आवश्यक दस्तावेज</Text>
                  {Array.isArray(scheme?.requiredDocumentsList) && scheme.requiredDocumentsList.length > 0 ? (
                    scheme.requiredDocumentsList.map((docText, index) => (
                      <View key={index} style={styles.checkListItem}>
                        <MaterialIcon name="file-document-outline" size={20} color={themeColor} style={{ marginTop: 2 }} />
                        <Text style={styles.checkListText}>{docText}</Text>
                      </View>
                    ))
                  ) : Array.isArray(scheme?.requiredDocuments) && scheme.requiredDocuments.length > 0 ? (
                    scheme.requiredDocuments.map((docObj, index) => (
                      <View key={index} style={styles.checkListItem}>
                        <MaterialIcon name="file-document-outline" size={20} color={themeColor} style={{ marginTop: 2 }} />
                        <Text style={styles.checkListText}>{docObj.label || docObj.key}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>दस्तावेज़ सूची उपलब्ध नहीं है।</Text>
                  )}
                </View>

                {/* Process Steps */}
                {Array.isArray(scheme?.processSteps) && scheme.processSteps.length > 0 && (
                  <View style={styles.infoBlock}>
                    <Text style={styles.sectionHeading}>दस्तावेज़ एवं खाता प्रक्रिया</Text>
                    {scheme.processSteps.map((stepItem, index) => {
                      const stepNum = stepItem.step || index + 1;
                      const iconName =
                        stepNum >= 1 && stepNum <= 9
                          ? `numeric-${stepNum}-circle`
                          : 'circle-slice-8';
                      return (
                        <View key={index} style={styles.checkListItem}>
                          <MaterialIcon name={iconName} size={20} color="#0F8A5F" style={{ marginTop: 2 }} />
                          <View style={{ flex: 1 }}>
                            {stepItem.title ? (
                              <Text style={styles.stepTitleText}>{stepItem.title}</Text>
                            ) : null}
                            <Text style={styles.checkListText}>
                              {stepItem.text || stepItem.description}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* ─── Tab 4: सामान्य प्रश्न / FAQ ─── */}
            {activeTab === 'FAQ' && (
              <View style={styles.tabContentSection}>
                <View style={styles.infoBlock}>
                  <Text style={styles.sectionHeading}>सामान्य प्रश्न / FAQ</Text>
                  {Array.isArray(scheme?.faqs) && scheme.faqs.length > 0 ? (
                    scheme.faqs.map((faqItem, index) => (
                      <View key={index} style={styles.faqCard}>
                        <Text style={styles.faqQuestion}>
                          Q. {faqItem.question}
                        </Text>
                        <Text style={styles.faqAnswer}>
                          A. {faqItem.answer}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>सामान्य प्रश्न जल्द उपलब्ध होंगे।</Text>
                  )}
                </View>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Fixed Bottom Apply Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[
                styles.applyBtn,
                { backgroundColor: themeColor, shadowColor: themeColor },
              ]}
              activeOpacity={0.85}
              onPress={handleApply}
            >
              <Text style={styles.applyBtnText}>
                {scheme?.registrationFee
                  ? `अभी आवेदन करें (₹${scheme.registrationFee})`
                  : 'अभी आवेदन करें'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 14,
    backgroundColor: '#FFFFFF',
  },
  heroBadgeBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeSymbol: {
    fontSize: 32,
  },
  quoteTextContainer: {
    flex: 1,
  },
  headerTitlere: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  quoteText: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {},
  tabLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
  tabContentSection: {
    gap: 16,
  },
  infoBlock: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
  },
  checkListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  ruleTitleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  stepTitleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  checkListText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 19,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  disclaimerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  applyBtn: {
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 19,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
});
