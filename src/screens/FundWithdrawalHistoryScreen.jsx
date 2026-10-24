import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import COLORS from '../constants/colors';
import useFundWithdrawal from '../hooks/useFundWithdrawal';
import { getSchemeMeta, resolveSchemeCode } from '../services/fundSchemeService';
import FundWithdrawalDetailsModal from '../components/FundWithdrawalDetailsModal';

const STATUS_TABS = [
  { id: 'all', label: 'सभी (All)' },
  { id: 'pending', label: 'समीक्षाधीन (Pending)', icon: 'clock-outline', color: '#D97706' },
  { id: 'approved', label: 'स्वीकृत (Approved)', icon: 'check-circle-outline', color: '#059669' },
  { id: 'rejected', label: 'अस्वीकृत (Rejected)', icon: 'close-circle-outline', color: '#DC2626' },
];

export default function FundWithdrawalHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    requests,
    requestsTotal,
    requestsLoading,
    loadRequests,
    cancelRequest,
    cancelling,
    currentRequestLoading,
    loadRequestDetails,
  } = useFundWithdrawal();

  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const targetFundAccountId = route.params?.fundAccountId;
  const activeSchemeCode = resolveSchemeCode(route.params?.schemeCode || 'VIVAH_SAHAYOG');
  const schemeMeta = getSchemeMeta(activeSchemeCode);
  const themeColor = schemeMeta.color || COLORS.primary;

  const loadData = useCallback(
    async (targetPage = 1, append = false, status = activeTab) => {
      await loadRequests({
        page: targetPage,
        limit: 20,
        status,
        fundAccountId: targetFundAccountId,
        append,
      });
    },
    [activeTab, loadRequests, targetFundAccountId]
  );

  useEffect(() => {
    setPage(1);
    loadData(1, false, activeTab);
  }, [activeTab, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadData(1, false, activeTab);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (requestsLoading) return;
    if (requests.length >= requestsTotal) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, true, activeTab);
  };

  const handleOpenDetails = async (item) => {
    setSelectedRequest(item);
    setDetailsModalVisible(true);
    const full = await loadRequestDetails(item._id || item.id || item.requestId);
    if (full) {
      setSelectedRequest(full);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      await cancelRequest(requestId, 'Cancelled by user', targetFundAccountId);
      Toast.show({
        type: 'success',
        text1: 'अनुरोध रद्द कर दिया गया',
        text2: 'निकासी अनुरोध सफलतापूर्वक रद्द किया गया। राशि खाते में पुनः उपलब्ध है।',
      });
      setDetailsModalVisible(false);
      loadData(1, false, activeTab);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'रद्द करने में विफल',
        text2: err?.message || 'अनुरोध रद्द नहीं किया जा सका।',
      });
    }
  };

  const renderStatusPill = (status) => {
    const raw = (status || 'pending').toLowerCase();
    if (raw === 'approved' || raw === 'completed' || raw === 'success') {
      return (
        <View style={[s.statusPill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
          <MaterialIcon name="check-circle" size={13} color="#059669" />
          <Text style={[s.statusPillText, { color: '#059669' }]}>स्वीकृत (Paid)</Text>
        </View>
      );
    }
    if (raw === 'rejected') {
      return (
        <View style={[s.statusPill, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <MaterialIcon name="close-circle" size={13} color="#DC2626" />
          <Text style={[s.statusPillText, { color: '#DC2626' }]}>अस्वीकृत (Rejected)</Text>
        </View>
      );
    }
    if (raw === 'cancelled') {
      return (
        <View style={[s.statusPill, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
          <MaterialIcon name="cancel" size={13} color="#64748B" />
          <Text style={[s.statusPillText, { color: '#64748B' }]}>रद्द (Cancelled)</Text>
        </View>
      );
    }
    return (
      <View style={[s.statusPill, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
        <MaterialIcon name="clock-outline" size={13} color="#D97706" />
        <Text style={[s.statusPillText, { color: '#D97706' }]}>समीक्षाधीन (Pending)</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const reqId = item.requestId || item.referenceId || item._id;
    const amount = Number(item.amount || 0);
    const rawStatus = (item.status || 'pending').toLowerCase();
    const isPending = rawStatus === 'pending';
    const isApproved = rawStatus === 'approved' || rawStatus === 'completed' || rawStatus === 'success';
    const isRejected = rawStatus === 'rejected';
    const isCancelled = rawStatus === 'cancelled';

    const bank = item.bankDetails || item.payoutBank || {};
    const bankName = bank.bankName || 'बैंक खाता';
    const lastDigits = bank.accountNumber ? String(bank.accountNumber).slice(-4) : '••••';

    const utr = item.utr || item.transactionRef || item.txnId || '';
    const rejectionReason = item.rejectionReason || item.remarks || item.rejectNote;

    const dateStr = item.createdAt
      ? new Date(item.createdAt).toLocaleString('hi-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

    return (
      <TouchableOpacity
        style={s.requestCard}
        onPress={() => handleOpenDetails(item)}
        activeOpacity={0.85}
      >
        {/* Top Header: ID & Date */}
        <View style={s.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardReqId}>ID: {reqId}</Text>
            <Text style={s.cardDateText}>{dateStr}</Text>
          </View>
          <View style={s.cardAmountWrap}>
            <Text style={[s.cardAmount, { color: themeColor }]}>
              ₹ {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            {renderStatusPill(rawStatus)}
          </View>
        </View>

        <View style={s.cardDivider} />

        {/* Bank & Purpose Details */}
        <View style={s.bankInfoRow}>
          <MaterialIcon name="bank-outline" size={16} color="#64748B" />
          <Text style={s.bankInfoText}>
            {bankName} (•••• {lastDigits}) {bank.ifsc ? `• ${bank.ifsc}` : ''}
          </Text>
        </View>

        {Boolean(item.reason || item.purpose) && (
          <View style={s.reasonRow}>
            <MaterialIcon name="format-quote-close-outline" size={15} color="#94A3B8" />
            <Text style={s.reasonText} numberOfLines={1}>
              {item.reason || item.purpose}
            </Text>
          </View>
        )}

        {/* Dynamic Status Action / Information Box */}
        {isPending && (
          <View style={s.pendingBox}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcon name="clock-time-four-outline" size={16} color="#D97706" />
              <Text style={s.pendingNote}>एडमिन द्वारा समीक्षाधीन (Under Review)</Text>
            </View>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => handleCancel(item._id || item.id || item.requestId)}
              disabled={cancelling}
              activeOpacity={0.7}
            >
              <Text style={s.cancelBtnText}>रद्द करें</Text>
            </TouchableOpacity>
          </View>
        )}

        {isApproved && (
          <View style={s.approvedBox}>
            <MaterialIcon name="check-decagram" size={16} color="#059669" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={s.approvedTitle}>भुगतान पूर्ण (Paid / Processed)</Text>
              {Boolean(utr) && <Text style={s.approvedSub}>UTR: {utr}</Text>}
            </View>
          </View>
        )}

        {isRejected && (
          <View style={s.rejectedBox}>
            <MaterialIcon name="alert-circle-outline" size={16} color="#DC2626" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={s.rejectedTitle}>अस्वीकृत (Rejected)</Text>
              {Boolean(rejectionReason) && (
                <Text style={s.rejectedSub} numberOfLines={2}>
                  कारण: {rejectionReason}
                </Text>
              )}
            </View>
          </View>
        )}

        {isCancelled && (
          <View style={s.cancelledBox}>
            <MaterialIcon name="cancel" size={15} color="#64748B" />
            <Text style={s.cancelledText}>आपके द्वारा रद्द किया गया (Cancelled by You)</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>निकासी अनुरोध व इतिहास</Text>
          <Text style={[s.headerSub, { color: themeColor }]}>
            {schemeMeta.name} • {requestsTotal} अनुरोध
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('FundWithdrawalRequest', {
              fundAccountId: targetFundAccountId,
              schemeCode: activeSchemeCode,
            })
          }
          style={[s.newReqBtn, { backgroundColor: themeColor }]}
          activeOpacity={0.8}
        >
          <FeatherIcon name="plus" size={16} color="#FFFFFF" />
          <Text style={s.newReqBtnText}>नया</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={s.tabsWrap}>
        {STATUS_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                s.tab,
                isSelected && [s.tabActive, { borderBottomColor: themeColor }],
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  s.tabText,
                  isSelected && [s.tabTextActive, { color: themeColor }],
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Requests List */}
      <FlatList
        data={requests}
        keyExtractor={(item, index) => item._id || item.requestId || String(index)}
        renderItem={renderItem}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeColor]} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          requestsLoading ? (
            <View style={s.emptyBox}>
              <ActivityIndicator size="large" color={themeColor} />
              <Text style={s.emptyText}>अनुरोध लोड हो रहे हैं...</Text>
            </View>
          ) : (
            <View style={s.emptyBox}>
              <MaterialIcon name="file-document-outline" size={48} color="#CBD5E1" />
              <Text style={s.emptyTitle}>कोई निकासी अनुरोध नहीं मिला</Text>
              <Text style={s.emptySub}>
                {activeTab === 'all'
                  ? 'आपने अभी तक कोई निकासी अनुरोध दर्ज नहीं किया है।'
                  : `इस फ़िल्टर (${activeTab}) में कोई अनुरोध उपलब्ध नहीं है।`}
              </Text>
              <TouchableOpacity
                style={[s.emptyCtaBtn, { backgroundColor: themeColor }]}
                onPress={() =>
                  navigation.navigate('FundWithdrawalRequest', {
                    fundAccountId: targetFundAccountId,
                    schemeCode: activeSchemeCode,
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={s.emptyCtaText}>नया निकासी अनुरोध करें</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      {/* Details Modal */}
      <FundWithdrawalDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        request={selectedRequest}
        loading={currentRequestLoading}
        onCancelRequest={handleCancel}
        cancelling={cancelling}
        themeColor={themeColor}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  newReqBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  newReqBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2.5,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardReqId: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardDateText: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  cardAmountWrap: {
    alignItems: 'flex-end',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  bankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bankInfoText: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '600',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  reasonText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingNote: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  approvedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  approvedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  approvedSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 1,
    fontWeight: '600',
  },
  rejectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  rejectedSub: {
    fontSize: 11,
    color: '#991B1B',
    marginTop: 1,
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
    gap: 6,
  },
  cancelledText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  emptyCtaBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
