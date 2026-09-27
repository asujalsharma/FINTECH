import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../constants/colors';

const RECENT_CONTRIBUTIONS = [
  { id: '1', date: '12 Jan 2027', type: 'मासिक सहयोग', amount: '₹500', txnId: 'TXN984210', mode: 'UPI / Wallet', status: 'Success' },
  { id: '2', date: '12 Dec 2026', type: 'मासिक सहयोग', amount: '₹500', txnId: 'TXN873109', mode: 'UPI / Wallet', status: 'Success' },
  { id: '3', date: '12 Nov 2026', type: 'मासिक सहयोग', amount: '₹500', txnId: 'TXN762018', mode: 'UPI / Wallet', status: 'Success' },
  { id: '4', date: '12 Oct 2026', type: 'मासिक सहयोग', amount: '₹500', txnId: 'TXN651927', mode: 'UPI / Wallet', status: 'Success' },
  { id: '5', date: '12 Sep 2026', type: 'प्रारंभिक सहयोग', amount: '₹2,000', txnId: 'TXN540836', mode: 'NetBanking', status: 'Success' },
];

const DOCUMENTS = [
  { id: 'd1', title: 'बालिका का जन्म प्रमाण पत्र', type: 'PDF Document', size: '1.2 MB', date: '12 Sep 2026', verified: true, icon: 'file-pdf-box' },
  { id: 'd2', title: 'माता-पिता का आधार कार्ड', type: 'PDF Document', size: '2.4 MB', date: '12 Sep 2026', verified: true, icon: 'card-account-details-outline' },
  { id: 'd3', title: 'आय प्रमाण पत्र (Income Cert)', type: 'PDF Document', size: '850 KB', date: '14 Sep 2026', verified: true, icon: 'file-certificate-outline' },
  { id: 'd4', title: 'बालिका का पासपोर्ट फोटो', type: 'Image File', size: '420 KB', date: '12 Sep 2026', verified: true, icon: 'image-outline' },
];

