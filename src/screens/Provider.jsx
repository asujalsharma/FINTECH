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
import { useNavigation, useRoute } from '@react-navigation/native';
import { getData } from '../API';
import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import { Platform } from 'react-native';

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
            <Icon name="tag" size={26} color={THEME_COLORS.primary} />
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
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name} Providers</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Provider..."
          placeholderTextColor="#777"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.message}>Loading providers...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProviders}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.noData}>No providers found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default FastagProviders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  /* SEARCH BAR */
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -35,
    marginBottom: 15,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#1756C5',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  /* LIST */
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 4,
    shadowColor: '#1756C5',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 15,
  },
  /* ICON */
  logoWrapper: {
    width: 56,
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  logo: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  /* TEXT */
  name: {
    fontSize: 15,
    color: '#1A1A2E',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  noData: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  message: {
    marginTop: 15,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
});
