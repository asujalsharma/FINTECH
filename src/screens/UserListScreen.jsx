import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { getData } from '../API';
import COLORS from '../constants/colors';

export default function UserListScreen() {
  const navigation = useNavigation();
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserList();
  }, []);

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const res = await getData('/api/user/refer-list'); 
      console.log('User List Response →', res);
      if (res?.Status || res?.success) {
        setUserList(res?.Data || []);
      } else {
        // Handle empty or error
      }
    } catch (err) {
      console.error('Fetch user list error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.avatarContainer}>
          <FontAwesome5 name="user" size={20} color="#fff" />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name || item.firstName + ' ' + item.lastName || 'Unknown User'}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
        <Text style={styles.userDate}>Joined: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
      </View>
      <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Active</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User List</Text>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
        ) : userList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="users" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No users found.</Text>
            <Text style={styles.emptySubText}>Users you refer will appear here.</Text>
          </View>
        ) : (
          <FlatList
            data={userList}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    color: COLORS.black,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
      backgroundColor: '#E6F4EA',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
  },
  statusText: {
      color: '#1E8E3E',
      fontSize: 12,
      fontWeight: '600',
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 100,
  },
  emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginTop: 15,
  },
  emptySubText: {
      fontSize: 14,
      color: '#777',
      marginTop: 5,
  }
});
