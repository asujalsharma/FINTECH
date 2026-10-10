import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getData } from '../API';

export default function DonationStatsWidget({ onDonatePress }) {
  const [stats, setStats] = useState({
    totalRaised: 1245000,
    totalDonors: 1480,
    girlsSupported: 320,
    recentBlessings: [
      {
        id: 'b1',
        donorName: 'रमेश कुमार',
        amount: 2100,
        message: 'बेटी के सुखद वैवाहिक जीवन की हार्दिक शुभकामनाएँ! सदैव प्रसन्न रहो।',
        time: 'आज',
      },
      {
        id: 'b2',
        donorName: 'अनामिका शर्मा',
        amount: 5100,
        message: 'सभी बेटियों को उज्ज्वल भविष्य और शिक्षा का आशीर्वाद।',
        time: 'कल',
      },
      {
        id: 'b3',
        donorName: 'गुप्त दानी (Anonymous)',
        amount: 11000,
        message: 'शुभ विवाह सहयोग। भगवान परिवार पर सदैव कृपा बनाए रखे।',
        time: '2 दिन पहले',
      },
    ],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getData('/api/donation/stats');
        if (isMounted && res && (res.Status || res.success || res.Data)) {
          const d = res.Data || res.data || res;
          setStats(prev => ({
            totalRaised: d.totalRaised ?? d.totalFundsRaised ?? prev.totalRaised,
            totalDonors: d.totalDonors ?? prev.totalDonors,
            girlsSupported: d.girlsSupported ?? prev.girlsSupported,
            recentBlessings:
              Array.isArray(d.recentBlessings) && d.recentBlessings.length > 0
                ? d.recentBlessings
                : prev.recentBlessings,
          }));
        }
      } catch (e) {
        // Fallback to sample stats on network or 404
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={w.card}>
      {/* Header */}
      <View style={w.headerRow}>
        <View style={w.iconBadge}>
          <FontAwesome5 name="hands-helping" size={16} color="#B45309" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={w.title}>जन सहयोग प्रभाव (Live Impact)</Text>
          <Text style={w.subtitle}>Sarvana Vivah Sahayog Foundation</Text>
        </View>
        {loading && <ActivityIndicator size="small" color="#D81B60" />}
      </View>

      {/* Metrics Row */}
      <View style={w.metricsRow}>
        <View style={w.metricItem}>
          <Text style={w.metricVal}>
            ₹{(stats.totalRaised / 100000).toFixed(1)}L+
          </Text>
          <Text style={w.metricLabel}>एकत्रित कोष</Text>
        </View>

        <View style={w.metricDivider} />

        <View style={w.metricItem}>
          <Text style={w.metricVal}>{stats.totalDonors}+</Text>
          <Text style={w.metricLabel}>दानी बंधु</Text>
        </View>

        <View style={w.metricDivider} />

        <View style={w.metricItem}>
          <Text style={w.metricVal}>{stats.girlsSupported}+</Text>
          <Text style={w.metricLabel}>सहयोग प्राप्त बेटियां</Text>
        </View>
      </View>

      {/* Blessings Wall */}
      <View style={w.blessingsHeader}>
        <MaterialIcon name="message-heart" size={16} color="#D81B60" />
        <Text style={w.blessingsTitle}>शुभकामनाएँ एवं आशीर्वाद (Blessings Wall)</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={w.blessingsScroll}
      >
        {stats.recentBlessings.map((b, idx) => (
          <View key={b.id || idx} style={w.blessingCard}>
            <View style={w.blessingTop}>
              <Text style={w.donorName} numberOfLines={1}>
                {b.donorName || 'शुभचिंतक'}
              </Text>
              <Text style={w.blessingAmount}>₹{b.amount}</Text>
            </View>
            <Text style={w.blessingText} numberOfLines={2}>
              "{b.message}"
            </Text>
          </View>
        ))}
      </ScrollView>

      {onDonatePress && (
        <TouchableOpacity
          style={w.ctaBtn}
          onPress={onDonatePress}
          activeOpacity={0.85}
        >
          <FontAwesome5 name="heart" size={13} color="#FFF" solid />
          <Text style={w.ctaText}>सहयोग करें (Donate Now) • 80G Tax Exemption</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const w = StyleSheet.create({
  card: {
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    elevation: 3,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14.5, fontWeight: '800', color: '#92400E' },
  subtitle: { fontSize: 11, color: '#B45309', fontWeight: '500' },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 14,
  },
  metricItem: { flex: 1, alignItems: 'center' },
  metricVal: { fontSize: 16, fontWeight: '900', color: '#D81B60' },
  metricLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  metricDivider: { width: 1, backgroundColor: '#F1F5F9' },

  blessingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  blessingsTitle: { fontSize: 12, fontWeight: '800', color: '#831843' },
  blessingsScroll: { paddingRight: 8, gap: 10 },
  blessingCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  blessingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  donorName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginRight: 6,
  },
  blessingAmount: { fontSize: 12, fontWeight: '900', color: '#059669' },
  blessingText: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 15,
  },

  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D81B60',
    borderRadius: 12,
    height: 42,
    marginTop: 12,
  },
  ctaText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});
