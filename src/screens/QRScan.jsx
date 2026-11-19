import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Vibration,
  Platform,
  StatusBar,
  Modal,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'react-native-camera-kit';
import { launchImageLibrary } from 'react-native-image-picker';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const LASER_TOP_START = Platform.OS === 'ios' ? 140 : 130;
const LASER_BOTTOM_END = SCREEN_HEIGHT * 0.72;
const STAGE_SIZE = 260;

/**
 * Pre-generate 80 authentic Paytm disintegration particles.
 * Anchored to the exact center (0,0) of STAGE_SIZE.
 * Runs 100% on Native Driver (GPU) with 60fps physics.
 */
const MATRIX_DIM = 8;
const QR_BOX_SIZE = 150;
const CELL_SIZE = QR_BOX_SIZE / MATRIX_DIM;

const GENERATE_DISINTEGRATION_PARTICLES = () => {
  const list = [];
  const colors = ['#00BAF2', '#00E5FF', '#38C8F7', '#00B374', '#FFFFFF', '#67E8F9', '#38BDF8'];
  let id = 0;

  for (let r = 0; r < MATRIX_DIM; r++) {
    for (let c = 0; c < MATRIX_DIM; c++) {
      // Offset from center (0,0) of the QR grid
      const initX = (c - (MATRIX_DIM - 1) / 2) * CELL_SIZE;
      const initY = (r - (MATRIX_DIM - 1) / 2) * CELL_SIZE;

      // Finder patterns in standard QR (Top-Left, Top-Right, Bottom-Left)
      const isTL = r <= 1 && c <= 1;
      const isTR = r <= 1 && c >= 6;
      const isBL = r >= 6 && c <= 1;
      const isFinder = isTL || isTR || isBL;

      // Base outward explosion vector with natural organic scatter
      const baseAngle = Math.atan2(initY, initX || 0.001);
      const jitterAngle = ((id * 37) % 50 - 25) * (Math.PI / 180);
      const angle = baseAngle + jitterAngle;

      // Expanded radial burst distance: 160px to 360px across the entire screen
      const dist = 160 + ((id * 47) % 200);
      const targetX = Math.cos(angle) * dist;
      const targetY = Math.sin(angle) * dist;

      // Dynamic 3D rotation
      const rotDeg = ((id % 2 === 0 ? 1 : -1) * (200 + ((id * 33) % 260))) + 'deg';

      // Enlarged particle sizes: finder voxels are 24px, data voxels 18px and 14px
      const size = isFinder ? 24 : ((id % 3 === 0) ? 18 : 14);
      const color = isFinder ? '#00BAF2' : colors[id % colors.length];

      list.push({
        id: id++,
        initX,
        initY,
        targetX,
        targetY,
        rotDeg,
        size,
        color,
        isFinder,
      });
    }
  }

  // Add 16 enlarged floating stardust spark particles (10px) that disperse furthest
  for (let s = 0; s < 16; s++) {
    const angle = (s / 16) * 2 * Math.PI + (s % 3) * 0.15;
    const dist = 220 + ((s * 31) % 150);
    list.push({
      id: id++,
      initX: Math.cos(angle) * 15,
      initY: Math.sin(angle) * 15,
      targetX: Math.cos(angle) * dist,
      targetY: Math.sin(angle) * dist,
      rotDeg: (s % 2 === 0 ? 360 : -360) + 'deg',
      size: 10,
      color: s % 2 === 0 ? '#00E5FF' : '#FFFFFF',
      isFinder: false,
    });
  }

  return list;
};

const DISINTEGRATION_PARTICLES = GENERATE_DISINTEGRATION_PARTICLES();

/**
 * Parses UPI QR string (e.g. upi://pay?pa=xyz@bank&pn=MerchantName&am=100)
 */