export default function SahayogAccount() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Statement' | 'Documents'
  const [statementFilter, setStatementFilter] = useState('all'); // 'all' | 'contribution' | 'disbursed'

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
        <Text style={styles.headerTitle}>मेरा सहयोग Account</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Beneficiary Card */}
        <View style={styles.beneficiaryCard}>
          <Image
            source={require('../Assets/vivah_sahayog_logo.png')}
            style={styles.avatarImg}
          />
          <View style={styles.beneficiaryInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.beneficiaryName}>कुमारी आराध्या</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>स्थिति: सक्रिय</Text>
              </View>
            </View>
            <Text style={styles.beneficiarySub}>नाम: SARVANA • आयु: 1 वर्ष</Text>
            <Text style={styles.beneficiarySub}>
              Sahayog ID: <Text style={styles.idText}>VSA-2026-000125</Text>
            </Text>
            <View style={styles.phoneRow}>
              <FeatherIcon name="phone" size={12} color="#0F8A5F" />
              <Text style={styles.phoneText}>+91 98765 43210 (लिंक्ड)</Text>
            </View>
          </View>
        </View>

        {/* Segmented Tabs: [ Overview | Statement | Documents ] */}
        <View style={styles.tabBar}>
          {['Overview', 'Statement', 'Documents'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === 'Overview' ? 'अवलोकन' : tab === 'Statement' ? 'विवरणिका' : 'दस्तावेज'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===================== TAB 1: OVERVIEW ===================== */}
        {activeTab === 'Overview' && (
          <>
            {/* Wallet Section (कुल प्राप्त सहयोग) */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <View style={styles.statIconBg}>
                    <MaterialIcon name="wallet-outline" size={24} color="#0F8A5F" />
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>कुल प्राप्त सहयोग</Text>
                    <Text style={[styles.statValue, { color: '#0F8A5F' }]}>₹ 4,000</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Recent Contributions Section */}
            <View style={styles.recentSection}>
              <Text style={styles.recentHeading}>हाल के योगदान</Text>

              <View style={styles.contributionList}>
                {RECENT_CONTRIBUTIONS.map(item => (
                  <View key={item.id} style={styles.contributionRow}>
                    <Text style={styles.dateCol}>{item.date}</Text>
                    <Text style={styles.typeCol}>{item.type}</Text>
                    <Text style={styles.amountCol}>{item.amount}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.viewFullStatementBtn}
                activeOpacity={0.7}
                onPress={() => setActiveTab('Statement')}
              >
                <Text style={styles.viewFullStatementText}>View Full Statement →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ===================== TAB 2: STATEMENT ===================== */}
        {activeTab === 'Statement' && (
          <View style={styles.statementSection}>
            {/* Summary Banner */}
            <View style={styles.statementSummaryCard}>
              <View style={styles.statementSummaryCol}>
                <Text style={styles.statementSummaryLabel}>कुल जमा योगदान</Text>
                <Text style={styles.statementSummaryVal}>₹4,000</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.statementSummaryCol}>
                <Text style={styles.statementSummaryLabel}>कुल प्रविष्टियाँ</Text>
                <Text style={styles.statementSummaryVal}>5 सफल</Text>
              </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterPillsRow}>
              <TouchableOpacity
                style={[styles.filterPill, statementFilter === 'all' && styles.filterPillActive]}
                onPress={() => setStatementFilter('all')}
              >
                <Text style={[styles.filterPillText, statementFilter === 'all' && styles.filterPillTextActive]}>
                  सभी (5)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterPill, statementFilter === 'contribution' && styles.filterPillActive]}
                onPress={() => setStatementFilter('contribution')}
              >
                <Text style={[styles.filterPillText, statementFilter === 'contribution' && styles.filterPillTextActive]}>
                  योगदान (5)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterPill, statementFilter === 'disbursed' && styles.filterPillActive]}
                onPress={() => setStatementFilter('disbursed')}
              >
                <Text style={[styles.filterPillText, statementFilter === 'disbursed' && styles.filterPillTextActive]}>
                  सहायता संवितरण (0)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Full Ledger List */}
            <View style={styles.statementList}>
              {RECENT_CONTRIBUTIONS.map(item => (
                <View key={item.id} style={styles.statementCard}>
                  <View style={styles.statementTopRow}>
                    <View style={styles.statementBadgeRow}>
                      <View style={styles.statementIconCircle}>
                        <MaterialIcon name="heart" size={16} color="#D81B60" />
                      </View>
                      <View>
                        <Text style={styles.statementItemTitle}>{item.type}</Text>
                        <Text style={styles.statementTxnId}>ID: {item.txnId}</Text>
                      </View>
                    </View>
                    <Text style={styles.statementAmount}>{item.amount}</Text>
                  </View>

                  <View style={styles.statementBottomRow}>
                    <Text style={styles.statementMeta}>{item.date} • {item.mode}</Text>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ===================== TAB 3: DOCUMENTS ===================== */}
        {activeTab === 'Documents' && (
          <View style={styles.documentsSection}>
            <View style={styles.docHeaderInfo}>
              <MaterialIcon name="shield-check" size={20} color="#0F8A5F" />
              <Text style={styles.docHeaderText}>
                सभी दस्तावेज SARVANA Verification Team द्वारा सत्यापित हैं।
              </Text>
            </View>

            {DOCUMENTS.map(doc => (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docIconWrapper}>
                  <MaterialIcon name={doc.icon} size={28} color="#D81B60" />
                </View>
                <View style={styles.docDetailsCol}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docTitle} numberOfLines={1}>
                      {doc.title}
                    </Text>
                    {doc.verified && (
                      <View style={styles.verifiedBadge}>
                        <MaterialIcon name="check-decagram" size={14} color="#0F8A5F" />
                        <Text style={styles.verifiedBadgeText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.docMeta}>
                    {doc.type} • {doc.size} • {doc.date}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.docActionBtn}
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Document Preview', `Opening ${doc.title}`)}
                >
                  <FeatherIcon name="download" size={18} color="#0F8A5F" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Upload New Document Button */}
            <TouchableOpacity
              style={styles.uploadNewDocBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Upload Document', 'Select PDF or image from storage')}
            >
              <FeatherIcon name="plus-circle" size={18} color="#D81B60" />
              <Text style={styles.uploadNewDocText}>नया दस्तावेज अपलोड करें</Text>
            </TouchableOpacity>

            {/* Document & Account Process Note */}
            <View style={styles.processCard}>
              <View style={styles.processHeader}>
                <MaterialIcon name="clipboard-check-outline" size={18} color="#0F8A5F" />
                <Text style={styles.processHeading}>दस्तावेज़ एवं खाता प्रक्रिया विवरण</Text>
              </View>
              <Text style={styles.processStepText}>• उपयोगकर्ता की जानकारी मोबाइल नंबर से लिंक कर दर्ज की जाती है।</Text>
              <Text style={styles.processStepText}>• आवश्यक दस्तावेज़ अपलोड कर SARVANA टीम द्वारा सत्यापन किया जाता है।</Text>
              <Text style={styles.processStepText}>• सत्यापन पूर्ण होने पर खाते का अवलोकन (Overview) सक्रिय होता है।</Text>
              <Text style={styles.processStepText}>• खाते में उपलब्ध राशि व भुगतान की स्थिति पारदर्शी रूप से प्रदर्शित होती है।</Text>
              <Text style={styles.processStepText}>• उपयोगकर्ता को पूरी लेन-देन विवरणिका (Statement) देखने की सुविधा मिलती है।</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  beneficiaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    marginBottom: 16,
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FCE7F3',
    marginRight: 14,
  },
  beneficiaryInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  beneficiaryName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F8A5F',
  },
  beneficiarySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  idText: {
    fontWeight: '700',
    color: '#D81B60',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F8A5F',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: '#D81B60',
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#D81B60',
    fontWeight: '700',
  },
  statsContainer: {
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCardHalf: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statSubText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  rulesCard: {
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 20,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  rulesHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D81B60',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  ruleText: {
    flex: 1,
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  processCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginTop: 16,
    marginBottom: 10,
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  processHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F8A5F',
  },
  processStepText: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 18,
    marginBottom: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  donateBtn: {
    flex: 1,
    backgroundColor: '#D81B60',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  applyHelpBtn: {
    flex: 1.4,
    backgroundColor: '#0F8A5F',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyHelpBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  recentSection: {
    marginBottom: 20,
  },
  recentHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  contributionList: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  contributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dateCol: {
    fontSize: 12.5,
    color: '#64748B',
    width: '32%',
  },
  typeCol: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  amountCol: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F8A5F',
    textAlign: 'right',
  },
  viewFullStatementBtn: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewFullStatementText: {
    color: '#D81B60',
    fontSize: 13,
    fontWeight: '700',
  },

  /* STATEMENT TAB STYLES */
  statementSection: {
    gap: 14,
  },
  statementSummaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statementSummaryCol: {
    alignItems: 'center',
  },
  statementSummaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  statementSummaryVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D81B60',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#FBCFE8',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#D81B60',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  statementList: {
    gap: 10,
  },
  statementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  statementTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statementBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statementIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statementItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  statementTxnId: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  statementAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F8A5F',
  },
  statementBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  statementMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F8A5F',
  },

  /* DOCUMENTS TAB STYLES */
  documentsSection: {
    gap: 12,
  },
  docHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 4,
  },
  docHeaderText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    lineHeight: 16,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  docIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docDetailsCol: {
    flex: 1,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 6,
    marginBottom: 4,
  },
  docTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F8A5F',
  },
  docMeta: {
    fontSize: 11.5,
    color: '#64748B',
  },
  docActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  uploadNewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#FBCFE8',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#FFF5F8',
    marginTop: 6,
    gap: 8,
  },
  uploadNewDocText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#D81B60',
  },
});
