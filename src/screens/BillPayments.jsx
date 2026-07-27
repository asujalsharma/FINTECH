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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../API';
import Footer from '../components/Footer';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.44;

const BLUE = '#471d7d';

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
          <Icon name="apps" size={28} color={BLUE} />
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
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Bill & Utility Services</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Categories */}
      <FlatList
        data={services}
        keyExtractor={(item, index) => String(index)}
        renderItem={renderItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, paddingTop: 16 }}
        ListFooterComponent={
          <View style={{ marginTop: 20 }}>
            <Footer />
          </View>
        }
      />
    </View>
  );
};


export default BillPayments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },

  header: {
    backgroundColor: BLUE,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },

  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 12,
    marginVertical: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  iconWrapper: {
    backgroundColor: '#EDE7F6',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  image: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
  },
});