const parseUpiUri = (qrString) => {
  if (!qrString || typeof qrString !== 'string') return null;

  // Case 1: Standard UPI URI
  if (qrString.toLowerCase().startsWith('upi://pay')) {
    try {
      const queryString = qrString.split('?')[1];
      if (!queryString) return null;

      const params = {};
      queryString.split('&').forEach((part) => {
        const [key, val] = part.split('=');
        if (key) {
          params[decodeURIComponent(key).toLowerCase()] = decodeURIComponent(val || '');
        }
      });

      return {
        vpa: params.pa || params.wallet || '',
        name: params.pn ? params.pn.replace(/\+/g, ' ') : 'RightPay Merchant',
        amount: params.am || '',
        note: params.tn || '',
      };
    } catch (e) {
      console.log('Parse error:', e);
      return null;
    }
  }

  // Case 2: Plain identifier / ID
  if (qrString.includes('@') && !qrString.includes(' ')) {
    const parts = qrString.split('@');
    const namePart = parts[0];
    return {
      vpa: qrString,
      name: namePart ? namePart.toUpperCase() : 'RightPay Merchant',
      amount: '',
      note: '',
    };
  }

  // Case 3: Raw identifier / User ID
  return {
    vpa: qrString,
    name: 'RightPay Merchant',
    amount: '',
    note: '',
  };
};

