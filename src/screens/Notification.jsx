import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getData } from '../API';
import COLORS from '../constants/colors';

const Notification = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // 🔥 Replace with your API
      const response = await getData('api/notification/list');
      const data = await response.Data;
      console.log(data);

      setNotifications(data || []);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  // Run when screen opens / focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotifications();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notifications</Text>
        <View />
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : notifications.length === 0 ? (
          <Text style={styles.noText}>No New Notifications</Text>
        ) : (
          notifications.map((item, index) => (
            <View key={index} style={styles.notificationCard}>
              <View style={styles.iconBox}>
                <Icon name="notifications" size={24} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.body}</Text>
                <Text style={styles.time}>{item.createdAt}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.headerBg,
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },

  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  scrollContainer: {
    padding: 16,
  },

  noText: {
    color: '#999',
    fontSize: 16,
    marginTop: 40,
    textAlign: 'center',
    fontWeight: '600',
  },

  notificationCard: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 15,
    flexDirection: 'row',
    elevation: 2,
  },

  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#E7F1FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginTop: 3,
  },
  time: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
  },
});
