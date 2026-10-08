import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { getData, API_BASE_URL } from '../API';

const { width, height } = Dimensions.get('window');

/**
 * Dynamic Pop Image Banner Component for SARVANA Fintech
 * Fetches promotional/announcement popup from GET /api/pop-image
 *
 * @param {Object} props
 * @param {any} [props.navigation] Optional React Navigation prop for deep linking
 * @param {string} [props.userToken] Optional token override
 * @param {boolean} [props.forceShow=false] Bypasses daily suppression check
 * @param {number} [props.triggerDelayMs=300] Delay before popup appears (ms)
 * @param {() => void} [props.onClose] Callback when popup is dismissed
 */
export default function PopupBanner({
  navigation,
  userToken,
  forceShow = false,
  triggerDelayMs = 300,
  onClose,
}) {
  const [visible, setVisible] = useState(false);
  const [banner, setBanner] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  const dismissedThisVisit = useRef(false);
  const fetchingRef = useRef(false);

  // Redux Auth State
  const reduxUser = useSelector(state => state?.user);
  const activeToken =
    userToken ||
    reduxUser?.AccessToken ||
    reduxUser?.token ||
    reduxUser?.accessToken ||
    reduxUser?.Data?.AccessToken;

  // Clear stale legacy dismissal key
  useEffect(() => {
    AsyncStorage.removeItem('@popup_banner_dismissed_date').catch(() => {});
  }, []);

  // ── 1. Fetch Dynamic Popup Banner from Backend ─────────────────────────────
  const fetchPopupBanner = useCallback(async () => {
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;

      if (dismissedThisVisit.current && !forceShow) {
        return;
      }

      // Check daily dismissal if not forced
      if (!forceShow) {
        const todayStr = new Date().toISOString().split('T')[0];
        const dismissedToday = await AsyncStorage.getItem('@popup_banner_dismissed_today');
        if (dismissedToday === todayStr) {
          console.log('ℹ️ [PopupBanner] Banner suppressed for today by user preference.');
          return;
        }
      }

      // Check for available token before calling API (from Redux, AsyncStorage, or persist:root)
      let token = activeToken;
      if (!token) {
        token =
          (await AsyncStorage.getItem('AccessToken')) ||
          (await AsyncStorage.getItem('token'));
      }
      if (!token) {
        try {
          const persistRoot = await AsyncStorage.getItem('persist:root');
          if (persistRoot) {
            const parsed = JSON.parse(persistRoot);
            const userObj = parsed?.user ? JSON.parse(parsed.user) : null;
            token =
              userObj?.AccessToken ||
              userObj?.token ||
              userObj?.accessToken ||
              userObj?.Data?.AccessToken;
          }
        } catch {
          // ignore
        }
      }

      if (!token) {
        console.log('⚠️ [PopupBanner] Waiting for auth token before calling /api/pop-image...');
        return;
      }

      console.log('📡 [PopupBanner] Calling GET /api/pop-image with token...');

      // Backend route: GET /api/pop-image
      const res = await getData('/api/pop-image');

      console.log(
        '📦 [PopupBanner] API Response:',
        res?.Status ? 'Success' : res?.Remarks || 'No Banner'
      );

      const data = res?.Data;
      if (res?.Status && data && data.image) {
        // Normalize Windows and Unix path separators
        const cleanPath = String(data.image).replace(/\\/g, '/');
        const imageUrl =
          cleanPath.startsWith('http://') || cleanPath.startsWith('https://')
            ? cleanPath
            : `${API_BASE_URL}/${cleanPath.replace(/^\//, '')}`;

        console.log('🎉 [PopupBanner] Pop banner image resolved:', imageUrl);

        setBanner({
          ...data,
          imageUrl,
          link: data.link || data.redirectUrl || '',
        });

        // Trigger entrance if not dismissed during fetch
        setTimeout(() => {
          if (!dismissedThisVisit.current) {
            console.log('🚀 [PopupBanner] Displaying banner on screen now!');
            setVisible(true);
          }
        }, Math.max(triggerDelayMs, 100));
      } else {
        console.log('ℹ️ [PopupBanner] No active pop image found in response.');
      }
    } catch (err) {
      console.log(
        '❌ [PopupBanner] Error fetching popup banner:',
        err?.response?.data || err?.message || err
      );
    } finally {
      fetchingRef.current = false;
    }
  }, [activeToken, forceShow, triggerDelayMs]);

  // When activeToken resolves on mount or login, fetch
  useEffect(() => {
    if (activeToken) {
      fetchPopupBanner();
    }
  }, [activeToken]);

  // When screen gains focus, reset visit dismissal and show/fetch banner
  useFocusEffect(
    useCallback(() => {
      dismissedThisVisit.current = false;
      fetchPopupBanner();
    }, [fetchPopupBanner])
  );

  // ── 2. Close & Dismiss for Current Screen Visit ─────────────────────────────
  const handleClose = () => {
    console.log('🛑 [PopupBanner] Closed by user for this visit.');
    dismissedThisVisit.current = true;
    setVisible(false);
    if (onClose) onClose();
  };

  // ── 3. Don't Show Again Today ──────────────────────────────────────────────
  const handleDontShowToday = async () => {
    console.log('🛑 [PopupBanner] Suppressed for today by user.');
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem('@popup_banner_dismissed_today', todayStr);
    } catch {
      // ignore
    }
    handleClose();
  };

  // ── 4. Handle Banner Press (External URL or Internal Route) ────────────────
  const handleBannerPress = () => {
    if (!banner?.link) return;

    const link = String(banner.link).trim();
    console.log('🔗 [PopupBanner] Banner pressed. Target:', link);

    if (link.startsWith('http://') || link.startsWith('https://')) {
      Linking.openURL(link).catch(err => {
        console.warn('Could not open popup banner URL:', err);
      });
    } else if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate(link);
      } catch (e) {
        console.warn('Could not navigate to screen:', link);
      }
    }

    handleClose();
  };

  if (!visible || !banner?.imageUrl) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalCardWrapper}>
              {/* Card Container */}
              <View style={styles.cardContainer}>
                {/* Close Button Inside Card at Top-Right */}
                <TouchableOpacity
                  style={styles.closeBtn}
                  activeOpacity={0.8}
                  onPress={handleClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityLabel="Close Banner"
                  accessibilityRole="button"
                >
                  <View style={styles.closeCircle}>
                    <FeatherIcon name="x" size={18} color="#0F172A" />
                  </View>
                </TouchableOpacity>

                {/* Banner Image */}
                <TouchableOpacity
                  style={styles.imageTouchable}
                  activeOpacity={banner.link ? 0.92 : 1}
                  onPress={handleBannerPress}
                >
                  {imageLoading ? (
                    <View style={styles.loadingPlaceholder}>
                      <ActivityIndicator size="small" color="#D81B60" />
                    </View>
                  ) : null}

                  <Image
                    source={{ uri: banner.imageUrl }}
                    style={styles.bannerImage}
                    resizeMode="contain"
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                    onLoad={() => console.log('✅ [PopupBanner] Image rendered on screen!')}
                    onError={(e) =>
                      console.log('❌ [PopupBanner] Image load failed:', e?.nativeEvent)
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* Secondary Option: "Don't show again today" */}
              <TouchableOpacity
                style={styles.dontShowBtn}
                activeOpacity={0.7}
                onPress={handleDontShowToday}
              >
                <Text style={styles.dontShowText}>Don't show again today</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCardWrapper: {
    width: Math.min(width * 0.9, 420),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '100%',
    borderRadius: 18,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 99,
    elevation: 10,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTouchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingPlaceholder: {
    position: 'absolute',
    inset: 0,
    minHeight: 200,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bannerImage: {
    width: '100%',
    height: Math.min(width * 1.15, height * 0.65),
    borderRadius: 18,
  },
  dontShowBtn: {
    marginTop: 14,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  dontShowText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
