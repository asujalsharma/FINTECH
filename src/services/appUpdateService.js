import { Linking, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { API_BASE_URL } from '../API';

export const PLAY_STORE_URL = 'market://details?id=com.onlineadda';
export const WEB_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.onlineadda';

/**
 * Open the Google Play Store page for Online Adda
 */
export const openPlayStore = async () => {
  try {
    const canOpen = await Linking.canOpenURL(PLAY_STORE_URL);
    if (canOpen && Platform.OS === 'android') {
      await Linking.openURL(PLAY_STORE_URL);
    } else {
      await Linking.openURL(WEB_PLAY_STORE_URL);
    }
  } catch (err) {
    console.warn(
      'Could not open Play Store directly, falling back to web URL:',
      err,
    );
    try {
      await Linking.openURL(WEB_PLAY_STORE_URL);
    } catch (e) {
      console.error('Failed to open web Play Store URL:', e);
    }
  }
};

/**
 * Compare two semver-like version strings
 * Returns true if latest > current
 */
export const isVersionHigher = (latest, current) => {
  if (!latest || !current) return false;
  const cleanL = String(latest)
    .replace(/[^0-9.]/g, '')
    .split('.')
    .map(Number);
  const cleanC = String(current)
    .replace(/[^0-9.]/g, '')
    .split('.')
    .map(Number);
  const maxLen = Math.max(cleanL.length, cleanC.length);

  for (let i = 0; i < maxLen; i++) {
    const l = cleanL[i] || 0;
    const c = cleanC[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
};

/**
 * Check if a newer version is available on the Play Store or Backend API
 */
export const checkForAppUpdate = async () => {
  const currentVersion = DeviceInfo.getVersion() || '1.2';
  const bundleId = DeviceInfo.getBundleId() || 'com.onlineadda';

  let latestVersion = null;
  let isForceUpdate = true;
  let releaseNotes = [
    'Faster bill payment experience',
    'Important security updates & performance fixes',
  ];

  // 1. Try Backend API first if available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `${API_BASE_URL}/api/app-version?platform=${Platform.OS}`,
      {
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const serverVersion =
        data?.version || data?.latestVersion || data?.data?.version;
      if (serverVersion) {
        latestVersion = serverVersion;
        if (data?.isForce !== undefined) isForceUpdate = data.isForce;
        if (Array.isArray(data?.whatsNew) && data.whatsNew.length > 0) {
          releaseNotes = data.whatsNew;
        }
      }
    }
  } catch (e) {
    // Backend version endpoint not present or unreachable
  }

  // 2. Try Google Play Store scraping if backend didn't return a version
  if (!latestVersion && Platform.OS === 'android') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const playRes = await fetch(
        `https://play.google.com/store/apps/details?id=${bundleId}&hl=en&gl=US`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.93 Mobile Safari/537.36',
          },
          signal: controller.signal,
        },
      );
      clearTimeout(timeoutId);

      if (playRes.ok) {
        const html = await playRes.text();
        const patterns = [
          /\[\[\["([0-9]+\.[0-9]+(?:\.[0-9]+)?)"\]\]/,
          /Current Version.*?class="htlgb">([^<]+)<\/span>/i,
          /\["([0-9]+\.[0-9]+\.[0-9]+)"\]/,
          /\"softwareVersion\"\s*:\s*\"([^\"]+)\"/i,
        ];

        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match && match[1]) {
            const candidate = match[1].trim();
            if (/^[0-9]+(\.[0-9]+)+$/.test(candidate)) {
              latestVersion = candidate;
              break;
            }
          }
        }
      }
    } catch (err) {
      // Network or scraping failed silently
    }
  }

  const updateAvailable = latestVersion
    ? isVersionHigher(latestVersion, currentVersion)
    : false;

  return {
    updateAvailable,
    currentVersion,
    latestVersion: latestVersion || currentVersion,
    isForceUpdate,
    releaseNotes,
  };
};
