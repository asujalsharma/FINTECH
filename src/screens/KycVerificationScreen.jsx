import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
  StatusBar,
  BackHandler,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
import Toast from 'react-native-toast-message';
import { getData, postData } from '../API';
import CustomAlertModal from '../components/CustomAlertModal';

const PRIMARY_COLOR = '#471d7d';
const SUCCESS_COLOR = '#16a34a';
const PENDING_COLOR = '#ea580c';

export default function KycVerificationScreen({ route }) {
  const navigation = useNavigation();
  const nextScreen = route?.params?.nextScreen || 'CreatePassword';
  const email = route?.params?.email || '';

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [kycData, setKycData] = useState({
    kycAadhaarStatus: 'pending',
    kycPanStatus: 'pending',
    kycComplete: false,
    kycAadhaarName: '',
    kycAadhaarUid: '',
    kycAadhaarDob: '',
    kycAadhaarGender: '',
    kycPanNumber: '',
    kycPanName: '',
  });

  // Aadhaar flow state
  const [initiatingAadhaar, setInitiatingAadhaar] = useState(false);
  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);
  const [digilockerUrl, setDigilockerUrl] = useState('');
  const [showWebviewModal, setShowWebviewModal] = useState(false);
  const [activeVerificationId, setActiveVerificationId] = useState('');
  const [activeReferenceId, setActiveReferenceId] = useState('');

  // PAN flow state
  const [panNumber, setPanNumber] = useState('');
  const [verifyingPan, setVerifyingPan] = useState(false);

  // Custom Alert / Notice modal state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'notice',
  });

  const showAlert = (title, message, type = 'notice') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Prevent hardware back button until KYC is complete if user is blocked from dashboard
  useEffect(() => {
    const backAction = () => {
      if (!kycData.kycComplete) {
        showAlert(
          'KYC Required',
          'Please complete your Aadhaar and PAN verification to continue to your dashboard.',
          'warning'
        );
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [kycData.kycComplete]);

  // Fetch initial KYC status
  const fetchKycStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await getData('/api/ekyc/status');
      if (res && (res.Status || res.kycAadhaarStatus !== undefined)) {
        setKycData({
          kycAadhaarStatus: res.kycAadhaarStatus || 'pending',
          kycPanStatus: res.kycPanStatus || 'pending',
          kycComplete: !!res.kycComplete,
          kycAadhaarName: res.kycAadhaarName || '',
          kycAadhaarUid: res.kycAadhaarUid || '',
          kycAadhaarDob: res.kycAadhaarDob || '',
          kycAadhaarGender: res.kycAadhaarGender || '',
          kycPanNumber: res.kycPanNumber || '',
          kycPanName: res.kycPanName || '',
        });

        if (res.kycPanNumber) {
          setPanNumber(res.kycPanNumber);
        }
      }
    } catch (err) {
      console.log('Error fetching KYC status:', err?.response?.data || err.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  // ----------------------------------------------------
  // AADHAAR DIGILOCKER INITIATION
  // ----------------------------------------------------
  const handleInitiateAadhaar = async () => {
    try {
      setInitiatingAadhaar(true);
      const res = await postData('/api/ekyc/initiate-aadhaar');

      if (res?.Status && res?.url) {
        setDigilockerUrl(res.url);
        setActiveVerificationId(res.verification_id);
        setActiveReferenceId(res.reference_id);
        setShowWebviewModal(true);
      } else {
        showAlert('Error', res?.Remarks || 'Failed to initiate Aadhaar verification.', 'error');
      }
    } catch (err) {
      console.error('Initiate Aadhaar error:', err?.response?.data || err.message);
      showAlert(
        'Error',
        err?.response?.data?.Remarks || 'Unable to connect to DigiLocker service. Please try again.',
        'error'
      );
    } finally {
      setInitiatingAadhaar(false);
    }
  };

  // ----------------------------------------------------
  // AADHAAR DOCUMENT VERIFICATION
  // ----------------------------------------------------
  const handleVerifyAadhaarDoc = async (vId, rId) => {
    try {
      setVerifyingAadhaar(true);
      const res = await postData('/api/ekyc/verify-aadhaar', {
        verification_id: vId || activeVerificationId,
        reference_id: rId || activeReferenceId,
      });

      if (res?.Status && res?.kycAadhaarStatus === 'verified') {
        Toast.show({
          type: 'success',
          text1: 'Aadhaar Verified',
          text2: `Verified successfully for ${res.name || 'user'}`,
        });
        setShowWebviewModal(false);
        fetchKycStatus();
      } else {
        showAlert(
          'Verification Failed',
          res?.Remarks || 'Aadhaar details could not be verified. Please retry DigiLocker.',
          'error'
        );
      }
    } catch (err) {
      console.error('Verify Aadhaar doc error:', err?.response?.data || err.message);
      showAlert(
        'Verification Incomplete',
        err?.response?.data?.Remarks || 'Please complete DigiLocker authentication before verifying.',
        'warning'
      );
    } finally {
      setVerifyingAadhaar(false);
    }
  };

  // WebView navigation state check for DigiLocker completion
  const handleWebviewNavigation = state => {
    const url = state?.url || '';
    console.log('DigiLocker WebView URL:', url);

    if (
      url.includes('/kyc/aadhaar-callback') ||
      url.includes('status=Success') ||
      url.includes('aadhaar-callback') ||
      url.includes('digilocker_success')
    ) {
      // Returned from DigiLocker callback
      setShowWebviewModal(false);
      handleVerifyAadhaarDoc(activeVerificationId, activeReferenceId);
    }
  };

  // ----------------------------------------------------
  // PAN CARD VERIFICATION
  // ----------------------------------------------------
  const handleVerifyPan = async () => {
    const cleanPan = panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!cleanPan) {
      showAlert('Required', 'Please enter your 10-digit PAN card number.', 'warning');
      return;
    }

    if (!panRegex.test(cleanPan)) {
      showAlert('Invalid PAN', 'PAN must be in standard 10-character format (e.g. ABCDE1234F).', 'warning');
      return;
    }

    try {
      setVerifyingPan(true);
      const res = await postData('/api/ekyc/verify-pan', { pan: cleanPan });

      if (res?.Status && res?.kycPanStatus === 'verified') {
        Toast.show({
          type: 'success',
          text1: 'PAN Verified',
          text2: `Verified for ${res.registeredName || cleanPan}`,
        });
        fetchKycStatus();
      } else {
        showAlert('Verification Failed', res?.Remarks || 'Could not verify PAN number. Please check and retry.', 'error');
      }
    } catch (err) {
      console.error('Verify PAN error:', err?.response?.data || err.message);
      showAlert(
        'PAN Verification Failed',
        err?.response?.data?.Remarks || 'Invalid PAN number or verification failed. Please try again.',
        'error'
      );
    } finally {
      setVerifyingPan(false);
    }
  };

  // ----------------------------------------------------
  // PROCEED TO MPIN / DASHBOARD
  // ----------------------------------------------------
  const handleProceed = () => {
    if (!kycData.kycComplete && !(kycData.kycAadhaarStatus === 'verified' && kycData.kycPanStatus === 'verified')) {
      showAlert('KYC Incomplete', 'Please verify both your Aadhaar and PAN cards to continue.', 'warning');
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'KYC Verified ✅',
      text2: nextScreen === 'CreatePassword' ? 'Please set your 4-digit MPIN' : 'Welcome to AydsPay!',
    });

    if (nextScreen === 'CreatePassword') {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'CreatePassword', params: { email } }],
        })
      );
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );
    }
  };

  const isAadhaarDone = kycData.kycAadhaarStatus === 'verified';
  const isPanDone = kycData.kycPanStatus === 'verified';
  const isBothDone = isAadhaarDone && isPanDone;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>KYC Verification</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          As per regulations, verify your Aadhaar & PAN to activate your account and access the dashboard.
        </Text>

        {/* Progress Tracker */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: isBothDone ? '100%' : isAadhaarDone || isPanDone ? '50%' : '15%' },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {isBothDone ? '2 of 2 Verified ✅' : isAadhaarDone || isPanDone ? '1 of 2 Verified' : '0 of 2 Verified'}
          </Text>
        </View>
      </View>

      {loadingStatus ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Checking verification status...</Text>
        </View>
      ) : (
        <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* ========================================= */}
          {/* CARD 1: AADHAAR VERIFICATION (DIGILOCKER) */}
          {/* ========================================= */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.iconCircle, isAadhaarDone && styles.iconCircleSuccess]}>
                  <Icon
                    name={isAadhaarDone ? 'verified' : 'fingerprint'}
                    size={24}
                    color={isAadhaarDone ? SUCCESS_COLOR : PRIMARY_COLOR}
                  />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.cardTitle}>Aadhaar Verification</Text>
                  <Text style={styles.cardSubtitle}>Government DigiLocker Gateway</Text>
                </View>
              </View>

              <View style={[styles.statusBadge, isAadhaarDone ? styles.badgeSuccess : styles.badgePending]}>
                <Text style={[styles.statusBadgeText, isAadhaarDone ? styles.textSuccess : styles.textPending]}>
                  {isAadhaarDone ? 'VERIFIED' : 'PENDING'}
                </Text>
              </View>
            </View>

            {isAadhaarDone ? (
              <View style={styles.verifiedDetailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{kycData.kycAadhaarName || 'Verified User'}</Text>
                </View>
                {kycData.kycAadhaarUid ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Aadhaar UID:</Text>
                    <Text style={styles.detailValue}>{kycData.kycAadhaarUid}</Text>
                  </View>
                ) : null}
                {kycData.kycAadhaarDob ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>DOB / Gender:</Text>
                    <Text style={styles.detailValue}>
                      {kycData.kycAadhaarDob} {kycData.kycAadhaarGender ? `(${kycData.kycAadhaarGender})` : ''}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.actionBox}>
                <Text style={styles.descriptionText}>
                  Verify instantly using DigiLocker. No need to upload paper documents.
                </Text>

                <TouchableOpacity
                  style={[styles.primaryBtn, initiatingAadhaar && { opacity: 0.7 }]}
                  onPress={handleInitiateAadhaar}
                  disabled={initiatingAadhaar}
                >
                  {initiatingAadhaar ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="lock-open" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.btnText}>Verify with DigiLocker</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ========================================= */}
          {/* CARD 2: PAN CARD VERIFICATION */}
          {/* ========================================= */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.iconCircle, isPanDone && styles.iconCircleSuccess]}>
                  <Icon
                    name={isPanDone ? 'verified' : 'credit-card'}
                    size={24}
                    color={isPanDone ? SUCCESS_COLOR : PRIMARY_COLOR}
                  />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.cardTitle}>PAN Verification</Text>
                  <Text style={styles.cardSubtitle}>NSDL / Income Tax Database</Text>
                </View>
              </View>

              <View style={[styles.statusBadge, isPanDone ? styles.badgeSuccess : styles.badgePending]}>
                <Text style={[styles.statusBadgeText, isPanDone ? styles.textSuccess : styles.textPending]}>
                  {isPanDone ? 'VERIFIED' : 'PENDING'}
                </Text>
              </View>
            </View>

            {isPanDone ? (
              <View style={styles.verifiedDetailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Registered Name:</Text>
                  <Text style={styles.detailValue}>{kycData.kycPanName || 'Verified User'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PAN Number:</Text>
                  <Text style={[styles.detailValue, { fontWeight: '700' }]}>{kycData.kycPanNumber || panNumber}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.actionBox}>
                <Text style={styles.descriptionText}>
                  Enter your 10-character Permanent Account Number (PAN) to verify.
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. ABCDE1234F"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="characters"
                    maxLength={10}
                    value={panNumber}
                    onChangeText={text => setPanNumber(text.toUpperCase())}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, verifyingPan && { opacity: 0.7 }]}
                  onPress={handleVerifyPan}
                  disabled={verifyingPan}
                >
                  {verifyingPan ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.btnText}>Verify PAN Card</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ========================================= */}
          {/* FINAL PROCEED BUTTON */}
          {/* ========================================= */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[styles.proceedBtn, !isBothDone && styles.proceedBtnDisabled]}
              onPress={handleProceed}
              disabled={!isBothDone}
            >
              <Text style={styles.proceedBtnText}>
                {isBothDone
                  ? nextScreen === 'CreatePassword'
                    ? 'PROCEED TO SET MPIN'
                    : 'CONTINUE TO DASHBOARD'
                  : 'COMPLETE BOTH STEPS TO CONTINUE'}
              </Text>
              {isBothDone && <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>

            {!isBothDone && (
              <Text style={styles.footerHelpText}>
                🔒 Dashboard access is locked until both Aadhaar and PAN are verified.
              </Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* ========================================= */}
      {/* DIGILOCKER WEBVIEW MODAL */}
      {/* ========================================= */}
      <Modal visible={showWebviewModal} animationType="slide" onRequestClose={() => setShowWebviewModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalHeaderTitle}>DigiLocker Verification</Text>
              <Text style={styles.modalHeaderSubtitle}>Sign in to verify your Aadhaar</Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowWebviewModal(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {digilockerUrl ? (
            <WebView
              source={{ uri: digilockerUrl }}
              onNavigationStateChange={handleWebviewNavigation}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webviewLoader}>
                  <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                  <Text style={{ marginTop: 10, color: '#666' }}>Loading DigiLocker...</Text>
                </View>
              )}
            />
          ) : null}

          {/* Bottom manual confirmation button in case webhook/redirect is delayed */}
          <View style={styles.modalBottomBar}>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={() => handleVerifyAadhaarDoc(activeVerificationId, activeReferenceId)}
              disabled={verifyingAadhaar}
            >
              {verifyingAadhaar ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalConfirmText}>I Have Completed DigiLocker Authorization</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Custom Alert / Notice Popup Modal */}
      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 18,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 18,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginTop: 6,
    textAlign: 'right',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleSuccess: {
    backgroundColor: '#dcfce7',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePending: {
    backgroundColor: '#ffedd5',
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textPending: {
    color: PENDING_COLOR,
  },
  textSuccess: {
    color: SUCCESS_COLOR,
  },
  actionBox: {
    marginTop: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  inputContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  textInput: {
    height: 48,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 1.5,
  },
  primaryBtn: {
    backgroundColor: PRIMARY_COLOR,
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  verifiedDetailsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  proceedBtn: {
    backgroundColor: PRIMARY_COLOR,
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  proceedBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  proceedBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerHelpText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  modalCloseBtn: {
    padding: 6,
  },
  webviewLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBottomBar: {
    padding: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalConfirmBtn: {
    backgroundColor: SUCCESS_COLOR,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

