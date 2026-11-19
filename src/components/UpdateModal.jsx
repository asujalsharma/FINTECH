import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { openPlayStore } from '../services/appUpdateService';

/**
 * Pixel-perfect Play Store Update Modal
 * Matching the exact UI: rocket icon badge, version transition pill,
 * what's new feature list with checkmarks, and "Update Now →" action.
 */
const UpdateModal = ({
  visible = false,
  currentVersion = '1.5',
  latestVersion = '1.6',
  releaseNotes = [
    'Faster bill payment experience',
    'Important security updates & performance fixes',
  ],
  isForce = true,
  onDismiss,
  onUpdate = openPlayStore,
}) => {
  if (!visible) return null;

  const handleUpdatePress = () => {
    if (onUpdate) {
      onUpdate();
    } else {
      openPlayStore();
    }
  };

  const handleBackdropPress = () => {
    if (!isForce && onDismiss) {
      onDismiss();
    }
  };

  const currentVerText = currentVersion?.startsWith('v')
    ? currentVersion
    : `v${currentVersion}`;
  const latestVerText = latestVersion?.startsWith('v')
    ? latestVersion
    : `v${latestVersion}`;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!isForce && onDismiss) {
          onDismiss();
        }
      }}
    >
      <StatusBar backgroundColor="rgba(15, 23, 42, 0.7)" barStyle="light-content" />

      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Rocket Icon Badge */}
              <View style={styles.iconCircle}>
                <MaterialIcon
                  name="rocket-launch"
                  size={44}
                  color="#5f259f"
                  style={styles.rocketIcon}
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>Update Required</Text>

              {/* Version Pill: v1.5 → v1.6 */}
              <View style={styles.versionPill}>
                <Text style={styles.versionText}>
                  {currentVerText} → {latestVerText}
                </Text>
              </View>

              {/* Subtitle / Description */}
              <Text style={styles.description}>
                We have added critical security enhancements and improvements.
                Please update to continue.
              </Text>

              {/* What's New Box */}
              <View style={styles.whatsNewBox}>
                <Text style={styles.whatsNewTitle}>What's New:</Text>

                {releaseNotes.map((note, index) => (
                  <View
                    key={index}
                    style={[
                      styles.featureRow,
                      index > 0 && { marginTop: 10 },
                    ]}
                  >
                    <MaterialIcon
                      name="check-circle"
                      size={18}
                      color="#10B981"
                      style={styles.checkIcon}
                    />
                    <Text style={styles.featureText}>{note}</Text>
                  </View>
                ))}
              </View>

              {/* Update Now Button */}
              <TouchableOpacity
                style={styles.updateBtn}
                onPress={handleUpdatePress}
                activeOpacity={0.85}
              >
                <Text style={styles.updateBtnText}>Update Now</Text>
                <MaterialIcon
                  name="arrow-right"
                  size={20}
                  color="#FFFFFF"
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  rocketIcon: {
    transform: [{ rotate: '-15deg' }],
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  versionPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 14,
  },
  versionText: {
    color: '#5f259f',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  description: {
    color: '#64748B',
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  whatsNewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    width: '100%',
    marginBottom: 22,
  },
  whatsNewTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIcon: {
    marginTop: 1,
    marginRight: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    lineHeight: 18.5,
    flex: 1,
  },
  updateBtn: {
    backgroundColor: '#4C1D95',
    height: 52,
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4C1D95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  arrowIcon: {
    marginLeft: 6,
  },
});

export default UpdateModal;
