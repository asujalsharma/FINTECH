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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import COLORS from '../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getData } from '../API';
import Footer from '../components/Footer';

const FastagProviders = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const { ServiceId, name } = route.params;

  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(async () => {
      const Provider = await getData(
        '/api/cyrus/bbps/operator-list?serviceId=' + ServiceId,
      );
      setProviders(Provider.Data);
      setFilteredProviders(Provider.Data);
      setLoading(false);
    }, 1000);
  }, []);

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
    console.log(name);
    if (name.toLowerCase() === 'fastag')
      navigation.navigate('FastagScreen', {
        provider: item,
        ServiceId,
        name: name,
      });
    else
      navigation.navigate('Payment', { provider: item, ServiceId, name: name });
  };
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
      <View style={styles.itemLeft}>
        <View style={styles.logoWrapper}>
          {item.icon ? (
            <Image source={{ uri: item.icon }} style={styles.logo} />
          ) : (
            <Icon name="tag" size={26} color={'#471d7d'} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={2}>
            {item.operator_name}
          </Text>
        </View>
      </View>

      <Icon name="chevron-right" size={18} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name} Providers</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Provider..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.messageContainer}>
            <ActivityIndicator size="large" color={'#471d7d'} />
            <Text style={styles.message}>Loading providers...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProviders}
            keyExtractor={(item, index) => String(index)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.noData}>No providers found.</Text>
            }
            ListFooterComponent={
              <View style={{ marginTop: 20 }}>
                <Footer />
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};


export default FastagProviders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },

  header: {
    backgroundColor: '#471d7d',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '800',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },

  /* LIST */
  list: {
    paddingBottom: 30,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  /* ICON */
  logoWrapper: {
    width: 46,
    height: 46,
    backgroundColor: '#EDE7F6',
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 29, 125, 0.12)',
  },
  logo: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },

  /* TEXT */
  name: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
  },

  noData: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },

  messageContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  message: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
});
