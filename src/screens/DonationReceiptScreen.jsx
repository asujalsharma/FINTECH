import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Share,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { getData, postData } from '../API';

// ─── Number to Words (Indian System) Helper ────────────────────────────────────
function numberToWords(num) {
  const safeNum = Math.round(Number(num) || 0);
  if (safeNum <= 0) return 'Zero Rupees';

  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + safeNum).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return `${safeNum} Rupees`;
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() ? `${str.trim()} Rupees Only` : 'Zero Rupees';
}

export default function DonationReceiptScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const passedReceipt = route.params?.receipt;
  const orderId =
    route.params?.orderId ||
    route.params?.receiptNumberOrOrderId ||
    passedReceipt?.orderId ||
    passedReceipt?.receiptNumber;
  const paymentUrl = route.params?.paymentUrl;

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // ─── STRICT VERIFICATION HELPER ───────────────────────────────────────────────
  // Evaluates response against mandatory criteria:
  // 1. isPaid === true
  // 2. paymentStatus === 'success'
  // 3. receiptNumber is present
  const parseAndEvaluate = useCallback((rawResponse) => {
    if (!rawResponse) return { success: false, data: null };
    const data =
      rawResponse?.Data ||
      rawResponse?.data?.Data ||
      rawResponse?.data ||
      rawResponse;

    const isPaid =
      data?.isPaid === true ||
      rawResponse?.Data?.isPaid === true ||
      rawResponse?.data?.Data?.isPaid === true;

    const paymentStatus = String(
      data?.paymentStatus ||
      rawResponse?.Data?.paymentStatus ||
      data?.status ||
      ''
    ).toLowerCase();

    const receiptNumber =
      data?.receiptNumber ||
      data?.receiptNo ||
      rawResponse?.Data?.receiptNumber;

    if (isPaid === true && paymentStatus === 'success' && Boolean(receiptNumber)) {
      return {
        success: true,
        data: {
          ...data,
          isPaid: true,
          paymentStatus: 'success',
          receiptNumber: String(receiptNumber),
        },
      };
    }

    return {
      success: false,
      data: data || null,
    };
  }, []);

  // ─── PAYMENT STATUS VERIFICATION API CALL ─────────────────────────────────────
  const verifyPayment = useCallback(
    async (targetOrderId, isManualRefresh = false) => {
      if (!targetOrderId) {
        setIsVerified(false);
        setLoading(false);
        setChecking(false);
        return;
      }

      if (isManualRefresh) {
        setChecking(true);
      } else {
        setLoading(true);
      }

      try {
        let verified = false;
        let verifiedResult = null;

        // 1️⃣ Try GET /api/donation/receipt/:orderId
        try {
          const getRes = await getData(`/api/donation/receipt/${targetOrderId}`);
          const parsed = parseAndEvaluate(getRes);
          if (parsed.success) {
            verified = true;
            verifiedResult = parsed.data;
          } else if (parsed.data) {
            verifiedResult = parsed.data;
          }
        } catch (getErr) {
          console.log('GET /api/donation/receipt/:orderId error:', getErr?.message);
        }

        // 2️⃣ If not verified yet, call POST /api/donation/verify with { orderId }
        if (!verified) {
          try {
            const verifyRes = await postData('/api/donation/verify', {
              orderId: targetOrderId,
            });
            const parsed = parseAndEvaluate(verifyRes);
            if (parsed.success) {
              verified = true;
              verifiedResult = parsed.data;
            } else if (parsed.data) {
              verifiedResult = parsed.data;
            }
          } catch (postErr) {
            console.log('POST /api/donation/verify error:', postErr?.message);
          }
        }

        // 3️⃣ Enforce strict verification rules
        if (verified && verifiedResult?.receiptNumber) {
          setReceiptData(verifiedResult);
          setIsVerified(true);
          if (isManualRefresh) {
            Toast.show({
              type: 'success',
              text1: 'भुगतान सत्यापित! 🙏',
              text2: 'दान भुगतान सफल रहा। 80G रसीद तैयार है।',
            });
          }
        } else {
          setIsVerified(false);
          if (verifiedResult) {
            setReceiptData(prev => ({ ...(prev || {}), ...verifiedResult }));
          }
          if (isManualRefresh) {
            Toast.show({
              type: 'info',
              text1: 'भुगतान अभी भी लंबित है',
              text2: 'बैंक से पुष्टि होने पर स्थिति अपडेट हो जाएगी।',
            });
          }
        }
      } catch (err) {
        console.log('Donation verification error:', err);
        setIsVerified(false);
        if (isManualRefresh) {
          Toast.show({
            type: 'error',
            text1: 'सत्यापन विफल',
            text2: 'सर्वर से संपर्क नहीं हो सका। कृपया बाद में प्रयास करें।',
          });
        }
      } finally {
        setLoading(false);
        setChecking(false);
      }
    },
    [parseAndEvaluate]
  );

  // ─── INITIAL VERIFICATION ON MOUNT ───────────────────────────────────────────
  useEffect(() => {
    // If passedReceipt already has confirmed backend data, check it first
    if (passedReceipt) {
      const parsedPassed = parseAndEvaluate(passedReceipt);
      if (parsedPassed.success) {
        setReceiptData(parsedPassed.data);
        setIsVerified(true);
        setLoading(false);
        return;
      }
    }

    if (orderId) {
      verifyPayment(orderId, false);
    } else {
      setIsVerified(false);
      setLoading(false);
    }
  }, [orderId, passedReceipt, parseAndEvaluate, verifyPayment]);

  // Fallback values for display
  const rawAmount = Number(
    receiptData?.amount || route.params?.amount || passedReceipt?.amount || 2100
  );
  const donorName =
    receiptData?.donorName || route.params?.donorName || passedReceipt?.donorName || 'Generous Donor';
  const donorPan =
    receiptData?.donorPan || route.params?.donorPan || passedReceipt?.donorPan || '—';
  const donorPhone =
    receiptData?.donorPhone || route.params?.donorPhone || passedReceipt?.donorPhone || '—';
  const vivahId =
    receiptData?.vivahSahayogId || route.params?.vivahSahayogId || passedReceipt?.vivahSahayogId;

  const dateStr = receiptData?.createdAt
    ? new Date(receiptData.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  // ─── SHARE RECEIPT ────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!isVerified || !receiptData?.receiptNumber) return;
    try {
      const shareMessage = `🙏 *SARVANA VIVAH SAHAYOG FOUNDATION*
Section 80G NGO Donation Receipt
---------------------------------------
Receipt No: ${receiptData.receiptNumber}
Date: ${dateStr}
Donor Name: ${donorName}
${donorPan !== '—' ? `PAN: ${donorPan}\n` : ''}Amount: ₹${rawAmount.toLocaleString('en-IN')} (${numberToWords(rawAmount)})
Beneficiary: ${vivahId ? `Girl Child ID (${vivahId})` : 'General NGO Wedding Fund'}
Status: Verified & Tax Deductible (Sec 80G)
---------------------------------------
Thank you for your generous contribution in supporting daughter weddings!`;

      await Share.share({
        title: `80G Donation Receipt - ${receiptData.receiptNumber}`,
        message: shareMessage,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  // ─── RETRY PAYMENT / PAY NOW ──────────────────────────────────────────────────
  const handleRetryPayment = async () => {
    if (paymentUrl) {
      try {
        const canOpen = await Linking.canOpenURL(paymentUrl);
        if (canOpen) {
          await Linking.openURL(paymentUrl);
          return;
        }
      } catch (e) {
        console.log('Open paymentUrl failed:', e);
      }
    }
    // Redirect back to DonationScreen to re-initiate
    navigation.navigate('DonationScreen', {
      amount: rawAmount,
      vivahSahayogId: vivahId,
      donorName: donorName !== 'Generous Donor' ? donorName : undefined,
      donorPhone: donorPhone !== '—' ? donorPhone : undefined,
      donorPan: donorPan !== '—' ? donorPan : undefined,
    });
  };

  // ─── CHECK STATUS AGAIN ───────────────────────────────────────────────────────
  const handleCheckAgain = () => {
    if (checking) return;
    verifyPayment(orderId, true);
  };

  // ─── BACK TO HOME ─────────────────────────────────────────────────────────────
  const handleBackToHome = () => {
    navigation.navigate('SahayogHome');
  };

  // ─── RENDER LOADING ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={s.header}>
          <TouchableOpacity onPress={handleBackToHome} style={s.backBtn} activeOpacity={0.7}>
            <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>भुगतान स्थिति (Payment Status)</Text>
          <View style={s.headerSpacer} />
        </View>
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color="#D81B60" />
          <Text style={s.loadingTitle}>भुगतान स्थिति जांची जा रही है...</Text>
          <Text style={s.loadingSub}>Verifying donation payment with bank servers</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── RENDER PAYMENT INCOMPLETE / PENDING SCREEN ───────────────────────────────
  if (!isVerified || !receiptData?.receiptNumber) {
    return (
      <SafeAreaView style={s.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={handleBackToHome} style={s.backBtn} activeOpacity={0.7}>
            <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>भुगतान स्थिति (Payment Status)</Text>
          <View style={s.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Incomplete / Pending Hero Card */}
          <View style={s.pendingCard}>
            <View style={s.pendingIconCircle}>
              <MaterialIcon name="clock-alert-outline" size={48} color="#D97706" />
            </View>

            <Text style={s.pendingHeading}>Donation Payment Incomplete</Text>
            <Text style={s.pendingHindiHeading}>दान भुगतान अपूर्ण / लंबित</Text>

            <Text style={s.pendingSubtitle}>
              We did not receive confirmation for this payment. If money was debited, it will be updated once confirmed by your bank.
            </Text>

            <View style={s.dashedDivider} />

            {/* Transaction Summary Details */}
            <View style={s.detailsTable}>
              <View style={s.detailRow}>
                <Text style={s.dLabel}>Order ID / संदर्भ सं.:</Text>
                <Text style={[s.dValue, s.monoText]}>{orderId || 'TXN-ONLINE'}</Text>
              </View>

              <View style={s.detailRow}>
                <Text style={s.dLabel}>Donation Amount:</Text>
                <Text style={[s.dValue, s.amountPendingVal]}>
                  ₹{rawAmount.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={s.detailRow}>
                <Text style={s.dLabel}>Beneficiary:</Text>
                <Text style={s.dValue}>
                  {vivahId ? `Girl Child ID (${vivahId})` : 'General Wedding Fund'}
                </Text>
              </View>

              <View style={s.detailRow}>
                <Text style={s.dLabel}>Status (स्थिति):</Text>
                <View style={s.pendingBadge}>
                  <MaterialIcon name="clock-outline" size={13} color="#B45309" />
                  <Text style={s.pendingBadgeText}>PAYMENT PENDING</Text>
                </View>
              </View>
            </View>

            {/* Advisory Info Box */}
            <View style={s.infoNoticeBox}>
              <FeatherIcon name="info" size={16} color="#0284C7" style={s.infoNoticeIcon} />
              <Text style={s.infoNoticeText}>
                बैंक से पुष्टि प्राप्त होने में कभी-कभी 2 से 5 मिनट का समय लग सकता है। पुष्टि होने पर आपकी 80G टैक्स रसीद 'सहयोग खाता' में स्वतः उपलब्ध हो जाएगी।
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={s.btnCol}>
            {/* 1. Retry Payment / Pay Now */}
            <TouchableOpacity
              style={s.retryBtn}
              onPress={handleRetryPayment}
              activeOpacity={0.88}
            >
              <MaterialIcon name="credit-card-fast-outline" size={20} color="#FFFFFF" />
              <Text style={s.retryBtnText}>Retry Payment / Pay Now (पुनः भुगतान करें)</Text>
            </TouchableOpacity>

            {/* 2. Check Status Again */}
            <TouchableOpacity
              style={s.checkAgainBtn}
              onPress={handleCheckAgain}
              disabled={checking}
              activeOpacity={0.88}
            >
              {checking ? (
                <>
                  <ActivityIndicator size="small" color="#B45309" />
                  <Text style={s.checkAgainText}>स्थिति जांची जा रही है...</Text>
                </>
              ) : (
                <>
                  <FeatherIcon name="refresh-cw" size={17} color="#B45309" />
                  <Text style={s.checkAgainText}>Check Status Again (स्थिति पुनः जांचें)</Text>
                </>
              )}
            </TouchableOpacity>

            {/* 3. Back to Home */}
            <TouchableOpacity
              style={s.homeBtn}
              onPress={handleBackToHome}
              activeOpacity={0.88}
            >
              <FeatherIcon name="home" size={16} color="#64748B" />
              <Text style={s.homeBtnText}>Back to Home (मुख्य पृष्ठ पर वापस जाएं)</Text>
            </TouchableOpacity>
          </View>

          <View style={s.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── RENDER OFFICIAL 80G TAX EXEMPTION RECEIPT SCREEN ─────────────────────────
  // Strictly rendered ONLY when data.paymentStatus === 'success' && data.receiptNumber
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={handleBackToHome}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>80G दान रसीद (Donation Receipt)</Text>
        <TouchableOpacity onPress={handleShare} style={s.shareBtn} activeOpacity={0.7}>
          <FeatherIcon name="share-2" size={20} color="#D81B60" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── Formal Printable 80G Receipt Card ─── */}
        <View style={s.receiptCard}>
          {/* Top Ornamental Band */}
          <View style={s.ornamentBand}>
            <View style={s.ornamentDot} />
            <Text style={s.ornamentText}>OFFICIAL 80G TAX EXEMPTION RECEIPT</Text>
            <View style={s.ornamentDot} />
          </View>

          {/* NGO Header */}
          <View style={s.ngoHeader}>
            <View style={s.ngoLogoCircle}>
              <FontAwesome5 name="hands-helping" size={22} color="#D81B60" />
            </View>
            <Text style={s.ngoName}>Sarvana Vivah Sahayog Foundation</Text>
            <Text style={s.ngoReg}>Regd. Public Charitable Trust • NITI Aayog NGO Darpan</Text>
            <Text style={s.ngo80G}>
              Eligible for 50% Tax Deduction under Section 80G of Income Tax Act 1961
            </Text>
            <Text style={s.ngoCert}>80G Order No: VSF/80G/2026/A124 • PAN: AAATS1234F</Text>
          </View>

          <View style={s.dashedDivider} />

          {/* Receipt Metadata */}
          <View style={s.metaRow}>
            <View style={s.flex1}>
              <Text style={s.metaLabel}>Receipt Number</Text>
              <Text style={s.metaVal}>{receiptData.receiptNumber}</Text>
            </View>
            <View style={s.alignRight}>
              <Text style={s.metaLabel}>Date of Donation</Text>
              <Text style={s.metaVal}>{dateStr}</Text>
            </View>
          </View>

          {/* Amount Box */}
          <View style={s.amountCard}>
            <Text style={s.amountLabel}>Donation Amount (दान राशि)</Text>
            <Text style={s.amountFigure}>₹{rawAmount.toLocaleString('en-IN')}</Text>
            <Text style={s.amountWords}>{numberToWords(rawAmount)}</Text>
          </View>

          {/* Details Table */}
          <View style={s.detailsTable}>
            <View style={s.detailRow}>
              <Text style={s.dLabel}>Donor Name:</Text>
              <Text style={s.dValue}>{donorName}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.dLabel}>Mobile Number:</Text>
              <Text style={s.dValue}>{donorPhone}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.dLabel}>Donor PAN (for 80G):</Text>
              <Text style={[s.dValue, donorPan !== '—' ? s.panPresent : s.panNone]}>
                {donorPan}
              </Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.dLabel}>Beneficiary:</Text>
              <Text style={s.dValue}>
                {vivahId ? `Specific Girl Child (${vivahId})` : 'General NGO Wedding Fund'}
              </Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.dLabel}>Payment Ref / Order ID:</Text>
              <Text style={[s.dValue, s.monoText]}>
                {receiptData?.orderId || orderId || 'TXN-ONLINE'}
              </Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.dLabel}>Payment Status:</Text>
              <View style={s.verifiedBadge}>
                <MaterialIcon name="check-decagram" size={14} color="#059669" />
                <Text style={s.verifiedText}>PAID & VERIFIED</Text>
              </View>
            </View>
          </View>

          <View style={s.dashedDivider} />

          {/* Seal & Authorized Signatory */}
          <View style={s.footerSignRow}>
            <View style={s.sealBadge}>
              <MaterialIcon name="seal" size={24} color="#B45309" />
              <Text style={s.sealText}>OFFICIAL{'\n'}NGO SEAL</Text>
            </View>
            <View style={s.signCol}>
              <Text style={s.signText}>Authorized Signatory</Text>
              <Text style={s.signSub}>Sarvana Vivah Sahayog Foundation</Text>
              <Text style={s.computerNotice}>Computer generated digital receipt</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={s.btnCol}>
          <TouchableOpacity
            style={s.shareActionBtn}
            onPress={handleShare}
            activeOpacity={0.88}
          >
            <FeatherIcon name="share-2" size={18} color="#FFF" />
            <Text style={s.shareActionText}>रसीद शेयर करें (Share / Print 80G Receipt)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.donateAgainBtn}
            onPress={() => navigation.navigate('DonationScreen')}
            activeOpacity={0.88}
          >
            <FontAwesome5 name="heart" size={15} color="#D81B60" solid />
            <Text style={s.donateAgainText}>अन्य सहयोग करें (Donate Again)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.homeBtn}
            onPress={handleBackToHome}
            activeOpacity={0.88}
          >
            <FeatherIcon name="home" size={16} color="#64748B" />
            <Text style={s.homeBtnText}>मुख्य पृष्ठ पर वापस जाएं</Text>
          </TouchableOpacity>
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  shareBtn: { padding: 6, backgroundColor: '#FFF0F5', borderRadius: 8 },
  scroll: { padding: 16 },

  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginTop: 14 },
  loadingSub: { fontSize: 12, color: '#64748B', marginTop: 4, textAlign: 'center' },

  /* ─── PENDING / INCOMPLETE CARD ─── */
  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  pendingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pendingHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#92400E',
    textAlign: 'center',
  },
  pendingHindiHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 2,
    textAlign: 'center',
  },
  pendingSubtitle: {
    fontSize: 12.5,
    color: '#475569',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingBadgeText: { fontSize: 10.5, fontWeight: '800', color: '#B45309' },
  infoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    width: '100%',
  },
  infoNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#0369A1',
    lineHeight: 16,
    fontWeight: '500',
  },

  /* ─── RECEIPT CARD ─── */
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginBottom: 20,
  },
  ornamentBand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14,
  },
  ornamentDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#B45309' },
  ornamentText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.8,
  },

  ngoHeader: { alignItems: 'center', marginBottom: 12 },
  ngoLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  ngoName: { fontSize: 16.5, fontWeight: '900', color: '#1E293B', textAlign: 'center' },
  ngoReg: { fontSize: 11, color: '#64748B', marginTop: 2, textAlign: 'center' },
  ngo80G: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  ngoCert: { fontSize: 10, color: '#94A3B8', marginTop: 2, textAlign: 'center' },

  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 14,
    width: '100%',
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  metaVal: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginTop: 2 },

  amountCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  amountLabel: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  amountFigure: {
    fontSize: 26,
    fontWeight: '900',
    color: '#D81B60',
    marginVertical: 2,
  },
  amountWords: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  detailsTable: { width: '100%', marginTop: 6 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', flex: 1 },
  dValue: { fontSize: 12.5, fontWeight: '700', color: '#1E293B', textAlign: 'right', flex: 1.2 },
  monoText: { fontFamily: 'monospace', fontSize: 11 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: { fontSize: 10.5, fontWeight: '800', color: '#059669' },

  footerSignRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 10,
    padding: 6,
    backgroundColor: '#FFFDF9',
  },
  sealText: { fontSize: 9, fontWeight: '900', color: '#B45309', lineHeight: 11 },
  signCol: { alignItems: 'flex-end' },
  signText: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  signSub: { fontSize: 10, color: '#64748B', marginTop: 1 },
  computerNotice: { fontSize: 9, color: '#94A3B8', marginTop: 3, fontStyle: 'italic' },

  /* ─── BUTTONS ─── */
  btnCol: { gap: 10 },
  retryBtn: {
    backgroundColor: '#D81B60',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  retryBtnText: { color: '#FFF', fontSize: 14.5, fontWeight: '800' },

  checkAgainBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#B45309',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkAgainText: { color: '#B45309', fontSize: 14, fontWeight: '800' },

  shareActionBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
  },
  shareActionText: { color: '#FFF', fontSize: 14.5, fontWeight: '800' },

  donateAgainBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#D81B60',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  donateAgainText: { color: '#D81B60', fontSize: 14, fontWeight: '800' },

  homeBtn: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  homeBtnText: { color: '#64748B', fontSize: 13, fontWeight: '700' },

  headerSpacer: { width: 36 },
  amountPendingVal: { color: '#D81B60', fontSize: 16, fontWeight: '900' },
  infoNoticeIcon: { marginTop: 2 },
  bottomSpacer: { height: 30 },
  flex1: { flex: 1 },
  alignRight: { alignItems: 'flex-end' },
  panPresent: { color: '#059669' },
  panNone: { color: '#64748B' },
});
