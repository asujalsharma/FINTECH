import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import COLORS from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getData } from '../API';

const GoogleProviders = () => {
  const navigation = useNavigation();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [error, setError] = useState(null);

  // Simulate fetching data
  useEffect(() => {
    setTimeout(async () => {
      const Provider = await getData(
        '/api/cyrus/bbps/operator-list?serviceId=678575d63fde9ce75e7eb2a6',
      );
      setProviders(Provider.Data);
      setLoading(false);
    }, 1500);
  }, []);

  const handleSelect = item => {
    navigation.navigate('GasPayment', { provider: item });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        item.id === selectedProviderId && styles.itemSelected,
      ]}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.itemLeft}>
        <View style={styles.logoPlaceholder}>
          {item.icon ? (
            <Image source={{ uri: item.icon }} style={styles.logo} />
          ) : (
            <Icon name="tag" size={24} color={COLORS.primary} />
          )}
        </View>
        <View>
          <Text style={styles.name}>{item.operator_name}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={18} color="#aaa" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={22} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gas Providers</Text>
      </View>

      {/* Loading / Error */}
      {loading && (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.message}>Loading providers...</Text>
        </View>
      )}
      {error && <Text style={[styles.message, { color: 'red' }]}>{error}</Text>}

      {/* Provider List */}
      {!loading && !error && (
        <FlatList
          data={providers}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

export default GoogleProviders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: COLORS.black,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 20,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  message: {
    color: COLORS.black,
    fontSize: 16,
    marginTop: 12,
  },
  list: {
    marginTop: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#cce3ff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemSelected: {
    backgroundColor: '#f0f8ff',
    borderColor: COLORS.primary,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#666',
  },
});
