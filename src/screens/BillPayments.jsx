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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44;

import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import { URL } from '../constants/URL';

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
      activeOpacity={0.9}
      onPress={() => {
        if (item.name && item.name.toLowerCase().trim() === 'google play')
          navigation.navigate('GooglePlayPayment', { ServiceId: item?._id });
        else navigation.navigate('Provider', { ServiceId: item?._id, name: item?.name });
      }}
    >
      <View style={styles.iconWrapper}>
        {item?.icon ? (
          <Image
            source={{ uri: URL + '/' + item.icon }}
            style={styles.image}
          />
        ) : (
          <Icon name="apps" size={32} color={THEME_COLORS.primary} />
        )}
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Services</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Categories */}
      <View style={styles.content}>
        <FlatList
          data={services}
          keyExtractor={(item, index) => String(index)}
          renderItem={renderItem}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 30, paddingTop: 20 }}
        />
      </View>
    </View>
  );
};

export default BillPayments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    marginTop: -40,
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 24,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#1756C5',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconWrapper: {
    backgroundColor: '#F0F5FF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
  },
  image: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    paddingHorizontal: 8,
    letterSpacing: 0.2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
});
