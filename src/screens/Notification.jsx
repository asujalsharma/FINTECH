import { THEME_COLORS } from '../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
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

const Notification = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getData('api/notification/list');
      const data = response?.Data || []; // Handle potential structure differences
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotifications();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A237A" />
      {/* Header */}
      <LinearGradient
        colors={['#0A237A', '#1246C0', '#1A6FE0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* Body */}
      <View style={styles.whiteSheet}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#1756C5"
              style={{ marginTop: 40 }}
            />
          ) : notifications.length === 0 ? (
            <Text style={styles.noText}>No New Notifications</Text>
          ) : (
            notifications.map((item, index) => (
              <View key={index} style={styles.notificationCard}>
                <View style={styles.iconBox}>
                  <Icon name="notifications" size={24} color={THEME_COLORS.orange} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.message}>{item.body}</Text>
                  <Text style={styles.time}>{item.createdAt}</Text>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A237A', // Blue Theme
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  whiteSheet: {
    backgroundColor: '#F5FAFF',
    marginTop: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 1,
    overflow: 'hidden',
  },

  scrollContainer: {
    padding: 20,
    paddingTop: 30,
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
    borderRadius: 14,
    backgroundColor: '#fff',
    marginBottom: 15,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF3E0', // Orange tint for notification icon
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});