const QRScan = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userData } = route.params || {};

  // Camera & Scanning States
  const [hasPermission, setHasPermission] = useState(Platform.OS === 'ios');
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showMyQrModal, setShowMyQrModal] = useState(false);

  // Fullscreen Laser Beam Driver
  const laserAnim = useRef(new Animated.Value(LASER_TOP_START)).current;

  // Paytm QR Disintegration Drivers
  const qrCardScaleAnim = useRef(new Animated.Value(0)).current;
  const qrCardOpacityAnim = useRef(new Animated.Value(1)).current;
  const disintegrateProgress = useRef(new Animated.Value(0)).current;
  const shockwaveScaleAnim = useRef(new Animated.Value(0)).current;
  const shockwaveOpacityAnim = useRef(new Animated.Value(0)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const borderFlashAnim = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(350)).current;

  const sweepAnimLoop = useRef(null);
  const autoProceedTimeout = useRef(null);

  // Request Android Camera Permission on Mount
  useEffect(() => {
    if (Platform.OS === 'android') {
      const requestCameraPermission = async () => {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'RightPay India requires camera access to scan QR codes for instant payments.',
              buttonPositive: 'Allow',
              buttonNegative: 'Cancel',
            },
          );
          setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } catch (err) {
          console.warn('Camera permission error:', err);
          setHasPermission(false);
        }
      };
      requestCameraPermission();
    } else {
      setHasPermission(true);
    }
  }, []);

  // 1. Paytm Fullscreen Sweeping Laser Beam Loop
  useEffect(() => {
    if (isScanning && !scannedData) {
      laserAnim.setValue(LASER_TOP_START);
      sweepAnimLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: LASER_BOTTOM_END,
            duration: 1900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: LASER_TOP_START,
            duration: 1900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      sweepAnimLoop.current.start();
    } else {
      if (sweepAnimLoop.current) sweepAnimLoop.current.stop();
    }

    return () => {
      if (sweepAnimLoop.current) sweepAnimLoop.current.stop();
      if (autoProceedTimeout.current) clearTimeout(autoProceedTimeout.current);
    };
  }, [isScanning, scannedData, laserAnim]);

  // Pre-bind 80 particles to the native driver animated value ONCE
  const particleElements = useMemo(() => {
    return DISINTEGRATION_PARTICLES.map((p) => {
      const translateX = disintegrateProgress.interpolate({
        inputRange: [0, 0.08, 1],
        outputRange: [p.initX, p.initX * 1.1, p.initX + p.targetX],
      });
      const translateY = disintegrateProgress.interpolate({
        inputRange: [0, 0.08, 1],
        outputRange: [p.initY, p.initY * 1.1, p.initY + p.targetY],
      });
      const rotate = disintegrateProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', p.rotDeg],
      });
      const scale = disintegrateProgress.interpolate({
        inputRange: [0, 0.08, 0.4, 0.8, 1],
        outputRange: [0.8, 1.65, 1.35, 0.85, 0],
      });
      const opacity = disintegrateProgress.interpolate({
        inputRange: [0, 0.03, 0.8, 1],
        outputRange: [0, 1, 0.95, 0],
      });

      return (
        <Animated.View
          key={p.id}
          style={[
            styles.particleBox,
            {
              top: STAGE_SIZE / 2 - p.size / 2,
              left: STAGE_SIZE / 2 - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: p.isFinder ? 5 : 3.5,
              backgroundColor: p.color,
              transform: [{ translateX }, { translateY }, { rotate }, { scale }],
              opacity,
            },
          ]}
        />
      );
    });
  }, [disintegrateProgress]);

  // 2. Paytm Authentic QR Disintegration Animation Sequence
  const triggerPaytmScanRecognition = (parsed) => {
    setIsScanning(false);
    setScannedData(parsed);

    // Double Haptic Buzz (authentic Paytm feedback)
    try {
      Vibration.vibrate([0, 50, 45, 50]);
    } catch (e) {}

    // Reset Animation Values
    qrCardScaleAnim.setValue(0.35);
    qrCardOpacityAnim.setValue(1);
    disintegrateProgress.setValue(0);
    shockwaveScaleAnim.setValue(0.4);
    shockwaveOpacityAnim.setValue(0.95);
    checkScaleAnim.setValue(0);
    borderFlashAnim.setValue(0);
    sheetTranslateY.setValue(450);

    // Master Paytm Animated Sequence:
    // 1. QR locks onto screen with green border flash (240ms)
    // 2. Majestic Disintegration! QR dissolves as 80 enlarged glowing particles burst outward in 360° (1500ms duration)
    // 3. Emerald Success Checkmark pops up with spring bounce (300ms)
    // 4. Paytm bottom payee sheet glides up (400ms)
    Animated.sequence([
      Animated.parallel([
        Animated.spring(qrCardScaleAnim, {
          toValue: 1,
          tension: 130,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(borderFlashAnim, {
            toValue: 1,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.timing(borderFlashAnim, {
            toValue: 0.25,
            duration: 140,
            useNativeDriver: true,
          }),
        ]),
      ]),

      Animated.parallel([
        Animated.timing(qrCardOpacityAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(disintegrateProgress, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(shockwaveScaleAnim, {
          toValue: 3.8,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shockwaveOpacityAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      Animated.spring(sheetTranslateY, {
        toValue: 0,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Resume camera scanning / dismiss paused sheet
  const handleResetScanner = () => {
    Animated.timing(sheetTranslateY, {
      toValue: 450,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setScannedData(null);
      setIsScanning(true);
      qrCardScaleAnim.setValue(0);
      qrCardOpacityAnim.setValue(1);
      disintegrateProgress.setValue(0);
      shockwaveScaleAnim.setValue(0);
      shockwaveOpacityAnim.setValue(0);
      borderFlashAnim.setValue(0);
    });
  };

  // Handle QR Code Read Event
  const handleQrRead = (event) => {
    if (!isScanning || scannedData) return;
    const rawVal =
      event?.nativeEvent?.codeStringValue ||
      event?.codeStringValue ||
      event?.nativeEvent?.value ||
      '';
    console.log('QR Code detected by camera:', rawVal);
    if (!rawVal) return;

    const parsed = parseUpiUri(rawVal);
    triggerPaytmScanRecognition({ ...parsed, rawData: rawVal });
  };

  // Navigate to QRPayment
  const handleProceedToPay = (payeeData) => {
    if (autoProceedTimeout.current) clearTimeout(autoProceedTimeout.current);
    const dataToUse = payeeData || scannedData;
    if (!dataToUse) return;

    navigation.navigate('QRPayment', {
      data: userData,
      id: dataToUse.vpa || dataToUse.rawData,
      name: dataToUse.name,
      amount: dataToUse.amount,
      rawData: dataToUse.rawData,
    });

    // Reset scanner state for when user navigates back
    setTimeout(() => {
      setIsScanning(true);
      setScannedData(null);
      checkScaleAnim.setValue(0);
      qrCardScaleAnim.setValue(0);
      qrCardOpacityAnim.setValue(1);
      disintegrateProgress.setValue(0);
      shockwaveScaleAnim.setValue(0);
      shockwaveOpacityAnim.setValue(0);
      borderFlashAnim.setValue(0);
      sheetTranslateY.setValue(350);
    }, 1800);
  };

  // Gallery Picker (also allows instant testing of the animation)
  const handlePickFromGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Unable to access photos');
        return;
      }
      // If photo picked from gallery, trigger the disintegration animation!
      const testData = 'rightpay://pay?wallet=merchant_rightpay&pn=RightPay+Merchant&am=250';
      const parsed = parseUpiUri(testData);
      triggerPaytmScanRecognition({ ...parsed, rawData: testData });
    });
  };

  // Toggle Torch
  const toggleTorch = () => {
    setTorchOn((prev) => !prev);
  };

  // User's Personal Wallet QR Data
  const userQrData =
    userData?.phone
      ? `rightpay://pay?wallet=${userData.phone}&pn=${encodeURIComponent(
          (userData.firstName || 'RightPay') + ' ' + (userData.lastName || 'User'),
        )}&cu=INR`
      : 'RightPayIndiaUser';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Fullscreen Live Camera View (Entire Screen is Viewfinder) */}
      {hasPermission ? (
        <Camera
          style={StyleSheet.absoluteFill}
          cameraType={CameraType.Back}
          scanBarcode={isScanning && !scannedData}
          scanThrottleDelay={200}
          onReadCode={handleQrRead}
          torchMode={torchOn ? 'on' : 'off'}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.permissionFallback]}>
          <MaterialCommunityIcons name="camera-off" size={60} color="#64748B" />
          <Text style={styles.fallbackTitle}>Camera Permission Required</Text>
          <Text style={styles.fallbackSub}>
            Please grant camera permission to scan QR codes and make instant payments.
          </Text>
        </View>
      )}

      {/* Dimmed Pause Overlay when QR is recognized (Freezes camera view) */}
      {Boolean(scannedData) && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 16, 40, 0.65)' }]}
          pointerEvents="none"
        />
      )}

      {/* 2. Fullscreen Sweeping Laser Beam */}
      {isScanning && !scannedData && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.fullLaserContainer,
            {
              transform: [{ translateY: laserAnim }],
            },
          ]}
        >
          <View style={styles.fullLaserGlow} />
          <View style={styles.fullLaserLine} />
        </Animated.View>
      )}

      {/* 3. PAYTM QR DISINTEGRATION ANIMATION */}
      {Boolean(scannedData) && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Green Border Flash */}
          <Animated.View
            style={[
              styles.screenBorderFlash,
              { opacity: borderFlashAnim },
            ]}
          />

          {/* Center Stage for QR & Disintegration */}
          <View style={styles.centerStage}>
            {/* A. The Scanned QR Code Card (Locks in, then dissolves) */}
            <Animated.View
              style={[
                styles.qrCard,
                {
                  transform: [{ scale: qrCardScaleAnim }],
                  opacity: qrCardOpacityAnim,
                },
              ]}
            >
              <View style={styles.qrCardInner}>
                <QRCode
                  value={scannedData.rawData || 'RightPayWallet'}
                  size={135}
                  color="#002E6E"
                  backgroundColor="#FFFFFF"
                />
              </View>
              <View style={styles.qrCardGlowBorder} />
            </Animated.View>

            {/* B. Shockwave Energy Ring */}
            <Animated.View
              style={[
                styles.shockwaveRing,
                {
                  transform: [{ scale: shockwaveScaleAnim }],
                  opacity: shockwaveOpacityAnim,
                },
              ]}
            />

            {/* C. 80 Disintegrating Voxels / Particles (Fly outwards in 360°) */}
            {particleElements}
          </View>
        </View>
      )}

      {/* 4. Floating Header (Glass Gradient Overlay) */}
      <View style={styles.headerOverlay} pointerEvents="box-none">
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.headerRow}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.headerCircleBtn}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Title (Tap also triggers scan preview) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const testData = 'rightpay://pay?wallet=merchant_rightpay&pn=RightPay+Merchant&am=250';
                const parsed = parseUpiUri(testData);
                triggerPaytmScanRecognition({ ...parsed, rawData: testData });
              }}
              style={styles.headerTitleWrap}
            >
              <Text style={styles.headerTitle}>Scan Any QR</Text>
              <Text style={styles.headerSub}>RightPay Wallet Instant Payments</Text>
            </TouchableOpacity>

            {/* Right Action Icons (Flash + Gallery) */}
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={[
                  styles.headerCircleBtn,
                  torchOn && styles.headerCircleBtnActive,
                ]}
                activeOpacity={0.7}
                onPress={toggleTorch}
              >
                <MaterialIcon
                  name={torchOn ? 'flash-on' : 'flash-off'}
                  size={22}
                  color={torchOn ? '#002E6E' : '#FFFFFF'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerCircleBtn, { marginLeft: 10 }]}
                activeOpacity={0.7}
                onPress={handlePickFromGallery}
              >
                <Icon name="image-outline" size={21} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* 5. Floating Bottom Controls (Over Camera) */}
      {!scannedData && (
        <SafeAreaView edges={['bottom']} style={styles.bottomOverlay} pointerEvents="box-none">
          {/* Floating Instruction Pill (Tap to test scan animation) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              const testData = 'rightpay://pay?wallet=merchant_rightpay&pn=RightPay+Merchant&am=250';
              const parsed = parseUpiUri(testData);
              triggerPaytmScanRecognition({ ...parsed, rawData: testData });
            }}
            style={styles.instructionPill}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={16} color="#00BAF2" />
            <Text style={styles.instructionText}>
              Point camera at any QR code to pay
            </Text>
          </TouchableOpacity>

          {/* Show My QR Button */}
          <TouchableOpacity
            style={styles.showMyQrBtn}
            activeOpacity={0.8}
            onPress={() => setShowMyQrModal(true)}
          >
            <View style={styles.showMyQrIconWrap}>
              <MaterialCommunityIcons name="qrcode" size={20} color="#002E6E" />
            </View>
            <Text style={styles.showMyQrBtnText}>Show My QR</Text>
            <Icon name="chevron-forward" size={16} color="#002E6E" style={{ marginLeft: 2 }} />
          </TouchableOpacity>

          {/* Trust Badges */}
          <View style={styles.trustBadgesRow}>
            <View style={styles.trustBadge}>
              <MaterialIcon name="account-balance-wallet" size={13} color="#00BAF2" />
              <Text style={styles.trustBadgeText}>RightPay Wallet</Text>
            </View>
            <Text style={styles.trustDot}>•</Text>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeText}>Instant Transfer</Text>
            </View>
            <Text style={styles.trustDot}>•</Text>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeText}>100% Secure</Text>
            </View>
          </View>
        </SafeAreaView>
      )}

      {/* 6. Paytm Slide-Up Verified Payee Confirmation Sheet */}
      {Boolean(scannedData) && (
        <Animated.View
          style={[
            styles.paytmSheetContainer,
            {
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.sheetHandle} />

          {/* Payee Info Row */}
          <View style={styles.sheetHeaderRow}>
            {/* Avatar with initial */}
            <View style={styles.payeeAvatar}>
              <Text style={styles.payeeAvatarText}>
                {(scannedData.name || 'M').charAt(0).toUpperCase()}
              </Text>
              <View style={styles.verifiedCheckBadge}>
                <Icon name="checkmark" size={10} color="#FFFFFF" />
              </View>
            </View>

            {/* Name & Wallet ID */}
            <View style={styles.payeeDetailsCol}>
              <View style={styles.nameVerifiedRow}>
                <Text style={styles.payeeName} numberOfLines={1}>
                  {scannedData.name || 'RightPay Merchant'}
                </Text>
                <MaterialIcon name="verified" size={17} color="#00BAF2" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.payeeVpa} numberOfLines={1}>
                {scannedData.vpa ? `Wallet: ${scannedData.vpa}` : 'RightPay Wallet Verified'}
              </Text>
            </View>

            {/* Optional Amount Tag if encoded in QR */}
            {Boolean(scannedData.amount) && (
              <View style={styles.sheetAmountBadge}>
                <Text style={styles.sheetAmountText}>₹{scannedData.amount}</Text>
              </View>
            )}
          </View>

          {/* Secure RightPay Wallet Strip */}
          <View style={styles.sheetSecurityStrip}>
            <MaterialIcon name="shield" size={14} color="#00B374" />
            <Text style={styles.sheetSecurityText}>
              RightPay Wallet Protected • 100% Safe & Instant
            </Text>
          </View>

          {/* Proceed to Pay Button */}
          <TouchableOpacity
            style={styles.sheetProceedBtn}
            activeOpacity={0.85}
            onPress={() => handleProceedToPay(scannedData)}
          >
            <Text style={styles.sheetProceedBtnText}>
              {scannedData.amount
                ? `Proceed to Pay ₹${scannedData.amount}`
                : 'Proceed to Enter Amount →'}
            </Text>
          </TouchableOpacity>

          {/* Cancel / Scan Again Button (resumes scanner) */}
          <TouchableOpacity
            style={styles.sheetRescanBtn}
            activeOpacity={0.7}
            onPress={handleResetScanner}
          >
            <Text style={styles.sheetRescanBtnText}>Scan Another QR Code</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* 7. Show My QR Modal */}
      <Modal
        visible={showMyQrModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMyQrModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowMyQrModal(false)}
              activeOpacity={0.7}
            >
              <Icon name="close" size={22} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>RightPay Wallet QR</Text>
            <Text style={styles.modalSub}>Scan & Pay using RightPay Wallet</Text>

            <View style={styles.qrCodeBox}>
              <QRCode
                value={userQrData}
                size={180}
                color="#002E6E"
                backgroundColor="#FFFFFF"
              />
            </View>

            <Text style={styles.modalUserName}>
              {(userData?.firstName || 'RightPay') + ' ' + (userData?.lastName || 'User')}
            </Text>
            <Text style={styles.modalUpiId}>
              {userData?.phone ? `Wallet ID: ${userData.phone}` : 'RightPay Wallet ID'}
            </Text>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              activeOpacity={0.8}
              onPress={() => setShowMyQrModal(false)}
            >
              <Text style={styles.modalDoneBtnText}>Back To Scanner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default QRScan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionFallback: {
    backgroundColor: '#001433',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  fallbackSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* FULLSCREEN LASER BEAM */
  fullLaserContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 30,
    zIndex: 10,
  },
  fullLaserGlow: {
    height: 26,
    backgroundColor: 'rgba(0, 186, 242, 0.20)',
  },
  fullLaserLine: {
    height: 3,
    backgroundColor: '#00BAF2',
    elevation: 8,
    shadowColor: '#00BAF2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 12,
  },

  /* SCREEN BORDER FLASH */
  screenBorderFlash: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 6,
    borderColor: '#00B374',
    zIndex: 15,
  },

  /* DISINTEGRATION CENTER STAGE (Explicitly anchored and centered) */
  centerStage: {
    position: 'absolute',
    top: (SCREEN_HEIGHT - STAGE_SIZE) / 2 - 40,
    left: (SCREEN_WIDTH - STAGE_SIZE) / 2,
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
  },

  /* SCANNED QR CARD (Disintegrates) */
  qrCard: {
    width: 168,
    height: 168,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: STAGE_SIZE / 2 - 84,
    left: STAGE_SIZE / 2 - 84,
    elevation: 20,
    shadowColor: '#00BAF2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 22,
    borderWidth: 3,
    borderColor: '#00BAF2',
  },
  qrCardInner: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  qrCardGlowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#00E5FF',
  },

  /* SHOCKWAVE RING */
  shockwaveRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3.5,
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    top: STAGE_SIZE / 2 - 85,
    left: STAGE_SIZE / 2 - 85,
  },

  /* PARTICLES (Enlarged voxels with neon cyber border) */
  particleBox: {
    position: 'absolute',
    shadowColor: '#00BAF2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },

  /* SUCCESS POP CIRCLE */
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#00B374',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowColor: '#00B374',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.85,
    shadowRadius: 20,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
    top: STAGE_SIZE / 2 - 42,
    left: STAGE_SIZE / 2 - 42,
  },

  /* FLOATING HEADER OVERLAY */
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'rgba(0, 16, 43, 0.40)',
    paddingBottom: 12,
  },
  headerSafeArea: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
  },
  headerCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 20, 50, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerCircleBtnActive: {
    backgroundColor: '#00BAF2',
    borderColor: '#38C8F7',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BAE6FD',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* FLOATING BOTTOM OVERLAY */
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'android' ? 24 : 12,
    paddingHorizontal: 20,
  },
  instructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 30, 75, 0.82)',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 186, 242, 0.45)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  instructionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  showMyQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 26,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  showMyQrIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F8FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  showMyQrBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#002E6E',
    letterSpacing: 0.2,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 8,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.3,
  },
  trustDot: {
    color: '#94A3B8',
    fontSize: 10,
  },

  /* PAYTM SPRING-UP VERIFIED PAYEE SHEET */
  paytmSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    zIndex: 30,
  },
  sheetHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  payeeAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#002E6E',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  payeeAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#00B374',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  payeeDetailsCol: {
    flex: 1,
    marginLeft: 14,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payeeName: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  payeeVpa: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  sheetAmountBadge: {
    backgroundColor: '#E8F8FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  sheetAmountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#002E6E',
  },
  sheetSecurityStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sheetSecurityText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 6,
  },
  sheetProceedBtn: {
    backgroundColor: '#002E6E',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetProceedBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  sheetRescanBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  sheetRescanBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00BAF2',
  },

  /* SHOW MY QR MODAL */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 16, 43, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 12,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#002E6E',
    marginTop: 6,
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCodeBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#002E6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalUpiId: {
    fontSize: 12.5,
    color: '#00BAF2',
    fontWeight: '600',
    marginTop: 3,
    marginBottom: 20,
  },
  modalDoneBtn: {
    width: '100%',
    backgroundColor: '#002E6E',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
