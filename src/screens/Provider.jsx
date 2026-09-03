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
  TextInput,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getData } from '../API';
import Footer from '../components/Footer';

const ProviderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ServiceId, name } = route.params;

  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const Provider = await getData(
          '/api/cyrus/bbps/operator-list?serviceId=' + ServiceId,
        );
        const data = Provider?.Data || [];
        setProviders(data);
        setFilteredProviders(data);
      } catch (err) {
        console.log('Provider fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [ServiceId]);

  const handleSearch = text => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredProviders(providers);
      return;
    }
    const filtered = providers.filter(item =>
      item.operator_name?.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredProviders(filtered);
  };

  const handleSelect = item => {
    if (name?.toLowerCase() === 'fastag') {
      navigation.navigate('FastagScreen', {
        provider: item,
        ServiceId,
        name: name,
      });
    } else {
      navigation.navigate('Payment', { provider: item, ServiceId, name: name });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.item}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.itemLeft}>
        <View style={styles.logoWrapper}>
          {item.icon ? (
            <Image source={{ uri: item.icon }} style={styles.logo} />
          ) : (
            <Icon name="business" size={24} color={COLORS.primary || '#0D52ED'} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={2}>
            {item.operator_name}
          </Text>
          <Text style={styles.subText}>BBPS Verified Biller</Text>
        </View>
      </View>

      <Icon name="chevron-right" size={22} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{name || 'Select'} Providers</Text>
          <Text style={styles.headerSubtitle}>Choose your official board or biller</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${name || ''} biller...`}
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="cancel" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.messageContainer}>
            <ActivityIndicator size="large" color={COLORS.primary || '#0D52ED'} />
            <Text style={styles.message}>Loading billers & operators...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProviders}
            keyExtractor={(_, index) => String(index)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={48} color="#CBD5E1" />
                <Text style={styles.noData}>No providers match your search.</Text>
              </View>
            }
            ListFooterComponent={
              <View style={{ marginTop: 24 }}>
                <Footer />
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProviderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 5,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backBtn: {
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
    marginTop: 2,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#091838',
  },
  list: {
    paddingBottom: 40,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  logoWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#091838',
  },
  subText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  noData: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});
