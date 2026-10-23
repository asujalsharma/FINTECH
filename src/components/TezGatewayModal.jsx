import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Linking,
  AppState,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { checkTezGatewayOrder, openUpiApp } from '../services/tezGatewayService';

const POLL_INTERVAL = 3500; // 3.5 seconds
const MAX_POLL_TIMEOUT = 300000; // 5 minutes

export default function TezGatewayModal({
  visible,
  onClose,
  orderData,
  onSuccess,
  onFailed,
}) {
  const [activeTab, setActiveTab] = useState('apps'); // 'apps' | 'qr' | 'web'
  const [pollingStatus, setPollingStatus] = useState('POLLING'); // 'POLLING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT'
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isPollingRef = useRef(false);
  const pollTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const orderId = orderData?.orderId;
  const amount = orderData?.amount;
  const upiLinks = orderData?.upiLinks || {};
  const paymentUrl = orderData?.payment_url;

  // -------------------------------------------------------------
  // STOP POLLING
  // -------------------------------------------------------------
  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  // -------------------------------------------------------------
  // POLL FUNCTION
  // -------------------------------------------------------------
  const performStatusCheck = useCallback(async () => {
    if (!orderId || !isPollingRef.current) return;

    try {
      console.log(`[TezGateway] Checking order status for: ${orderId}`);
      const checkRes = await checkTezGatewayOrder(orderId);
      console.log('[TezGateway] Poll response:', checkRes);

      if (checkRes.isSuccess) {
        console.log('🎉 [TezGateway] Payment SUCCESS confirmed!');
        stopPolling();
        setPollingStatus('SUCCESS');
        setVerifiedResult(checkRes);

        // Give the user a brief celebratory moment before navigating/closing
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(checkRes);
          }
        }, 1200);
        return;
      }

      if (checkRes.isFailed) {
        console.log('❌ [TezGateway] Payment FAIL confirmed:', checkRes.rawTxnStatus);
        stopPolling();
        setPollingStatus('FAILED');
        setVerifiedResult(checkRes);
        if (onFailed) {
          onFailed(checkRes);
        }
        return;
      }

      // Check max duration (5 minutes)
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      if (elapsed >= MAX_POLL_TIMEOUT) {
        console.warn('⏱️ [TezGateway] Max polling timeout (5 mins) reached.');
        stopPolling();
        setPollingStatus('TIMEOUT');
        return;
      }

      // Schedule next poll
      if (isPollingRef.current) {
        pollTimerRef.current = setTimeout(performStatusCheck, POLL_INTERVAL);
      }
    } catch (err) {
      console.warn('[TezGateway] Status check error:', err?.message);
      // Still schedule next poll unless stopped
      if (isPollingRef.current) {
        pollTimerRef.current = setTimeout(performStatusCheck, POLL_INTERVAL);
      }
    }
  }, [orderId, stopPolling, onSuccess, onFailed]);

  // -------------------------------------------------------------
  // LIFECYCLE: START POLLING ON MODAL OPEN
  // -------------------------------------------------------------
  useEffect(() => {
    if (visible && orderId) {
      isPollingRef.current = true;
      setPollingStatus('POLLING');
      setVerifiedResult(null);
      setElapsedSeconds(0);
      startTimeRef.current = Date.now();

      // Start elapsed timer for user visibility
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);

      // Start polling loop
      pollTimerRef.current = setTimeout(performStatusCheck, 1500);
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [visible, orderId, performStatusCheck, stopPolling]);

  // -------------------------------------------------------------
  // APP STATE: Resume verification immediately when user returns from UPI app
  // -------------------------------------------------------------
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[TezGateway] App returned to foreground, checking status immediately...');
        if (visible && isPollingRef.current) {
          performStatusCheck();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [visible, performStatusCheck]);

  // -------------------------------------------------------------
  // USER CANCEL / CLOSE
  // -------------------------------------------------------------
  const handleClose = () => {
    if (pollingStatus === 'POLLING') {
      Alert.alert(
        'Cancel Payment?',
        'If you have already paid in your UPI app, please wait a few seconds for confirmation before exiting.',
        [
          { text: 'Wait', style: 'cancel' },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => {
              stopPolling();
              onClose();
            },
          },
        ],
      );
    } else {
      stopPolling();
      onClose();
    }
  };

  const formatTimer = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.gatewayBadge}>
                <Icon name="bolt" size={16} color="#059669" />
                <Text style={styles.gatewayBadgeText}>TEZGATEWAY UPI</Text>
              </View>
              <Text style={styles.title}>Complete Payment</Text>
              <Text style={styles.orderIdText}>Order #{orderId}</Text>
            </View>

            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>AMOUNT TO PAY</Text>
              <Text style={styles.amountValue}>₹{amount}</Text>
            </View>
          </View>

          {/* Success Overlay View */}
          {pollingStatus === 'SUCCESS' ? (
            <View style={styles.statusResultBox}>
              <View style={styles.successIconCircle}>
                <Icon name="check" size={48} color="#FFF" />
              </View>
              <Text style={styles.successTitle}>Payment Confirmed!</Text>
              <Text style={styles.successDesc}>
                ₹{amount} successfully received via TezGateway.
              </Text>
              {verifiedResult?.utr ? (
                <View style={styles.utrBadge}>
                  <Text style={styles.utrText}>UTR: {verifiedResult.utr}</Text>
                </View>
              ) : null}
              <ActivityIndicator
                size="small"
                color="#059669"
                style={{ marginTop: 16 }}
              />
              <Text style={styles.updatingText}>Updating wallet balance...</Text>
            </View>
          ) : pollingStatus === 'FAILED' ? (
            <View style={styles.statusResultBox}>
              <View style={styles.failedIconCircle}>
                <Icon name="close" size={48} color="#FFF" />
              </View>
              <Text style={styles.failedTitle}>Payment Failed</Text>
              <Text style={styles.failedDesc}>
                The payment could not be completed. Please try again or use another payment method.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  stopPolling();
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Close & Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Tab Selector */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'apps' && styles.tabItemActive]}
                  onPress={() => setActiveTab('apps')}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="phone-android"
                    size={18}
                    color={activeTab === 'apps' ? '#5f259f' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'apps' && styles.tabTextActive,
                    ]}
                  >
                    UPI Apps
                  </Text>
                </TouchableOpacity>

                {upiLinks.qr_image ? (
                  <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'qr' && styles.tabItemActive]}
                    onPress={() => setActiveTab('qr')}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name="qr-code-scanner"
                      size={18}
                      color={activeTab === 'qr' ? '#5f259f' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'qr' && styles.tabTextActive,
                      ]}
                    >
                      Scan QR
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {paymentUrl ? (
                  <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'web' && styles.tabItemActive]}
                    onPress={() => setActiveTab('web')}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name="language"
                      size={18}
                      color={activeTab === 'web' ? '#5f259f' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'web' && styles.tabTextActive,
                      ]}
                    >
                      Web Link
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Tab Content */}
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {activeTab === 'apps' && (
                  <View style={styles.appsList}>
                    <Text style={styles.sectionHeading}>
                      Tap your preferred UPI app to pay:
                    </Text>

                    {/* Google Pay */}
                    <TouchableOpacity
                      style={styles.appCard}
                      onPress={() =>
                        openUpiApp(
                          upiLinks.gpay_link || upiLinks.bhim_link,
                          'Google Pay',
                        )
                      }
                      activeOpacity={0.85}
                    >
                      <View style={[styles.appIconCircle, { backgroundColor: '#E8F0FE' }]}>
                        <MaterialIcon name="google" size={24} color="#5f259f" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.appName}>Google Pay</Text>
                        <Text style={styles.appSubtitle}>Instant & Direct UPI</Text>
                      </View>
                      <View style={styles.payChip}>
                        <Text style={styles.payChipText}>PAY ₹{amount}</Text>
                        <Icon name="chevron-right" size={18} color="#5f259f" />
                      </View>
                    </TouchableOpacity>

                    {/* PhonePe */}
                    <TouchableOpacity
                      style={styles.appCard}
                      onPress={() =>
                        openUpiApp(
                          upiLinks.phonepe_link || upiLinks.bhim_link,
                          'PhonePe',
                        )
                      }
                      activeOpacity={0.85}
                    >
                      <View style={[styles.appIconCircle, { backgroundColor: '#F3E8FF' }]}>
                        <MaterialIcon name="wallet" size={24} color="#6739B7" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.appName}>PhonePe</Text>
                        <Text style={styles.appSubtitle}>Fast UPI Checkout</Text>
                      </View>
                      <View style={[styles.payChip, { backgroundColor: '#F3E8FF' }]}>
                        <Text style={[styles.payChipText, { color: '#6739B7' }]}>
                          PAY ₹{amount}
                        </Text>
                        <Icon name="chevron-right" size={18} color="#6739B7" />
                      </View>
                    </TouchableOpacity>

                    {/* Paytm */}
                    <TouchableOpacity
                      style={styles.appCard}
                      onPress={() =>
                        openUpiApp(
                          upiLinks.paytm_link || upiLinks.bhim_link,
                          'Paytm',
                        )
                      }
                      activeOpacity={0.85}
                    >
                      <View style={[styles.appIconCircle, { backgroundColor: '#E0F2FE' }]}>
                        <MaterialIcon name="cellphone-check" size={24} color="#5f259f" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.appName}>Paytm UPI</Text>
                        <Text style={styles.appSubtitle}>Wallet & UPI</Text>
                      </View>
                      <View style={[styles.payChip, { backgroundColor: '#E0F2FE' }]}>
                        <Text style={[styles.payChipText, { color: '#5f259f' }]}>
                          PAY ₹{amount}
                        </Text>
                        <Icon name="chevron-right" size={18} color="#5f259f" />
                      </View>
                    </TouchableOpacity>

                    {/* BHIM / Other UPI */}
                    <TouchableOpacity
                      style={styles.appCard}
                      onPress={() =>
                        openUpiApp(
                          upiLinks.bhim_link || paymentUrl,
                          'BHIM / Other UPI',
                        )
                      }
                      activeOpacity={0.85}
                    >
                      <View style={[styles.appIconCircle, { backgroundColor: '#FEF3C7' }]}>
                        <Icon name="account-balance-wallet" size={24} color="#D97706" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.appName}>BHIM / Other UPI</Text>
                        <Text style={styles.appSubtitle}>CRED, Navi & Any UPI App</Text>
                      </View>
                      <View style={[styles.payChip, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.payChipText, { color: '#D97706' }]}>
                          PAY ₹{amount}
                        </Text>
                        <Icon name="chevron-right" size={18} color="#D97706" />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {activeTab === 'qr' && (
                  <View style={styles.qrContainer}>
                    <Text style={styles.qrTitle}>Scan to Pay ₹{amount}</Text>
                    <Text style={styles.qrSubtitle}>
                      Open any UPI app on another device and scan this QR code:
                    </Text>

                    <View style={styles.qrCard}>
                      {upiLinks.qr_image ? (
                        <Image
                          source={{
                            uri:
                              upiLinks.qr_image.startsWith('data:image') ||
                              upiLinks.qr_image.startsWith('http')
                                ? upiLinks.qr_image
                                : `data:image/png;base64,${upiLinks.qr_image}`,
                          }}
                          style={styles.qrImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.noQrPlaceholder}>
                          <Icon name="qr-code" size={60} color="#94A3B8" />
                          <Text style={{ color: '#64748B', marginTop: 8 }}>
                            QR Code not generated
                          </Text>
                        </View>
                      )}
                      <View style={styles.qrFooterPill}>
                        <Icon name="security" size={14} color="#059669" />
                        <Text style={styles.qrFooterPillText}>
                          Dynamic 1-time UPI QR
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {activeTab === 'web' && (
                  <View style={styles.webContainer}>
                    <Text style={styles.webTitle}>Checkout in Browser</Text>
                    <Text style={styles.webDesc}>
                      You can complete this payment on the official TezGateway secure payment page in your browser.
                    </Text>
                    <TouchableOpacity
                      style={styles.webLaunchBtn}
                      onPress={() => Linking.openURL(paymentUrl)}
                      activeOpacity={0.85}
                    >
                      <Icon name="open-in-browser" size={22} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.webLaunchBtnText}>Open TezGateway Portal</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>

              {/* Live Polling Status Footer */}
              <View style={styles.pollingFooter}>
                <View style={styles.pollingRow}>
                  <ActivityIndicator size="small" color="#5f259f" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pollingMainText}>
                      Waiting for payment confirmation...
                    </Text>
                    <Text style={styles.pollingSubText}>
                      Auto-checking status ({formatTimer(elapsedSeconds)} elapsed)
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.checkNowBtn}
                    onPress={performStatusCheck}
                    activeOpacity={0.7}
                  >
                    <Icon name="refresh" size={16} color="#5f259f" />
                    <Text style={styles.checkNowText}>Verify</Text>
                  </TouchableOpacity>
                </View>

                {/* Cancel / Close Action */}
                <TouchableOpacity
                  style={styles.cancelLink}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelLinkText}>Cancel / Pay Later</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 44,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
  },
  gatewayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  gatewayBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginLeft: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderIdText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  amountBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5f259f',
    marginTop: 2,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginVertical: 14,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#5f259f',
    fontWeight: '800',
  },

  scrollArea: {
    maxHeight: 330,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },

  // App Cards
  appsList: {
    paddingVertical: 2,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  appIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  payChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  payChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5f259f',
    marginRight: 2,
  },

  // QR View
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  qrTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  qrSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  noQrPlaceholder: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
  },
  qrFooterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  qrFooterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 5,
  },

  // Web View
  webContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  webTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  webDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  webLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5f259f',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
  },
  webLaunchBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Polling Footer
  pollingFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pollingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  pollingMainText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  pollingSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  checkNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCE5FF',
  },
  checkNowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5f259f',
    marginLeft: 3,
  },
  cancelLink: {
    alignItems: 'center',
    paddingTop: 12,
  },
  cancelLinkText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  // Status Result Box
  statusResultBox: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  utrBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 6,
  },
  utrText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  updatingText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  failedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  failedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 6,
  },
  failedDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#5f259f',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
