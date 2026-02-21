import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';

const RedirectScreen = ({ route, navigation }) => {
  const { data, type } = route.params;
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1756C5" />

      {/* Header */}
      <LinearGradient
        colors={['#1756C5', '#1E3A8A', '#0D3A8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerText}>
            {type === 'travel' ? `${data?.name} Booking` : data?.name}
          </Text>
          <View style={styles.secureBadge}>
            <Icon name="shield" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.secureText}>SECURE CONNECTION</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={() => setLoading(true)}>
          <Icon name="rotate-cw" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: data.route }}
          style={{ flex: 1 }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={THEME_COLORS.primary} />
            <Text style={styles.loadingText}>Connecting to Secure Portal...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RedirectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 18,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  secureText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  refreshBtn: {
    padding: 8,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
