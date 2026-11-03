import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SUPPORTED_LANGUAGES } from '../services/languageService';

const LanguageSelectorModal = ({
  visible,
  currentLanguage,
  onSelectLanguage,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.globeCircle}>
                    <Icon name="translate" size={20} color="#5f259f" />
                  </View>
                  <View>
                    <Text style={styles.title}>Select App Language</Text>
                    <Text style={styles.subtitle}>
                      भाषा चुनें • ਭਾਸ਼ਾ ਚੁਣੋ • ভাষা নির্বাচন
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Language Options List */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                {SUPPORTED_LANGUAGES.map(lang => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      activeOpacity={0.8}
                      style={[
                        styles.languageCard,
                        isSelected && styles.languageCardSelected,
                      ]}
                      onPress={() => onSelectLanguage(lang.code)}
                    >
                      <View style={styles.langLeft}>
                        <View
                          style={[
                            styles.flagCircle,
                            isSelected && styles.flagCircleSelected,
                          ]}
                        >
                          <Text style={styles.flagText}>{lang.flag}</Text>
                        </View>
                        <View style={styles.langTextCol}>
                          <View style={styles.nameRow}>
                            <Text
                              style={[
                                styles.nativeName,
                                isSelected && styles.nativeNameSelected,
                              ]}
                            >
                              {lang.nativeName}
                            </Text>
                            <Text style={styles.englishName}>
                              ({lang.name})
                            </Text>
                          </View>
                          <Text style={styles.subText}>{lang.subText}</Text>
                        </View>
                      </View>

                      {/* Selection Radio / Checkmark */}
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && (
                          <Icon name="check" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Footer Tip */}
              <View style={styles.footerInfo}>
                <Icon name="auto-awesome" size={15} color="#5f259f" />
                <Text style={styles.footerInfoText}>
                  Instant switch across English, Hindi, Punjabi & Bengali
                </Text>
              </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  globeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 14,
  },
  listContent: {
    gap: 10,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  languageCardSelected: {
    borderColor: '#5f259f',
    backgroundColor: '#FAF5FF',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  flagCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flagCircleSelected: {
    borderColor: '#D8B4FE',
  },
  flagText: {
    fontSize: 20,
  },
  langTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  nativeNameSelected: {
    color: '#5f259f',
  },
  englishName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  subText: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#5f259f',
    backgroundColor: '#5f259f',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 14,
    gap: 6,
  },
  footerInfoText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#5f259f',
    textAlign: 'center',
  },
});

export default LanguageSelectorModal;
