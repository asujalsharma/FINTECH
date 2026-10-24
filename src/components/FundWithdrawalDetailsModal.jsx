import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';

export default function FundWithdrawalDetailsModal({
  visible,
  onClose,
  request,
  loading,
  onCancelRequest,
  cancelling,
  themeColor = COLORS.primary,
}) {
  const [confirmCancelVisible, setConfirmCancelVisible] = useState(false);

  if (!visible) return null;

  const rawStatus = (request?.status || request?.approvalStatus || 'pending').toLowerCase();
  const isPending = rawStatus === 'pending';
  const isApproved = rawStatus === 'approved' || rawStatus === 'completed' || rawStatus === 'success';
  const isRejected = rawStatus === 'rejected';
  const isCancelled = rawStatus === 'cancelled';

  const statusConfig = isApproved
    ? {
        label: 'स्वीकृत एवं भुगतान पूर्ण (Paid / Approved)',
        pillText: 'स्वीकृत (Approved)',
        color: '#059669',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        icon: 'check-decagram',
      }
    : isRejected
    ? {
        label: 'अस्वीकृत (Rejected)',
        pillText: 'अस्वीकृत',
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
        icon: 'close-circle',
      }
    : isCancelled
    ? {
        label: 'आपके द्वारा रद्द (Cancelled)',
        pillText: 'रद्द (Cancelled)',
        color: '#64748B',
        bg: '#F1F5F9',
        border: '#CBD5E1',
        icon: 'cancel',
      }
    : {
        label: 'समीक्षाधीन (Under Admin Review)',
        pillText: 'लंबित (Pending)',
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FDE68A',
        icon: 'clock-outline',
      };

  const amount = Number(request?.amount || 0);
  const reqId = request?.requestId || request?.referenceId || request?._id || '—';
  const bankDetails = request?.bankDetails || request?.payoutBank || {};
  const utr = request?.utr || request?.transactionRef || request?.txnId || request?.bankRefNo || '';
  const reason = request?.reason || request?.purpose || '—';
  const adminRemarks = request?.adminRemarks || request?.remarks || '';
  const rejectionReason = request?.rejectionReason || request?.rejectNote || adminRemarks;

  const createdAt = request?.createdAt
    ? new Date(request.createdAt).toLocaleString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const processedAt = request?.processedAt || request?.updatedAt
    ? new Date(request.processedAt || request.updatedAt).toLocaleString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const handleCancelConfirm = async () => {
    setConfirmCancelVisible(false);
    if (onCancelRequest) {
      onCancelRequest(request?._id || request?.id || request?.requestId);
    }
  };

  const maskAccNo = (num) => {
    if (!num) return '—';
    const str = String(num);
    if (str.length <= 4) return str;
    return `•••• •••• ${str.slice(-4)}`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modalSheet}>
          {/* Header */}
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitle}>निकासी अनुरोध विवरण</Text>
              <Text style={s.headerSub}>Request ID: {reqId}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
              <FeatherIcon name="x" size={22} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={themeColor} />
              <Text style={s.loadingText}>विवरण लोड हो रहा है...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
              {/* Amount & Status Card */}
              <View style={s.heroCard}>
                <Text style={s.heroAmountLabel}>अनुरोधित राशि (Requested Amount)</Text>
                <Text style={[s.heroAmount, { color: themeColor }]}>
                  ₹ {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>

                <View style={[s.statusBadge, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
                  <MaterialIcon name={statusConfig.icon} size={16} color={statusConfig.color} />
                  <Text style={[s.statusBadgeText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              {/* Status Timeline */}
              <View style={s.card}>
                <Text style={s.cardHeading}>प्रक्रिया स्थिति (Process Timeline)</Text>
                <View style={s.timeline}>
                  <View style={s.timelineStep}>
                    <View style={[s.timelineDot, { backgroundColor: '#059669' }]}>
                      <MaterialIcon name="check" size={12} color="#FFFFFF" />
                    </View>
                    <View style={s.timelineInfo}>
                      <Text style={s.timelineTitle}>अनुरोध दर्ज हुआ</Text>
                      <Text style={s.timelineTime}>{createdAt}</Text>
                    </View>
                  </View>

                  <View style={s.timelineLine} />

                  <View style={s.timelineStep}>
                    <View
                      style={[
                        s.timelineDot,
                        {
                          backgroundColor: isApproved
                            ? '#059669'
                            : isRejected
                            ? '#DC2626'
                            : isCancelled
                            ? '#94A3B8'
                            : '#D97706',
                        },
                      ]}
                    >
                      <MaterialIcon
                        name={isApproved ? 'check' : isRejected ? 'close' : isCancelled ? 'cancel' : 'clock-outline'}
                        size={12}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={s.timelineInfo}>
                      <Text style={s.timelineTitle}>
                        {isApproved
                          ? 'सत्यापित एवं स्वीकृत'
                          : isRejected
                          ? 'एडमिन द्वारा अस्वीकृत'
                          : isCancelled
                          ? 'रद्द किया गया'
                          : 'एडमिन समीक्षाधीन'}
                      </Text>
                      <Text style={s.timelineTime}>
                        {processedAt || 'जाँच प्रक्रियाधीन'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Approved Settlement Details */}
              {isApproved && (
                <View style={[s.card, { borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }]}>
                  <View style={s.approvedHeader}>
                    <MaterialIcon name="bank-check" size={22} color="#059669" />
                    <Text style={[s.cardHeading, { color: '#065F46', marginBottom: 0, marginLeft: 8 }]}>
                      भुगतान सफल (Payment Settled)
                    </Text>
                  </View>
                  {Boolean(utr) && (
                    <View style={s.infoRow}>
                      <Text style={s.infoLabel}>UTR / Txn Reference:</Text>
                      <Text style={[s.infoValue, { color: '#065F46', fontWeight: '800' }]}>{utr}</Text>
                    </View>
                  )}
                  {Boolean(adminRemarks) && (
                    <View style={s.infoRow}>
                      <Text style={s.infoLabel}>एडमिन टिप्पणी:</Text>
                      <Text style={s.infoValue}>{adminRemarks}</Text>
                    </View>
                  )}
                  {Boolean(processedAt) && (
                    <View style={s.infoRow}>
                      <Text style={s.infoLabel}>भुगतान तिथि:</Text>
                      <Text style={s.infoValue}>{processedAt}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Rejection Note */}
              {isRejected && (
                <View style={[s.card, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
                  <View style={s.approvedHeader}>
                    <MaterialIcon name="alert-circle-outline" size={22} color="#DC2626" />
                    <Text style={[s.cardHeading, { color: '#991B1B', marginBottom: 0, marginLeft: 8 }]}>
                      अस्वीकृति का कारण (Reason for Rejection)
                    </Text>
                  </View>
                  <Text style={[s.infoValue, { color: '#7F1D1D', marginTop: 8 }]}>
                    {rejectionReason || 'प्रशासनिक सत्यापन नियमों के अनुरूप न होने के कारण यह अनुरोध अस्वीकृत किया गया है।'}
                  </Text>
                </View>
              )}

              {/* Bank Transfer Details */}
              <View style={s.card}>
                <Text style={s.cardHeading}>बैंक खाता विवरण (Payout Bank Details)</Text>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>बैंक का नाम:</Text>
                  <Text style={s.infoValue}>{bankDetails.bankName || '—'}</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>शाखा (Branch):</Text>
                  <Text style={s.infoValue}>{bankDetails.branchName || '—'}</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>खाता धारक (Name):</Text>
                  <Text style={s.infoValue}>{bankDetails.holderName || request?.beneficiaryName || '—'}</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>खाता संख्या (Acc No):</Text>
                  <Text style={s.infoValue}>{maskAccNo(bankDetails.accountNumber)}</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>IFSC Code:</Text>
                  <Text style={[s.infoValue, { textTransform: 'uppercase' }]}>{bankDetails.ifsc || '—'}</Text>
                </View>
                {Boolean(bankDetails.upiId) && (
                  <View style={s.infoRow}>
                    <Text style={s.infoLabel}>UPI ID:</Text>
                    <Text style={s.infoValue}>{bankDetails.upiId}</Text>
                  </View>
                )}
              </View>

              {/* Purpose / Reason */}
              <View style={s.card}>
                <Text style={s.cardHeading}>निकासी का कारण (Purpose / Reason)</Text>
                <Text style={s.reasonText}>{reason}</Text>
              </View>

              {/* Action: Cancel request if pending */}
              {isPending && (
                <TouchableOpacity
                  style={s.cancelActionBtn}
                  onPress={() => setConfirmCancelVisible(true)}
                  disabled={cancelling}
                  activeOpacity={0.8}
                >
                  {cancelling ? (
                    <ActivityIndicator color="#DC2626" size="small" />
                  ) : (
                    <>
                      <MaterialIcon name="close-circle-outline" size={18} color="#DC2626" />
                      <Text style={s.cancelActionBtnText}>अनुरोध रद्द करें (Cancel Request)</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <View style={{ height: 30 }} />
            </ScrollView>
          )}
        </View>
      </View>

      {/* Cancel Confirmation Alert Modal */}
      <Modal visible={confirmCancelVisible} transparent animationType="fade">
        <View style={s.alertOverlay}>
          <View style={s.alertBox}>
            <View style={s.alertIconCircle}>
              <MaterialIcon name="alert-outline" size={32} color="#DC2626" />
            </View>
            <Text style={s.alertTitle}>निकासी अनुरोध रद्द करें?</Text>
            <Text style={s.alertDesc}>
              क्या आप सचमुच ₹{amount.toLocaleString('en-IN')} का यह निकासी अनुरोध रद्द करना चाहते हैं? रद्द करने पर यह राशि आपके खाते में वापस उपलब्ध हो जाएगी।
            </Text>
            <View style={s.alertBtnRow}>
              <TouchableOpacity
                style={s.alertCancelBtn}
                onPress={() => setConfirmCancelVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={s.alertCancelText}>वापस जाएँ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.alertConfirmBtn}
                onPress={handleCancelConfirm}
                activeOpacity={0.8}
              >
                <Text style={s.alertConfirmText}>हाँ, रद्द करें</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    padding: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    padding: 20,
  },
  heroCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroAmountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
    maxWidth: '65%',
    textAlign: 'right',
  },
  reasonText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
  },
  timeline: {
    paddingLeft: 6,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineInfo: {
    marginLeft: 12,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  timelineTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginLeft: 10,
    marginVertical: 3,
  },
  approvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
    marginTop: 6,
  },
  cancelActionBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  alertIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  alertBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  alertCancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  alertConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  alertConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
