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
            <Icon name="tag" size={26} color={COLORS.primary} />
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={22} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name} Providers</Text>
      </View>

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
          <ActivityIndicator size="large" color={COLORS.primary} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },

  /* SEARCH BAR */
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#d6e4ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
  },

  /* LIST */
  list: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1.3,
    borderColor: '#d6e4ff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  /* ICON */
  logoWrapper: {
    width: 50,
    height: 50,
    backgroundColor: '#eef5ff',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbe6ff',
  },
  logo: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },

  /* TEXT */
  name: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '600',
  },

  noData: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },

  messageContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: '#444',
  },
});
