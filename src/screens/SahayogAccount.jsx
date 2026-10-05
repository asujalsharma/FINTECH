import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
  Linking,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';
import useFundAccount, { getDocumentUrl } from '../hooks/useFundAccount';

const VIVAH_LOGO = require('../Assets/vivah_sahayog_logo.png');

export default function SahayogAccount() {
  const navigation = useNavigation();
  const { profile, loading, statements, statementsTotal, fetchProfile, fetchStatements } = useFundAccount();
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Statement' | 'Documents'
  const [statementFilter, setStatementFilter] = useState('all'); // 'all' | 'credit' | 'debit'
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  const loadData = useCallback(async () => {
    await fetchProfile();
    await fetchStatements(1, 20, false);
  }, [fetchProfile, fetchStatements]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    loadData();
    return unsubscribe;
  }, [navigation, loadData]);

  const rawPhoto = profile?.documents?.balikaPhoto || profile?.balikaPhoto;
  const balikaPhotoUri = rawPhoto ? getDocumentUrl(rawPhoto) : null;

  const filteredStatements = statements.filter(item => {
    if (statementFilter === 'all') return true;
    if (statementFilter === 'credit') return item.type === 'credit';
    if (statementFilter === 'debit') return item.type === 'debit';
    return true;
  });

  const getStatusConfig = status => {
    switch (status) {
      case 'approved':
        return { label: 'स्थिति: सक्रिय', bg: '#ECFDF5', border: '#A7F3D0', color: '#0F8A5F', icon: 'check-circle' };
      case 'pending':
        return { label: 'स्थिति: समीक्षा में', bg: '#FFF7ED', border: '#FED7AA', color: '#F57C00', icon: 'clock-outline' };
      case 'rejected':
        return { label: 'स्थिति: अस्वीकृत', bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', icon: 'close-circle' };
      default:
        return { label: 'स्थिति: अप्राप्य', bg: '#F1F5F9', border: '#CBD5E1', color: '#64748B', icon: 'help-circle-outline' };
    }
  };

  const currentStatus = profile?.approvalStatus || profile?.status;
  const statusConfig = getStatusConfig(currentStatus);

  const openDoc = (docPath, docTitle) => {
    if (!docPath) {
      Alert.alert('दस्तावेज', 'यह दस्तावेज अपलोड नहीं किया गया है।');
      return;
    }
    const fullUrl = getDocumentUrl(docPath);
    if (!fullUrl) {
      Alert.alert('दस्तावेज', `${docTitle} को खोला नहीं जा सका।`);
      return;
    }
    setSelectedPreviewDoc({ title: docTitle, url: fullUrl });
  };

  const openExternal = url => {
    if (!url) return;
    Linking.openURL(url).catch(() => {
      Alert.alert('त्रुटि', 'लिंक खोला नहीं जा सका।');
    });
  };

  const documentsList = [
    {
      id: 'birthCertificate',
      title: 'बालिका का जन्म प्रमाण पत्र',
      path: profile?.documents?.birthCertificate || profile?.birthCertificate,
      type: 'प्रमाण पत्र (Document)',
      icon: 'file-pdf-box',
    },
    {
      id: 'parentAadhaar',
      title: 'माता-पिता का आधार कार्ड',
      path: profile?.documents?.parentAadhaar || profile?.parentAadhaar,
      type: 'पहचान पत्र (Aadhaar)',
      icon: 'card-account-details-outline',
    },
    {
      id: 'balikaPhoto',
      title: 'बालिका का पासपोर्ट फोटो',
      path: profile?.documents?.balikaPhoto || profile?.balikaPhoto,
      type: 'फोटो (Photo)',
      icon: 'image-outline',
    },
  ];

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

      {loading && !profile ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary || '#D81B60'} />
          <Text style={styles.loadingText}>खाता लोड हो रहा है...</Text>
        </View>
      ) : !profile ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={['#D81B60']} />}
        >
          <View style={styles.emptyIconCircle}>
            <MaterialIcon name="card-account-details-outline" size={48} color="#D81B60" />
          </View>
          <Text style={styles.emptyTitle}>कोई सक्रिय सहयोग खाता नहीं मिला</Text>
          <Text style={styles.emptySubtitle}>
            आपने अभी तक विवाह सहयोग योजना (Vivah Sahayog Yojna) के लिए आवेदन नहीं किया है या आपका आवेदन विचाराधीन है।
          </Text>

          <TouchableOpacity
            style={styles.applyNowBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('VivahSahayogEntry')}
          >
            <Text style={styles.applyNowBtnText}>अभी आवेदन करें / विवरण देखें</Text>
            <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={['#D81B60']} />}
        >
          {/* Beneficiary Card */}
          <View style={styles.beneficiaryCard}>
            <View style={styles.avatarWrap}>
              {balikaPhotoUri ? (
                <Image
                  source={{ uri: balikaPhotoUri }}
                  style={styles.avatarImg}
                />
              ) : (
                <Image
                  source={VIVAH_LOGO}
                  style={styles.avatarImg}
                  resizeMode="contain"
                />
              )}
            </View>
            <View style={styles.beneficiaryInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.beneficiaryName} numberOfLines={1}>
                  {profile.balikaName || 'बालिका'}
                </Text>
                <View
                  style={[
                    styles.activeBadge,
                    {
                      backgroundColor: statusConfig.bg,
                      borderColor: statusConfig.border,
                    },
                  ]}
                >
                  <Text style={[styles.activeBadgeText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.beneficiarySub}>
                {profile.motherName || profile.fatherName
                  ? `माता: ${profile.motherName || '—'} • पिता: ${profile.fatherName || '—'}`
                  : `Vivah Sahayog Yojna`}
              </Text>
              <Text style={styles.beneficiarySub}>
                आयु: {profile.currentAge || '—'}
              </Text>
              <Text style={styles.beneficiarySub}>
                Sahayog ID:{' '}
                <Text style={styles.idText}>
                  {profile.accountNumber ||
                    (profile._id ? `VSA-${profile._id.slice(-6).toUpperCase()}` : '—')}
                </Text>
              </Text>

              {profile.mobileNumber ? (
                <View style={styles.phoneRow}>
                  <FeatherIcon name="phone" size={12} color="#0F8A5F" />
                  <Text style={styles.phoneText}>+91 {profile.mobileNumber} (लिंक्ड)</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Rejection Note */}
          {profile.status === 'rejected' && profile.rejectionNote && (
            <View style={styles.rejectionCard}>
              <MaterialIcon name="alert-circle-outline" size={20} color="#DC2626" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.rejectionTitle}>अस्वीकृति का कारण:</Text>
                <Text style={styles.rejectionText}>{profile.rejectionNote}</Text>
              </View>
            </View>
          )}

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
                      <Text style={[styles.statValue, { color: '#0F8A5F' }]}>
                        ₹ {(profile.wallet?.balance || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Personal Details Snapshot */}
              <View style={styles.infoSnapshotCard}>
                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>जन्म तिथि:</Text>
                  <Text style={styles.snapshotVal}>{profile.dob || '—'}</Text>
                </View>
                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>वार्षिक आय:</Text>
                  <Text style={styles.snapshotVal}>{profile.annualIncome || '—'}</Text>
                </View>
                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>स्थान:</Text>
                  <Text style={styles.snapshotVal}>
                    {profile.district ? `${profile.district}, ${profile.state}` : profile.state || '—'}
                  </Text>
                </View>
              </View>

              {/* Recent Contributions Section */}
              <View style={styles.recentSection}>
                <Text style={styles.recentHeading}>हाल के योगदान</Text>

                {statements && statements.length > 0 ? (
                  <View style={styles.contributionList}>
                    {statements.slice(0, 5).map((item, index) => {
                      const isCredit = item.type === 'credit';
                      const formattedDate = item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('hi-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—';
                      return (
                        <View key={item._id || index} style={styles.contributionRow}>
                          <Text style={styles.dateCol}>{formattedDate}</Text>
                          <Text style={styles.typeCol} numberOfLines={1}>
                            {item.txnName || item.remarks || (isCredit ? 'मासिक सहयोग' : 'संवितरण')}
                          </Text>
                          <Text
                            style={[
                              styles.amountCol,
                              { color: isCredit ? '#0F8A5F' : '#DC2626' },
                            ]}
                          >
                            {isCredit ? '+' : '-'}₹{(item.amount || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.noTxnCard}>
                    <MaterialIcon name="clock-outline" size={28} color="#94A3B8" />
                    <Text style={styles.noTxnText}>अभी तक कोई लेन-देन दर्ज नहीं हुआ है।</Text>
                  </View>
                )}

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
                  <Text style={styles.statementSummaryVal}>
                    ₹{(profile.wallet?.totalCredited || profile.wallet?.balance || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.statementSummaryCol}>
                  <Text style={styles.statementSummaryLabel}>कुल प्रविष्टियाँ</Text>
                  <Text style={styles.statementSummaryVal}>
                    {statementsTotal || statements.length} प्रविष्टियाँ
                  </Text>
                </View>
              </View>

              {/* Filter Pills */}
              <View style={styles.filterPillsRow}>
                <TouchableOpacity
                  style={[styles.filterPill, statementFilter === 'all' && styles.filterPillActive]}
                  onPress={() => setStatementFilter('all')}
                >
                  <Text style={[styles.filterPillText, statementFilter === 'all' && styles.filterPillTextActive]}>
                    सभी ({statements.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterPill, statementFilter === 'credit' && styles.filterPillActive]}
                  onPress={() => setStatementFilter('credit')}
                >
                  <Text style={[styles.filterPillText, statementFilter === 'credit' && styles.filterPillTextActive]}>
                    योगदान ({statements.filter(s => s.type === 'credit').length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterPill, statementFilter === 'debit' && styles.filterPillActive]}
                  onPress={() => setStatementFilter('debit')}
                >
                  <Text style={[styles.filterPillText, statementFilter === 'debit' && styles.filterPillTextActive]}>
                    संवितरण ({statements.filter(s => s.type === 'debit').length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Full Ledger List */}
              <View style={styles.statementList}>
                {filteredStatements.length > 0 ? (
                  filteredStatements.map((item, index) => {
                    const isCredit = item.type === 'credit';
                    const formattedDate = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('hi-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—';
                    return (
                      <View key={item._id || index} style={styles.statementCard}>
                        <View style={styles.statementTopRow}>
                          <View style={styles.statementBadgeRow}>
                            <View
                              style={[
                                styles.statementIconCircle,
                                { backgroundColor: isCredit ? '#ECFDF5' : '#FEF2F2' },
                              ]}
                            >
                              <MaterialIcon
                                name={isCredit ? 'arrow-up-bold' : 'arrow-down-bold'}
                                size={16}
                                color={isCredit ? '#0F8A5F' : '#DC2626'}
                              />
                            </View>
                            <View>
                              <Text style={styles.statementItemTitle}>
                                {item.txnName || item.remarks || (isCredit ? 'मासिक सहयोग' : 'संवितरण')}
                              </Text>
                              <Text style={styles.statementTxnId}>
                                ID: {item.txnId || item._id?.slice(-8).toUpperCase() || 'TXN-000'}
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={[
                              styles.statementAmount,
                              { color: isCredit ? '#0F8A5F' : '#DC2626' },
                            ]}
                          >
                            {isCredit ? '+' : '-'}₹{(item.amount || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>

                        <View style={styles.statementBottomRow}>
                          <Text style={styles.statementMeta}>
                            {formattedDate} • {item.paymentMode || 'Wallet'}
                          </Text>
                          <View style={styles.statusPill}>
                            <Text style={styles.statusPillText}>{item.status || 'सफल'}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.noTxnCard}>
                    <Text style={styles.noTxnText}>कोई विवरणिका प्रविष्टि नहीं मिली।</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ===================== TAB 3: DOCUMENTS ===================== */}
          {activeTab === 'Documents' && (
            <View style={styles.documentsSection}>
              <View style={styles.docHeaderInfo}>
                <MaterialIcon name="shield-check" size={20} color="#0F8A5F" />
                <Text style={styles.docHeaderText}>
                  {profile.status === 'approved'
                    ? 'सभी दस्तावेज SARVANA Verification Team द्वारा सत्यापित हैं।'
                    : 'दस्तावेज समीक्षा प्रक्रियाधीन हैं।'}
                </Text>
              </View>

              {documentsList.map(doc => {
                const isUploaded = Boolean(doc.path);
                const docUrl = isUploaded ? getDocumentUrl(doc.path) : null;
                return (
                  <TouchableOpacity
                    key={doc.id}
                    style={styles.docCard}
                    activeOpacity={isUploaded ? 0.75 : 1}
                    onPress={() => isUploaded && openDoc(doc.path, doc.title)}
                  >
                    <View style={styles.docIconWrapper}>
                      <MaterialIcon name={doc.icon} size={28} color="#D81B60" />
                    </View>
                    <View style={styles.docDetailsCol}>
                      <View style={styles.docTitleRow}>
                        <Text style={styles.docTitle} numberOfLines={1}>
                          {doc.title}
                        </Text>
                        {(profile?.approvalStatus === 'approved' || profile?.status === 'approved') && isUploaded ? (
                          <View style={styles.verifiedBadge}>
                            <MaterialIcon name="check-decagram" size={14} color="#0F8A5F" />
                            <Text style={styles.verifiedBadgeText}>Verified</Text>
                          </View>
                        ) : isUploaded ? (
                          <View style={styles.pendingBadge}>
                            <MaterialIcon name="clock-outline" size={14} color="#F57C00" />
                            <Text style={styles.pendingBadgeText}>Uploaded</Text>
                          </View>
                        ) : (
                          <View style={styles.missingBadge}>
                            <Text style={styles.missingBadgeText}>Not Uploaded</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.docMeta}>{doc.type}</Text>
                    </View>

                    {isUploaded ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity
                          style={styles.docActionBtn}
                          activeOpacity={0.7}
                          onPress={() => openDoc(doc.path, doc.title)}
                        >
                          <FeatherIcon name="eye" size={18} color="#0F8A5F" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.docActionBtn, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}
                          activeOpacity={0.7}
                          onPress={() => openExternal(docUrl)}
                        >
                          <FeatherIcon name="external-link" size={16} color="#64748B" />
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}

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
      )}

      {/* Document In-App Preview Modal */}
      <Modal
        visible={!!selectedPreviewDoc}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPreviewDoc(null)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewModalCard}>
            <View style={styles.previewHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {selectedPreviewDoc?.title || 'दस्तावेज'}
                </Text>
                <Text style={styles.previewSub}>पूर्वावलोकन (Preview)</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedPreviewDoc(null)}
                style={styles.previewCloseBtn}
              >
                <FeatherIcon name="x" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.previewImageContainer}>
              {selectedPreviewDoc?.url && (
                <Image
                  source={{ uri: selectedPreviewDoc.url }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
            </View>

            <View style={styles.previewFooter}>
              <TouchableOpacity
                style={styles.previewExternalBtn}
                onPress={() => openExternal(selectedPreviewDoc?.url)}
                activeOpacity={0.8}
              >
                <FeatherIcon name="external-link" size={16} color="#D81B60" />
                <Text style={styles.previewExternalText}>ब्राउज़र में खोलें</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.previewDoneBtn}
                onPress={() => setSelectedPreviewDoc(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.previewDoneText}>बंद करें</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#FCE7F3',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  applyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D81B60',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  applyNowBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
    marginBottom: 12,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FCE7F3',
    marginRight: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F5',
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    flex: 1,
    marginRight: 6,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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
  rejectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  rejectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  rejectionText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 1,
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
    marginBottom: 14,
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
  infoSnapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    gap: 6,
    marginBottom: 16,
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  snapshotLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  snapshotVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
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
    textAlign: 'right',
  },
  noTxnCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  noTxnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
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
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F8A5F',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pendingBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#F57C00',
  },
  missingBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  missingBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  docMeta: {
    fontSize: 11.5,
    color: '#64748B',
  },
  docActionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
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
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  previewModalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  previewSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  previewCloseBtn: {
    padding: 4,
  },
  previewImageContainer: {
    width: '100%',
    height: 340,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  previewExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFF0F5',
  },
  previewExternalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D81B60',
  },
  previewDoneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  previewDoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
