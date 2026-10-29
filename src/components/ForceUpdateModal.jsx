import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  BackHandler,
  AppState,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { postData } from '../API';

// Helper to compare semver versions (e.g. "1.4.0" vs "1.5.0")
function compareVersions(v1, v2) {
  if (!v1 || !v2) return 0;
  const p1 = String(v1).split('.').map(n => parseInt(n, 10) || 0);
  const p2 = String(v2).split('.').map(n => parseInt(n, 10) || 0);
  const maxLen = Math.max(p1.length, p2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export default function ForceUpdateModal() {
  const [visible, setVisible] = useState(false);
  const [isForce, setIsForce] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [currentVersion, setCurrentVersion] = useState('');
  const [currentBuild, setCurrentBuild] = useState(1);

  const checkForUpdate = useCallback(async () => {
    try {
      const version = DeviceInfo.getVersion();
      const build = parseInt(DeviceInfo.getBuildNumber(), 10) || 1;
      const bundleId = DeviceInfo.getBundleId() || 'com.aydspay';

      setCurrentVersion(version);
      setCurrentBuild(build);

      // Call backend update check endpoint
      const res = await postData('/api/app/check-update', {
        platform: Platform.OS,
        version,
        buildNumber: build,
        bundleId,
      });

      console.log('App Update Check Response:', res);

      if (!res || res.success === false) return;

      const data = res.data || res;

      let forceRequired = false;
      let hasUpdate = false;

      // 1. Check build number (versionCode)
      if (data.minBuildNumber && build < data.minBuildNumber) {
        forceRequired = true;
        hasUpdate = true;
      } else if (data.minVersion && compareVersions(version, data.minVersion) < 0) {
        forceRequired = true;
        hasUpdate = true;
      } else if (data.forceUpdate === true) {
        forceRequired = true;
        hasUpdate = true;
      }

      // 2. Check for optional update if not forced
      if (!forceRequired) {
        if (data.latestBuildNumber && build < data.latestBuildNumber) {
          hasUpdate = true;
        } else if (data.latestVersion && compareVersions(version, data.latestVersion) < 0) {
          hasUpdate = true;
        } else if (data.updateAvailable === true) {
          hasUpdate = true;
        }
      }

      if (hasUpdate) {
        setIsForce(forceRequired);
        setUpdateInfo(data);
        setVisible(true);
      } else {
        setVisible(false);
      }
    } catch (err) {
      // Gracefully ignore error if backend route isn't reached yet
      console.log('Update check skipped or failed:', err?.message);
    }
  }, []);

  // Listen to AppState (re-check when returning from Play Store / background)
  useEffect(() => {
    checkForUpdate();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkForUpdate();
      }
    });

    return () => subscription.remove();
  }, [checkForUpdate]);

  // Lock hardware back button on Android when force update is active
  useEffect(() => {
    if (!visible || !isForce) return;

    const backAction = () => {
      return true; // Prevents back navigation
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [visible, isForce]);

  const handleUpdatePress = () => {
    const bundleId = DeviceInfo.getBundleId() || 'com.aydspay';
    const storeUrl =
      updateInfo?.storeUrl ||
      (Platform.OS === 'android'
        ? `market://details?id=${bundleId}`
        : `https://apps.apple.com/app/id${bundleId}`);

    const fallbackUrl =
      updateInfo?.fallbackUrl ||
      `https://play.google.com/store/apps/details?id=${bundleId}`;

    Linking.canOpenURL(storeUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(storeUrl);
        } else {
          Linking.openURL(fallbackUrl);
        }
      })
      .catch(() => {
        Linking.openURL(fallbackUrl);
      });
  };

  const handleDismiss = () => {
    if (!isForce) {
      setVisible(false);
    }
  };

  if (!visible) return null;

  const title =
    updateInfo?.title ||
    (isForce ? 'Update Required' : 'New Update Available');

  const message =
    updateInfo?.message ||
    (isForce
      ? 'A new version of the app is available with critical enhancements and improvements. Please update to continue.'
      : 'A new version is available. Update now to enjoy the latest features and bug fixes.');

  const releaseNotes = updateInfo?.releaseNotes || [
    'Performance improvements & bug fixes',
    'Enhanced security and reliability',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Icon */}
          <View style={styles.iconCircle}>
            <Icon
              name={isForce ? 'rocket-launch' : 'cloud-download'}
              size={42}
              color="#471d7d"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Version Badge */}
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>
              v{currentVersion || '1.0'} → v{updateInfo?.latestVersion || 'Latest'}
            </Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Release Notes */}
          {releaseNotes && releaseNotes.length > 0 && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>What's New:</Text>
              {releaseNotes.map((note, index) => (
                <View key={index} style={styles.noteRow}>
                  <Icon
                    name="check-circle"
                    size={16}
                    color="#16a34a"
                    style={{ marginTop: 2, marginRight: 8 }}
                  />
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Update Button */}
          <TouchableOpacity
            style={styles.updateButton}
            activeOpacity={0.85}
            onPress={handleUpdatePress}
          >
            <Text style={styles.updateButtonText}>Update Now</Text>
            <Icon name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* Optional Skip/Later Button */}
          {!isForce && (
            <TouchableOpacity
              style={styles.laterButton}
              activeOpacity={0.7}
              onPress={handleDismiss}
            >
              <Text style={styles.laterButtonText}>Later</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  versionBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#471d7d',
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  notesContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
  },
  updateButton: {
    backgroundColor: '#471d7d',
    borderRadius: 16,
    height: 52,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  laterButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  laterButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
