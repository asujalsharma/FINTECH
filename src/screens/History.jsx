import {

  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { URL } from '../constants/URL';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

const History = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const [history, setHistory] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.post(`${URL}/api/paymenthistory`, {
          id: id,
        });
        if (response) {
          setHistory(response.data.payments);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (id) fetchHistory();
  }, [id]);

  const renderItem = ({ item }) => {
    const date = new Date(item.created * 1000);
    const formattedDateTime = date.toLocaleString();

    const isCredit = item.type !== 'payment'; // Assumption based on previous logic

    return (
      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: isCredit ? '#E8F5E9' : '#FFF3E0' }]}>
          <Icon
            name={isCredit ? "arrow-downward" : "arrow-upward"}
            size={24}
            color={isCredit ? '#2DB84B' : '#FF9500'}
          />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.typeText}>{item.type || 'Transaction'}</Text>
            <Text style={[styles.amountText, { color: isCredit ? '#1A1A2E' : '#FF3D3D' }]}>
              {isCredit ? '+' : '-'} ₹{item.amount}.00
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.dateText}>{formattedDateTime}</Text>
            <Text style={[styles.statusText, { color: isCredit ? '#2DB84B' : '#FF9500' }]}>
              {isCredit ? 'Success' : 'Debit'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Payment History</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* White Sheet */}
      <View style={styles.whiteSheet}>
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.paymentIntentId || index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No transaction history found.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default History;

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
  listContent: {
    padding: 20,
    paddingTop: 30,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    textTransform: 'capitalize',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  }
});
