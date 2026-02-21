import React, { useState } from 'react';
import {
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { THEME_COLORS, GRADIENTS } from '../constants/theme';

const operators = [
  { id: '1', name: 'Airtel TV', icon: { uri: 'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png' } },
  { id: '2', name: 'Dish TV', icon: { uri: 'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png' } },
  { id: '3', name: 'Tata Sky', icon: { uri: 'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png' } },
  { id: '4', name: 'Sun Direct', icon: { uri: 'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png' } },
  { id: '5', name: 'Videocon DTH', icon: { uri: 'https://w7.pngwing.com/pngs/240/684/png-transparent-4g-bharti-airtel-lte-3g-2g-recharge-text-trademark-logo-thumbnail.png' } },
];

const OperatorListScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  const filteredOperators = operators.filter(op =>
    op.name.toLowerCase().includes(searchText.toLowerCase())
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Operator</Text>
      </LinearGradient>

      {/* Search Input Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search operator..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Operator List */}
      <FlatList
        data={filteredOperators}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('Recharge', { operator: item })}
          >
            <View style={styles.itemLeft}>
              <View style={styles.iconWrapper}>
                <Image source={item.icon} style={styles.icon} />
              </View>
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default OperatorListScreen;

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
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -35,
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 60,
    elevation: 8,
    shadowColor: '#1756C5',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  iconWrapper: {
    width: 48,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
});
