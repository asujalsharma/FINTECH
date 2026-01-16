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

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44;

const BLUE = '#36004f';

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
        if (item.name === 'Google Play')
          navigation.navigate('GooglePlayPayment', { ServiceId: item?._id });
        else navigation.navigate('Provider', { ServiceId: item?._id, name: item?.name });
      }}
    >
      <View style={styles.iconWrapper}>
        {item?.icon ? (
          <Image
            source={{ uri: 'https://api.new.techember.in/' + item.icon }}
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
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Bill Services</Text>

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
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 12 }}
      />
    </View>
  );
};

export default BillPayments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F9',
  },

  header: {
    backgroundColor: BLUE,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 22,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: BLUE,
    shadowRadius: 10,
    marginHorizontal: 10,
  },

  iconWrapper: {
    backgroundColor: '#EAF3FF',
    padding: 14,
    borderRadius: 50,
    marginBottom: 10,
  },

  image: {
    width: 40,
    height: 40,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginTop: 5,
    width: '90%',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
