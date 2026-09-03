import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../API';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const BillPayments = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { service } = route.params ?? {};

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (service) {
      setServices(service);
      setLoading(false);
    }
  }, [service]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => {
        if (item.name === 'Google Play')
          navigation.navigate('GooglePlayPayment', { ServiceId: item?._id });
        else navigation.navigate('Provider', { ServiceId: item?._id, name: item?.name });
      }}
    >
      <View style={styles.iconWrapper}>
        {item?.icon ? (
          <Image
            source={{ uri: item.icon?.startsWith('http') ? item.icon : `${API_BASE_URL}/${item.icon}` }}
            style={styles.image}
          />
        ) : (
          <Icon name="apps" size={28} color={COLORS.primary || '#0D52ED'} />
        )}
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.cardBadge}>Instant BBPS</Text>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary || '#0D52ED'} />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Bill & Utility Services</Text>
          <Text style={styles.headerSubtitle}>Official BBPS Approved Operators</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Categories */}
      <FlatList
        data={services}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: 0, paddingTop: 16 }}
        ListFooterComponentStyle={{ marginTop: 'auto', marginHorizontal: -16, paddingTop: 24 }}
        ListFooterComponent={<Footer />}
      />
    </View>
  );
};

export default BillPayments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: {
    alignItems: 'center',
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  headerSubtitle: {
    color: '#D9E7FF',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },

  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginVertical: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },

  iconWrapper: {
    backgroundColor: '#EFF6FF',
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  image: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#091838',
    textAlign: 'center',
  },

  cardBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
